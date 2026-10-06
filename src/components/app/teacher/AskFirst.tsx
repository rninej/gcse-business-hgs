'use client';

// The ask-first interview. A teacher trialling the platform said it plainly:
// "You didn't ask me any questions — you're meant to satisfy need and you
// don't know what we want." So the Generate flow now interviews the teacher
// BEFORE writing a single question: what's it for, which exact sub-topics,
// how many questions, how tough, which styles, and a free "anything else?".
// Answers collapse into an editable brief; Generate only happens once the
// teacher has said what they want.

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, Loader2, Pencil, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TOPICS, targetLabel } from '@/lib/topics';
import type { QuestionType } from '@/lib/types';
import { cn } from '@/lib/utils';

// ---------- the purpose question (Q1) ----------

export const PURPOSES = [
  { v: 'starter', label: 'Lesson starter', hint: 'A do-now to warm the class up' },
  { v: 'check', label: 'End-of-lesson check', hint: 'Did today’s lesson stick?' },
  { v: 'homework', label: 'Homework', hint: 'Recapping recent lessons' },
  { v: 'topictest', label: 'End-of-topic test', hint: 'A formal test to wrap a topic' },
  { v: 'revision', label: 'Exam revision', hint: 'Exam-style 1BS0 practice' },
  { v: 'baseline', label: 'Baseline check', hint: 'Find the gaps before we start' },
] as const;

/** what each purpose tells the AI — folded into the brief sent to /api/teacher/generate */
export const PURPOSE_PROMPT: Record<string, string> = {
  starter:
    'The teacher wants this as a short lesson starter (do-now): snappy, quick-fire questions to warm a class up at the start of a lesson.',
  check: 'The teacher wants this as an end-of-lesson knowledge check confirming what today’s lesson taught.',
  homework: 'The teacher wants this as a homework quiz recapping recent lessons.',
  topictest:
    'The teacher wants this as a formal end-of-topic test: fuller, even coverage of the selected sub-topics with exam-style wording.',
  revision:
    'The teacher wants this as exam revision: Edexcel GCSE Business (1BS0) exam-style questions across the selected scope.',
  baseline:
    'The teacher wants this as a baseline diagnostic check to find gaps in the class’s understanding — spread the questions across the selected scope.',
};

export function purposeLabel(v: string): string {
  return PURPOSES.find((p) => p.v === v)?.label ?? '';
}

export function difficultyLabel(d: '1' | '2' | '3' | 'mixed'): string {
  return d === 'mixed' ? 'Mixed difficulty' : d === '1' ? 'Foundation' : d === '2' ? 'Standard' : 'Challenge';
}

export function typesLabel(types: QuestionType[], cases: boolean): string {
  const base =
    types.length === 0
      ? 'natural mix of styles'
      : types.map((t) => (t === 'truefalse' ? 'true/false' : t)).join(' + ');
  return cases ? `${base} · case studies` : base;
}

// ---------- interview scaffolding ----------

const QUESTIONS: { n: number; q: string; hint?: string }[] = [
  { n: 1, q: 'What’s the quiz for?', hint: 'So the shape and wording fit how you’ll actually use it.' },
  { n: 2, q: 'Which topics — exactly?', hint: 'Tap a topic for all of it, or open it and pick single sub-topics.' },
  { n: 3, q: 'How many questions?' },
  { n: 4, q: 'How tough should it be?' },
  { n: 5, q: 'Which question styles?' },
  { n: 6, q: 'Anything else I should know?' },
];

const DIFFS: ['mixed' | '1' | '2' | '3', string][] = [
  ['mixed', 'Mixed (recommended)'],
  ['1', 'Foundation'],
  ['2', 'Standard'],
  ['3', 'Challenge'],
];

const STYLES: [QuestionType, string][] = [
  ['mcq', 'Multiple choice'],
  ['term', 'Type the term'],
  ['fib', 'Fill the blank'],
  ['numeric', 'Calculations'],
  ['truefalse', 'True / false'],
  ['written', 'Written · AI marked'],
];

const COUNT_CHIPS = [5, 8, 10, 12, 15, 20, 25, 30];

function Chip({
  on,
  onClick,
  children,
  className,
  title,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={title}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary',
        className
      )}
    >
      {children}
    </button>
  );
}

export interface AskFirstProps {
  /** which question is open, 1–6; 7 = the brief summary */
  step: number;
  onStep: (n: number) => void;
  // Q1 purpose ('' = "doesn't matter")
  purpose: string;
  onPurpose: (v: string) => void;
  // Q2 exact scope
  topics: string[];
  subtopics: string[];
  subCounts: Record<string, number> | null;
  onToggleTopic: (id: string) => void;
  onPickWhole: (id: string) => void;
  onToggleSub: (topicId: string, subId: string) => void;
  // Q3 count
  count: number;
  onCount: (n: number) => void;
  // Q4 difficulty
  difficulty: '1' | '2' | '3' | 'mixed';
  onDifficulty: (d: '1' | '2' | '3' | 'mixed') => void;
  // Q5 styles
  types: QuestionType[];
  onTypes: (t: QuestionType[]) => void;
  cases: boolean;
  onCases: (b: boolean) => void;
  // Q6 free note
  note: string;
  onNote: (s: string) => void;
  // generation
  busy: boolean;
  onGenerate: () => void;
}

export function AskFirst(p: AskFirstProps) {
  // when the teacher jumps back via "change", remember where to return to
  const [returnTo, setReturnTo] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const firstRender = useRef(true);

  const hasScope = p.topics.length + p.subtopics.length > 0 || p.note.trim().length > 0;

  /** move on from question `from` — back to where the teacher jumped from, if anywhere */
  function advance(from: number) {
    p.onStep(returnTo !== null && returnTo > from ? returnTo : from + 1);
    setReturnTo(null);
  }

  /** open an earlier question for editing, remembering the way back */
  function changeTo(n: number, from: number) {
    setReturnTo(from);
    p.onStep(n);
  }

  // gentle scroll so the active question is always visible (mobile especially)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [p.step]);

  function answerText(n: number): string {
    switch (n) {
      case 1:
        return p.purpose ? purposeLabel(p.purpose) : 'Doesn’t matter';
      case 2:
        return p.topics.length + p.subtopics.length > 0
          ? targetLabel(p.topics, p.subtopics)
          : 'I’ll describe it instead';
      case 3:
        return `${p.count} questions`;
      case 4:
        return difficultyLabel(p.difficulty);
      case 5:
        return typesLabel(p.types, p.cases);
      case 6:
        return p.note.trim() ? `“${p.note.trim().slice(0, 90)}${p.note.trim().length > 90 ? '…' : ''}”` : 'Nothing else';
      default:
        return '';
    }
  }

  const summary = p.step === 7;
  const active = summary ? null : QUESTIONS.find((q) => q.n === p.step);

  return (
    <div className="space-y-4">
      {/* assistant header — the product doing the asking */}
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-primary/5"
          aria-hidden
        >
          <Wand2 className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">Before I write anything — a few questions.</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You’re the teacher; I’m not. Answer these and the quiz comes out the way you want it, first time.
          </p>
        </div>
      </div>

      {/* progress dots */}
      <div className="flex items-center gap-2" aria-hidden>
        {QUESTIONS.map((q) => {
          const done = p.step > q.n;
          const now = p.step === q.n;
          return (
            <span
              key={q.n}
              className={cn(
                'h-1.5 rounded-full transition-all',
                now ? 'w-6 bg-primary' : done ? 'w-3 bg-[var(--success)]' : 'w-3 bg-secondary'
              )}
            />
          );
        })}
        <span className="ml-1 text-[11px] text-muted-foreground tabular-nums">
          {summary ? 'All answered — check the brief' : `Question ${p.step} of 6`}
        </span>
      </div>

      {/* answered questions so far — collapsed, editable */}
      {p.step > 1 ? (
        <ol className="space-y-1.5" role="list">
          {QUESTIONS.filter((q) => q.n < p.step).map((q) => (
            <li key={q.n} className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-1.5">
              <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[var(--success)] text-[10px] font-bold text-white tabular-nums">
                {q.n}
              </span>
              <span className="min-w-0 truncate text-xs">
                <span className="text-muted-foreground">{q.q}</span>{' '}
                <span className="font-medium text-foreground">{answerText(q.n)}</span>
              </span>
              <button
                type="button"
                onClick={() => changeTo(q.n, p.step)}
                className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="h-3 w-3" aria-hidden /> change
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      {/* ---------- the summary: the brief, checked by the teacher ---------- */}
      {summary ? (
        <div ref={cardRef} className="glass-soft rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
          <p className="text-sm font-semibold">Here’s what I’ll write:</p>
          <dl className="space-y-1.5">
            {QUESTIONS.map((q) => (
              <div key={q.n} className="flex items-baseline gap-2 text-xs">
                <dt className="w-28 shrink-0 text-muted-foreground">{q.q}</dt>
                <dd className="min-w-0 flex-1 font-medium">{answerText(q.n)}</dd>
                <button
                  type="button"
                  onClick={() => changeTo(q.n, 7)}
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" aria-hidden /> change
                </button>
              </div>
            ))}
          </dl>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <Button onClick={p.onGenerate} disabled={p.busy || !hasScope}>
              {p.busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Writing your questions…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" aria-hidden /> Write the questions
                </>
              )}
            </Button>
            {!hasScope ? (
              <p className="text-xs text-[var(--warn)]">
                Pick your topics — or describe the quiz — first. Tap “change” on question 2 or 6.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Takes up to a minute. You can edit every question after.</p>
            )}
          </div>
        </div>
      ) : active ? (
        /* ---------- one question at a time ---------- */
        <div
          ref={cardRef}
          key={active.n}
          className="glass-soft rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
          aria-live="polite"
        >
          <div>
            <p className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary tabular-nums">
                {active.n}
              </span>
              {active.q}
            </p>
            {active.n === 2 ? (
              <p className="text-xs text-muted-foreground mt-1 pl-7">
                Get exact: open <span className="font-medium text-foreground">2.1</span> and pick just{' '}
                <span className="font-medium text-foreground">2.1.3 Business and globalisation</span> — the quiz will
                cover only what you pick, nothing else.
              </p>
            ) : active.hint ? (
              <p className="text-xs text-muted-foreground mt-1 pl-7">{active.hint}</p>
            ) : null}
          </div>

          {/* Q1 — purpose */}
          {active.n === 1 ? (
            <div className="space-y-2.5 pl-0 sm:pl-7">
              <div className="flex flex-wrap gap-2" role="group" aria-label="What the quiz is for">
                {PURPOSES.map((o) => (
                  <Chip key={o.v} on={p.purpose === o.v} onClick={() => { p.onPurpose(o.v); advance(1); }} title={o.hint}>
                    {o.label}
                  </Chip>
                ))}
              </div>
              <div>
                <Chip on={p.purpose === ''} onClick={() => { p.onPurpose(''); advance(1); }}>
                  Doesn’t matter — just good questions
                </Chip>
              </div>
            </div>
          ) : null}

          {/* Q2 — exact topics/sub-topics */}
          {active.n === 2 ? (
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Topics">
                {TOPICS.map((t) => {
                  const whole = p.topics.includes(t.id);
                  const subs = p.subtopics.filter((s) => s.startsWith(t.id + '.'));
                  const on = whole || subs.length > 0;
                  return (
                    <Chip
                      key={t.id}
                      on={on}
                      onClick={() => p.onToggleTopic(t.id)}
                    >
                      {t.id} {t.short}
                      {on && !whole ? <span className="ml-1 opacity-80 tabular-nums">({subs.length})</span> : null}
                    </Chip>
                  );
                })}
              </div>
              {TOPICS.filter((t) => p.topics.includes(t.id) || p.subtopics.some((s) => s.startsWith(t.id + '.'))).map(
                (t) => {
                  const whole = p.topics.includes(t.id);
                  const subs = p.subtopics.filter((s) => s.startsWith(t.id + '.'));
                  return (
                    <div key={t.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">
                          {t.id} · {t.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {whole ? 'whole topic' : `${subs.length} of ${t.subtopics.length} sub-topics picked`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Sub-topics within ${t.title}`}>
                        <Chip on={whole} onClick={() => p.onPickWhole(t.id)} className="text-[11px] px-2.5 py-1">
                          Whole topic
                        </Chip>
                        {t.subtopics.map((st) => {
                          const on = whole || subs.includes(st.id);
                          const c = p.subCounts?.[st.id];
                          return (
                            <Chip
                              key={st.id}
                              on={on}
                              onClick={() => p.onToggleSub(t.id, st.id)}
                              className="text-[11px] px-2.5 py-1"
                            >
                              {st.id} {st.short}
                              {c !== undefined ? <span className="ml-1 opacity-70 tabular-nums">{c}</span> : null}
                            </Chip>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
              {p.topics.length + p.subtopics.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nothing picked yet — or skip this and simply describe the quiz in question 6.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Scope: <span className="font-medium text-foreground">{targetLabel(p.topics, p.subtopics)}</span> —
                  little numbers show bank coverage per sub-topic.
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  {p.topics.length + p.subtopics.length === 0
                    ? 'You can leave this empty if you describe it later.'
                    : 'All set.'}
                </span>
                <Button size="sm" onClick={() => advance(2)}>
                  That’s the scope <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </div>
          ) : null}

          {/* Q3 — count */}
          {active.n === 3 ? (
            <div className="space-y-3 pl-0 sm:pl-7">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Number of questions">
                {COUNT_CHIPS.map((n) => (
                  <Chip
                    key={n}
                    on={p.count === n}
                    onClick={() => {
                      p.onCount(n);
                      advance(3);
                    }}
                  >
                    {n}
                  </Chip>
                ))}
              </div>
              <div className="space-y-1.5 max-w-xs">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>or fine-tune</span>
                  <span className="font-semibold text-foreground tabular-nums">{p.count}</span>
                </div>
                <Slider value={[p.count]} min={5} max={30} step={1} onValueChange={(v) => p.onCount(v[0] ?? 12)} />
              </div>
              <Button size="sm" variant="outline" onClick={() => advance(3)}>
                {p.count} questions is right <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          ) : null}

          {/* Q4 — difficulty */}
          {active.n === 4 ? (
            <div className="space-y-2.5 pl-0 sm:pl-7">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Difficulty">
                {DIFFS.map(([v, label]) => (
                  <Chip
                    key={v}
                    on={p.difficulty === v}
                    onClick={() => {
                      p.onDifficulty(v);
                      advance(4);
                    }}
                  >
                    {label}
                  </Chip>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Mixed mirrors the exam: a spread of easy wins and proper stretch.
              </p>
            </div>
          ) : null}

          {/* Q5 — styles */}
          {active.n === 5 ? (
            <div className="space-y-3 pl-0 sm:pl-7">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Question styles">
                {STYLES.map(([t, label]) => (
                  <Chip
                    key={t}
                    on={p.types.includes(t)}
                    onClick={() =>
                      p.onTypes(p.types.includes(t) ? p.types.filter((x) => x !== t) : [...p.types, t])
                    }
                  >
                    {label}
                  </Chip>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3 max-w-sm">
                <div>
                  <div className="text-xs font-medium">Include case studies</div>
                  <p className="text-[11px] text-muted-foreground">Short business extracts above some questions.</p>
                </div>
                <Switch checked={p.cases} onCheckedChange={p.onCases} aria-label="Include case studies" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Leave all off and I’ll mix them naturally.</p>
                <Button size="sm" onClick={() => advance(5)}>
                  Next <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </div>
          ) : null}

          {/* Q6 — anything else */}
          {active.n === 6 ? (
            <div className="space-y-2.5 pl-0 sm:pl-7">
              <Textarea
                value={p.note}
                onChange={(e) => p.onNote(e.target.value)}
                rows={3}
                maxLength={600}
                placeholder="e.g. “feature a fictional bakery”, “they found multinationals hard — go easy on it”, “one 6-mark written question at the end”…"
                aria-label="Anything else the quiz writer should know"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground tabular-nums">
                  Optional <span className="ml-1">{p.note.length}/600</span>
                </p>
                <Button size="sm" onClick={() => advance(6)}>
                  That’s everything <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </div>
          ) : null}

          {/* back link */}
          {active.n > 1 ? (
            <button
              type="button"
              onClick={() => {
                setReturnTo(null);
                p.onStep(active.n - 1);
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> back
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
