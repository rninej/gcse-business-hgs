'use client';

// Shared presentational primitives
import { type LucideIcon, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { calendarDaysUntil } from '@/lib/dates';
import { CharAvatar, BuildAvatar } from '@/components/characters';
import { parseBuild } from '@/lib/avatarBuilder';
import type { QuestionType } from '@/lib/types';

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub ? <p className="text-sm text-muted-foreground mt-1">{sub}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 no-print">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'default',
  onClick,
  actionLabel = 'View',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number | null;
  sub?: string;
  tone?: 'default' | 'good' | 'warn' | 'bad';
  /** when set the card becomes a button that navigates somewhere */
  onClick?: () => void;
  /** screen-reader/tooltip label for where the card goes */
  actionLabel?: string;
}) {
  const toneCls =
    tone === 'good'
      ? 'text-[var(--success)]'
      : tone === 'warn'
        ? 'text-[var(--warn)]'
        : tone === 'bad'
          ? 'text-[var(--danger)]'
          : 'text-primary';

  const body = (
    <CardContent className="p-0 flex items-start gap-3">
      <div className="rounded-xl bg-secondary p-2.5 h-10 w-10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-2xl font-semibold leading-tight ${toneCls}`}>
          {value === null || value === undefined ? '—' : value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        {sub ? <div className="text-xs text-muted-foreground/80 mt-0.5">{sub}</div> : null}
      </div>
      {onClick ? (
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground shrink-0 mt-0.5 stat-go"
          aria-hidden
        >
          <ChevronRight className="h-3 w-3" />
        </span>
      ) : null}
    </CardContent>
  );

  if (onClick) {
    return (
      <Card
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${value ?? '—'} — ${actionLabel}`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className="p-4 text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary outline-offset-2 group"
      >
        {body}
      </Card>
    );
  }
  return <Card className="p-4">{body}</Card>;
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center flex flex-col items-center gap-3">
      <div className="rounded-full bg-secondary p-3 anim-float shadow-[inset_0_1px_0_0_rgb(255_255_255/0.6)]">
        <Icon className="h-6 w-6 text-primary" aria-hidden />
      </div>
      <div className="font-medium">{title}</div>
      {body ? <p className="text-sm text-muted-foreground max-w-sm">{body}</p> : null}
      {action}
    </div>
  );
}

const TYPE_LABEL: Record<QuestionType, string> = {
  mcq: 'Multiple choice',
  term: 'Type the term',
  fib: 'Fill the blank',
  numeric: 'Calculation',
  truefalse: 'True or false',
  written: 'Written · AI marked',
};

export function TypeBadge({ type }: { type: QuestionType }) {
  return (
    <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
      {TYPE_LABEL[type]}
    </Badge>
  );
}

export function PctChip({ pct }: { pct: number | null | undefined }) {
  if (pct === null || pct === undefined) return <span className="text-muted-foreground">—</span>;
  const cls =
    pct >= 80
      ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/25'
      : pct >= 55
        ? 'bg-primary/10 text-primary border-primary/25'
        : pct >= 40
          ? 'bg-[var(--warn)]/15 text-[var(--warn)] border-[var(--warn)]/30'
          : 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/25';
  return <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${cls}`}>{pct}%</span>;
}

export function DueChip({ dueAt }: { dueAt: number | null }) {
  if (!dueAt) return <Badge variant="outline" className="text-muted-foreground">No due date</Badge>;
  // calendar days, not 24-hour buckets — see lib/dates.ts
  const days = calendarDaysUntil(dueAt);
  if (days < 0) return <Badge className="bg-[var(--danger)] text-white hover:bg-[var(--danger)]">Overdue</Badge>;
  if (days === 0) return <Badge className="bg-[var(--danger)]/90 text-white hover:bg-[var(--danger)]/90">Due today</Badge>;
  if (days === 1) return <Badge className="bg-[var(--warn)] text-white hover:bg-[var(--warn)]">Due tomorrow</Badge>;
  if (days <= 7) return <Badge className="bg-[var(--warn)]/80 text-white hover:bg-[var(--warn)]/80">Due in {days} days</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">
    {new Date(dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
  </Badge>;
}

export function StatusPill({ status }: { status: 'not-started' | 'in-progress' | 'submitted' | 'late' }) {
  if (status === 'submitted')
    return <Badge className="bg-[var(--success)]/90 text-white hover:bg-[var(--success)]/90 gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-white" />Submitted</Badge>;
  if (status === 'late')
    return <Badge className="bg-[var(--warn)]/90 text-white hover:bg-[var(--warn)]/90 gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-white" />Late</Badge>;
  if (status === 'in-progress')
    return <Badge className="bg-primary/90 text-white hover:bg-primary/90 gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />In progress</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Not started</Badge>;
}

export function MarksChip({ marks }: { marks: number }) {
  return (
    <Badge variant="outline" className="text-[11px] font-normal">
      {marks} {marks === 1 ? 'mark' : 'marks'}
    </Badge>
  );
}

export function ThemedSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-sm p-3 text-[var(--danger)]" role="alert">
      {message}
    </div>
  );
}

/* ------------------------- avatars ------------------------- */

/** Initials for a display name — "Ava Stone" -> "AS", "jo" -> "JO". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic themed tint for a name — same student, same colour, on
 *  every screen and every visit. Warm, on-palette, never blue. */
const AVATAR_TINTS = [
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-teal-100 text-teal-800',
  'bg-lime-100 text-lime-800',
  'bg-orange-100 text-orange-800',
  'bg-rose-100 text-rose-800',
  'bg-yellow-100 text-yellow-800',
  'bg-stone-200 text-stone-700',
] as const;

export function avatarTint(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

const AVATAR_SIZES = {
  xs: { box: 'h-6 w-6', text: 'text-[10px]', emoji: 'text-sm' },
  sm: { box: 'h-8 w-8', text: 'text-xs', emoji: 'text-base' },
  md: { box: 'h-9 w-9', text: 'text-sm', emoji: 'text-lg' },
  lg: { box: 'h-14 w-14', text: 'text-lg', emoji: 'text-2xl' },
  xl: { box: 'h-24 w-24', text: 'text-3xl', emoji: 'text-5xl' },
} as const;

/** A user's avatar circle: their uploaded picture (data URL) or emoji pick
 *  ("emoji:\u{1F98A}") when set, crisp themed initials otherwise. Size with
 *  the `size` prop; `className` adds extras (e.g. a highlight ring). */
export function Avatar({
  name,
  src,
  size = 'sm',
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof AVATAR_SIZES;
  className?: string;
}) {
  const s = AVATAR_SIZES[size];
  const emoji = src?.startsWith('emoji:') ? [...src.slice(6)][0] ?? null : null;
  const charId = src?.startsWith('char:') ? src.slice(5) : null;
  // a custom-built character — invalid/stale payloads fall back to initials
  const build = src?.startsWith('build:') ? parseBuild(src) : null;
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5',
        s.box,
        className
      )}
      aria-hidden
    >
      {charId ? (
        // a 2D character pick — inline SVG bust, clipped to the circle
        <CharAvatar id={charId} />
      ) : build ? (
        // a custom-built character — layered SVG from the builder
        <BuildAvatar build={build} />
      ) : src && !emoji ? (
        // data-URL avatar chosen by this user — next/image adds nothing here
        <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <span
          className={cn(
            'flex h-full w-full items-center justify-center font-bold leading-none',
            avatarTint(name),
            emoji ? s.emoji : s.text
          )}
        >
          {emoji ?? initialsOf(name)}
        </span>
      )}
    </span>
  );
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      Try again
    </Button>
  );
}
