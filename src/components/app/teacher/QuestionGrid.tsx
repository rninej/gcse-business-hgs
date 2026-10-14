'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Check,
  Download,
  LifeBuoy,
  PenLine,
  Printer,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TypeBadge, Avatar, EmptyState } from '@/components/shared';
import { cn } from '@/lib/utils';
import type { ResultsData } from './ResultsView';

/* ------------------------------------------------------------------ */
/* Educake-style question-level class analysis.                        */
/*                                                                     */
/* Rows = pupils, columns = individual questions. Green tick / red     */
/* cross per cell, a class-percentage heatmap strip along the top,     */
/* each pupil's overall score beside their name, and the weakest       */
/* questions flagged with a "worth revisiting" callout — turning a     */
/* mark book into a reteach plan.                                      */
/* ------------------------------------------------------------------ */

type Q = ResultsData['qAnalysis'][number];
type Ans = Q['answers'][number];

const NAME_W = 168; // sticky name column (px)
const PCT_W = 56; // sticky overall-% column (px)
const CELL = 30; // question cell (px)

/** traffic-light tint for a percentage (class row, pupil score, chips) */
function heatCls(pct: number | null | undefined, solid = false) {
  if (pct === null || pct === undefined)
    return solid ? 'bg-secondary text-muted-foreground' : 'bg-secondary/60 text-muted-foreground';
  if (pct >= 75)
    return solid ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--success)]/12 text-[var(--success)]';
  if (pct >= 50)
    return solid ? 'bg-[var(--warn)]/25 text-[var(--warn)]' : 'bg-[var(--warn)]/15 text-[var(--warn)]';
  return solid ? 'bg-[var(--danger)]/20 text-[var(--danger)]' : 'bg-[var(--danger)]/12 text-[var(--danger)]';
}

/** written columns tint by marks ratio instead of a binary % */
function writtenHeat(ratio: number | null) {
  if (ratio === null) return 'bg-secondary/60 text-muted-foreground';
  if (ratio >= 0.999) return 'bg-[var(--success)]/12 text-[var(--success)]';
  if (ratio >= 0.5) return 'bg-[var(--warn)]/15 text-[var(--warn)]';
  return 'bg-[var(--danger)]/12 text-[var(--danger)]';
}

export function QuestionGrid({
  data,
  printSignal,
  onOpenProfile,
}: {
  data: ResultsData;
  /** bumped by the page's Print button while this tab is active */
  printSignal: number;
  onOpenProfile: (studentId: string) => void;
}) {
  const [printing, setPrinting] = useState(false);
  const [openQ, setOpenQ] = useState<string | null>(null);

  const a = data.assignment;
  const s = data.stats;
  const qs = data.qAnalysis;
  const submitted = useMemo(
    () => data.rows.filter((r) => r.status === 'submitted' || r.status === 'late'),
    [data.rows]
  );
  const notYet = useMemo(
    () => data.rows.filter((r) => r.status !== 'submitted' && r.status !== 'late'),
    [data.rows]
  );

  /** studentId → qid → their answer */
  const cells = useMemo(() => {
    const m = new Map<string, Map<string, Ans>>();
    for (const q of qs)
      for (const ans of q.answers) {
        let row = m.get(ans.studentId);
        if (!row) m.set(ans.studentId, (row = new Map()));
        row.set(q.id, ans);
      }
    return m;
  }, [qs]);

  /** questions fewer than half the class got right (written: under half marks) */
  const weak = useMemo(
    () =>
      qs
        .filter((q) => {
          if (q.answered === 0) return false;
          if (q.type === 'written') return q.avgAwarded != null && q.avgAwarded / q.marks < 0.5;
          return q.pctCorrect !== null && q.pctCorrect < 50;
        })
        .sort((x, y) => {
          const rx = x.type === 'written' ? (x.avgAwarded ?? 0) / x.marks : (x.pctCorrect ?? 100) / 100;
          const ry = y.type === 'written' ? (y.avgAwarded ?? 0) / y.marks : (y.pctCorrect ?? 100) / 100;
          return rx - ry;
        }),
    [qs]
  );
  const weakIds = useMemo(() => new Set(weak.map((q) => q.id)), [weak]);

  /** pupils the grid suggests a 1:1 with */
  const support = submitted.filter((r) => r.pct !== undefined && r.pct < 40);

  /* ---- print flow (same pattern as the activity heatmap sheet) ----- */
  useEffect(() => {
    if (printSignal <= 0) return;
    // async bump so the overlay state change isn't a synchronous effect
    const raf = requestAnimationFrame(() => setPrinting(true));
    return () => cancelAnimationFrame(raf);
  }, [printSignal]);

  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener('afterprint', done, { once: true });
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    const safety = window.setTimeout(done, 4000);
    return () => {
      window.removeEventListener('afterprint', done);
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [printing]);

  /* ---- grid CSV ---------------------------------------------------- */
  function csv() {
    const head = ['Pupil', 'Overall %', ...qs.map((q) => `Q${q.n}`)];
    const classRow = [
      'All pupils',
      s.avgPct === null ? '' : Math.round(s.avgPct),
      ...qs.map((q) =>
        q.type === 'written'
          ? q.avgAwarded != null
            ? `${q.avgAwarded}/${q.marks}`
            : ''
          : q.pctCorrect === null
            ? ''
            : q.pctCorrect
      ),
    ];
    const lines = submitted.map((r) => [
      r.displayName,
      r.pct ?? '',
      ...qs.map((q) => {
        const ans = cells.get(r.studentId)?.get(q.id);
        if (!ans) return '';
        if (q.type === 'written') return ans.awarded !== undefined ? `${ans.awarded}/${q.marks}` : '';
        return ans.correct ? 1 : 0;
      }),
    ]);
    const blob = new Blob(
      [[head, classRow, ...lines].map((l) => l.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')],
      { type: 'text/csv' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${a.title.replace(/[^a-z0-9]+/gi, '-')}-question-grid.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /* ---- one question cell ------------------------------------------- */
  function Cell({ q, ans, print, cellPx }: { q: Q; ans: Ans | undefined; print: boolean; cellPx: number }) {
    const weakCol = weakIds.has(q.id);
    const tip =
      !print && ans
        ? q.type === 'written'
          ? `Q${q.n}${ans.awarded !== undefined ? ` · ${ans.awarded}/${q.marks} marks` : ' · marking…'} · ${ans.name}`
          : `Q${q.n} · ${ans.correct ? 'correct' : ans.given === '—' ? 'left blank' : `incorrect — wrote "${ans.given}"`} · ${ans.name}`
        : undefined;

    const sq = print ? { width: cellPx - 2, height: cellPx - 2 } : undefined;
    const sqCls = print
      ? 'inline-flex items-center justify-center rounded-[3px] leading-none'
      : 'inline-flex h-7 w-7 items-center justify-center rounded-md leading-none';

    let inner: ReactNode;
    if (!ans) {
      inner = <span className="text-muted-foreground/40 text-[11px]">·</span>;
    } else if (q.type === 'written') {
      if (ans.awarded === undefined) {
        inner = (
          <span className={cn(sqCls, 'bg-secondary/70')} style={sq}>
            <span className="text-[10px] text-muted-foreground">…</span>
          </span>
        );
      } else {
        const full = ans.awarded >= q.marks;
        const zero = ans.awarded === 0;
        inner = (
          <span
            className={cn(
              sqCls,
              full
                ? 'bg-[var(--success)] text-white'
                : zero
                  ? 'bg-[var(--danger)] text-white'
                  : 'bg-[var(--warn)] text-[#3d2a05]'
            )}
            style={sq}
          >
            <span className={cn('font-bold tabular-nums', print ? 'text-[8px]' : 'text-[10px]')}>
              {ans.awarded}/{q.marks}
            </span>
          </span>
        );
      }
    } else {
      inner = (
        <span
          className={cn(sqCls, ans.correct ? 'bg-[var(--success)] text-white' : 'bg-[var(--danger)] text-white')}
          style={sq}
        >
          {ans.correct ? (
            <Check className={cn(print ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5')} strokeWidth={4} aria-label="correct" />
          ) : (
            <X className={cn(print ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5')} strokeWidth={4} aria-label="incorrect" />
          )}
        </span>
      );
    }

    return (
      <td className={cn('qgrid-cell', weakCol && 'qgrid-weak')} title={tip}>
        {inner}
      </td>
    );
  }

  /* ---- the matrix --------------------------------------------------- */
  function grid(print: boolean) {
    // A4 portrait at browser print margins leaves ~700px of track; the name
    // and score columns take ~176px, so cells shrink to fit the rest
    const cellPx = print ? Math.max(10, Math.min(17, Math.floor(480 / Math.max(qs.length, 1)))) : CELL;
    const nameW = print ? 132 : NAME_W;
    const pctW = print ? 44 : PCT_W;

    if (submitted.length === 0 && !print)
      return (
        <EmptyState
          icon={Users}
          title="No submissions yet"
          body="The grid fills in as pupils hand in — every pupil becomes a row, every question a column."
        />
      );

    return (
      <table
        className={cn('qgrid w-full border-separate border-spacing-0', print && 'qgrid-print')}
        style={{ minWidth: nameW + pctW + qs.length * (cellPx + 1) }}
      >
        <thead>
          <tr>
            <th
              scope="col"
              className={cn(
                'qgrid-th qgrid-corner',
                !print && 'sticky left-0 top-0 z-30',
                print && 'text-left'
              )}
              style={{ width: nameW, minWidth: nameW, left: 0 }}
            >
              <span className="block text-left font-semibold">Pupil</span>
              <span className="block text-left text-[10px] font-normal text-muted-foreground">
                {submitted.length} of {data.rows.length} handed in
              </span>
            </th>
            <th
              scope="col"
              className={cn('qgrid-th qgrid-corner text-center', !print && 'sticky top-0 z-30')}
              style={{ width: pctW, minWidth: pctW, left: print ? undefined : NAME_W }}
              title={`Class average ${s.avgPct === null ? '—' : Math.round(s.avgPct)}%`}
            >
              <span className="block text-[10px] font-medium text-muted-foreground">All Qs</span>
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums leading-none',
                  heatCls(s.avgPct, true)
                )}
              >
                {s.avgPct === null ? '—' : `${Math.round(s.avgPct)}%`}
              </span>
            </th>
            {qs.map((qq) => {
              const written = qq.type === 'written';
              const pctVal = qq.answered === 0 ? null : qq.pctCorrect;
              const val =
                qq.answered === 0
                  ? null
                  : written
                    ? qq.avgAwarded != null
                      ? `${qq.avgAwarded}/${qq.marks}`
                      : null
                    : qq.pctCorrect;
              const weakCol = weakIds.has(qq.id);
              return (
                <th
                  key={qq.id}
                  scope="col"
                  className={cn('qgrid-th qgrid-qth', weakCol && 'qgrid-weak', !print && 'sticky top-0 z-30')}
                  style={{ width: cellPx, minWidth: cellPx }}
                  title={
                    print
                      ? undefined
                      : `Q${qq.n} · ${
                          val === null ? 'no marks yet' : written ? `avg ${val} marks` : `${val}% of the class correct`
                        } · ${qq.topicTitle} — click for detail`
                  }
                >
                  {!print ? (
                    <button
                      className="w-full flex flex-col items-center gap-1"
                      onClick={() => setOpenQ(qq.id)}
                      aria-label={`Question ${qq.n} detail`}
                    >
                      <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-bold', weakCol ? 'text-[var(--danger)]' : 'text-foreground')}>
                        {qq.n}
                        {written ? <PenLine className="h-2.5 w-2.5 text-muted-foreground" aria-label="written question" /> : null}
                      </span>
                      <span
                        className={cn(
                          'inline-flex min-w-[22px] items-center justify-center rounded-md px-1 py-0.5 text-[10px] font-bold tabular-nums leading-none',
                          written ? writtenHeat(val === null ? null : qq.avgAwarded! / qq.marks) : heatCls(pctVal, true),
                          weakCol && 'ring-1 ring-[var(--danger)]/40'
                        )}
                      >
                        {val === null ? '—' : written ? val : `${val}%`}
                      </span>
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold">
                        {qq.n}
                        {written ? <PenLine className="h-2 w-2 text-muted-foreground" aria-hidden /> : null}
                      </span>
                      <span className="text-[8.5px] font-bold tabular-nums leading-none">{val === null ? '—' : written ? val : `${val}%`}</span>
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {submitted.map((r, ri) => (
            <tr key={r.studentId} className="group">
              <th
                scope="row"
                className={cn(
                  'qgrid-td qgrid-name',
                  !print && 'sticky left-0 z-20',
                  ri % 2 === 1 && 'qgrid-alt',
                  print && 'text-left'
                )}
                style={{ left: 0, width: nameW, minWidth: nameW }}
              >
                {print ? (
                  <span className="truncate text-[10px] font-semibold">
                    {r.displayName}
                    {r.status === 'late' ? ' (late)' : ''}
                  </span>
                ) : (
                  <button
                    className="flex items-center gap-2 min-w-0 text-left hover:text-primary transition-colors"
                    onClick={() => onOpenProfile(r.studentId)}
                    title={`${r.displayName}'s full profile`}
                  >
                    <Avatar name={r.displayName} src={r.avatar} size="xs" />
                    <span className="truncate text-[13px] font-medium">{r.displayName}</span>
                    {r.status === 'late' ? (
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-[var(--warn)]">late</span>
                    ) : null}
                  </button>
                )}
              </th>
              <td
                className={cn('qgrid-td qgrid-score', !print && 'sticky z-20', ri % 2 === 1 && 'qgrid-alt')}
                style={{ left: print ? undefined : NAME_W, width: pctW, minWidth: pctW }}
                title={print ? undefined : `${r.displayName}'s overall score`}
              >
                <span
                  className={cn(
                    'inline-flex w-full items-center justify-center rounded-md py-1 text-[11px] font-bold tabular-nums leading-none',
                    heatCls(r.pct, true)
                  )}
                >
                  {r.pct === undefined ? '—' : `${r.pct}%`}
                </span>
              </td>
              {qs.map((qq) => (
                <Cell key={qq.id} q={qq} ans={cells.get(r.studentId)?.get(qq.id)} print={print} cellPx={cellPx} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const dialogQ = openQ ? qs.find((x) => x.id === openQ) : null;

  return (
    <div className="space-y-4">
      {/* what am I looking at — one line, Educake-style framing */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Every pupil × every question — spot exactly where the class struggled and what to reteach.
        </p>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={csv} disabled={submitted.length === 0}>
            <Download className="h-3.5 w-3.5" /> Grid CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setPrinting(true)}
            disabled={submitted.length === 0}
            title="Print the question-level analysis as a clean one-page sheet"
          >
            <Printer className="h-3.5 w-3.5" /> Print grid
          </Button>
        </div>
      </div>

      {/* reteach callout — the actionable heart of the report */}
      {weak.length > 0 && (
        <div className="rounded-xl border border-[var(--warn)]/40 bg-[var(--warn)]/10 p-4 flex gap-3 print:hidden">
          <AlertTriangle className="h-5 w-5 text-[var(--warn)] shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0">
            <div className="text-sm font-semibold">Worth revisiting with the class</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fewer than half the class answered {weak.length === 1 ? 'this question' : 'these questions'} correctly —
              likely a shared misconception rather than one pupil slipping.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {weak.slice(0, 5).map((q) => (
                <button
                  key={q.id}
                  onClick={() => setOpenQ(q.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--warn)]/50 bg-card px-2.5 py-1 text-[11px] font-medium hover:bg-[var(--warn)]/15 transition-colors"
                  title="Show the question"
                >
                  <span className="font-bold">Q{q.n}</span>
                  <span className="tabular-nums">
                    {q.type === 'written' ? `avg ${q.avgAwarded}/${q.marks}` : `${q.pctCorrect}%`}
                  </span>
                  <span className="text-muted-foreground">· {q.topicTitle}</span>
                </button>
              ))}
              {weak.length > 5 && (
                <span className="inline-flex items-center px-2 py-1 text-[11px] text-muted-foreground">
                  +{weak.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* pupils who might need a hand */}
      {support.length > 0 && (
        <div className="rounded-xl border bg-card p-3.5 flex items-start gap-3 text-xs print:hidden">
          <LifeBuoy className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Might need a hand:</span>{' '}
            {support.map((r, i) => (
              <span key={r.studentId}>
                {i > 0 && ', '}
                <button
                  className="font-medium hover:text-primary transition-colors"
                  onClick={() => onOpenProfile(r.studentId)}
                  title={`${r.displayName}'s full profile`}
                >
                  {r.displayName}
                </button>{' '}
                <span className="tabular-nums">({r.pct}%)</span>
              </span>
            ))}
            <span className="text-muted-foreground"> — scored under 40%.</span>
          </p>
        </div>
      )}

      {/* the matrix */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="qgrid-scroll overflow-auto max-h-[70vh] scroll-slim">{grid(false)}</div>
        {notYet.length > 0 && (
          <div className="border-t px-4 py-2.5 text-[11px] text-muted-foreground print:hidden">
            Not yet handed in: {notYet.map((r) => r.displayName).join(', ')}
          </div>
        )}
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground print:hidden">
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-[var(--success)] text-white" aria-hidden>
            <Check className="h-2.5 w-2.5" strokeWidth={4} />
          </span>
          correct
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-[var(--danger)] text-white" aria-hidden>
            <X className="h-2.5 w-2.5" strokeWidth={4} />
          </span>
          incorrect
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-6 items-center justify-center rounded-[5px] bg-[var(--warn)] text-[#3d2a05] text-[9px] font-bold" aria-hidden>
            2/3
          </span>
          written · part marks
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-secondary text-[9px] text-muted-foreground" aria-hidden>…</span>
          still marking
        </span>
        <span className="flex items-center gap-1.5">
          <PenLine className="h-3 w-3 text-muted-foreground" aria-hidden />
          written · AI marked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[var(--danger)]/12 text-[9px] font-bold text-[var(--danger)]" aria-hidden>29%</span>
          under half the class correct — flagged above
        </span>
        <span className="ml-auto">Click any question number for the question, answers and who said what.</span>
      </div>

      {/* question detail dialog */}
      <Dialog open={dialogQ !== null} onOpenChange={(v) => !v && setOpenQ(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scroll-slim">
          {dialogQ && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle className="flex flex-wrap items-center gap-2 text-base">
                  <span className="font-bold text-primary">Q{dialogQ.n}</span>
                  <TypeBadge type={dialogQ.type as never} />
                  <span className="text-xs font-normal text-muted-foreground">{dialogQ.topicTitle}</span>
                  <span className="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
                    {dialogQ.marks} {dialogQ.marks === 1 ? 'mark' : 'marks'}
                  </span>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Question {dialogQ.n} — {dialogQ.topicTitle}. Class results and every pupil's answer.
                </DialogDescription>
              </DialogHeader>

              <p className="text-sm leading-relaxed border-b pb-4">{dialogQ.stemFull ?? dialogQ.stem}</p>

              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold tabular-nums">
                    {dialogQ.type === 'written' ? (
                      dialogQ.avgAwarded != null ? (
                        <span className="text-primary">{dialogQ.avgAwarded}<span className="text-sm text-muted-foreground">/{dialogQ.marks} avg</span></span>
                      ) : (
                        <span className="text-base text-muted-foreground">marking…</span>
                      )
                    ) : dialogQ.pctCorrect === null ? (
                      <span className="text-base text-muted-foreground">—</span>
                    ) : (
                      <span className={dialogQ.pctCorrect < 50 ? 'text-[var(--danger)]' : dialogQ.pctCorrect >= 75 ? 'text-[var(--success)]' : 'text-[var(--warn)]'}>
                        {dialogQ.pctCorrect}%
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {dialogQ.type === 'written' ? 'average marks awarded' : `${dialogQ.correct}/${dialogQ.answered} pupils correct`}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground border-l pl-4">
                  Correct answer: <span className="font-medium text-[var(--success)]">{dialogQ.expected}</span>
                </div>
              </div>

              {dialogQ.distribution && dialogQ.distribution.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">What the class answered</p>
                  <div className="space-y-1.5">
                    {dialogQ.distribution.map((d) => (
                      <div key={d.label} className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'text-xs truncate flex-1 min-w-0',
                            d.correct ? 'text-[var(--success)] font-semibold' : d.count > 0 ? 'text-foreground' : 'text-muted-foreground'
                          )}
                          title={d.label}
                        >
                          {d.label} {d.correct ? '✓' : ''}
                        </span>
                        <div className="w-1/3 h-2.5 rounded-full bg-secondary overflow-hidden shrink-0">
                          <div
                            className={cn('h-full rounded-full', d.correct ? 'bg-[var(--success)]' : d.count > 0 ? 'bg-[var(--danger)]/70' : 'bg-transparent')}
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] tabular-nums text-muted-foreground w-14 text-right shrink-0">
                          {d.count} · {d.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Who said what</p>
                {dialogQ.answers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No submissions yet.</p>
                ) : (
                  <ul className="grid sm:grid-cols-2 gap-1.5">
                    {dialogQ.answers.map((ans) => (
                      <li
                        key={ans.studentId}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-xs',
                          dialogQ.type === 'written'
                            ? 'border-primary/20'
                            : ans.correct
                              ? 'border-[var(--success)]/25'
                              : 'border-[var(--danger)]/25'
                        )}
                      >
                        <button
                          className="font-medium hover:text-primary transition-colors truncate text-left"
                          title={`${ans.name}'s full profile`}
                          onClick={() => {
                            setOpenQ(null);
                            onOpenProfile(ans.studentId);
                          }}
                        >
                          {ans.name}
                        </button>
                        {dialogQ.type === 'written' ? (
                          <span className="ml-auto shrink-0 font-semibold tabular-nums text-primary">
                            {ans.awarded !== undefined ? `${ans.awarded}/${dialogQ.marks}` : 'marking…'}
                          </span>
                        ) : (
                          <>
                            <span className="ml-auto text-right truncate max-w-[55%]" title={ans.given}>
                              {ans.given === '—' ? <span className="text-muted-foreground italic">left blank</span> : ans.given}
                            </span>
                            {ans.correct ? (
                              <Check className="h-3.5 w-3.5 text-[var(--success)] shrink-0" aria-label="correct" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-[var(--danger)] shrink-0" aria-label="incorrect" />
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* print sheet — a full-page clone portalled to <body> so nothing
          else on the page hits the paper (same trick as the heatmap) */}
      {printing
        ? createPortal(
            <div className="grid-print-overlay hidden print:block bg-white text-foreground px-10 py-8">
              <div className="flex items-baseline justify-between gap-4 border-b border-black/15 pb-3 mb-1">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                    gcsebusiness · question-level class analysis
                  </div>
                  <h1 className="text-xl font-bold mt-0.5">{a.title}</h1>
                </div>
                <div className="text-[11px] text-muted-foreground text-right">
                  {a.classTitle}
                  <br />
                  printed {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                {a.questionCount} questions · {a.totalMarks} marks ·{' '}
                {submitted.length}/{data.rows.length} handed in · class average{' '}
                <span className="font-semibold text-foreground tabular-nums">
                  {s.avgPct === null ? '—' : `${Math.round(s.avgPct)}%`}
                </span>
                {a.dueAt ? ` · due ${new Date(a.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
              </p>
              {weak.length > 0 && (
                <p className="text-xs mb-3">
                  <span className="font-semibold text-[var(--warn)]">Worth revisiting:</span>{' '}
                  {weak
                    .slice(0, 6)
                    .map(
                      (q) =>
                        `Q${q.n} (${q.type === 'written' ? `avg ${q.avgAwarded}/${q.marks}` : `${q.pctCorrect}%`} · ${q.topicTitle})`
                    )
                    .join(', ')}
                </p>
              )}
              <div className="mb-1 text-[10px] font-semibold text-muted-foreground">
                Top row: class % correct per question (✎-marked written questions show average marks). Percentages under 50% are boxed.
              </div>
              {grid(true)}
              {notYet.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  Not yet handed in: {notYet.map((r) => r.displayName).join(', ')}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-2 border-t border-black/10 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] bg-[var(--success)] text-white" aria-hidden>
                    <Check className="h-2 w-2" strokeWidth={4} />
                  </span>
                  correct
                </span>
                <span className="flex items-center gap-1">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] bg-[var(--danger)] text-white" aria-hidden>
                    <X className="h-2 w-2" strokeWidth={4} />
                  </span>
                  incorrect
                </span>
                <span className="flex items-center gap-1">
                  <span className="flex h-3.5 w-5 items-center justify-center rounded-[3px] bg-[var(--warn)] text-[#3d2a05] text-[8px] font-bold" aria-hidden>
                    2/3
                  </span>
                  written, part marks
                </span>
                <span className="flex items-center gap-1">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] bg-secondary text-[8px]" aria-hidden>…</span>
                  still marking
                </span>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
