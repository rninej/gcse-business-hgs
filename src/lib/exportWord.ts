'use client';

// Word (.docx) export for the /debug printable documents (Privacy Policy,
// DPA, Terms of Service, Invoice). Rather than duplicating every clause in
// builder code, this walks the ALREADY-RENDERED document DOM and maps it to
// real Word paragraphs/tables — so live edits (the DPA's school fields, the
// invoice's price) flow into the downloaded file exactly as they would print.
//
// Fidelity rules (mirroring the print stylesheet):
//   - anything the printer hides (`no-print`, `print:hidden`, plain `hidden`)
//     is left out; print-only content (`hidden print:inline` …) is included
//   - colours/sizes/weights are read from computed styles with the theme
//     forced to light for the duration of the conversion (docs print on
//     white), so dark mode never leaks white text into the file
//   - flex `justify-between` rows become right-tab aligned lines (invoice
//     totals); multi-column grids become borderless layout tables (signature
//     blocks); `border-b` "signature line" divs become ruled paragraphs
//
// The `docx` package is imported dynamically so it never touches the initial
// bundle — it is only fetched the first time a Word button is clicked.

import type {
  AlignmentType,
  IParagraphOptions,
  IRunOptions,
  Paragraph,
  Table,
} from 'docx';

/** A run we are still building — either TextRun options, a tab or a break. */
type RunSpec = IRunOptions | { tab: true } | { break: number };
type Block = Paragraph | Table;

/** Inherited context while walking (background fill, forced white text, th bold). */
interface Ctx {
  fill?: string;
  white?: boolean;
  boldAll?: boolean;
}

type DocxModule = typeof import('docx');

// A4 portrait, margins matching the print stylesheet (14/13/16 mm → twips).
const PAGE = { size: { width: 11906, height: 16838 }, margin: { top: 794, right: 737, bottom: 907, left: 737 } };
const CONTENT_TWIP = PAGE.size.width - PAGE.margin.left - PAGE.margin.right; // ≈ 10432

export interface WordDocSpec {
  /** the already-rendered document element to export */
  element: HTMLElement;
  /** download filename (include .docx) */
  filename: string;
  title: string;
  description?: string;
}

export async function downloadWordDoc(spec: WordDocSpec): Promise<void> {
  const docx = await import('docx');
  const { element, filename, title, description } = spec;

  // The documents print light-on-white; read computed styles in light mode so
  // a dark dashboard never exports white text. The app sets BOTH a `dark`
  // class and an inline `color-scheme` on <html> (the latter darkens UA form
  // controls — inputs — on its own), so both are neutralised. Transitions are
  // frozen too: shadcn inputs transition their color, and a synchronous
  // getComputedStyle would otherwise catch the value mid-flight between themes.
  const root = document.documentElement;
  const wasDark = root.classList.contains('dark');
  const prevScheme = root.style.colorScheme;
  const freeze = document.createElement('style');
  freeze.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
  document.head.appendChild(freeze);
  if (wasDark) root.classList.remove('dark');
  if (prevScheme !== 'light') root.style.colorScheme = 'light';
  let blocks: Block[];
  try {
    blocks = new Converter(docx, element).convert();
  } finally {
    freeze.remove();
    if (wasDark) root.classList.add('dark');
    if (prevScheme !== 'light') root.style.colorScheme = prevScheme;
  }

  const doc = new docx.Document({
    creator: 'gcsebusiness',
    title,
    description: description ?? 'gcsebusiness · gcse.business · Edexcel GCSE (9-1) Business',
    styles: { default: { document: { run: { font: 'Georgia', size: 22 } } } }, // 11pt serif, as printed
    numbering: {
      config: [
        {
          reference: 'ordered',
          levels: [0, 1, 2].map((level) => ({
            level,
            format: docx.LevelFormat.DECIMAL,
            text: `%${level + 1}.`,
            alignment: docx.AlignmentType.START,
            style: { paragraph: { indent: { left: 640 + level * 360, hanging: 260 } } },
          })),
        },
      ],
    },
    sections: [{ properties: { page: PAGE }, children: blocks }],
  });

  const blob = await docx.Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

// ---------------------------------------------------------------------------

class Converter {
  private root: HTMLElement;

  constructor(
    private d: DocxModule,
    root: HTMLElement,
  ) {
    this.root = root;
  }

  convert(): Block[] {
    return this.container(this.root, {});
  }

  // ----- what the printer would show -------------------------------------

  private skip(el: Element): boolean {
    if (el instanceof SVGElement) return true; // logos/marks — no vector art in docx
    if (!(el instanceof HTMLElement)) return true;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'BUTTON' || tag === 'SELECT' || tag === 'IFRAME' || tag === 'CANVAS' || tag === 'IMG' || tag === 'VIDEO' || tag === 'AUDIO') return true;
    const cls = el.classList;
    if (cls.contains('no-print') || cls.contains('print:hidden')) return true;
    // `hidden` on screen but shown when printing → include
    const printShown = Array.from(cls).some((c) => /^print:(block|inline|flex|grid|table|contents|list-item)/.test(c));
    if (cls.contains('hidden') && !printShown) return true;
    return false;
  }

  private isBlock(el: Element): boolean {
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BR') return false;
    return /^(P|H1|H2|H3|H4|H5|H6|UL|OL|DL|TABLE|HR|DIV|HEADER|FOOTER|SECTION|ARTICLE|MAIN|NAV|ASIDE|FORM|FIGURE|BLOCKQUOTE|PRE|ADDRESS|DETAILS)$/.test(tag);
  }

  // ----- style reading (light mode is forced by the caller) ---------------

  private styleOf(el: Element): CSSStyleDeclaration {
    return getComputedStyle(el);
  }

  /**
   * Computed colours arrive as `lab(...)`/`oklch(...)` under Tailwind v4 —
   * neither getComputedStyle nor canvas normalise them back to rgb in
   * Chromium, so convert to sRGB here (CSS Color 4 reference math).
   */
  private parseColor(css: string | null | undefined): { r: number; g: number; b: number; a: number } | null {
    if (!css || css === 'none' || css === 'transparent') return null;
    const fromRgb = (body: string) => {
      const [r, g, b, a = '1'] = body.split(',').map((x) => x.trim());
      return { r: +r, g: +g, b: +b, a: +a };
    };
    const m = /rgba?\(([^)]+)\)/.exec(css);
    if (m) return fromRgb(m[1]);
    const fn = /^(lab|oklab|lch|oklch)\(([\s\S]*)\)$/.exec(css.trim());
    if (!fn) return null;
    const [body, alphaPart = ''] = fn[2].split('/');
    const nums = body.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (nums.length < 3 || nums.some((n) => !Number.isFinite(n))) return null;
    let [l, c, h] = nums;
    let rgb: [number, number, number];
    if (fn[1] === 'lch' || fn[1] === 'oklch') {
      const rad = (h * Math.PI) / 180;
      rgb = fn[1] === 'lch' ? this.labToRgb(l, c * Math.cos(rad), c * Math.sin(rad)) : this.oklabToRgb(l, c * Math.cos(rad), c * Math.sin(rad));
    } else {
      rgb = fn[1] === 'lab' ? this.labToRgb(l, c, h) : this.oklabToRgb(l, c, h);
    }
    const a = alphaPart.trim() === '' ? 1 : Number.parseFloat(alphaPart);
    return { r: rgb[0], g: rgb[1], b: rgb[2], a: Number.isFinite(a) ? a : 1 };
  }

  private gamma(v: number): number {
    const lin = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055;
    return Math.min(255, Math.max(0, Math.round(lin * 255)));
  }

  /** CIE Lab (D50, CSS Color 4 white) → Bradford-adapted linear sRGB. */
  private labToRgb(L: number, a: number, b: number): [number, number, number] {
    const kappa = 24389 / 27, eps = 216 / 24389;
    const fy = (L + 16) / 116, fx = a / 500 + fy, fz = fy - b / 200;
    const xr = fx > eps ? fx ** 3 : (116 * fx - 16) / kappa;
    const yr = L > kappa * eps ? ((L + 16) / 116) ** 3 : L / kappa;
    const zr = fz > eps ? fz ** 3 : (116 * fz - 16) / kappa;
    const Xn = 0.3457 / 0.3585, Yn = 1, Zn = (1 - 0.3457 - 0.3585) / 0.3585;
    const X = xr * Xn, Y = yr * Yn, Z = zr * Zn;
    // Bradford chromatic adaptation D50 → D65, then XYZ(D65) → linear sRGB
    const x = 0.9555766 * X - 0.0230393 * Y + 0.0631636 * Z;
    const y = -0.0282895 * X + 1.0099416 * Y + 0.0210077 * Z;
    const z = 0.0122982 * X - 0.020483 * Y + 1.3299098 * Z;
    return [
      this.gamma(3.2409699419 * x - 1.5373831776 * y - 0.4986107603 * z),
      this.gamma(-0.9692436363 * x + 1.8759675015 * y + 0.0415550574 * z),
      this.gamma(0.0556300797 * x - 0.203976959 * y + 1.0569715142 * z),
    ];
  }

  /** OKLab → linear sRGB (Björn Ottosson's reference matrices). */
  private oklabToRgb(L: number, a: number, b: number): [number, number, number] {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
    return [
      this.gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      this.gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      this.gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    ];
  }

  private bgColor(el: Element): { r: number; g: number; b: number; a: number } | null {
    return this.parseColor(this.styleOf(el).backgroundColor);
  }

  /** Background → paragraph shading / forced-white text, inherited down. */
  private deriveCtx(el: Element, parent: Ctx): Ctx {
    const bg = this.bgColor(el);
    if (!bg || bg.a < 0.5) return parent;
    if (bg.r > 246 && bg.g > 246 && bg.b > 246) return parent; // paper — keep it clean
    const hex = [bg.r, bg.g, bg.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
    const lum = (0.2126 * bg.r + 0.7152 * bg.g + 0.0722 * bg.b) / 255;
    return { ...parent, fill: hex, white: lum < 0.45 ? true : parent.white };
  }

  private runColor(style: CSSStyleDeclaration, ctx: Ctx): string | undefined {
    if (ctx.white) return 'FFFFFF';
    const c = this.parseColor(style.color);
    if (!c || c.a < 0.4) return undefined;
    return [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  private runSize(style: CSSStyleDeclaration): number | undefined {
    const px = parseFloat(style.fontSize);
    if (!Number.isFinite(px) || px <= 0) return undefined;
    return Math.max(14, Math.round(px * 0.75 * 2)); // px → pt → half-points
  }

  // ----- inline runs -------------------------------------------------------

  /** A text run carrying the computed style of the element it belongs to. */
  private styledRun(el: Element, text: string, ctx: Ctx): RunSpec {
    const style = this.styleOf(el);
    return {
      text,
      bold: (parseInt(style.fontWeight, 10) || 400) >= 600 || !!ctx.boldAll,
      italics: style.fontStyle === 'italic',
      color: this.runColor(style, ctx),
      size: this.runSize(style),
      ...(style.textDecorationLine.includes('underline') ? { underline: {} } : {}),
      ...(/mono/i.test(style.fontFamily) ? { font: 'Consolas' } : {}),
    };
  }

  /** All text of `el` (recursively) as run specs, using computed styles. */
  private inlineRuns(el: Element, ctx: Ctx): RunSpec[] {
    if (el instanceof SVGElement) return [];
    if (el.tagName === 'BR') return [{ break: 1 }];
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const v = (el as HTMLInputElement).value.trim();
      if (v) return [this.styledRun(el, v, ctx)];
      const ph = (el as HTMLInputElement).placeholder.trim();
      if (ph) return [{ ...this.styledRun(el, ph, ctx), italics: true, color: '8A8A8A' }]; // a fill-in hint
      return [];
    }
    const out: RunSpec[] = [];
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === 3) {
        const t = (node.textContent ?? '').replace(/[\s\u00A0]+/g, ' ');
        if (t.trim() || (out.length && t)) out.push(this.styledRun(el, t, ctx));
      } else if (node.nodeType === 1) {
        const child = node as Element;
        if (this.skip(child)) continue;
        out.push(...this.inlineRuns(child, ctx));
      }
    }
    return out;
  }

  private toTextRun(spec: RunSpec): InstanceType<DocxModule['TextRun']> {
    if ('tab' in spec) return new this.d.TextRun({ children: [new this.d.Tab()] });
    if ('break' in spec) return new this.d.TextRun({ break: spec.break });
    return new this.d.TextRun(spec);
  }

  /** Adjacent text nodes can each carry a collapsed space — dedupe at boundaries. */
  private toRuns(runs: RunSpec[]): InstanceType<DocxModule['TextRun']>[] {
    const out: InstanceType<DocxModule['TextRun']>[] = [];
    for (const r of runs) {
      const prev = out[out.length - 1];
      if (
        prev &&
        'text' in r && typeof r.text === 'string' && r.text.startsWith(' ') &&
        (prev as { text?: string }).text?.endsWith(' ')
      ) {
        out.push(this.toTextRun({ ...r, text: r.text.replace(/^ +/, '') }));
      } else {
        out.push(this.toTextRun(r));
      }
    }
    return out;
  }

  // ----- paragraphs --------------------------------------------------------

  /** text-(right|center) walk — `sm:` variants apply on A4, like the printer. */
  private alignment(el: Element | null): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
    let node: Element | null = el;
    while (node) {
      if (node instanceof HTMLElement) {
        const m = /(?:^|\s)(?:sm:|md:|lg:|xl:|2xl:)?text-(right|center)(?:\s|$)/.exec(` ${node.className} `);
        if (m) return m[1] === 'right' ? this.d.AlignmentType.RIGHT : this.d.AlignmentType.CENTER;
      }
      if (node === this.root) break;
      node = node.parentElement;
    }
    return undefined;
  }

  private headingSpacing(tag: string): { before: number; after: number } | undefined {
    switch (tag) {
      case 'H1': return { before: 0, after: 200 };
      case 'H2': return { before: 320, after: 120 };
      case 'H3': return { before: 0, after: 160 }; // the document title sheet header
      case 'H4': return { before: 300, after: 80 }; // numbered section heads
      case 'H5': return { before: 220, after: 60 };
      case 'H6': return { before: 220, after: 60 };
      default: return undefined;
    }
  }

  private paraBorder(cls: string, el: HTMLElement): IParagraphOptions['border'] {
    const side = (dir: 'Top' | 'Bottom') => {
      const style = this.styleOf(el);
      const c = this.parseColor(dir === 'Top' ? style.borderTopColor : style.borderBottomColor);
      const hex = c ? [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase() : 'A3A3A3';
      return { style: this.d.BorderStyle.SINGLE, color: hex, size: 4, space: 4 };
    };
    const top = /(^|\s)border-t(-2|-4)?(\s|$)/.test(cls) ? { ...side('Top'), size: /border-t-[24]/.test(cls) ? 8 : 4 } : undefined;
    const bottom = /(^|\s)border-b(-2|-4)?(\s|$)/.test(cls) ? { ...side('Bottom'), size: /border-b-[24]/.test(cls) ? 12 : 4 } : undefined;
    return top || bottom ? { top, bottom } : undefined;
  }

  private paragraph(
    runs: RunSpec[],
    el: Element | null,
    ctx: Ctx,
    overrides: Partial<IParagraphOptions> = {},
  ): Paragraph {
    const tag = el?.tagName ?? '';
    const cls = el instanceof HTMLElement ? ` ${el.className} ` : '';
    const keep = /^H[1-6]$/.test(tag) || cls.includes('break-inside-avoid') || cls.includes('avoid-break');
    return new this.d.Paragraph({
      children: this.toRuns(runs),
      alignment: overrides.alignment ?? this.alignment(el),
      spacing: this.headingSpacing(tag) ?? { before: 0, after: 130 },
      keepNext: keep || undefined,
      keepLines: cls.includes('avoid-break') || cls.includes('break-inside-avoid') || undefined,
      border: el instanceof HTMLElement ? this.paraBorder(cls, el) : undefined,
      shading: ctx.fill ? { type: this.d.ShadingType.CLEAR, fill: ctx.fill } : undefined,
      ...overrides,
    });
  }

  /** The `h-9 border-b` ruled blanks in signature blocks. */
  private isRuledLine(el: HTMLElement): boolean {
    return (
      el.children.length === 0 &&
      (el.textContent ?? '').trim() === '' &&
      /(^|\s)border-b(\s|$)/.test(` ${el.className} `) &&
      !/(^|\s)border-b-\d(\s|$)/.test(` ${el.className} `)
    );
  }

  // ----- block dispatch ----------------------------------------------------

  private convertBlock(el: Element, ctx: Ctx): Block[] {
    const tag = el.tagName;
    const ctx2 = this.deriveCtx(el, ctx);

    if (tag === 'HR') return [this.paragraph([], el, ctx2)];
    if (/^(P|H1|H2|H3|H4|H5|H6)$/.test(tag)) {
      const runs = this.inlineRuns(el, ctx2);
      return runs.length ? [this.paragraph(runs, el, ctx2)] : [];
    }
    if (tag === 'UL' || tag === 'OL') return this.list(el, ctx2, 0, tag === 'OL');
    if (tag === 'TABLE') return [this.dataTable(el as HTMLTableElement, ctx2)];

    // DIV / HEADER / SECTION … containers
    const html = el as HTMLElement;
    if (this.isRuledLine(html)) {
      return [
        this.paragraph([], html, ctx2, {
          spacing: { before: 440, after: 40 },
          border: { bottom: { style: this.d.BorderStyle.SINGLE, color: '404040', size: 6, space: 1 } },
        }),
      ];
    }
    if (/(^|\s)flex($|\s)/.test(` ${html.className} `) && !/(^|\s)(flex-col|sm:flex-col)($|\s)/.test(` ${html.className} `)) {
      return this.flexRow(html, ctx2);
    }
    const cols = this.gridCols(html);
    if (cols > 1) return [this.gridTable(html, ctx2, cols)];

    const blocks = this.container(html, ctx2);
    if (/(^|\s)border-b(-2|-4)?(\s|$)/.test(` ${html.className} `)) {
      // e.g. the document header's heavy rule — reproduce it after the content
      blocks.push(this.paragraph([], html, ctx2, { spacing: { before: 60, after: 200 } }));
    }
    return blocks;
  }

  /** Walk children; consecutive inline nodes become one paragraph. */
  private container(el: Element, ctx: Ctx): Block[] {
    const out: Block[] = [];
    let runs: RunSpec[] = [];
    const flush = () => {
      if (runs.length) {
        out.push(this.paragraph(runs, el, ctx));
        runs = [];
      }
    };
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === 3) {
        const t = (node.textContent ?? '').replace(/[\s\u00A0]+/g, ' ');
        if (t.trim() || runs.length) runs.push(this.styledRun(el, t, ctx));
        continue;
      }
      if (node.nodeType !== 1) continue;
      const child = node as Element;
      if (this.skip(child)) continue;
      if (child.tagName === 'INPUT' || child.tagName === 'TEXTAREA') {
        // stacked dashed fields (invoice "Bill to") — one line each
        flush();
        const r = this.inlineRuns(child, ctx);
        if (r.length) out.push(this.paragraph(r, child, ctx));
        continue;
      }
      if (this.isBlock(child)) {
        flush();
        out.push(...this.convertBlock(child, ctx));
      } else {
        runs.push(...this.inlineRuns(child, ctx));
      }
    }
    flush();
    return out;
  }

  // ----- lists -------------------------------------------------------------

  private list(el: Element, ctx: Ctx, depth: number, ordered: boolean): Block[] {
    const out: Block[] = [];
    for (const li of Array.from(el.children)) {
      if (li.tagName !== 'LI' || this.skip(li)) continue;
      const runs: RunSpec[] = [];
      for (const node of Array.from(li.childNodes)) {
        if (node.nodeType === 3) {
          const t = (node.textContent ?? '').replace(/[\s\u00A0]+/g, ' ');
          if (t.trim() || runs.length) runs.push({ text: t });
        } else if (node.nodeType === 1) {
          const child = node as Element;
          if (this.skip(child)) continue;
          if (child.tagName === 'UL' || child.tagName === 'OL') {
            if (runs.length) {
              out.push(
                new this.d.Paragraph({
                  children: this.toRuns(runs),
                  bullet: ordered ? undefined : { level: depth },
                  numbering: ordered ? { reference: 'ordered', level: depth } : undefined,
                  spacing: { after: 80 },
                }),
              );
              runs.length = 0;
            }
            out.push(...this.list(child, ctx, Math.min(depth + 1, 2), child.tagName === 'OL'));
          } else if (this.isBlock(child)) {
            out.push(...this.convertBlock(child, ctx));
          } else {
            runs.push(...this.inlineRuns(child, ctx));
          }
        }
      }
      if (runs.length) {
        out.push(
          new this.d.Paragraph({
            children: this.toRuns(runs),
            bullet: ordered ? undefined : { level: depth },
            numbering: ordered ? { reference: 'ordered', level: depth } : undefined,
            spacing: { after: 80 },
          }),
        );
      }
    }
    return out;
  }

  // ----- tables ------------------------------------------------------------

  private columnWidths(cells: Element[]): number[] | undefined {
    const widths = cells.map((c) => {
      const m = /(?:^|\s)w-(\d+)(?:\s|$)/.exec(` ${c.className} `);
      return m ? Math.round(+m[1] * 4 * 15) : 0; // Tailwind spacing ×4 = px, ×15 = twips
    });
    if (!widths.some(Boolean)) return undefined;
    const fixed = widths.reduce((a, b) => a + b, 0);
    const flexCount = widths.filter((w) => !w).length;
    const each = Math.max(0, Math.floor((CONTENT_TWIP - fixed) / Math.max(1, flexCount)));
    return widths.map((w) => w || each);
  }

  private dataTable(tbl: HTMLTableElement, ctx: Ctx): Table {
    const D = this.d;
    const line = { style: D.BorderStyle.SINGLE, size: 4, color: 'A3A3A3' };
    const rows = Array.from(tbl.rows).filter((r) => !this.skip(r));
    let colWidths: number[] | undefined;
    const trs = rows.map((tr, ri) => {
      const cells = Array.from(tr.children).filter((c) => (c.tagName === 'TD' || c.tagName === 'TH') && !this.skip(c));
      if (ri === 0) colWidths = this.columnWidths(cells);
      return new D.TableRow({
        children: cells.map((c, ci) => {
          const cellEl = c as HTMLElement;
          const cellCtx = this.deriveCtx(cellEl, ctx);
          const isHead = cellEl.tagName === 'TH';
          const blocks = this.container(cellEl, { ...cellCtx, boldAll: isHead });
          return new D.TableCell({
            children: blocks.length ? blocks : [new D.Paragraph({ children: [] })],
            shading: cellCtx.fill ? { type: D.ShadingType.CLEAR, fill: cellCtx.fill } : undefined,
            margins: { top: 80, bottom: 80, left: 110, right: 110 },
            width: colWidths?.[ci] ? { size: colWidths[ci], type: D.WidthType.DXA } : undefined,
          });
        }),
        tableHeader: ri === 0 && !!tbl.tHead,
      });
    });
    return new D.Table({
      rows: trs,
      width: { size: 100, type: D.WidthType.PERCENTAGE },
      columnWidths: colWidths,
      borders: { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line },
    });
  }

  private gridCols(el: HTMLElement): number {
    let cols = 0;
    for (const c of el.classList) {
      const m = /^(?:sm:|md:|lg:|xl:|2xl:)?grid-cols-(\d+)$/.exec(c);
      if (m) cols = Math.max(cols, +m[1]);
    }
    return cols;
  }

  /** A responsive grid (signature blocks, invoice header columns) → side-by-side cells. */
  private gridTable(el: HTMLElement, ctx: Ctx, cols: number): Table {
    const D = this.d;
    const none = { style: D.BorderStyle.NONE };
    const kids = Array.from(el.children).filter((c) => !this.skip(c));
    const width = Math.floor(CONTENT_TWIP / cols);
    return new D.Table({
      width: { size: 100, type: D.WidthType.PERCENTAGE },
      columnWidths: Array.from({ length: kids.length || cols }, () => width),
      borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
      rows: [
        new D.TableRow({
          children: kids.map((kid) => {
            const blocks = this.container(kid, this.deriveCtx(kid, ctx));
            return new D.TableCell({
              children: blocks.length ? blocks : [new D.Paragraph({ children: [] })],
              margins: { top: 40, bottom: 40, left: 0, right: 240 },
              width: { size: width, type: D.WidthType.DXA },
            });
          }),
        }),
      ],
    });
  }

  // ----- flex rows ---------------------------------------------------------

  /** One flex row's child, flattened to runs (block children → line breaks). */
  private flatten(el: Element, ctx: Ctx): { runs: RunSpec[]; multiline: boolean } {
    const runs: RunSpec[] = [];
    let multiline = false;
    const walk = (node: Element) => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === 3) {
          const t = (child.textContent ?? '').replace(/[\s\u00A0]+/g, ' ');
          if (t.trim() || runs.length) runs.push(this.styledRun(node, t, ctx));
        } else if (child.nodeType === 1) {
          const c = child as Element;
          if (this.skip(c)) continue;
          if (c.tagName === 'BR') {
            runs.push({ break: 1 });
            multiline = true;
          } else if (this.isBlock(c) && c.tagName !== 'INPUT' && c.tagName !== 'TEXTAREA') {
            if (runs.length) runs.push({ break: 1 });
            multiline = true;
            walk(c);
          } else {
            runs.push(...this.inlineRuns(c, ctx));
          }
        }
      }
    };
    walk(el);
    return { runs, multiline };
  }

  /**
   * `justify-between` rows: single-line groups (invoice totals) become one
   * right-tab line; anything taller (the branded invoice header) becomes a
   * borderless two-column table.
   */
  private flexRow(el: HTMLElement, ctx: Ctx): Block[] {
    const D = this.d;
    const cls = ` ${el.className} `;
    const between = /(?:^|\s)(?:sm:|md:)?justify-between(?:\s|$)/.test(cls);
    const atEnd = /(?:^|\s)(?:sm:|md:)?justify-end(?:\s|$)/.test(cls);
    const groups = Array.from(el.children)
      .filter((c) => !this.skip(c))
      .map((c) => this.flatten(c, ctx))
      .filter((g) => g.runs.length);
    if (!groups.length) return [];

    if (groups.some((g) => g.multiline)) {
      const D = this.d;
      const none = { style: D.BorderStyle.NONE };
      const width = Math.floor(CONTENT_TWIP / groups.length);
      return [
        new D.Table({
          width: { size: 100, type: D.WidthType.PERCENTAGE },
          columnWidths: groups.map(() => width),
          borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
          rows: [
            new D.TableRow({
              children: groups.map((g, i) => {
                const last = i === groups.length - 1;
                const align = (between || atEnd) && last ? D.AlignmentType.RIGHT : undefined;
                return new D.TableCell({
                  children: [
                    this.paragraph(g.runs, el, ctx, {
                      alignment: align,
                      spacing: { before: 160, after: 160 },
                    }),
                  ],
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  width: { size: width, type: D.WidthType.DXA },
                });
              }),
            }),
          ],
        }),
      ];
    }

    const runs: RunSpec[] = [];
    groups.forEach((g, i) => {
      if (i > 0) runs.push(between ? { tab: true } : { text: ' ' });
      runs.push(...g.runs);
    });
    return [
      this.paragraph(runs, el, ctx, {
        alignment: atEnd ? D.AlignmentType.RIGHT : undefined,
        tabStops: between ? [{ type: D.TabStopType.RIGHT, position: D.TabStopPosition.MAX }] : undefined,
      }),
    ];
  }
}
