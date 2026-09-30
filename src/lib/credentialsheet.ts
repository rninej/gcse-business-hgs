// Client-side credential sheet export: CSV + a real, dependency-free PDF.
// The PDF is assembled by hand (objects + xref with byte-accurate offsets) so
// teachers get a proper A4 table download without shipping a PDF library.

export interface LoginRow {
  displayName: string;
  username: string;
  password: string | null;
}

/* ---------------- CSV ---------------- */

function csvCell(v: string): string {
  const s = v.replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

export function buildLoginsCsv(className: string, rows: LoginRow[]): string {
  const head = 'Student,Username,Password';
  const body = rows.map((r) => [r.displayName, r.username, r.password ?? ''].map(csvCell).join(','));
  return [`Class: ${className}`, head, ...body].join('\n');
}

export function downloadFile(filename: string, mime: string, data: string | Uint8Array) {
  const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : new Blob([data as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Plain-text list for email bodies / pasting into a document */
export function buildLoginsText(className: string, rows: LoginRow[]): string {
  const lines = rows.map(
    (r) => `${r.displayName} — username: ${r.username} — password: ${r.password ?? '(set a new password first)'}`
  );
  return [`Class: ${className}`, '', ...lines].join('\n');
}

/* ---------------- PDF ---------------- */

// A4 portrait, points.
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 50;
const COL_NAME = MARGIN;
const COL_USER = 250;
const COL_PW = 410;
const ROW_H = 19;
const HEADER_Y = PAGE_H - 110;

/** PDF strings here are ASCII — fold accents and drop anything else */
function ascii(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]/g, '');
}

function esc(s: string): string {
  return ascii(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/** Truncate so a column never overruns the next */
function clip(s: string, maxChars: number): string {
  const a = ascii(s);
  return a.length > maxChars ? a.slice(0, maxChars - 3) + '...' : a;
}

function txt(x: number, y: number, font: 'F1' | 'F2' | 'F3', size: number, s: string, gray?: number): string {
  const color = gray !== undefined ? `${gray} g ` : '';
  return `BT ${color}/${font} ${size} Tf ${x} ${y} Td (${esc(s)}) Tj ET\n`;
}

function line(x1: number, y1: number, x2: number, y2: number, gray = 0.82): string {
  return `${gray} G 0.7 w ${x1} ${y1} m ${x2} ${y2} l S\n`;
}

export function buildLoginsPdf(className: string, rows: LoginRow[]): Uint8Array {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const rowsPerPage = Math.floor((HEADER_Y - 70) / ROW_H);
  const streams: string[] = [];

  let content = '';
  for (let i = 0; i < rows.length; i++) {
    const slot = i % rowsPerPage;
    if (slot === 0) {
      if (streams.length > 0 || content) streams.push(content);
      content =
        txt(COL_NAME, PAGE_H - MARGIN - 24, 'F2', 16, `Class logins — ${clip(className, 44)}`) +
        txt(COL_NAME, PAGE_H - MARGIN - 40, 'F1', 9, `${rows.length} students · generated ${dateStr}`, 0.45) +
        txt(COL_NAME, HEADER_Y + 4, 'F2', 9, 'STUDENT', 0.35) +
        txt(COL_USER, HEADER_Y + 4, 'F2', 9, 'USERNAME', 0.35) +
        txt(COL_PW, HEADER_Y + 4, 'F2', 9, 'PASSWORD', 0.35) +
        line(MARGIN, HEADER_Y - 2, PAGE_W - MARGIN, HEADER_Y - 2, 0.75);
    }
    const y = HEADER_Y - 8 - (slot + 1) * ROW_H;
    const r = rows[i];
    content += txt(COL_NAME, y, 'F1', 10, clip(r.displayName, 30));
    content += txt(COL_USER, y, 'F3', 9.5, clip(r.username, 26));
    content += txt(COL_PW, y, 'F3', 9.5, r.password ? clip(r.password, 24) : '(set a new password)', 0.5);
  }
  content += txt(COL_NAME, MARGIN + 8, 'F1', 8, 'Passwords are always visible (and changeable) in the class list on gcsebusiness.', 0.5);
  streams.push(content);

  // object ids: 1..P pages, P+1..2P contents, then fonts, pages tree, catalog
  const P = streams.length;
  const fontRegular = P * 2 + 1;
  const fontBold = fontRegular + 1;
  const fontMono = fontRegular + 2;
  const pagesObj = fontRegular + 3;
  const catalogObj = pagesObj + 1;

  const objects: string[] = new Array(catalogObj).fill('');
  for (let i = 0; i < P; i++) {
    objects[i] = `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R /F3 ${fontMono} 0 R >> >> /Contents ${P + 1 + i} 0 R >>`;
    objects[P + i] = `<< /Length ${streams[i].length} >>\nstream\n${streams[i]}endstream`;
  }
  objects[fontRegular - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  objects[fontBold - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;
  objects[fontMono - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>`;
  objects[pagesObj - 1] = `<< /Type /Pages /Kids [${Array.from({ length: P }, (_, i) => `${i + 1} 0 R`).join(' ')}] /Count ${P} >>`;
  objects[catalogObj - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;

  const parts: string[] = ['%PDF-1.4\n'];
  const offsets: number[] = new Array(catalogObj).fill(0);
  let pos = parts[0].length;
  for (let id = 1; id <= catalogObj; id++) {
    offsets[id - 1] = pos;
    const chunk = `${id} 0 obj\n${objects[id - 1]}\nendobj\n`;
    parts.push(chunk);
    pos += chunk.length;
  }

  let xref = `xref\n0 ${catalogObj + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= catalogObj; id++) {
    xref += `${String(offsets[id - 1]).padStart(10, '0')} 00000 n \n`;
  }
  parts.push(xref + `trailer\n<< /Size ${catalogObj + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${pos}\n%%EOF`);

  return new TextEncoder().encode(parts.join(''));
}

export function slugFilename(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'class';
}
