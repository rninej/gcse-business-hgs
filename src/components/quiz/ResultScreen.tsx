'use client';

// Post-submission result screen: score, stats, feedback and full question review.
// Integrity data is never shown here — that lives in the teacher's results view.

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import { topicTitle } from '@/lib/topics';
import { ScoreRing, BarList, Diagram } from '@/components/charts';
import { ErrorNote, PctChip } from '@/components/shared';
import { useToast } from '@/hooks/use-toast';
import type { AttemptResult, QReview, TopicStat } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResultData {
  status: 'submitted';
  mode: 'assignment' | 'practice';
  title: string;
  assignmentId: string | null;
  quizId: string | null;
  result: AttemptResult;
  reviews: QReview[];
  topicStats: TopicStat[];
  streak: number;
}

export function ResultScreen({ attemptId }: { attemptId: string }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redoing, setRedoing] = useState(false);

  useEffect(() => {
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
     
  }, [attemptId]);

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
  const correctCount = data.reviews.filter((x) => x.correct).length;
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
      <div className="flex items-center justify-between mb-5 gap-2">
        <Button variant="ghost" onClick={() => go({ name: 's-home' })}>
          <ArrowLeft className="h-4 w-4" /> Home
        </Button>
        <Button variant="outline" onClick={() => void redo()} disabled={redoing}>
          <RotateCw className={cn('h-4 w-4', redoing && 'animate-spin')} />
          {redoing ? 'Starting…' : 'Redo this quiz'}
        </Button>
      </div>

      {/* headline */}
      <div className={cn('rounded-2xl border p-6 sm:p-8 mb-5', r.pct >= 80 ? 'bg-[var(--success)]/8' : r.pct >= 55 ? 'bg-primary/8' : 'bg-[var(--warn)]/8')}>
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <ScoreRing pct={r.pct} label="score" size={128} />
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">{data.title}</div>
            <div className="text-2xl font-bold mt-1">
              {r.score} out of {r.total} marks
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)] gap-1.5">
                <Star className="h-3.5 w-3.5" /> +{r.points} points
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <Timer className="h-3.5 w-3.5" /> {timeMin}m {timeSec}s
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <Target className="h-3.5 w-3.5" /> {correctCount}/{data.reviews.length} correct
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
      </div>

      {/* feedback */}
      <div className="rounded-xl border bg-card p-5 mb-5">
        <h2 className="flex items-center gap-2 font-semibold mb-3">
          <MessageSquareHeart className="h-5 w-5 text-primary" aria-hidden /> Feedback
        </h2>
        <p className="text-[15px] leading-relaxed">{r.feedback}</p>
      </div>

      {/* stats */}
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-3 text-sm">By topic</h3>
          <BarList items={topicRows} emptyText="No topic data." />
        </div>
        {weak.length > 0 ? (
          <div className="rounded-xl border bg-[var(--accent)]/25 p-5 flex flex-col">
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
          <div className="rounded-xl border bg-[var(--success)]/10 p-5">
            <h3 className="font-semibold mb-2 text-sm">Next steps</h3>
            <p className="text-sm">
              No weak topics this time — keep your streak going with the next quiz in the sequence.
            </p>
          </div>
        )}
      </div>

      {/* review */}
      <h2 className="font-semibold mb-3">Your answers</h2>
      <ol className="space-y-3">
        {data.reviews.map((rev) => (
          <li
            key={rev.qid}
            className={cn('rounded-xl border p-4 sm:p-5', rev.correct ? 'border-[var(--success)]/40 bg-[var(--success)]/5' : 'border-[var(--danger)]/40 bg-[var(--danger)]/5')}
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
              <details className="mb-3 rounded-lg bg-card border px-3 py-2">
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
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                        isCorrect ? 'border-[var(--success)] bg-[var(--success)]/10 font-medium' : 'border-transparent'
                      )}
                    >
                      <span className="w-5 text-xs font-bold text-muted-foreground" aria-hidden>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {o}
                      {isCorrect ? <CheckCircle2 className="h-4 w-4 text-[var(--success)] ml-auto" aria-hidden /> : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-2 text-sm mb-3">
              <div className="rounded-lg bg-card border px-3 py-2">
                <span className="text-xs text-muted-foreground block">Your answer</span>
                <span className={cn('font-medium', rev.correct && 'text-[var(--success)]')}>{rev.given}</span>
              </div>
              {!rev.correct ? (
                <div className="rounded-lg bg-card border px-3 py-2">
                  <span className="text-xs text-muted-foreground block">Correct answer</span>
                  <span className="font-medium text-[var(--success)]">{rev.expected}</span>
                </div>
              ) : null}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed border-t pt-3">
              <span className="font-medium text-foreground">Why: </span>
              {rev.explain}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => go({ name: 's-home' })}>
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Button>
        <Button variant="outline" onClick={() => void redo()} disabled={redoing}>
          <RotateCw className={cn('h-4 w-4', redoing && 'animate-spin')} />
          {redoing ? 'Starting…' : data.mode === 'practice' ? 'Try this quiz again' : 'Redo this quiz'}
        </Button>
        {data.mode === 'practice' ? (
          <Button variant="ghost" onClick={() => go({ name: 's-practice' })}>
            Choose a different quiz
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground self-center">Every attempt is saved — your teacher can see all of them.</p>
        )}
      </div>
    </div>
  );
}
