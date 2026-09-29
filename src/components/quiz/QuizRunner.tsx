'use client';

// Quiz player with silent integrity telemetry.
// Records per-question timing, keystrokes, paste/copy events (with pasted text),
// tab switches and hidden time. Nothing is shown to the student; everything is
// scored server-side and surfaced only to teachers.
//
// All mutable bookkeeping lives in a module-scope store class; the component
// body only calls methods, which keeps the render path immutable.

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Timer,
  SendHorizonal,
  AlertTriangle,
  BookOpenText,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { ErrorNote, MarksChip, TypeBadge } from '@/components/shared';
import { Diagram } from '@/components/charts';
import type { ClientQuestion, PerQTelemetry, TelemetryEvent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RunData {
  status: 'in-progress';
  mode: 'assignment' | 'practice';
  title: string;
  dueAt: number | null;
  startedAt: number;
  timeLimitMin: number | null;
  remainingMs: number | null;
  serverNow: number;
  questions: ClientQuestion[];
}

interface Snapshot {
  answers: Record<string, string>;
  idx: number;
  perQ: Record<string, PerQTelemetry>;
  events: TelemetryEvent[];
  hiddenMs: number;
  startedClientMs: number;
}

class RunStore {
  perQ: Record<string, PerQTelemetry> = {};
  events: TelemetryEvent[] = [];
  hiddenMs = 0;
  hiddenSince: number | null = null;
  startedClientMs = Date.now();
  qEnter = Date.now();
  qAtFocus: Record<string, string> = {};
  submitted = false;

  record(e: TelemetryEvent['e'], d?: string) {
    this.events.push({ e, t: Date.now() - this.startedClientMs, d: d?.slice(0, 240) });
    if (this.events.length > 400) this.events = this.events.slice(-400);
  }

  markHidden() {
    this.record('hide');
    this.hiddenSince = Date.now();
  }

  markVisible() {
    this.record('show');
    this.closeHidden();
  }

  closeHidden() {
    if (this.hiddenSince !== null) {
      this.hiddenMs += Date.now() - this.hiddenSince;
      this.hiddenSince = null;
    }
  }

  flushQ(qid: string) {
    const t = this.perQ[qid] ?? { ms: 0, ks: 0, ch: 0 };
    t.ms += Math.max(0, Date.now() - this.qEnter);
    this.perQ[qid] = t;
    this.qEnter = Date.now();
  }

  key(qid: string, currentAnswer: string) {
    const t = this.perQ[qid] ?? { ms: 0, ks: 0, ch: 0 };
    t.ks += 1;
    this.perQ[qid] = t;
    if (this.qAtFocus[qid] === undefined) this.qAtFocus[qid] = currentAnswer;
  }

  leaveText(qid: string, finalValue: string) {
    const before = this.qAtFocus[qid];
    if (before === undefined) return;
    if (before !== finalValue) {
      const t = this.perQ[qid] ?? { ms: 0, ks: 0, ch: 0 };
      t.ch += 1;
      this.perQ[qid] = t;
    }
    delete this.qAtFocus[qid];
  }

  wallMs() {
    return Date.now() - this.startedClientMs;
  }

  markSubmitted() {
    this.submitted = true;
  }

  resetSubmitted() {
    this.submitted = false;
  }

  restore(snap: Partial<Snapshot>) {
    this.perQ = snap.perQ ?? {};
    this.events = snap.events ?? [];
    this.hiddenMs = snap.hiddenMs ?? 0;
    if (snap.startedClientMs) this.startedClientMs = snap.startedClientMs;
    this.qEnter = Date.now();
  }
}

export function QuizRunner({ attemptId }: { attemptId: string }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();

  const [store] = useState(() => new RunStore());
  const [data, setData] = useState<RunData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedView, setSubmittedView] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const lsKey = `hgs_run_${attemptId}`;

  const questions = data?.questions ?? [];
  const total = questions.length;
  const q: ClientQuestion | undefined = questions[idx];
  const answeredCount = useMemo(
    () => questions.filter((x) => (answers[x.id] ?? '') !== '').length,
    [questions, answers]
  );
  const deadline = useMemo(
    () => (data?.remainingMs != null ? Date.now() + data.remainingMs : null),
    [data]
  );

  /* ----- actions (declared before the effects that close over them) ----- */

  function persist() {
    if (!data || store.submitted) return;
    const snap: Snapshot = {
      answers,
      idx,
      perQ: store.perQ,
      events: store.events,
      hiddenMs: store.hiddenMs,
      startedClientMs: store.startedClientMs,
    };
    try {
      localStorage.setItem(lsKey, JSON.stringify(snap));
    } catch {
      /* storage unavailable — ignore */
    }
  }

  function goto(newIdx: number) {
    if (!q || store.submitted) return;
    store.flushQ(q.id);
    if (q.type === 'term' || q.type === 'fib' || q.type === 'numeric') {
      store.leaveText(q.id, answers[q.id] ?? '');
    }
    setIdx(Math.max(0, Math.min(newIdx, total - 1)));
  }

  function pickOption(qid: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function typeAnswer(qid: string, value: string) {
    store.key(qid, answers[qid] ?? '');
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  async function doSubmit(auto = false) {
    if (!data || store.submitted || submitting) return;
    store.markSubmitted();
    setSubmitting(true);
    setSubmitFailed(false);
    const cur = questions[idx];
    if (cur) {
      store.flushQ(cur.id);
      if (cur.type === 'term' || cur.type === 'fib' || cur.type === 'numeric') {
        store.leaveText(cur.id, answers[cur.id] ?? '');
      }
    }
    store.closeHidden();
    try {
      localStorage.removeItem(lsKey);
      await api.post(`/api/student/attempts/${attemptId}/submit`, {
        answers,
        perQ: store.perQ,
        events: store.events,
        wallMs: store.wallMs(),
        hiddenMs: store.hiddenMs,
      });
      go({ name: 'result', attemptId });
    } catch (e) {
      store.resetSubmitted();
      setSubmitting(false);
      setSubmitFailed(true);
      const msg = (e as Error).message;
      if (msg.includes('already submitted') || msg.includes('Already submitted')) {
        go({ name: 'result', attemptId });
        return;
      }
      setError(msg);
      toast({ title: 'Could not submit', description: msg, variant: 'destructive' });
      if (!auto) window.scrollTo({ top: 0 });
    }
  }

  /* ----- effects (after all declarations) ----- */

  // load attempt / restore saved progress
  useEffect(() => {
    let alive = true;
    api
      .get<RunData & { status: string }>(`/api/student/attempts/${attemptId}`)
      .then((d) => {
        if (!alive) return;
        if (d.status === 'submitted') {
          setSubmittedView(true);
          return;
        }
        setData(d);
        let snap: Partial<Snapshot> | null = null;
        try {
          const raw = localStorage.getItem(lsKey);
          if (raw) snap = JSON.parse(raw) as Partial<Snapshot>;
        } catch {
          snap = null;
        }
        if (snap) {
          setAnswers(snap.answers ?? {});
          setIdx(Math.min(snap.idx ?? 0, Math.max(0, d.questions.length - 1)));
          store.restore(snap);
        }
      })
      .catch((e) => {
        if (alive) setError((e as Error).message);
      });
    return () => {
      alive = false;
    };
     
  }, [attemptId]);

  // listeners + tickers while the quiz is open
  useEffect(() => {
    if (!data || submittedView) return;

    const onVis = () => {
      if (document.visibilityState === 'hidden') store.markHidden();
      else store.markVisible();
    };
    const onBlur = () => store.record('blur');
    const onFocus = () => store.record('focus');
    const onPaste = (e: ClipboardEvent) => {
      let text = '';
      try {
        text = e.clipboardData?.getData('text') ?? '';
      } catch {
        text = '';
      }
      store.record('paste', text || '(no text)');
    };
    const onCopy = (e: ClipboardEvent) => {
      let text = '';
      try {
        const sel = document.getSelection()?.toString() ?? '';
        text = sel || ((e.target as HTMLElement)?.innerText?.slice(0, 240) ?? '');
      } catch {
        text = '';
      }
      store.record(e.type === 'cut' ? 'cut' : 'copy', text);
    };

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('paste', onPaste);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCopy);

    const ticker = setInterval(() => setNow(Date.now()), 300);
    const saver = setInterval(() => persist(), 5000);
    const onLeave = () => persist();
    window.addEventListener('beforeunload', onLeave);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCopy);
      window.removeEventListener('beforeunload', onLeave);
      clearInterval(ticker);
      clearInterval(saver);
      store.closeHidden();
    };
     
  }, [data, submittedView]);

  // auto-submit when the clock runs out
  useEffect(() => {
    if (!data || deadline === null) return;
    if (now < deadline) return;
    if (!store.submitted && !submitting) {
      toast({ title: 'Time is up', description: 'Your answers were submitted automatically.' });
      void doSubmit(true);
    }
     
  }, [now, deadline, data, submitting]);

  /* ----- render ----- */

  if (error)
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <ErrorNote message={error} />
        {submitFailed ? (
          <div className="flex gap-3">
            <Button onClick={() => void doSubmit()} disabled={submitting}>
              {submitting ? 'Marking…' : 'Try submitting again'}
            </Button>
            <Button variant="ghost" onClick={() => go({ name: 's-home' })}>
              <ArrowLeft className="h-4 w-4" /> Back home
            </Button>
          </div>
        ) : (
          <Button variant="ghost" className="mt-4" onClick={() => go({ name: 's-home' })}>
            <ArrowLeft className="h-4 w-4" /> Back home
          </Button>
        )}
      </div>
    );

  if (submittedView) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 space-y-4">
        <p className="text-lg font-medium">This attempt has already been submitted.</p>
        <Button onClick={() => go({ name: 'result', attemptId })}>View result</Button>
      </div>
    );
  }

  if (!data || !q) {
    return (
      <div className="max-w-3xl mx-auto space-y-4" aria-busy>
        <div className="h-8 w-2/3 rounded-lg bg-secondary animate-pulse" />
        <div className="h-40 rounded-xl bg-secondary animate-pulse" />
      </div>
    );
  }

  const remaining = deadline !== null ? Math.max(0, deadline - now) : null;
  const timerCritical = remaining !== null && remaining < 60_000;
  const timeStr =
    remaining !== null
      ? `${Math.floor(remaining / 60000)}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`
      : null;
  const progress = total ? (answeredCount / total) * 100 : 0;
  const unanswered = total - answeredCount;

  return (
    <div className="max-w-4xl mx-auto" data-attempt={attemptId}>
      {/* header */}
      <div className="sticky top-14 md:top-0 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 mb-5">
        <div className="rounded-xl border bg-card/95 backdrop-blur px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={data.mode === 'practice' ? 'secondary' : 'default'} className="shrink-0">
              {data.mode === 'practice' ? 'Practice' : 'Assignment'}
            </Badge>
            <div className="font-semibold text-sm truncate flex-1 min-w-0">{data.title}</div>
            {timeStr !== null ? (
              <span
                className={cn(
                  'font-mono text-sm font-bold tabular-nums px-2.5 py-1 rounded-lg',
                  timerCritical ? 'bg-[var(--danger)]/10 text-[var(--danger)] animate-pulse' : 'bg-secondary'
                )}
                role="timer"
                aria-label="Time remaining"
              >
                <Timer className="inline h-3.5 w-3.5 mr-1.5" aria-hidden />
                {timeStr}
              </span>
            ) : null}
            <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-3.5 w-3.5" /> Exit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave this quiz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {data.timeLimitMin
                      ? 'Your answers are saved, but the timer keeps running and will submit whatever you have written when it hits zero.'
                      : 'Your answers are saved on this device — you can continue later.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep working</AlertDialogCancel>
                  <AlertDialogAction onClick={() => go({ name: 's-home' })}>Leave</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              {answeredCount}/{total} answered
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              Q{idx + 1} of {total}
            </span>
          </div>
        </div>
      </div>

      <div className={cn('grid gap-5', q.extract ? 'lg:grid-cols-[1fr_1.25fr]' : '')}>
        {/* extract panel */}
        {q.extract ? (
          <aside className="lg:sticky lg:top-32 self-start rounded-xl border bg-[var(--accent)]/20 p-5 order-2 lg:order-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-foreground)] uppercase tracking-wide mb-2">
              <BookOpenText className="h-4 w-4" aria-hidden /> Case study · {q.extract.title}
            </div>
            {q.extract.image ? (
              <img src={q.extract.image} alt={`Case study illustration for ${q.extract.title}`} className="rounded-lg border mb-3 w-full" />
            ) : null}
            <p className="text-[15px] leading-relaxed whitespace-pre-line">{q.extract.text}</p>
          </aside>
        ) : null}

        {/* question card */}
        <section className={cn('order-1 lg:order-2', !q.extract && 'mx-auto w-full max-w-2xl')}>
          <div className="rounded-xl border bg-card p-5 sm:p-7">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm tabular-nums" aria-hidden>
                {idx + 1}
              </span>
              <TypeBadge type={q.type} />
              <MarksChip marks={q.marks} />
              <span className="text-[11px] text-muted-foreground ml-auto">GCSE Business · {q.topic}</span>
            </div>

            <h2 className="text-lg sm:text-xl leading-relaxed font-medium">{q.stem}</h2>

            {q.diagram ? <Diagram k={q.diagram} /> : null}
            {q.image ? <img src={q.image} alt="Question illustration" className="rounded-lg border my-4 w-full" /> : null}

            {/* answer controls */}
            <div className="mt-6">
              {q.type === 'mcq' ? (
                <div className="grid gap-2.5" role="radiogroup" aria-label="Options">
                  {q.options?.map((opt, i) => {
                    const sel = answers[q.id] === String(i);
                    return (
                      <button
                        key={i}
                        role="radio"
                        aria-checked={sel}
                        onClick={() => pickOption(q.id, String(i))}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all',
                          sel ? 'border-primary bg-primary/10 shadow-sm' : 'hover:bg-secondary/70'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                            sel ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                          )}
                          aria-hidden
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-[15px]">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {q.type === 'truefalse' ? (
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="True or false">
                  {[
                    ['true', 'True'],
                    ['false', 'False'],
                  ].map(([v, label]) => {
                    const sel = answers[q.id] === v;
                    return (
                      <button
                        key={v}
                        role="radio"
                        aria-checked={sel}
                        onClick={() => pickOption(q.id, v)}
                        className={cn(
                          'rounded-xl border py-4 text-lg font-semibold transition-all',
                          sel ? 'border-primary bg-primary/10' : 'hover:bg-secondary/70'
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {q.type === 'term' || q.type === 'fib' ? (
                <div>
                  <Input
                    value={answers[q.id] ?? ''}
                    onChange={(e) => typeAnswer(q.id, e.target.value)}
                    placeholder={q.type === 'term' ? 'Type the term…' : 'One word…'}
                    className="text-lg h-14"
                    autoFocus
                    enterKeyHint="done"
                    aria-label="Your answer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Capitals and extra spaces don’t matter. Spelling does.
                  </p>
                </div>
              ) : null}

              {q.type === 'numeric' ? (
                <div>
                  <div className="relative">
                    <Input
                      value={answers[q.id] ?? ''}
                      onChange={(e) => typeAnswer(q.id, e.target.value)}
                      placeholder="e.g. 59.8"
                      className="text-lg h-14 font-mono pr-16"
                      inputMode="decimal"
                      autoFocus
                      enterKeyHint="done"
                      aria-label="Your answer"
                    />
                    {q.unit ? (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                        {q.unit}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    £, % and commas are fine — the marker reads the number.
                    {q.dp ? ` Answer to ${q.dp} decimal place${q.dp === 1 ? '' : 's'}.` : ''}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* nav */}
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" onClick={() => goto(idx - 1)} disabled={idx === 0}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <div className="flex-1 flex gap-1.5 justify-center overflow-x-auto scroll-slim py-1" aria-label="Question palette">
              {questions.map((x, i) => {
                const done = (answers[x.id] ?? '') !== '';
                return (
                  <button
                    key={x.id}
                    onClick={() => goto(i)}
                    aria-label={`Go to question ${i + 1}`}
                    aria-current={i === idx ? 'true' : undefined}
                    className={cn(
                      'h-8 w-8 shrink-0 rounded-lg text-xs font-semibold tabular-nums transition-colors',
                      i === idx
                        ? 'bg-primary text-primary-foreground'
                        : done
                          ? 'bg-primary/15 text-primary hover:bg-primary/25'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            {idx < total - 1 ? (
              <Button variant="outline" onClick={() => goto(idx + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button className={cn(unanswered > 0 && 'bg-[var(--warn)] hover:bg-[var(--warn)]/90 text-white')}>
                    <SendHorizonal className="h-4 w-4" /> Submit
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit for marking?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div>
                        {unanswered > 0 ? (
                          <p className="flex items-center gap-2 text-[var(--warn)] mb-2">
                            <AlertTriangle className="h-4 w-4" aria-hidden /> {unanswered} question{unanswered === 1 ? '' : 's'} still unanswered — these score zero.
                          </p>
                        ) : (
                          <p className="mb-2">Every question is answered.</p>
                        )}
                        <p>You’ll see your score, explanations and feedback straight away.</p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep working</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void doSubmit()} disabled={submitting}>
                      {submitting ? 'Marking…' : 'Submit'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {idx === total - 1 ? (
            <div className="mt-3 text-center">
              <Button variant="link" size="sm" onClick={() => setConfirmOpen(true)} className="text-muted-foreground">
                Jump to submit
              </Button>
            </div>
          ) : null}
        </section>
      </div>

      <p className="sr-only" aria-live="polite">
        Question {idx + 1} of {total}. {answeredCount} answered.
      </p>
    </div>
  );
}
