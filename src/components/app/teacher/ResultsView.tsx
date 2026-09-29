'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  ShieldAlert,
  Timer,
  TrendingUp,
  Users,
  BookOpenCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { topicTitle } from '@/lib/topics';
import { ScoreRing, RiskMeter, BarList } from '@/components/charts';
import { PageHeader, ThemedSkeleton, ErrorNote, StatusPill, PctChip, EmptyState, TypeBadge } from '@/components/shared';
import type { RiskBand, RiskSignal, TeacherStudentResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResultsData {
  assignment: {
    id: string;
    title: string;
    classTitle: string;
    dueAt: number | null;
    timeLimitMin: number | null;
    source: 'library' | 'ai' | 'custom';
    generatedBy: string;
    createdAt: number;
    questionCount: number;
    totalMarks: number;
  };
  rows: TeacherStudentResult[];
  stats: {
    totalStudents: number;
    submitted: number;
    inProgress: number;
    notStarted: number;
    avgPct: number | null;
    completion: number;
    riskDistribution: Record<RiskBand, number>;
    topicStats: { topic: string; c: number; t: number }[];
  };
  qAnalysis: {
    n: number;
    id: string;
    type: string;
    topic: string;
    topicTitle: string;
    stem: string;
    pctCorrect: number | null;
    correct: number;
    answered: number;
  }[];
  hardest: ResultsData['qAnalysis'];
}

export function ResultsView({ assignmentId }: { assignmentId: string }) {
  const go = useApp((s) => s.go);
  const [data, setData] = useState<ResultsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(() => {
    api
      .get<ResultsData>(`/api/teacher/assignments/${assignmentId}/results`)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError((e as Error).message));
  }, [assignmentId]);

  useEffect(load, [load]);

  useEffect(() => {
    timer.current = setInterval(() => {
      if (document.visibilityState === 'visible') setTick((t) => t + 1);
    }, 12000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  useEffect(() => {
    if (tick > 0) load();
  }, [tick, load]);

  if (error)
    return (
      <>
        <PageHeader title="Results" />
        <ErrorNote message={error} />
        <Button variant="ghost" className="mt-4" onClick={() => go({ name: 't-assignments' })}>
          <ArrowLeft className="h-4 w-4" /> Assignments
        </Button>
      </>
    );
  if (!data)
    return (
      <>
        <PageHeader title="Results" />
        <ThemedSkeleton rows={5} />
      </>
    );

  const a = data.assignment;
  const s = data.stats;
  const submitted = data.rows.filter((r) => r.status === 'submitted' || r.status === 'late');
  const flagged = submitted.filter((r) => (r.riskBand ?? 'low') === 'elevated' || (r.riskBand ?? 'low') === 'high');
  const byRisk = [...submitted].sort((x, y) => (y.riskScore ?? 0) - (x.riskScore ?? 0));
  const topicRows = (s.topicStats ?? []).map((v) => ({
    label: `${v.topic} · ${topicTitle(v.topic)}`,
    pct: v.t ? Math.round((v.c / v.t) * 100) : 0,
    sub: `${v.c}/${v.t} marks won`,
  }));

  function csv() {
    const head = 'Student,Username,Status,Score,Total,%,Time (min),Risk %,Risk band,Pastes,Tab switches';
    const lines = data!.rows.map((r) =>
      [
        r.displayName,
        r.username,
        r.status,
        r.score ?? '',
        r.total ?? '',
        r.pct ?? '',
        r.timeTakenSec ? Math.round(r.timeTakenSec / 60) : '',
        r.riskScore ?? '',
        r.riskBand ?? '',
        r.pasteCount ?? 0,
        r.tabSwitches ?? 0,
      ]
        .map((x) => `"${String(x).replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[head, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${a.title.replace(/[^a-z0-9]+/gi, '-')}-results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title={a.title}
        sub={`${a.classTitle} · ${a.questionCount} questions · ${a.totalMarks} marks · set ${new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => go({ name: 't-assignments' })}>
              <ArrowLeft className="h-4 w-4" /> Assignments
            </Button>
            <Button variant="outline" onClick={csv}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" onClick={load}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </>
        }
      />

      {/* summary strip */}
      <div className="grid gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 flex items-center gap-5">
          <ScoreRing pct={s.avgPct ?? 0} label="class average" size={104} />
          <div className="text-sm space-y-1">
            <div className="font-semibold">Average score</div>
            <div className="text-muted-foreground text-xs">
              {s.submitted} of {s.totalStudents} submitted
            </div>
            <div className="text-muted-foreground text-xs">{s.inProgress} still working</div>
            <div className="text-muted-foreground text-xs">{s.notStarted} not started</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Users className="h-4 w-4 text-primary" /> Hand-in progress
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
            <div className="h-full bg-[var(--success)]" style={{ width: `${s.totalStudents ? (s.submitted / s.totalStudents) * 100 : 0}%` }} />
            <div className="h-full bg-primary animate-pulse" style={{ width: `${s.totalStudents ? (s.inProgress / s.totalStudents) * 100 : 0}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--success)]" /> {s.submitted} in</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> {s.inProgress} live</span>
            <span>{s.completion}% complete</span>
          </div>
        </div>
        <div className={cn('rounded-xl border bg-card p-5', flagged.length > 0 && 'border-[var(--warn)]/50')}>
          <div className="flex items-center gap-2 text-sm font-semibold mb-1">
            <ShieldAlert className={cn('h-4 w-4', flagged.length ? 'text-[var(--warn)]' : 'text-[var(--success)]')} /> Integrity watch
          </div>
          {flagged.length === 0 ? (
            <p className="text-sm text-[var(--success)] mt-2">No unusual activity in this set.</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-[var(--warn)] tabular-nums">{flagged.length}</p>
              <p className="text-xs text-muted-foreground">submission{flagged.length === 1 ? '' : 's'} worth a look below</p>
            </>
          )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold mb-1">
            <Timer className="h-4 w-4 text-primary" /> Conditions
          </div>
          <div className="text-sm mt-2">
            {a.timeLimitMin ? <Badge className="bg-primary/15 text-primary border-primary/30">{a.timeLimitMin} min limit</Badge> : <Badge variant="secondary">Untimed</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {a.dueAt ? `Due ${new Date(a.dueAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}` : 'No deadline'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{a.generatedBy}</p>
        </div>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="integrity">Integrity ({flagged.length})</TabsTrigger>
          <TabsTrigger value="topics">Topics &amp; questions</TabsTrigger>
        </TabsList>

        {/* students tab */}
        <TabsContent value="students" className="mt-4">
          {data.rows.length === 0 ? (
            <EmptyState icon={Users} title="No students in this class" body="Add students from the Classes page." />
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead>
                    <tr className="border-b bg-secondary/50 text-left text-xs text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium w-[26%]">Score</th>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium w-[24%]">Integrity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr key={r.studentId} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{r.displayName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{r.username}</div>
                        </td>
                        <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                        <td className="px-4 py-3">
                          {r.pct === undefined ? (
                            <span className="text-muted-foreground text-xs">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden min-w-[60px]">
                                <div
                                  className={cn('h-full rounded-full', r.pct >= 80 ? 'bg-[var(--success)]' : r.pct >= 55 ? 'bg-primary' : r.pct >= 40 ? 'bg-[var(--warn)]' : 'bg-[var(--danger)]')}
                                  style={{ width: `${r.pct}%` }}
                                />
                              </div>
                              <span className="tabular-nums text-xs font-semibold w-12 text-right">
                                {r.score}/{r.total}
                              </span>
                              <PctChip pct={r.pct} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
                          {r.timeTakenSec === undefined ? '—' : `${Math.floor(r.timeTakenSec / 60)}m ${r.timeTakenSec % 60}s`}
                        </td>
                        <td className="px-4 py-3">
                          {r.riskScore === undefined ? (
                            <span className="text-muted-foreground text-xs">—</span>
                          ) : (
                            <RiskMeter score={r.riskScore} band={r.riskBand ?? 'low'} compact />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* integrity tab */}
        <TabsContent value="integrity" className="mt-4 space-y-4">
          <div className="rounded-xl border bg-[var(--accent)]/25 p-4 flex gap-3 text-sm">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
            <p className="text-muted-foreground">
              While students work, the platform quietly records timing, typing and tab behaviour. The scores
              below are <span className="font-medium text-foreground">indicators, not proof</span> — use them to
              start a conversation. Fast, confident students can still land in the amber zone.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['low', 'moderate', 'elevated', 'high'] as RiskBand[]).map((b) => {
              const n = s.riskDistribution[b];
              const tone =
                b === 'low' ? 'var(--success)' : b === 'moderate' ? 'var(--warn)' : b === 'elevated' ? 'oklch(0.72 0.16 55)' : 'var(--danger)';
              return (
                <div key={b} className="rounded-xl border bg-card p-4">
                  <div className="text-2xl font-bold tabular-nums" style={{ color: tone }}>{n}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">{b} risk</div>
                </div>
              );
            })}
          </div>

          {byRisk.filter((r) => (r.riskScore ?? 0) > 0).length === 0 ? (
            <EmptyState icon={ShieldAlert} title="Nothing flagged" body="No submission triggered any integrity signals in this assignment." />
          ) : (
            <ul className="space-y-3">
              {byRisk
                .filter((r) => (r.riskScore ?? 0) > 0)
                .map((r) => (
                  <li key={r.studentId} className="rounded-xl border bg-card p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="font-semibold">{r.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.pct !== undefined ? `${r.score}/${r.total} · ` : ''}
                          {r.timeTakenSec !== undefined ? `${Math.round(r.timeTakenSec / 60)} min · ` : ''}
                          {r.avgMsPerQ ? `${(r.avgMsPerQ / 1000).toFixed(1)}s per question · ` : ''}
                          {r.pasteCount ?? 0} paste events · {r.tabSwitches ?? 0} tab switches
                        </div>
                      </div>
                      <PctChip pct={r.pct ?? null} />
                    </div>
                    <RiskMeter score={r.riskScore ?? 0} band={r.riskBand ?? 'low'} signals={r.riskSignals} />
                  </li>
                ))}
            </ul>
          )}
        </TabsContent>

        {/* topics & questions tab */}
        <TabsContent value="topics" className="mt-4 space-y-5">
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold mb-1 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Topic performance</h3>
              <p className="text-xs text-muted-foreground mb-4">Marks won by the class, per spec topic.</p>
              <BarList items={topicRows} emptyText="No submissions yet." />
            </div>
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold mb-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[var(--warn)]" /> Hardest questions</h3>
              <p className="text-xs text-muted-foreground mb-4">Lowest share of correct answers first.</p>
              {data.hardest.length === 0 ? (
                <p className="text-sm text-muted-foreground">No submissions yet.</p>
              ) : (
                <ol className="space-y-3">
                  {data.hardest.map((q) => (
                    <li key={q.id} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="font-bold text-primary">Q{q.n}</span>
                        <TypeBadge type={q.type as never} />
                        <span className="text-muted-foreground">{q.topicTitle}</span>
                        <span className="ml-auto font-semibold tabular-nums">{q.pctCorrect}% correct</span>
                      </div>
                      <p className="text-sm">{q.stem}</p>
                      <p className="text-xs text-muted-foreground mt-1">{q.correct}/{q.answered} students correct</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <Collapsible className="rounded-xl border bg-card">
            <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium">
              <span className="flex items-center gap-2"><BookOpenCheck className="h-4 w-4 text-primary" /> All {a.questionCount} questions</span>
              <span className="text-xs text-muted-foreground">click to expand</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ol className="px-5 pb-5 space-y-2 max-h-[420px] overflow-y-auto scroll-slim">
                {data.qAnalysis.map((q) => (
                  <li key={q.id} className="rounded-lg border p-3 text-sm flex gap-3 items-start">
                    <span className="font-bold text-primary tabular-nums w-10 shrink-0">Q{q.n}</span>
                    <p className="flex-1">{q.stem}</p>
                    <span className="text-xs tabular-nums text-muted-foreground w-24 text-right shrink-0">
                      {q.pctCorrect === null ? '—' : `${q.pctCorrect}% · ${q.correct}/${q.answered}`}
                    </span>
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
      </Tabs>
    </>
  );
}
