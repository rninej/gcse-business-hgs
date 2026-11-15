'use client';

// The public, no-sign-up demo. Six real bank questions, marked by the same
// deterministic server-side engine the product uses. No AI, no account, no
// student data — just the thing itself, which is what teachers want to see.

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Loader2, X } from 'lucide-react';
import type { ClientQuestion } from '@/lib/types';

interface MarkedResult {
  id: string;
  correct: boolean;
  expected: string;
  given: string;
  explain: string;
  marks: number;
}

export function DemoQuiz({ questions }: { questions: ClientQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, MarkedResult> | null>(null);
  const [summary, setSummary] = useState<{ score: number; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const done = results !== null;
  const answered = questions.filter((q) => (answers[q.id] ?? '').trim() !== '').length;

  const set = (id: string, value: string) => setAnswers((a) => ({ ...a, [id]: value }));

  async function mark() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/demo/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error('That did not mark — please try again.');
      const data = (await res.json()) as { results: MarkedResult[]; score: number; total: number };
      setResults(Object.fromEntries(data.results.map((r) => [r.id, r])));
      setSummary({ score: data.score, total: data.total });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setAnswers({});
    setResults(null);
    setSummary(null);
    setError(null);
  }

  function renderInput(q: ClientQuestion) {
    const value = answers[q.id] ?? '';

    if (q.type === 'mcq') {
      return (
        <ul className="mt-3 space-y-2">
          {(q.options ?? []).map((opt, i) => {
            const v = String(i);
            const chosen = value === v;
            return (
              <li key={v}>
                <label
                  className={
                    'flex items-start gap-2.5 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ' +
                    (chosen ? 'border-primary/60 bg-primary/5' : 'hover:bg-foreground/5')
                  }
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={v}
                    checked={chosen}
                    disabled={done}
                    onChange={() => set(q.id, v)}
                    className="mt-1 accent-[var(--primary)]"
                  />
                  <span>{opt}</span>
                </label>
              </li>
            );
          })}
        </ul>
      );
    }

    if (q.type === 'truefalse') {
      return (
        <div className="mt-3 flex gap-2">
          {['True', 'False'].map((opt) => {
            const chosen = value === opt;
            return (
              <button
                key={opt}
                type="button"
                disabled={done}
                onClick={() => set(q.id, opt)}
                className={
                  'rounded-md border px-4 py-1.5 text-sm transition-colors ' +
                  (chosen ? 'border-primary/60 bg-primary/5 font-medium' : 'hover:bg-foreground/5')
                }
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="mt-3 flex max-w-sm items-center gap-2">
        <Input
          value={value}
          disabled={done}
          onChange={(e) => set(q.id, e.target.value)}
          placeholder={q.type === 'numeric' ? 'Your answer' : q.type === 'fib' ? 'One word…' : 'Type the term…'}
          aria-label={`Answer for question ${q.n}`}
          inputMode={q.type === 'numeric' ? 'decimal' : 'text'}
        />
        {q.type === 'numeric' && q.unit ? (
          <span className="text-sm text-muted-foreground">{q.unit}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <ol className="space-y-4">
        {questions.map((q) => {
          const r = results?.[q.id];
          return (
            <li key={q.id}>
              <article className="rounded-xl border border-white/60 bg-card/70 backdrop-blur-xl p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.6),0_8px_32px_-16px_rgb(13_92_70/0.18)]">
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <span className="rounded bg-foreground/5 px-1.5 py-0.5">Q{q.n}</span>
                  <span>Topic {q.topic}</span>
                  <span>·</span>
                  <span>
                    {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                  </span>
                  {r ? (
                    <span
                      className={
                        'ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-semibold ' +
                        (r.correct
                          ? 'bg-[var(--success)]/15 text-[var(--success)]'
                          : 'bg-[var(--danger)]/15 text-[var(--danger)]')
                      }
                    >
                      {r.correct ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
                      {r.correct ? `+${q.marks}` : '0'}
                    </span>
                  ) : null}
                </div>

                {q.extract ? (
                  <div className="mt-3 rounded-lg border border-white/50 bg-[var(--accent)]/25 px-3.5 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-foreground)]">
                      Case study · {q.extract.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{q.extract.text}</p>
                  </div>
                ) : null}

                <p className="mt-3 text-sm font-medium leading-snug">{q.stem}</p>

                {renderInput(q)}

                {r ? (
                  <div
                    className={
                      'mt-3 rounded-lg border px-3.5 py-2.5 text-[13px] leading-relaxed ' +
                      (r.correct
                        ? 'border-[var(--success)]/35 bg-[var(--success)]/8'
                        : 'border-[var(--danger)]/35 bg-[var(--danger)]/8')
                    }
                  >
                    <p className="font-medium">
                      {r.correct ? 'Correct' : `Correct answer: ${r.expected}`}
                      {r.correct ? ` — ${r.expected}` : ''}
                    </p>
                    <p className="mt-1 text-muted-foreground">{r.explain}</p>
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p className="mt-4 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}

      {summary ? (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-sm font-semibold">
            {summary.score} / {summary.total} marks
            <span className="ml-2 font-normal text-muted-foreground">
              ({Math.round((summary.score / Math.max(summary.total, 1)) * 100)}%) — marked by the same engine your
              students get.
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            In class, every mark comes with a topic breakdown for the whole class and a CSV export.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/">Set your school up</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">See pricing</Link>
            </Button>
            <Button variant="ghost" onClick={reset}>
              Try again
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => void mark()} disabled={busy || answered === 0} size="lg">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {busy ? 'Marking…' : 'Mark my answers'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {answered} of {questions.length} answered — you can submit a partial attempt.
          </span>
        </div>
      )}
    </div>
  );
}
