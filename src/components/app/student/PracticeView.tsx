'use client';

import { useEffect, useMemo, useState } from 'react';
import { PlayCircle, Layers3, Sparkles, Search, X, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { PageHeader, ThemedSkeleton, ErrorNote, TypeBadge } from '@/components/shared';
import { topicTitle, TOPIC_MAP } from '@/lib/topics';
import type { QuestionType } from '@/lib/types';

interface QuizRow {
  id: string;
  title: string;
  blurb: string;
  theme: 1 | 2;
  topics: string[];
  audience: 'practice' | 'assignment';
  questionCount: number;
  types: QuestionType[];
}

export function PracticeView() {
  const go = useApp((s) => s.go);
  const [quizzes, setQuizzes] = useState<QuizRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .get<{ quizzes: QuizRow[] }>('/api/quizzes?audience=practice')
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

  /** search across title, blurb, topic ids + topic titles, question types */
  const matches = useMemo(() => {
    if (!quizzes) return [];
    const q = query.trim().toLowerCase();
    if (!q) return quizzes;
    return quizzes.filter((z) => {
      const hay = [
        z.title,
        z.blurb,
        ...z.topics,
        ...z.topics.map((t) => TOPIC_MAP[t]?.title ?? ''),
        ...z.types,
      ]
        .join(' ')
        .toLowerCase();
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [quizzes, query]);

  if (error)
    return (
      <>
        <PageHeader title="Quizzes" />
        <ErrorNote message={error} />
      </>
    );
  if (!quizzes)
    return (
      <>
        <PageHeader title="Quizzes" />
        <ThemedSkeleton rows={3} />
      </>
    );

  return (
    <>
      <PageHeader
        title="Quizzes"
        sub="Pick a topic and test yourself — as many times as you like. Your marks update your progress map."
        actions={
          <Button variant="outline" size="sm" onClick={() => go({ name: 's-revise' })}>
            <Layers className="h-4 w-4" /> Flashcards
          </Button>
        }
      />

      <div className="rounded-xl border bg-[var(--accent)]/25 p-4 mb-5 flex gap-3 text-sm">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
        <p className="text-muted-foreground">
          Every attempt gets automatic feedback and full explanations — and these practice quizzes are
          completely separate from the tasks your teacher sets you.
        </p>
      </div>

      {/* search */}
      <div className="relative mb-6" role="search">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search quizzes — try “break-even”, “marketing”, “2.4”…"
          className="pl-10 pr-10 h-12 text-base rounded-xl bg-card"
          aria-label="Search practice quizzes"
        />
        {query ? (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {query && matches.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-6">
          No practice quizzes match “{query}”. Try a topic number like <span className="font-medium">1.3</span> or a word like <span className="font-medium">cash</span>.
        </p>
      ) : null}

      {[
        { title: 'Theme 1 · Investigating small business', theme: 1 as const },
        { title: 'Theme 2 · Building a business', theme: 2 as const },
      ].map((group) => {
        const rows = matches.filter((q) => q.theme === group.theme);
        return (
          <section key={group.title} className="mb-8">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <Layers3 className="h-4 w-4" /> {group.title}
            </h2>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {query ? 'Nothing in this theme matches your search.' : 'Quizzes coming soon.'}
              </p>
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
                          {t} · {topicTitle(t)}
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
