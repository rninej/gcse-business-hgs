'use client';

// Shared presentational primitives
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
}: {
  icon: LucideIcon;
  label: string;
  value: string | number | null;
  sub?: string;
  tone?: 'default' | 'good' | 'warn' | 'bad';
}) {
  const toneCls =
    tone === 'good'
      ? 'text-[var(--success)]'
      : tone === 'warn'
        ? 'text-[var(--warn)]'
        : tone === 'bad'
          ? 'text-[var(--danger)]'
          : 'text-primary';
  return (
    <Card className="p-4">
      <CardContent className="p-0 flex items-start gap-3">
        <div className="rounded-xl bg-secondary p-2.5 h-10 w-10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className={`text-2xl font-semibold leading-tight ${toneCls}`}>
            {value === null || value === undefined ? '—' : value}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          {sub ? <div className="text-xs text-muted-foreground/80 mt-0.5">{sub}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
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
      <div className="rounded-full bg-secondary p-3">
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
  const days = Math.ceil((dueAt - Date.now()) / 86400000);
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

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      Try again
    </Button>
  );
}
