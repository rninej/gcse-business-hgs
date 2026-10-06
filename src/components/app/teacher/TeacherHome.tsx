'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users, ClipboardList, CheckCircle2, TrendingUp, ShieldAlert, Layers, ArrowRight, PlusCircle, BookOpen, Trophy, Flame, Medal, Wand2, BellRing, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PageHeader, StatCard, ThemedSkeleton, ErrorNote, DueChip, EmptyState, Avatar } from '@/components/shared';
import { calendarDaysUntil } from '@/lib/dates';
import { BarList } from '@/components/charts';
import { api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { StudentProfileDialog } from './StudentProfile';
import { cn } from '@/lib/utils';

interface CommonSlip {
  id: string;
  stem: string;
  topic?: string;
  studentsWrong: number;
  timesWrong: number;
  classes: { classId: string; name: string; studentsWrong: number }[];
}

interface AttentionRow {
  id: string;
  title: string;
  classTitle: string;
  dueAt: number;
  questionCount: number;
  submittedCount: number;
  total: number;
  missing: { name: string; started: boolean }[];
  missingCount: number;
}

interface FixPool {
  classId: string;
  name: string;
  questions: number;
  students: number;
}

interface Overview {
  stats: {
    classCount: number;
    studentCount: number;
    assignmentCount: number;
    submittedCount: number;
    avgPct: number | null;
    flaggedCount: number;
  };
  recentAssignments: {
    id: string;
    title: string;
    classTitle: string;
    dueAt: number | null;
    questionCount: number;
    submitted: number;
    totalStudents: number;
  }[];
  weakTopics: { topic: string; title: string; pct: number }[];
  commonSlips?: CommonSlip[];
  fixPools?: FixPool[];
  needsAttention?: AttentionRow[];
  latestSubmittedAssignmentId?: string | null;
  topFlaggedAssignmentId?: string | null;
}

export function TeacherHome() {
  const go = useApp((s) => s.go);
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<Overview>('/api/teacher/overview')
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(load, [load]);

  if (error)
    return (
      <>
        <PageHeader title="Dashboard" />
        <ErrorNote message={error} />
      </>
    );
  if (!data)
    return (
      <>
        <PageHeader title="Dashboard" sub="Good to see you." />
        <ThemedSkeleton rows={4} />
      </>
    );

  const s = data.stats;
  const slips = data.commonSlips ?? [];
  const pools = (data.fixPools ?? []).filter((p) => p.questions > 0);
  return (
    <>
      <PageHeader
        title="Dashboard"
        sub="Everything happening across your classes."
        actions={
          <>
            <Button variant="outline" onClick={() => go({ name: 't-library' })}>
              <BookOpen className="h-4 w-4" /> Library
            </Button>
            <Button onClick={() => go({ name: 't-new' })}>
              <PlusCircle className="h-4 w-4" /> New assignment
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          icon={Layers}
          label="Classes"
          value={s.classCount}
          onClick={() => go({ name: 't-classes' })}
          actionLabel="open your classes"
        />
        <StatCard
          icon={Users}
          label="Students"
          value={s.studentCount}
          onClick={() => go({ name: 't-classes' })}
          actionLabel="open the class lists"
        />
        <StatCard
          icon={ClipboardList}
          label="Assignments set"
          value={s.assignmentCount}
          onClick={() => go({ name: 't-assignments' })}
          actionLabel="open assignments"
        />
        <StatCard
          icon={TrendingUp}
          label="Average score"
          value={s.avgPct === null ? '—' : `${s.avgPct}%`}
          sub={`${s.submittedCount} submitted`}
          tone={s.avgPct === null ? 'default' : s.avgPct >= 70 ? 'good' : s.avgPct >= 50 ? 'warn' : 'bad'}
          onClick={() =>
            data.latestSubmittedAssignmentId
              ? go({ name: 't-results', assignmentId: data.latestSubmittedAssignmentId })
              : go({ name: 't-assignments' })
          }
          actionLabel={data.latestSubmittedAssignmentId ? 'open the latest marked results' : 'open assignments'}
        />
        <StatCard
          icon={ShieldAlert}
          label="Integrity flags"
          value={s.flaggedCount}
          sub={s.flaggedCount ? 'review in results' : 'all clear'}
          tone={s.flaggedCount > 0 ? 'bad' : 'good'}
          onClick={() =>
            data.topFlaggedAssignmentId
              ? go({ name: 't-results', assignmentId: data.topFlaggedAssignmentId })
              : go({ name: 't-assignments' })
          }
          actionLabel={data.topFlaggedAssignmentId ? 'review the flagged submissions' : 'open assignments'}
        />
      </div>

      <NeedsAttentionCard rows={data.needsAttention ?? []} />

      {/* explicit minmax(0,1fr) column on mobile — an implicit auto track
          sizes to max-content and overflows narrow viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        <section className="glass rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold">Recent assignments</h2>
            <Button variant="ghost" size="sm" onClick={() => go({ name: 't-assignments' })}>
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {data.recentAssignments.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ClipboardList}
                title="No assignments yet"
                body="Set your first quiz — pick one from the library, generate one, or write your own questions."
                action={
                  <Button size="sm" onClick={() => go({ name: 't-new' })}>
                    Create assignment
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y">
              {data.recentAssignments.map((a) => (
                <li key={a.id}>
                  <button
                    className="w-full text-left px-5 py-3.5 hover:bg-secondary/60 transition-colors flex items-center gap-3"
                    onClick={() => go({ name: 't-results', assignmentId: a.id })}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{a.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="truncate">{a.classTitle}</span>·<span>{a.questionCount} questions</span>
                        <DueChip dueAt={a.dueAt} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold tabular-nums">
                        {a.submitted}
                        <span className="text-muted-foreground font-normal">/{a.totalStudents}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
                        <CheckCircle2 className="h-3 w-3" /> handed in
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass rounded-xl p-5">
          <h2 className="font-semibold mb-1">Class topic gaps</h2>
          <p className="text-xs text-muted-foreground mb-4">Weakest topics first — based on every submission so far.</p>
          {s.submittedCount === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <BarList items={data.weakTopics.map((t) => ({ label: t.title, pct: t.pct }))} emptyText="No data yet" />
          )}
        </section>
      </div>

      <CommonSlipsCard slips={slips} pools={pools} />

      <ClassLeaderboard />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Needs attention — assignments due soon where someone hasn't handed  */
/* in yet. The teacher's morning chase list, sorted by whichever        */
/* deadline bites first.                                               */
/* ------------------------------------------------------------------ */

function NeedsAttentionCard({ rows }: { rows: AttentionRow[] }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [reminding, setReminding] = useState<string | null>(null);
  /** row id -> short confirmation, so a sent nudge visibly sticks */
  const [nudged, setNudged] = useState<Record<string, number>>({});
  if (rows.length === 0) return null;

  async function remind(row: AttentionRow) {
    setReminding(row.id);
    try {
      const r = await api.post<{ ok?: true; sent: number; skipped: number; message?: string }>(
        '/api/teacher/remind',
        { assignmentId: row.id }
      );
      setNudged((n) => ({ ...n, [row.id]: Date.now() }));
      toast({
        title: r.message ?? 'Nudge sent.',
        description:
          r.sent > 0
            ? 'It rings their bell the next time the app is open — no emails needed.'
            : 'Students nudged in the last 6 hours were left alone.',
      });
    } catch (e) {
      toast({ title: 'Could not send the nudge', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setReminding(null);
    }
  }

  // calendar days so this card always agrees with the DueChip in Recent
  // assignments — same helper, same answer (see lib/dates.ts)
  const dueLabel = (dueAt: number) => {
    const days = calendarDaysUntil(dueAt);
    if (days < 0) return { text: `overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`, tone: 'danger' as const };
    if (days === 0) return { text: 'due today', tone: 'danger' as const };
    if (days === 1) return { text: 'due tomorrow', tone: 'warn' as const };
    return { text: `due in ${days} days`, tone: 'default' as const };
  };

  return (
    <section
      className="relative glass rounded-xl mb-6 p-4 sm:p-6 overflow-hidden"
      aria-label="Assignments needing attention"
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--warn)]/15 text-[var(--warn)]" aria-hidden>
          <BellRing className="h-5 w-5" />
          <span className="attention-dot" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold">Needs your attention</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assignments due soon where some students haven&rsquo;t handed in — tap a row to see who.
          </p>
        </div>
      </div>
      <ul className="mt-4 divide-y rounded-lg border bg-card/60 overflow-hidden stagger">
        {rows.map((row) => {
          const due = dueLabel(row.dueAt);
          const sent = nudged[row.id] !== undefined;
          return (
            <li key={row.id} className="flex items-center gap-2 px-4 py-3 hover:bg-secondary/40 transition-colors">
              {/* main click target — opens the results view */}
              <button
                className="flex-1 min-w-0 text-left"
                onClick={() => go({ name: 't-results', assignmentId: row.id })}
              >
                <div className="font-medium text-sm truncate">{row.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="truncate">{row.classTitle}</span>·<span>{row.questionCount} questions</span>
                  <span
                    className={cn(
                      'font-medium',
                      due.tone === 'danger' && 'text-[var(--danger)]',
                      due.tone === 'warn' && 'text-[var(--warn)]'
                    )}
                  >
                    {due.text}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {row.missing.map((m) => (
                    <span
                      key={m.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--warn)]/35 bg-[var(--warn)]/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-[var(--warn-foreground)]"
                      title={m.started ? 'Started but not submitted' : 'Not started'}
                    >
                      {m.started ? <CircleDot className="h-3 w-3 text-[var(--warn)]" aria-hidden /> : null}
                      {m.name}
                    </span>
                  ))}
                  {row.missingCount > row.missing.length ? (
                    <span className="text-[11px] text-muted-foreground">+{row.missingCount - row.missing.length} more</span>
                  ) : null}
                </div>
              </button>
              {/* status + action grouped tightly on the right */}
              <div className="shrink-0 flex flex-col items-end gap-2 pl-2 sm:pl-3 border-l border-white/30">
                <div className="text-right leading-tight">
                  <div className="text-sm font-semibold tabular-nums">
                    {row.submittedCount}
                    <span className="text-muted-foreground font-normal">/{row.total}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
                    <CheckCircle2 className="h-3 w-3" /> handed in
                  </div>
                </div>
                {sent ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--success)]/40 bg-[var(--success)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--success)]"
                    title="Their bell rings the next time they open the app"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Nudged
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void remind(row)}
                    disabled={reminding === row.id}
                    title="Ring the bell of every student who hasn't handed this in yet"
                    className="press inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--warn)] px-3.5 text-xs font-semibold text-[var(--warn-foreground)] shadow-[0_4px_14px_-4px_rgb(146_84_21/0.45)] transition-all hover:brightness-105 hover:shadow-[0_6px_18px_-4px_rgb(146_84_21/0.55)] disabled:opacity-60 disabled:cursor-wait"
                  >
                    <BellRing className={cn('h-3.5 w-3.5', reminding === row.id && 'animate-pulse')} aria-hidden />
                    {reminding === row.id ? 'Sending…' : 'Remind'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Common slips — what the whole cohort is stuck on right now, with   */
/* one-tap "set a fixer" per class. Same pool as the class-page card.  */
/* ------------------------------------------------------------------ */

function CommonSlipsCard({ slips, pools }: { slips: CommonSlip[]; pools: FixPool[] }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [target, setTarget] = useState<FixPool | null>(null);
  const [fixing, setFixing] = useState(false);

  if (slips.length === 0 && pools.length === 0) return null;

  async function setFixer(p: FixPool) {
    setFixing(true);
    try {
      const res = await api.post<{ assignmentId: string; questionCount: number; poolSize: number }>(
        `/api/teacher/classes/${p.classId}/smart-practice`
      );
      toast({
        title: `Fixer set for ${p.name}`,
        description: `${res.questionCount} question${res.questionCount === 1 ? '' : 's'} from the class's common slips — visible now.`,
      });
      setTarget(null);
      go({ name: 't-assignments' });
    } catch (e) {
      toast({ title: 'Could not build the quiz', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setFixing(false);
    }
  }

  return (
    <section
      className="relative glass rounded-xl mt-6 p-4 sm:p-6 overflow-hidden"
      aria-label="Common slips across your classes"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary" aria-hidden>
            <Wand2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">Common slips across your classes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Questions your students keep getting wrong — build a self-marking fixer in one tap.
            </p>
          </div>
        </div>
        {pools.map((p) => (
          <Button key={p.classId} size="sm" className="w-full sm:w-auto shadow-[0_8px_24px_-8px_var(--primary)]" onClick={() => setTarget(p)}>
            <Wand2 className="h-3.5 w-3.5" /> Fix {p.name} · {p.questions}
          </Button>
        ))}
      </div>

      {slips.length > 0 ? (
        <ul className="mt-4 divide-y rounded-lg border bg-card/60 overflow-hidden stagger">
          {slips.map((sl) => (
            <li key={sl.id} className="flex items-center gap-3 px-4 py-3">
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 tabular-nums shrink-0">
                {sl.studentsWrong} student{sl.studentsWrong === 1 ? '' : 's'}
              </Badge>
              <span className="flex-1 min-w-0 text-sm truncate" title={sl.stem}>{sl.stem}</span>
              {sl.topic ? (
                <Badge variant="outline" className="hidden md:inline-flex text-[10px] h-5 px-1.5 gap-1 shrink-0 text-muted-foreground">
                  <BookOpen className="h-3 w-3" aria-hidden /> {sl.topic}
                </Badge>
              ) : null}
              <span className="hidden sm:flex items-center gap-1 shrink-0">
                {sl.classes.map((c) => (
                  <Badge key={c.classId} variant="outline" className="text-[10px] h-5 px-1.5 gap-1">
                    {c.name}
                    {sl.classes.length > 1 ? <span className="text-muted-foreground tabular-nums">· {c.studentsWrong}</span> : null}
                  </Badge>
                ))}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <AlertDialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Set a mistake-fixing quiz for {target?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              One untimed quiz, no due date, built from the {target?.questions} question{target?.questions === 1 ? '' : 's'} this class is stuck on (up to the 20 worst, freshest slips excluded). It appears on every student&rsquo;s dashboard immediately and marks itself as usual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={() => target && void setFixer(target)} disabled={fixing}>
              <Wand2 className="h-4 w-4" /> {fixing ? 'Building…' : 'Set it for the class'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Class leaderboard — same numbers the students see, for any class.  */
/* Sits at the bottom of the teacher dashboard.                        */
/* ------------------------------------------------------------------ */

interface LeaderRow {
  studentId: string;
  displayName: string;
  avatar: string | null;
  username: string;
  weekPoints: number;
  totalPoints: number;
  streak: number;
  quizzesDone: number;
}

interface LeaderboardData {
  className: string | null;
  classes: { id: string; name: string }[];
  rows: LeaderRow[];
}

function ClassLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const q = classId ? `?classId=${encodeURIComponent(classId)}` : '';
    api
      .get<LeaderboardData>(`/api/teacher/leaderboard${q}`)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError((e as Error).message);
      });
    return () => {
      alive = false;
    };
  }, [classId]);

  return (
    <section className="glass rounded-xl mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" aria-hidden /> Class leaderboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Points earned in the last 7 days — tap a student for their full profile.</p>
        </div>
        {data && data.classes.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {data.classes.map((c) => (
              <button
                key={c.id}
                onClick={() => setClassId(c.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  (classId ?? data.classes[0]?.id) === c.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                )}
                aria-pressed={(classId ?? data.classes[0]?.id) === c.id}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="p-5">
        {error ? (
          <ErrorNote message={error} />
        ) : !data ? (
          <div className="space-y-2" aria-busy>
            <div className="h-9 rounded-md bg-secondary animate-pulse" />
            <div className="h-9 rounded-md bg-secondary animate-pulse" />
            <div className="h-9 rounded-md bg-secondary animate-pulse" />
          </div>
        ) : data.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students in this class yet.</p>
        ) : (
          <ol className="space-y-1.5 stagger">
            {data.rows.map((r, i) => (
              <li key={r.studentId}>
                <button
                  onClick={() => setProfileId(r.studentId)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-secondary/60',
                    i < 3 && 'glass-soft'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
                      i === 0
                        ? 'bg-[var(--warn)]/20 text-[var(--warn-foreground)]'
                        : i === 1
                          ? 'bg-secondary text-foreground'
                          : i === 2
                            ? 'bg-[var(--accent)]/40 text-[var(--accent-foreground)]'
                            : 'bg-transparent text-muted-foreground'
                    )}
                    aria-label={`Rank ${i + 1}`}
                  >
                    {i < 3 ? <Medal className="h-4 w-4" aria-hidden /> : i + 1}
                  </span>
                  <Avatar name={r.displayName} src={r.avatar} size="sm" />
                  <span className="font-medium text-sm truncate flex-1 min-w-0">{r.displayName}</span>
                  {r.streak > 1 ? (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground tabular-nums" title={`${r.streak}-day streak`}>
                      <Flame className="h-3.5 w-3.5 text-[var(--warn)]" aria-hidden /> {r.streak}
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground tabular-nums hidden md:inline">{r.quizzesDone} quizzes</span>
                  <span className="text-right shrink-0">
                    <span className="font-bold text-sm tabular-nums text-primary">{r.weekPoints}</span>
                    <span className="text-xs text-muted-foreground"> pts this week</span>
                  </span>
                  <span className="hidden sm:block text-xs text-muted-foreground tabular-nums w-20 text-right shrink-0">
                    {r.totalPoints} total
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <StudentProfileDialog studentId={profileId ?? ''} open={profileId !== null} onOpenChange={(o) => !o && setProfileId(null)} />
    </section>
  );
}
