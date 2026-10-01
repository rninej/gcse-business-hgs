'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Activity heatmap — every completed quiz is a square, weeks back.   */
/* GitHub-style contribution grid in the frosted-glass theme.          */
/* Shared by the student dashboard ("Your activity") and the teacher's */
/* class page ("Class activity") — with a 12 / 26 / 52-week switch.    */
/* ------------------------------------------------------------------ */

const RANGE_OPTIONS = [12, 26, 52] as const;
type Range = (typeof RANGE_OPTIONS)[number];

/** keeps squares readable as the grid widens — 12w fits ~520px, wider
 *  ranges scroll horizontally instead of turning cells into slivers */
function gridMinWidth(weeks: number): string {
  if (weeks <= 12) return 'min-w-[520px]';
  if (weeks <= 26) return 'min-w-[820px]';
  return 'min-w-[1180px]';
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

    const cols: { date: Date; count: number; isToday: boolean; isFuture: boolean }[][] = [];
    let inRange = 0;
    for (let w = 0; w < weeks; w++) {
      const col: { date: Date; count: number; isToday: boolean; isFuture: boolean }[] = [];
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

  const { cols, inRange, activeCells, today } = view;

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

  return (
    <section className={cn('rounded-lg border bg-card p-4 sm:p-5', className)} aria-label={title}>
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
          <div className="flex items-center rounded-full border bg-secondary/60 p-0.5" role="group" aria-label="Date range">
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
        </div>
      </div>

      <div className="overflow-x-auto scroll-slim pb-1">
        <div className={gridMinWidth(weeks)}>
          {/* month marks */}
          <div className="grid mb-1" style={{ gridTemplateColumns: `1.35rem repeat(${weeks}, 1fr)` }} aria-hidden>
            {monthMarks.map((m, i) => (
              <span key={i} className="text-[10px] text-muted-foreground pl-1 leading-none h-3.5">
                {m ?? ''}
              </span>
            ))}
          </div>
          <div className="flex gap-1.5">
            {/* weekday labels */}
            <div className="grid grid-rows-7 gap-[3px] text-[9px] text-muted-foreground w-4 shrink-0" aria-hidden>
              <span className="leading-none h-3.5 flex items-center">Mon</span>
              <span />
              <span className="leading-none h-3.5 flex items-center">Wed</span>
              <span />
              <span className="leading-none h-3.5 flex items-center">Fri</span>
              <span />
              <span />
            </div>
            {/* the squares */}
            <div className="grid gap-[3px] flex-1" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
              {cols.map((col, wi) => (
                <div key={wi} className="grid grid-rows-7 gap-[3px]">
                  {col.map((c) => (
                    <div
                      key={c.date.getTime()}
                      title={label(c)}
                      className={cn(
                        'h-3.5 w-full rounded-[3px] transition-colors heat-cell',
                        c.isFuture ? 'heat-future bg-transparent' : level(c.count),
                        c.isToday && 'ring-2 ring-primary/50 ring-offset-1 ring-offset-[var(--card)]'
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap mt-2">
        {footerNote ? (
          <div className="text-[11px] text-muted-foreground">{footerNote}</div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
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
