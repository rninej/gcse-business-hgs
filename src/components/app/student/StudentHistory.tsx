'use client';

import { useCallback, useEffect, useState } from 'react';
import { History, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { PageHeader, ThemedSkeleton, ErrorNote, EmptyState, PctChip } from '@/components/shared';
import { ScoreRing, BarList } from '@/components/charts';

interface Overview {
  stats: { quizzesDone: number; avgPct: number | null; points: number; bestPct: number | null };
  recent: { id: string; title: string; mode: string; pct: number; score: number; total: number; submittedAt: number; feedbackBy: string }[];
  mastery: { topic: string; title: string; pct: number; attempts: number }[];
}

export function StudentHistory() {
  const go = useApp((s) => s.go);
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<Overview>('/api/student/overview')
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(load, [load]);

  if (error)
    return (
      <>
        <PageHeader title="My results" />
        <ErrorNote message={error} />
      </>
    );
  if (!data)
    return (
      <>
        <PageHeader title="My results" />
        <ThemedSkeleton rows={4} />
      </>
    );

  return (
    <>
      <PageHeader
        title="My results"
        sub="Every attempt, your averages and your progress by topic."
      />

      <div className="grid gap-3 mb-6 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
          <ScoreRing pct={data.stats.avgPct ?? 0} label="average" size={96} />
          <div className="text-sm">
            <div className="font-semibold">{data.stats.quizzesDone} completed</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.stats.points.toLocaleString()} points earned
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Progress by topic</h3>
          {data.mastery.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete a quiz to unlock this.</p>
          ) : (
            <BarList
              items={data.mastery.map((m) => ({ label: m.title, pct: m.pct, sub: `${m.attempts} marks attempted` }))}
            />
          )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Best score</h3>
          <p className="text-4xl font-bold text-primary tabular-nums">
            {data.stats.bestPct === null ? '—' : `${data.stats.bestPct}%`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Aim to beat it next time.</p>
        </div>
      </div>

      {data.recent.length === 0 ? (
        <EmptyState
          icon={History}
          title="No results yet"
          body="Your completed quizzes will appear here with feedback."
          action={<Button size="sm" variant="outline" onClick={() => go({ name: 's-practice' })}>Try a practice quiz</Button>}
        />
      ) : (
        <ul className="rounded-xl border bg-card divide-y">
          {data.recent.map((r) => (
            <li key={r.id}>
              <button
                className="w-full text-left px-5 py-4 hover:bg-secondary/50 transition-colors flex items-center gap-3"
                onClick={() => go({ name: 'result', attemptId: r.id })}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(r.submittedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    {' · '}{r.score}/{r.total}
                  </div>
                </div>
                <PctChip pct={r.pct} />
                <Eye className="h-4 w-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
