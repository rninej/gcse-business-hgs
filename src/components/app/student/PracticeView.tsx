'use client';

import { useEffect, useMemo, useState } from 'react';
import { PlayCircle, Layers3, Sparkles, Search, X, Layers, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PageHeader, ThemedSkeleton, ErrorNote, TypeBadge } from '@/components/shared';
import { topicTitle, TOPIC_MAP, TOPICS } from '@/lib/topics';
import { cn } from '@/lib/utils';
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

      {/* build your own quiz — the hero: a one-off mix from the practice pool */}
      <MixBuilder />

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

/* ------------------------------------------------------------------ */
/* Build your own quiz — pick topics, a question count and (optionally) */
/* a difficulty, then the server assembles a one-off practice attempt    */
/* from the practice pool. Untimed, unlimited goes, exactly like the     */
/* library quizzes — it is the same practice machinery underneath.       */
/* ------------------------------------------------------------------ */

const DIFFICULTY_OPTIONS: { value: 'mixed' | '1' | '2' | '3'; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: '1', label: 'Foundation' },
  { value: '2', label: 'Standard' },
  { value: '3', label: 'Challenge' },
];

function MixBuilder() {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'mixed' | '1' | '2' | '3'>('mixed');
  const [building, setBuilding] = useState(false);

  function toggle(id: string) {
    setTopics((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function start() {
    if (topics.size === 0 || building) return;
    setBuilding(true);
    try {
      const res = await api.post<{ attemptId: string }>('/api/student/practice', {
        topics: [...topics],
        count,
        difficulty,
      });
      go({ name: 'quiz', attemptId: res.attemptId });
    } catch (e) {
      toast({ title: 'Could not build your quiz', description: (e as Error).message });
      setBuilding(false);
    }
  }

  const picked = topics.size;

  return (
    <section className="glass rounded-2xl p-4 sm:p-6 mb-5 anim-rise" aria-label="Build your own quiz">
      <div className="flex items-start gap-3.5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"
          aria-hidden
        >
          <Wand2 className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-semibold leading-tight">Build your own quiz</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pick your topics, choose how many questions — we&rsquo;ll do the rest.
          </p>
        </div>
      </div>

      {/* topic chips — all 10 spec topics, wrap on any width */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Pick your topics">
        {TOPICS.map((t) => {
          const on = topics.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              aria-pressed={on}
              className={cn(
                'glass-soft rounded-full h-9 px-3.5 text-[13px] inline-flex items-center gap-1.5 press',
                on
                  ? 'glass-selected font-semibold text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="tabular-nums font-medium">{t.id}</span> {t.short}
            </button>
          );
        })}
      </div>

      {/* count + difficulty */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Questions
            </span>
            <span className="text-sm font-bold tabular-nums text-primary">{count}</span>
          </div>
          <Slider
            value={[count]}
            min={5}
            max={30}
            step={5}
            onValueChange={(v) => setCount(v[0] ?? 10)}
            aria-label="How many questions"
          />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Difficulty <span className="font-normal normal-case">· optional</span>
          </span>
          <div
            className="mt-2 flex flex-wrap gap-1 glass-soft rounded-xl p-1"
            role="group"
            aria-label="Difficulty"
          >
            {DIFFICULTY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setDifficulty(o.value)}
                aria-pressed={difficulty === o.value}
                className={cn(
                  'rounded-lg h-8 px-3 text-[13px] font-medium transition-colors press',
                  difficulty === o.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* action row */}
      <div className="mt-5 pt-4 border-t border-white/40 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-xs text-muted-foreground min-w-0 flex-1" aria-live="polite">
          {picked === 0
            ? 'Pick at least one topic to get started.'
            : `${picked} topic${picked === 1 ? '' : 's'} picked · untimed, unlimited goes`}
        </p>
        <Button
          onClick={() => void start()}
          disabled={picked === 0 || building}
          className="w-full sm:w-auto shadow-[0_8px_24px_-8px_var(--primary)]"
        >
          <Wand2 className={cn('h-4 w-4', building && 'animate-spin')} />
          {building ? 'Building…' : 'Start my quiz'}
        </Button>
      </div>
    </section>
  );
}
