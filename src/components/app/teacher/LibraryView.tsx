'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Layers3, ArrowRight, Eye, SendHorizonal, Search, X, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { PageHeader, ThemedSkeleton, ErrorNote, MarksChip, TypeBadge } from '@/components/shared';
import { Diagram } from '@/components/charts';
import { topicTitle, TOPIC_MAP } from '@/lib/topics';
import type { Question } from '@/lib/types';

interface QuizRow {
  id: string;
  title: string;
  blurb: string;
  theme: 1 | 2;
  topics: string[];
  audience: 'practice' | 'assignment';
  questionCount: number;
  types: Question['type'][];
}

export function LibraryView() {
  const go = useApp((s) => s.go);
  const [quizzes, setQuizzes] = useState<QuizRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .get<{ quizzes: QuizRow[] }>('/api/quizzes?audience=assignment')
      .then((d) => setQuizzes(d.quizzes))
      .catch((e) => setError((e as Error).message));
  }, []);

  const loadFull = useCallback(async (quizId: string): Promise<Question[]> => {
    // questions are exposed to teachers through the assignment preview API
    const res = await api.get<{ questions: Question[] }>(`/api/teacher/assignments/preview/${quizId}`);
    return res.questions;
  }, []);

  /** search across title, blurb, topic ids + titles, question types */
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
        <PageHeader title="Quiz library" />
        <ErrorNote message={error} />
      </>
    );
  if (!quizzes)
    return (
      <>
        <PageHeader title="Quiz library" />
        <ThemedSkeleton rows={3} />
      </>
    );

  const t1 = matches.filter((q) => q.theme === 1);
  const t2 = matches.filter((q) => q.theme === 2);

  return (
    <>
      <PageHeader
        title="Quiz library"
        sub="Hand-written banks aligned to the Edexcel spec — preview every question before you set it."
      />

      {/* search */}
      <div className="relative mb-6" role="search">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the library — try “cash flow”, “2.4”, “motivation”…"
          className="pl-10 pr-10 h-12 text-base rounded-xl bg-card"
          aria-label="Search the quiz library"
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
          No quizzes match “{query}”. Try a topic number like <span className="font-medium">1.3</span> or a word like <span className="font-medium">marketing</span>.
        </p>
      ) : null}

      {[
        { title: 'Theme 1 · Investigating small business', rows: t1 },
        { title: 'Theme 2 · Building a business', rows: t2 },
      ].map((group) => (
        <section key={group.title} className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            <Layers3 className="h-4 w-4" /> {group.title}
          </h2>
          {group.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Coming soon.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {group.rows.map((q) => (
                <div key={q.id} className="rounded-xl border bg-card p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
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
                  <div className="flex gap-2 mt-4 pt-3 border-t mt-auto">
                    <QuizPreview quizId={q.id} load={loadFull} />
                    <Button size="sm" className="ml-auto" onClick={() => go({ name: 't-new', presetQuizId: q.id })}>
                      Assign this <SendHorizonal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}

function QuizPreview({ quizId, load }: { quizId: string; load: (quizId: string) => Promise<Question[]> }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [trying, setTrying] = useState(false);

  /** play the whole quiz yourself — exactly like a student sees it, without
   *  assigning anything (a private self-test that never touches class stats) */
  async function tryIt() {
    if (trying) return;
    setTrying(true);
    try {
      const res = await api.post<{ attemptId: string }>('/api/teacher/selftest', { quizId });
      go({ name: 'quiz', attemptId: res.attemptId });
    } catch (e) {
      setTrying(false);
      toast({ title: 'Could not start the self-test', description: (e as Error).message, variant: 'destructive' });
    }
  }

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !qs && !err) {
      try {
        setQs(await load(quizId));
      } catch (e) {
        setErr((e as Error).message);
      }
    }
  }

  return (
    <Collapsible open={open} onOpenChange={toggle} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-3.5 w-3.5" /> {open ? 'Hide questions' : 'Preview questions'}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 w-full">
        {err ? <p className="text-sm text-[var(--danger)]">{err}</p> : null}
        {!qs && !err ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {qs ? (
          <>
            <ol className="space-y-3 max-h-96 overflow-y-auto scroll-slim pr-1">
            {qs.map((q, i) => (
              <li key={q.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary tabular-nums">{i + 1}</span>
                  <TypeBadge type={q.type} />
                  <MarksChip marks={q.marks} />
                  <span className="text-[10px] text-muted-foreground ml-auto">{q.topic}</span>
                </div>
                {q.extract ? (
                  <p className="text-xs italic text-muted-foreground border-l-2 pl-2 my-1.5">
                    [Case study · {q.extract.title}] {q.extract.text.slice(0, 140)}
                    {q.extract.text.length > 140 ? '…' : ''}
                  </p>
                ) : null}
                <p>{q.stem}</p>
                {q.type === 'mcq' ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Options: {q.options.join(' · ')} — <span className="text-[var(--success)] font-medium">correct: {q.options[q.correct]}</span>
                  </p>
                ) : null}
                {q.type === 'term' || q.type === 'fib' ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Accept: <span className="text-[var(--success)] font-medium">{q.accept.join(' / ')}</span>
                  </p>
                ) : null}
                {q.type === 'numeric' ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Answer: <span className="text-[var(--success)] font-medium">{q.value}{q.unit ?? ''} ± {q.tol}</span>
                  </p>
                ) : null}
                {q.type === 'truefalse' ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Answer: <span className="text-[var(--success)] font-medium">{q.answer ? 'True' : 'False'}</span>
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground/80 mt-1.5">Explanation: {q.explain}</p>
                {q.diagram ? <div className="scale-[0.92] origin-top-left"><Diagram k={q.diagram} /></div> : null}
              </li>
            ))}
          </ol>
            <div className="mt-3 pt-3 border-t border-white/40">
              <Button size="sm" variant="outline" onClick={() => void tryIt()} disabled={trying} className="border-primary/40 text-primary hover:bg-primary/5">
                <FlaskConical className={trying ? 'h-3.5 w-3.5 animate-pulse' : 'h-3.5 w-3.5'} />
                {trying ? 'Starting…' : 'Try it yourself'}
              </Button>
            </div>
          </>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
