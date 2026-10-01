'use client';

import { useCallback, useEffect, useState } from 'react';
import { Users, ClipboardList, CheckCircle2, TrendingUp, ShieldAlert, Layers, ArrowRight, PlusCircle, BookOpen, Trophy, Flame, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard, ThemedSkeleton, ErrorNote, DueChip, EmptyState } from '@/components/shared';
import { BarList } from '@/components/charts';
import { api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { StudentProfileDialog } from './StudentProfile';
import { cn } from '@/lib/utils';

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
        <StatCard icon={Layers} label="Classes" value={s.classCount} />
        <StatCard icon={Users} label="Students" value={s.studentCount} />
        <StatCard icon={ClipboardList} label="Assignments set" value={s.assignmentCount} />
        <StatCard
          icon={TrendingUp}
          label="Average score"
          value={s.avgPct === null ? '—' : `${s.avgPct}%`}
          sub={`${s.submittedCount} submitted`}
          tone={s.avgPct === null ? 'default' : s.avgPct >= 70 ? 'good' : s.avgPct >= 50 ? 'warn' : 'bad'}
        />
        <StatCard
          icon={ShieldAlert}
          label="Integrity flags"
          value={s.flaggedCount}
          sub={s.flaggedCount ? 'review in results' : 'all clear'}
          tone={s.flaggedCount > 0 ? 'bad' : 'good'}
        />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
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

      <ClassLeaderboard />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Class leaderboard — same numbers the students see, for any class.  */
/* Sits at the bottom of the teacher dashboard.                        */
/* ------------------------------------------------------------------ */

interface LeaderRow {
  studentId: string;
  displayName: string;
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
