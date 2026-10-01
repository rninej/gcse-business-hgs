'use client';

// Post-submission result screen: score, stats, feedback and full question review.
// Integrity data is never shown here — that lives in the teacher's results view.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Star,
  Timer,
  Target,
  BookOpenText,
  MessageSquareHeart,
  RotateCw,
  Flame,
  PenLine,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { topicTitle } from '@/lib/topics';
import { displayGiven } from '@/lib/sanitize';
import { ScoreRing, BarList, Diagram } from '@/components/charts';
import { ErrorNote, PctChip } from '@/components/shared';
import { ExplainMeButton } from '@/components/quiz/ExplainMeButton';
import { QuizBackdrop } from '@/components/quiz/QuizBackdrop';
import { useToast } from '@/hooks/use-toast';
import type { AttemptResult, QReview, TopicStat } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResultData {
  status: 'submitted';
  mode: 'assignment' | 'practice' | 'selftest';
  title: string;
  assignmentId: string | null;
  quizId: string | null;
  result: AttemptResult;
  reviews: QReview[];
  topicStats: TopicStat[];
  streak: number;
  teacherFeedback?: { text: string; at: number; byName: string } | null;
}

/** Quart-out count-up — the score rolls up and decelerates into its final
 *  value, the way a real scoreboard settles. Re-targets when the AI examiner
 *  lands written marks, so the update feels like the score growing. */
function useCountUp(target: number, duration = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export function ResultScreen({ attemptId }: { attemptId: string }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redoing, setRedoing] = useState(false);
  const [markingNow, setMarkingNow] = useState(false);

  // count-up hooks must run unconditionally — they read the result lazily and
  // only start moving once the marks land (target 0 until then)
  const rEarly = data?.result;
  const pctAnim = useCountUp(rEarly?.pct ?? 0, 1100);
  const scoreAnim = useCountUp(rEarly?.score ?? 0, 1150);

  const load = () =>
    api
      .get<ResultData>(`/api/student/attempts/${attemptId}`)
      .then((d) => {
        if (d.status !== 'submitted') {
          go({ name: 'quiz', attemptId });
          return;
        }
        setData(d);
      })
      .catch((e) => setError((e as Error).message));

  useEffect(() => {
    load();
     
  }, [attemptId]);

  // written answers are marked by the AI examiner shortly after submission —
  // poll until the marks land; if nothing has arrived after the first tick,
  // kick marking again ourselves (idempotent) in case the submit-time request
  // never made it
  const pending = Math.max(
    data?.result.writtenPending ?? 0,
    data?.reviews.filter((r) => r.type === 'written' && r.pendingMark).length ?? 0
  );
  useEffect(() => {
    if (pending <= 0) return;
    let tries = 0;
    let alive = true;
    const timer = setInterval(() => {
      tries += 1;
      if (tries > 30 || !alive) {
        clearInterval(timer);
        return;
      }
      if (tries === 1) {
        void api.post(`/api/student/attempts/${attemptId}/mark-written`).catch(() => undefined);
      }
      api
        .get<ResultData>(`/api/student/attempts/${attemptId}`)
        .then((d) => {
          if (d.status === 'submitted') setData(d);
          const still = Math.max(
            d.result?.writtenPending ?? 0,
            d.reviews?.filter((r) => r.type === 'written' && r.pendingMark).length ?? 0
          );
          if (still === 0) clearInterval(timer);
        })
        .catch(() => undefined);
    }, 4000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
     
  }, [pending > 0, attemptId]);

  async function markNow() {
    setMarkingNow(true);
    try {
      await api.post(`/api/student/attempts/${attemptId}/mark-written`);
      await load();
    } catch {
      /* the poll will pick it up */
    } finally {
      setMarkingNow(false);
    }
  }

  // start the same quiz again — a brand-new attempt with a fresh shuffle
  async function redo() {
    if (!data) return;
    setRedoing(true);
    try {
      if (data.mode === 'assignment' && data.assignmentId) {
        const res = await api.post<{ attemptId: string }>(`/api/student/assignments/${data.assignmentId}/start`);
        go({ name: 'quiz', attemptId: res.attemptId });
      } else if (data.quizId) {
        const res = await api.post<{ attemptId: string }>('/api/student/practice', { quizId: data.quizId });
        go({ name: 'quiz', attemptId: res.attemptId });
      } else {
        go({ name: 's-practice' });
      }
    } catch (e) {
      setRedoing(false);
      toast({ title: 'Could not start again', description: (e as Error).message, variant: 'destructive' });
    }
  }

  // build a practice quiz out of ONLY the questions this student got wrong —
  // the smartest way to revise (written answers still being marked are left
  // out; they may turn out right)
  const [retrying, setRetrying] = useState(false);
  async function retryWrong() {
    setRetrying(true);
    try {
      const res = await api.post<{ attemptId: string; questionCount: number }>(
        `/api/student/attempts/${attemptId}/retry-wrong`
      );
      toast({ title: `Practising the ${res.questionCount} you got wrong`, description: 'A fresh shuffle — your marks update the progress map.' });
      go({ name: 'quiz', attemptId: res.attemptId });
    } catch (e) {
      setRetrying(false);
      toast({ title: 'Could not start the retry', description: (e as Error).message, variant: 'destructive' });
    }
  }

  if (error)
    return (
      <div className="max-w-3xl mx-auto">
        <ErrorNote message={error} />
        <Button variant="ghost" className="mt-4" onClick={() => go({ name: 's-home' })}>
          <ArrowLeft className="h-4 w-4" /> Back home
        </Button>
      </div>
    );

  if (!data)
    return (
      <div className="max-w-3xl mx-auto space-y-4" aria-busy>
        <div className="h-10 w-2/3 rounded-lg bg-secondary animate-pulse" />
        <div className="h-48 rounded-xl bg-secondary animate-pulse" />
      </div>
    );

  const r = data.result;
  const isSelfTest = data.mode === 'selftest';
  const home = () => go(isSelfTest ? { name: 't-home' } : { name: 's-home' });
  const correctCount = data.reviews.filter((x) => x.type !== 'written' && x.correct).length;
  const writtenReviews = data.reviews.filter((x) => x.type === 'written');
  const pendingWritten = r.writtenPending ?? 0;
  // questions definitely marked wrong (pending written answers don't count yet)
  const wrongCount = data.reviews.filter(
    (x) => !x.correct && !(x.type === 'written' && x.pendingMark)
  ).length;
  const topicRows = (data.topicStats ?? []).map((v) => ({
    label: `${v.topic} · ${topicTitle(v.topic)}`,
    pct: v.t ? Math.round((v.c / v.t) * 100) : 0,
    sub: `${v.c}/${v.t} marks`,
  }));
  const weak = [...topicRows].sort((a, b) => a.pct - b.pct).slice(0, 2).filter((t) => t.pct < 70);
  const timeMin = r.timeTakenSec ? Math.floor(r.timeTakenSec / 60) : 0;
  const timeSec = r.timeTakenSec % 60;
  const streak = data.streak ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      <QuizBackdrop attemptId={attemptId} />
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <Button variant="ghost" onClick={home}>
          <ArrowLeft className="h-4 w-4" /> {isSelfTest ? 'Teacher home' : 'Home'}
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {wrongCount > 0 ? (
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/5"
              onClick={() => void retryWrong()}
              disabled={retrying || redoing}
              title="A short practice quiz with only the questions you got wrong"
            >
              <Target className={cn('h-4 w-4', retrying && 'animate-pulse')} />
              {retrying ? 'Building…' : `Practise the ${wrongCount} you got wrong`}
            </Button>
          ) : null}
          {!isSelfTest ? (
            <Button variant="outline" onClick={() => void redo()} disabled={redoing || retrying}>
              <RotateCw className={cn('h-4 w-4', redoing && 'animate-spin')} />
              {redoing ? 'Starting…' : 'Redo this quiz'}
            </Button>
          ) : (
            <Badge variant="secondary">Your own dry run — not saved to class stats</Badge>
          )}
        </div>
      </div>

      {/* headline */}
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={cn('rounded-2xl border p-6 sm:p-8 mb-5 backdrop-blur-xl backdrop-saturate-150 border-white/50', r.pct >= 80 ? 'bg-[var(--success)]/10' : r.pct >= 55 ? 'bg-primary/10' : 'bg-[var(--warn)]/10')}
      >
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <ScoreRing pct={pctAnim} label="score" size={128} />
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">{data.title}</div>
            <div className="text-2xl font-bold mt-1 tabular-nums">
              {scoreAnim} out of {r.total} marks
            </div>
            {pendingWritten > 0 ? (
              <p className="text-sm text-[var(--warn)] font-medium mt-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" aria-hidden /> Temporary score — {pendingWritten} written {pendingWritten === 1 ? 'answer is' : 'answers are'} still being marked by the AI examiner.
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)] gap-1.5">
                <Star className="h-3.5 w-3.5" /> +{r.points} points
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <Timer className="h-3.5 w-3.5" /> {timeMin}m {timeSec}s
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <Target className="h-3.5 w-3.5" /> {correctCount}/{data.reviews.length - writtenReviews.length} correct
              </Badge>
              {streak >= 2 ? (
                <Badge className="bg-[var(--warn)]/15 text-[var(--warn)] border border-[var(--warn)]/30 gap-1.5">
                  <Flame className="h-3.5 w-3.5" /> {streak}-day streak
                </Badge>
              ) : null}
            </div>
            {streak >= 2 ? (
              <p className="text-xs text-muted-foreground mt-2">Do a quiz tomorrow to keep your streak alive.</p>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* feedback */}
      <div className="rounded-xl border border-white/60 bg-card/75 backdrop-blur-xl backdrop-saturate-150 p-5 mb-5">
        <h2 className="flex items-center gap-2 font-semibold mb-3">
          <MessageSquareHeart className="h-5 w-5 text-primary" aria-hidden /> Feedback
        </h2>
        <p className="text-[15px] leading-relaxed">{r.feedback}</p>
      </div>

      {/* note from the teacher */}
      {data.teacherFeedback ? (
        <div className="rounded-xl border border-primary/35 bg-primary/[0.06] backdrop-blur-xl p-5 mb-5">
          <h2 className="flex flex-wrap items-center gap-2 font-semibold mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 shrink-0" aria-hidden>
              <MessageSquareHeart className="h-4 w-4 text-primary" />
            </span>
            From your teacher
            <span className="text-xs font-normal text-muted-foreground">
              {data.teacherFeedback.byName} ·{' '}
              {new Date(data.teacherFeedback.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </h2>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{data.teacherFeedback.text}</p>
        </div>
      ) : null}

      {/* stats */}
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div className="rounded-xl border border-white/60 bg-card/75 backdrop-blur-xl backdrop-saturate-150 p-5">
          <h3 className="font-semibold mb-3 text-sm">By topic</h3>
          <BarList items={topicRows} emptyText="No topic data." />
        </div>
        {weak.length > 0 ? (
          <div className="rounded-xl border border-white/40 bg-[var(--accent)]/25 backdrop-blur-xl p-5 flex flex-col">
            <h3 className="font-semibold mb-2 text-sm">Next steps</h3>
            <ul className="text-sm space-y-2 list-disc pl-5 mb-4">
              {weak.map((w) => (
                <li key={w.label}>
                  Revisit <span className="font-medium">{w.label}</span> — then retry a practice quiz on it.
                </li>
              ))}
              <li>Read the explanations below carefully; they are written to stick.</li>
            </ul>
            <Button size="sm" variant="outline" className="self-start mt-auto" onClick={() => go({ name: 's-practice' })}>
              <RotateCw className="h-3.5 w-3.5" /> Practice these topics
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/40 bg-[var(--success)]/10 backdrop-blur-xl p-5">
            <h3 className="font-semibold mb-2 text-sm">Next steps</h3>
            <p className="text-sm">
              No weak topics this time — keep your streak going with the next quiz in the sequence.
            </p>
          </div>
        )}
      </div>

      {/* review */}
      <h2 className="font-semibold mb-3">Your answers</h2>
      <ol className="space-y-3 stagger">
        {data.reviews.map((rev) =>
          rev.type === 'written' ? (
            <li key={rev.qid} className="rounded-xl border border-primary/30 bg-primary/[0.04] backdrop-blur-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <PenLine className="h-5 w-5 text-primary" aria-hidden />
                <span className="font-semibold">Q{rev.n}</span>
                <span className="text-xs text-muted-foreground">
                  Written · {rev.marks} {rev.marks === 1 ? 'mark' : 'marks'} · {topicTitle(rev.topic)}
                </span>
                <span className="ml-auto">
                  {rev.pendingMark ? (
                    <Badge className="bg-[var(--warn)]/15 text-[var(--warn)] border border-[var(--warn)]/30 gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden /> Being marked…
                    </Badge>
                  ) : (
                    <Badge
                      className={cn(
                        'gap-1.5',
                        (rev.awarded ?? 0) >= rev.marks
                          ? 'bg-[var(--success)]/15 text-[var(--success)]'
                          : (rev.awarded ?? 0) > 0
                            ? 'bg-primary/10 text-primary'
                            : 'bg-[var(--danger)]/10 text-[var(--danger)]'
                      )}
                    >
                      {rev.awarded ?? 0}/{rev.marks} marks
                    </Badge>
                  )}
                </span>
              </div>

              <p className="text-[15px] font-medium leading-relaxed mb-3">{rev.stem}</p>

              <div className="rounded-lg bg-card/70 backdrop-blur-xl border border-white/40 px-3 py-2.5 mb-3">
                <span className="text-xs text-muted-foreground block mb-1">Your answer</span>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{rev.given && rev.given !== '—' ? rev.given : '— left blank —'}</p>
              </div>

              {rev.pendingMark ? (
                <div className="rounded-lg border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-3 py-2.5 text-sm flex flex-wrap items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--warn)] animate-pulse" aria-hidden />
                  The AI examiner is marking this now — your marks will appear here shortly.
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => void markNow()} disabled={markingNow}>
                    {markingNow ? 'Marking…' : 'Mark now'}
                  </Button>
                </div>
              ) : (
                <>
                  {rev.comment ? (
                    <div className="rounded-lg border bg-[var(--accent)]/20 px-3 py-2.5 mb-3 text-sm">
                      <span className="text-xs text-muted-foreground block mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden /> Examiner’s comment
                      </span>
                      {rev.comment}
                    </div>
                  ) : null}
                  {rev.pointResults && rev.pointResults.length > 0 ? (
                    <div className="space-y-1.5 mb-3">
                      <span className="text-xs text-muted-foreground block">Mark scheme — how your answer scored</span>
                      {rev.pointResults.map((p, pi) => (
                        <div
                          key={pi}
                          className={cn(
                            'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
                            p.awarded ? 'border-[var(--success)]/40 bg-[var(--success)]/10' : 'border-[var(--danger)]/30 bg-[var(--danger)]/5'
                          )}
                        >
                          {p.awarded ? (
                            <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" aria-label="Mark awarded" />
                          ) : (
                            <XCircle className="h-4 w-4 text-[var(--danger)] shrink-0 mt-0.5" aria-label="Not awarded" />
                          )}
                          <span className="min-w-0">
                            <span className="font-medium">{p.text}</span>
                            <span className="text-xs text-muted-foreground"> · {p.marks} {p.marks === 1 ? 'mark' : 'marks'}</span>
                            {p.why ? <span className="block text-xs text-muted-foreground mt-0.5">{p.why}</span> : null}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-sm text-muted-foreground leading-relaxed border-t pt-3">
                    <span className="font-medium text-foreground">Model answer: </span>
                    {rev.explain}
                  </p>
                </>
              )}
            </li>
          ) : (
          <li
            key={rev.qid}
            className={cn('rounded-xl border p-4 sm:p-5 backdrop-blur-xl', rev.correct ? 'border-[var(--success)]/40 bg-[var(--success)]/8' : 'border-[var(--danger)]/40 bg-[var(--danger)]/6')}
          >
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {rev.correct ? (
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-label="Correct" />
              ) : (
                <XCircle className="h-5 w-5 text-[var(--danger)]" aria-label="Incorrect" />
              )}
              <span className="font-semibold">Q{rev.n}</span>
              <span className="text-xs text-muted-foreground">
                {rev.marks} mark{rev.marks === 1 ? '' : 's'} · {topicTitle(rev.topic)}
              </span>
              <span className="ml-auto text-xs font-semibold" style={{ color: rev.correct ? 'var(--success)' : 'var(--danger)' }}>
                {rev.correct ? 'Correct' : 'Not quite'}
              </span>
            </div>

            {rev.extract ? (
              <details className="mb-3 rounded-lg bg-card/70 backdrop-blur-xl border border-white/40 px-3 py-2">
                <summary className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                  <BookOpenText className="h-3.5 w-3.5" aria-hidden /> Case study · {rev.extract.title}
                </summary>
                <p className="text-sm italic text-muted-foreground mt-2 leading-relaxed">{rev.extract.text}</p>
              </details>
            ) : null}
            {rev.diagram ? (
              <div className="scale-[0.85] origin-top-left max-w-full"><Diagram k={rev.diagram} /></div>
            ) : null}

            <p className="text-[15px] font-medium leading-relaxed mb-3">{rev.stem}</p>

            {rev.type === 'mcq' && rev.options ? (
              <div className="space-y-1.5 mb-3">
                {rev.options.map((o, i) => {
                  const isCorrect = o === rev.expected;
                  const chosenIdx = Number.parseInt(rev.given, 10);
                  const isChosen = Number.isInteger(chosenIdx) && chosenIdx === i;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                        isCorrect
                          ? 'border-[var(--success)] bg-[var(--success)]/10 font-medium'
                          : isChosen
                            ? 'border-[var(--danger)] bg-[var(--danger)]/10'
                            : 'border-transparent'
                      )}
                    >
                      <span className="w-5 text-xs font-bold text-muted-foreground" aria-hidden>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {o}
                      {isCorrect ? <CheckCircle2 className="h-4 w-4 text-[var(--success)] ml-auto" aria-hidden /> : null}
                      {!isCorrect && isChosen ? <XCircle className="h-4 w-4 text-[var(--danger)] ml-auto" aria-label="Your choice" /> : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-2 text-sm mb-3">
              <div className="rounded-lg bg-card/70 backdrop-blur-xl border border-white/40 px-3 py-2">
                <span className="text-xs text-muted-foreground block">Your answer</span>
                <span className={cn('font-medium', rev.correct && 'text-[var(--success)]')}>
                  {rev.given && rev.given !== '—' ? displayGiven(rev, rev.given) : '—'}
                </span>
              </div>
              {!rev.correct ? (
                <div className="rounded-lg bg-card/70 backdrop-blur-xl border border-white/40 px-3 py-2">
                  <span className="text-xs text-muted-foreground block">Correct answer</span>
                  <span className="font-medium text-[var(--success)]">{rev.expected}</span>
                </div>
              ) : null}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed border-t pt-3">
              <span className="font-medium text-foreground">Why: </span>
              {rev.explain}
            </p>
            {!rev.correct ? <ExplainMeButton attemptId={attemptId} qid={rev.qid} className="mt-3" /> : null}
          </li>
          )
        )}
      </ol>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={home}>
          <ArrowLeft className="h-4 w-4" /> {isSelfTest ? 'Back to teacher home' : 'Back to home'}
        </Button>
        {!isSelfTest ? (
          <Button variant="outline" onClick={() => void redo()} disabled={redoing}>
            <RotateCw className={cn('h-4 w-4', redoing && 'animate-spin')} />
            {redoing ? 'Starting…' : data.mode === 'practice' ? 'Try this quiz again' : 'Redo this quiz'}
          </Button>
        ) : null}
        {data.mode === 'practice' ? (
          <Button variant="ghost" onClick={() => go({ name: 's-practice' })}>
            Choose a different quiz
          </Button>
        ) : isSelfTest ? (
          <p className="text-xs text-muted-foreground self-center">Self-tests never appear in class results or leaderboards.</p>
        ) : (
          <p className="text-xs text-muted-foreground self-center">Every attempt is saved — your teacher can see all of them.</p>
        )}
      </div>
    </div>
  );
}
