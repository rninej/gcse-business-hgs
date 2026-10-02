'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Flame, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Activity heatmap — every completed quiz is a SQUARE, weeks back.    */
/* GitHub-style contribution grid in the frosted-glass theme.          */
/* Shared by the student dashboard ("Your activity") and the teacher's */
/* class page ("Class activity") — with a 12 / 26 / 52-week switch     */
/* and a one-tap print sheet (only the heatmap prints).                */
/* ------------------------------------------------------------------ */

const RANGE_OPTIONS = [12, 26, 52] as const;
type Range = (typeof RANGE_OPTIONS)[number];

const GAP = 3; // px between cells (screen)
const LABEL_W = 16; // px — weekday label column
const CELL_MIN = 9; // px — below this the 52-week grid scrolls instead
const CELL_MAX = 18; // px — keeps 12-week squares proportionate

interface Cell {
  date: Date;
  count: number;
  isToday: boolean;
  isFuture: boolean;
}

export function ActivityHeatmap({
  activity,
  title,
  streak,
  className,
  footerNote,
}: {
  activity: number[];
  title: string;
  /** current streak in days — shown with a flame when ≥ 2 (student view) */
  streak?: number | null;
  className?: string;
  /** optional extra line under the header (teacher view: who leads) */
  footerNote?: React.ReactNode;
}) {
  const [weeks, setWeeks] = useState<Range>(12);
  const [printing, setPrinting] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // adaptive SQUARE cell size — the grid measures its container and picks
  // the biggest cell (clamped 9–18px) that fits `weeks` columns; if even 9px
  // doesn't fit, the grid keeps 9px squares and scrolls horizontally
  const [cell, setCell] = useState(14);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const avail = el.clientWidth - LABEL_W - 8;
      const size = Math.floor((avail - (weeks - 1) * GAP) / weeks);
      setCell(Math.max(CELL_MIN, Math.min(CELL_MAX, size)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [weeks]);

  // everything below only recomputes when the data or range changes
  const view = useMemo(() => {
    // bucket the timestamps into LOCAL days (a 23:00 quiz lands on the right day)
    const perDay = new Map<string, number>();
    for (const t of activity) {
      const d = new Date(t);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      perDay.set(key, (perDay.get(key) ?? 0) + 1);
    }

    // build the grid: columns are weeks starting Monday, rows Mon…Sun.
    // Start (weeks-1) back at that week's Monday so the final column is this week.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mondayThisWeek = new Date(today);
    mondayThisWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Mon=0
    const firstMonday = new Date(mondayThisWeek);
    firstMonday.setDate(mondayThisWeek.getDate() - (weeks - 1) * 7);

    const cols: Cell[][] = [];
    let inRange = 0;
    for (let w = 0; w < weeks; w++) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(firstMonday);
        date.setDate(firstMonday.getDate() + w * 7 + d);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const count = perDay.get(key) ?? 0;
        if (count > 0) inRange += count;
        col.push({
          date,
          count,
          isToday: date.getTime() === today.getTime(),
          isFuture: date.getTime() > today.getTime(),
        });
      }
      cols.push(col);
    }
    return { cols, inRange, activeCells: cols.flat().filter((c) => c.count > 0).length, today };
  }, [activity, weeks]);

  const { cols, inRange, activeCells } = view;

  function level(count: number): string {
    if (count <= 0) return 'bg-secondary/70';
    if (count === 1) return 'bg-primary/25';
    if (count === 2) return 'bg-primary/45';
    if (count === 3) return 'bg-primary/65';
    return 'bg-primary';
  }

  function label(c: { date: Date; count: number }): string {
    const day = c.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    return c.count === 0 ? day : `${c.count} quiz${c.count === 1 ? '' : 'zes'} · ${day}`;
  }

  // month name shown on the first column where the month changes
  const monthMarks = cols.map((col, i) => {
    if (i === 0) return col[0].date.toLocaleDateString('en-GB', { month: 'short' });
    const prev = cols[i - 1][0].date;
    return prev.getMonth() !== col[0].date.getMonth() ? col[0].date.toLocaleDateString('en-GB', { month: 'short' }) : null;
  });

  /* ---- print sheet --------------------------------------------------
   * A clone of the grid is portalled straight to <body> as a direct child
   * (.heat-print-overlay, hidden on screen). CSS `body:has(> …)` hides the
   * whole app during the print job, so only the sheet hits the paper —
   * print-width squares, no min-widths, no frosted glass. */
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener('afterprint', done, { once: true });
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => window.print())
    );
    const safety = window.setTimeout(done, 4000);
    return () => {
      window.removeEventListener('afterprint', done);
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [printing]);

  const grid = (print: boolean) => {
    // screen: adaptive square cells · print: fixed 9px squares
    const size = print ? 9 : cell;
    const gap = print ? 1 : GAP;
    const labelW = print ? 15 : LABEL_W;
    return (
      <div>
        {/* month marks — column track matches the square grid below */}
        <div
          className="grid mb-1"
          style={{ gridTemplateColumns: `${labelW}px repeat(${weeks}, ${size}px)`, columnGap: gap }}
          aria-hidden
        >
          {monthMarks.map((m, i) => (
            <span key={i} className="text-[10px] text-muted-foreground pl-1 leading-none h-3.5">
              {m ?? ''}
            </span>
          ))}
        </div>
        <div className="flex" style={{ gap }}>
          {/* weekday labels */}
          <div
            className="grid grid-rows-7 text-[9px] text-muted-foreground shrink-0"
            style={{ gap, width: labelW }}
            aria-hidden
          >
            <span className="leading-none h-3.5 flex items-center">Mon</span>
            <span />
            <span className="leading-none h-3.5 flex items-center">Wed</span>
            <span />
            <span className="leading-none h-3.5 flex items-center">Fri</span>
            <span />
            <span />
          </div>
          {/* the squares — width = height, at every range */}
          <div className="flex" style={{ gap }}>
            {cols.map((col, wi) => (
              <div key={wi} className="grid grid-rows-7" style={{ gap }}>
                {col.map((c) => (
                  <div
                    key={c.date.getTime()}
                    title={print ? undefined : label(c)}
                    className={cn(
                      'rounded-[3px] transition-colors heat-cell',
                      c.isFuture ? 'heat-future bg-transparent' : level(c.count),
                      !print && c.isToday && 'ring-2 ring-primary/50 ring-offset-1 ring-offset-[var(--card)]'
                    )}
                    style={{ width: size, height: size }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const printSheet = printing
    ? createPortal(
        <div
          className="heat-print-overlay hidden print:block bg-white text-foreground px-8 py-6"
          style={{ fontFamily: 'inherit' }}
        >
          <div className="flex items-baseline justify-between gap-4 border-b border-black/15 pb-3 mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">gcsebusiness</div>
              <h1 className="text-xl font-bold mt-0.5">{title}</h1>
            </div>
            <div className="text-[11px] text-muted-foreground text-right">
              {weeks}-week view · printed {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <p className="text-sm mb-3">
            <span className="font-semibold tabular-nums">
              {inRange} quiz{inRange === 1 ? '' : 'zes'}
            </span>{' '}
            · {activeCells} active {activeCells === 1 ? 'day' : 'days'} in {weeks} weeks
            {streak != null && streak >= 2 ? (
              <span className="ml-2 font-medium text-[var(--warn)]">· {streak}-day streak</span>
            ) : null}
          </p>
          {grid(true)}
          <div className="flex items-center justify-between gap-2 flex-wrap mt-4 text-[10px] text-muted-foreground">
            {footerNote ? (
              <div className="text-[11px] text-muted-foreground">{footerNote}</div>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1 ml-auto">
              <span className="mr-1">Less</span>
              <span className="h-2.5 w-2.5 rounded-[2px] bg-secondary/70" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/25" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/45" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/65" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-primary" aria-hidden />
              <span className="ml-1">More</span>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <section className={cn('rounded-lg border bg-card p-4 sm:p-5', className)} aria-label={title}>
      {printSheet}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-3">
        <h2 className="flex items-center gap-2 font-semibold text-sm">
          <CalendarDays className="h-4 w-4 text-primary" aria-hidden /> {title}
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {streak != null && streak >= 2 ? (
            <span className="flex items-center gap-1 text-[var(--warn)] font-medium">
              <Flame className="h-3.5 w-3.5" aria-hidden /> {streak}-day streak
            </span>
          ) : null}
          <span className="tabular-nums">
            {inRange} quiz{inRange === 1 ? '' : 'zes'} · {activeCells} active {activeCells === 1 ? 'day' : 'days'} in {weeks} weeks
          </span>
          {/* range switch — 12 / 26 / 52 weeks */}
          <div className="flex items-center rounded-full border bg-secondary/60 p-0.5 print:hidden" role="group" aria-label="Date range">
            {RANGE_OPTIONS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeeks(w)}
                aria-pressed={weeks === w}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums transition-colors',
                  weeks === w
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {w}w
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPrinting(true)}
            aria-label={`Print the ${title.toLowerCase()} sheet`}
            title="Print or save this activity grid as a one-page sheet"
            className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors print:hidden"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div ref={wrapRef} className="overflow-x-auto scroll-slim pb-1">
        {grid(false)}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap mt-2">
        {footerNote ? (
          <div className="text-[11px] text-muted-foreground">{footerNote}</div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto print:hidden">
          <span className="mr-1">Less</span>
          <span className="h-2.5 w-2.5 rounded-[2px] bg-secondary/70" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/25" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/45" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/65" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-[2px] bg-primary" aria-hidden />
          <span className="ml-1">More</span>
        </div>
      </div>
    </section>
  );
}
