'use client';

import { useEffect, useState } from 'react';
import { PlayCircle, Layers3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { PageHeader, ThemedSkeleton, ErrorNote, TypeBadge } from '@/components/shared';
import { topicTitle } from '@/lib/topics';
import type { QuestionType } from '@/lib/types';

interface QuizRow {
  id: string;
  title: string;
  blurb: string;
  theme: 1 | 2;
  topics: string[];
  questionCount: number;
  types: QuestionType[];
}

export function PracticeView() {
  const go = useApp((s) => s.go);
  const [quizzes, setQuizzes] = useState<QuizRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ quizzes: QuizRow[] }>('/api/quizzes')
      .then((d) => setQuizzes(d.quizzes))
      .catch((e) => setError((e as Error).message));
  }, []);

  async function start(quizId: string) {
    setStarting(quizId);
    try {
      const res = await api.post<{ attemptId: string }>('/api/student/practice', { quizId });
      go({ name: 'quiz', attemptId: res.attemptId });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStarting(null);
    }
  }

  if (error)
    return (
      <>
        <PageHeader title="Practice quizzes" />
        <ErrorNote message={error} />
      </>
    );
  if (!quizzes)
    return (
      <>
        <PageHeader title="Practice quizzes" />
        <ThemedSkeleton rows={3} />
      </>
    );

  return (
    <>
      <PageHeader
        title="Practice quizzes"
        sub="Pick a topic and test yourself — as many times as you like. Your marks update your progress map."
      />

      <div className="rounded-xl border bg-[var(--accent)]/25 p-4 mb-6 flex gap-3 text-sm">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
        <p className="text-muted-foreground">
          Every attempt gets automatic feedback and full explanations — the more you retry, the more the
          marking sinks in.
        </p>
      </div>

      {[
        { title: 'Theme 1 · Investigating small business', theme: 1 as const },
        { title: 'Theme 2 · Building a business', theme: 2 as const },
      ].map((group) => {
        const rows = quizzes.filter((q) => q.theme === group.theme);
        return (
          <section key={group.title} className="mb-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <Layers3 className="h-4 w-4" /> {group.title}
            </h2>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Quizzes coming soon.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {rows.map((q) => (
                  <div key={q.id} className="rounded-xl border bg-card p-5 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold">{q.title}</div>
                        <p className="text-xs text-muted-foreground mt-1">{q.blurb}</p>
                      </div>
                      <Badge variant="secondary" className="tabular-nums shrink-0">{q.questionCount} Qs</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {q.topics.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] font-normal">
                          {t} {topicTitle(t).split(' ')[0]}
                        </Badge>
                      ))}
                      {q.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">Untimed · unlimited retries</span>
                      <Button size="sm" onClick={() => start(q.id)} disabled={starting === q.id}>
                        <PlayCircle className="h-4 w-4" />
                        {starting === q.id ? 'Loading…' : 'Start practice'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
