'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ClipboardList,
  PlayCircle,
  RotateCw,
  Eye,
  Star,
  TrendingUp,
  Award,
  Flame,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { PageHeader, ThemedSkeleton, ErrorNote, EmptyState, DueChip, PctChip } from '@/components/shared';
import { BarList, ScoreRing } from '@/components/charts';
import { cn } from '@/lib/utils';

interface AssignmentRow {
  id: string;
  title: string;
  description: string;
  dueAt: number | null;
  timeLimitMin: number | null;
  questionCount: number;
  totalMarks: number;
  status: 'not-started' | 'in-progress' | 'submitted';
  attemptId: string | null;
  attemptCount: number;
  bestPct: number | null;
  daysLeft: number | null;
  result: { pct: number; score: number; total: number } | null;
}

interface StreakInfo {
  current: number;
  best: number;
  activeDays: number;
}

interface Overview {
  stats: { quizzesDone: number; avgPct: number | null; points: number; bestPct: number | null };
  streak: StreakInfo;
  recent: { id: string; title: string; mode: string; pct: number; score: number; total: number; submittedAt: number }[];
  mastery: { topic: string; title: string; pct: number; attempts: number }[];
}

interface LeaderRow {
  studentId: string;
  displayName: string;
  weekPoints: number;
  totalPoints: number;
  streak: number;
  quizzesDone: number;
  isMe: boolean;
}

interface Leaderboard {
  className: string;
  myRank: number | null;
  totalStudents: number;
  rows: LeaderRow[];
}

export function StudentHome() {
  const go = useApp((s) => s.go);
  const session = useApp((s) => s.session);
  const [assignments, setAssignments] = useState<AssignmentRow[] | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ assignments: AssignmentRow[] }>('/api/student/assignments')
      .then((d) => setAssignments(d.assignments))
      .catch((e) => setError((e as Error).message));
    api
      .get<Overview>('/api/student/overview')
      .then(setOverview)
      .catch(() => undefined);
    api
      .get<Leaderboard>('/api/student/leaderboard')
      .then(setBoard)
      .catch(() => undefined);
  }, []);

  useEffect(load, [load]);

  async function start(a: AssignmentRow) {
    if (a.status === 'submitted' && a.attemptId) {
      go({ name: 'result', attemptId: a.attemptId });
      return;
    }
    try {
      if (a.status === 'in-progress' && a.attemptId) {
        go({ name: 'quiz', attemptId: a.attemptId });
        return;
      }
      const res = await api.post<{ attemptId: string }>(`/api/student/assignments/${a.id}/start`);
      go({ name: 'quiz', attemptId: res.attemptId });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // start the assignment again from scratch — a fresh attempt, teacher sees every go
  async function redo(a: AssignmentRow) {
    try {
      const res = await api.post<{ attemptId: string }>(`/api/student/assignments/${a.id}/start`);
      go({ name: 'quiz', attemptId: res.attemptId });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (error)
    return (
      <>
        <PageHeader title={`Hi ${session?.name ?? ''}`} />
        <ErrorNote message={error} />
      </>
    );
  if (!assignments || !overview)
    return (
      <>
        <PageHeader title={`Hi ${session?.name ?? ''}`} sub="Your work at a glance." />
        <ThemedSkeleton rows={4} />
      </>
    );

  const pending = assignments.filter((a) => a.status !== 'submitted');
  const done = assignments.filter((a) => a.status === 'submitted');
  const firstName = (session?.name ?? 'there').split(' ')[0];
  const streak = overview.streak;
  const topRows = board ? board.rows.slice(0, 5) : [];
  const myRow = board?.rows.find((r) => r.isMe);
  const maxWeek = Math.max(1, ...(board?.rows.map((r) => r.weekPoints) ?? [1]));

  return (
    <>
      <PageHeader
        title={`Hi ${firstName}`}
        sub={`${session?.className ?? 'Your class'} · Edexcel GCSE (9–1) Business`}
        actions={
          <div className="flex items-center gap-2">
            {streak && streak.current >= 2 ? (
              <Badge className="bg-[var(--warn)]/15 text-[var(--warn)] border-[var(--warn)]/30 gap-1.5 text-sm px-3 py-1.5 hover:bg-[var(--warn)]/15">
                <Flame className="h-4 w-4" aria-hidden /> {streak.current}-day streak
              </Badge>
            ) : null}
            {overview.stats.points > 0 ? (
              <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)] gap-1.5 text-sm px-3 py-1.5">
                <Star className="h-4 w-4" /> {overview.stats.points.toLocaleString()} points
              </Badge>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-3 mb-6 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 sm:p-5 flex items-center gap-4">
          <ScoreRing pct={overview.stats.avgPct ?? 0} label="average" size={88} />
          <div className="text-sm min-w-0">
            <div className="font-semibold">{overview.stats.quizzesDone} completed</div>
            <div className="text-xs text-muted-foreground mt-1">
              {overview.stats.bestPct !== null ? `Best: ${overview.stats.bestPct}%` : 'Take your first quiz'}
            </div>
            {streak && streak.activeDays > 0 ? (
              <div className="text-xs text-muted-foreground/80 mt-0.5">
                {streak.activeDays} active {streak.activeDays === 1 ? 'day' : 'days'} · best streak {streak.best}
              </div>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <ClipboardList className="h-4 w-4 text-primary" /> To do
          </div>
          <p className="text-3xl font-bold tabular-nums">{pending.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {done.length} submitted · {assignments.length} total
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <TrendingUp className="h-4 w-4 text-primary" /> Strongest areas
          </div>
          {overview.mastery.length === 0 ? (
            <p className="text-xs text-muted-foreground">Complete quizzes to unlock your progress map.</p>
          ) : (
            <BarList
              items={[...overview.mastery].sort((a, b) => b.pct - a.pct).slice(0, 3).map((m) => ({ label: m.title, pct: m.pct }))}
            />
          )}
        </div>
      </div>

      {/* weekly class leaderboard */}
      {board ? (
        <section className="rounded-lg border bg-card mb-6 overflow-hidden" aria-label="Class leaderboard">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b bg-[var(--sidebar)]/60">
            <h2 className="flex items-center gap-2 font-semibold text-sm">
              <Trophy className="h-4 w-4 text-[var(--warn)]" aria-hidden /> Class leaderboard
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">This week</Badge>
              {board.myRank ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                  You: <span className="font-semibold text-foreground">#{board.myRank}</span> of {board.totalStudents}
                </span>
              ) : null}
            </div>
          </div>

          {board.rows.length <= 1 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground text-center">
              The leaderboard fills up as your class completes quizzes — earn the first points!
            </p>
          ) : (
            <ol className="divide-y">
              {topRows.map((r, i) => (
                <li
                  key={r.studentId}
                  className={cn(
                    'flex items-center gap-3 px-4 sm:px-5 py-2.5',
                    r.isMe && 'bg-primary/5'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums',
                      i === 0
                        ? 'bg-[var(--warn)]/20 text-[var(--warn)]'
                        : i === 1
                          ? 'bg-secondary text-foreground'
                          : i === 2
                            ? 'bg-[var(--accent)]/30 text-[var(--accent-foreground)]'
                            : 'text-muted-foreground'
                    )}
                    aria-label={`Rank ${i + 1}`}
                  >
                    {i + 1}
                  </span>
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      r.isMe ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    )}
                    aria-hidden
                  >
                    {initials(r.displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm truncate', r.isMe ? 'font-semibold' : 'font-medium')}>
                        {r.displayName}
                      </span>
                      {r.isMe ? (
                        <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4">You</Badge>
                      ) : null}
                      {r.streak >= 2 ? (
                        <span className="flex items-center gap-0.5 text-[11px] text-[var(--warn)] shrink-0" title={`${r.streak}-day streak`}>
                          <Flame className="h-3 w-3" aria-hidden /> {r.streak}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-secondary overflow-hidden max-w-[180px]">
                      <div
                        className={cn('h-full rounded-full', r.isMe ? 'bg-primary' : 'bg-primary/40')}
                        style={{ width: `${Math.max(3, (r.weekPoints / maxWeek) * 100)}%` }}
                        aria-hidden
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-sm font-bold">{r.weekPoints.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">pts</span>
                  </div>
                </li>
              ))}

              {myRow && !topRows.some((r) => r.isMe) ? (
                <li className="flex items-center gap-3 px-4 sm:px-5 py-2.5 bg-primary/5 border-t-2 border-primary/20">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold tabular-nums">
                    {board.myRank}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold" aria-hidden>
                    {initials(myRow.displayName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{myRow.displayName}</span>
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4">You</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-sm font-bold">{myRow.weekPoints.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">pts</span>
                  </div>
                </li>
              ) : null}
            </ol>
          )}
          <p className="px-4 sm:px-5 py-2.5 text-[11px] text-muted-foreground border-t bg-[var(--sidebar)]/40">
            Points come from quiz scores and bonuses — the leaderboard resets each week.
          </p>
        </section>
      ) : null}

      <h2 className="font-semibold mb-3">Your assignments</h2>
      {assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nothing set yet"
          body="When your teacher sets work it will appear here. Meanwhile, try a practice quiz!"
          action={<Button size="sm" variant="outline" onClick={() => go({ name: 's-practice' })}>Practice quizzes</Button>}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const submitted = a.status === 'submitted';
            return (
              <div
                key={a.id}
                className={cn(
                  'rounded-lg border bg-card p-4 sm:p-5 flex flex-wrap items-center gap-3',
                  submitted ? 'opacity-90' : a.status === 'in-progress' ? 'border-primary/50' : undefined
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{a.title}</span>
                    {a.timeLimitMin ? (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <RotateCw className="h-3 w-3" /> {a.timeLimitMin} min
                      </Badge>
                    ) : null}
                    {!submitted ? <DueChip dueAt={a.dueAt} /> : null}
                    {submitted && a.result ? <PctChip pct={a.result.pct} /> : null}
                    {a.attemptCount > 1 ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {a.attemptCount} goes{a.bestPct !== null ? ` · best ${a.bestPct}%` : ''}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.questionCount} questions · {a.totalMarks} marks
                    {a.description ? ` · ${a.description}` : ''}
                  </p>
                </div>
                {submitted ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums font-semibold">
                      {a.result?.score}/{a.result?.total}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => start(a)}>
                      <Eye className="h-3.5 w-3.5" /> Review
                    </Button>
                    <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/5" onClick={() => redo(a)}>
                      <RotateCw className="h-3.5 w-3.5" /> Redo
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => start(a)}>
                    <PlayCircle className="h-4 w-4" />
                    {a.status === 'in-progress' ? 'Continue' : 'Start'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {overview.recent.length > 0 ? (
        <>
          <h2 className="font-semibold mb-3 mt-8">Recent results</h2>
          <ul className="rounded-lg border bg-card divide-y">
            {overview.recent.slice(0, 5).map((r) => (
              <li key={r.id}>
                <button
                  className="w-full text-left px-5 py-3.5 hover:bg-secondary/50 transition-colors flex items-center gap-3"
                  onClick={() => go({ name: 'result', attemptId: r.id })}
                >
                  <Award className={cn('h-4 w-4', r.pct >= 80 ? 'text-[var(--success)]' : 'text-primary')} />
                  <span className="flex-1 truncate text-sm font-medium">{r.title}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(r.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <PctChip pct={r.pct} />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}
