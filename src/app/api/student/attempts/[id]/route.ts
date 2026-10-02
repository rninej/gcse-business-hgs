import { NextResponse } from 'next/server';
import { loadAccessibleAttempt } from '@/lib/attemptAccess';
import { isAbandonedTimed, finalizeAttempt } from '@/lib/finalize';
import { liteForStudent } from '@/lib/attemptLite';
import { streaksFrom } from '@/lib/streaks';
import { toClientQuestions, toReview } from '@/lib/sanitize';
import type { Attempt } from '@/lib/types';

 type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  let access = await loadAccessibleAttempt(id);
  if (!access) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });

  // a timed quiz whose student left (heartbeat went stale) is ended the
  // moment anyone looks at it — rejoining is only for untimed quizzes
  if (isAbandonedTimed(access.attempt)) {
    access = { ...access, attempt: await finalizeAttempt(access.attempt) };
  }
  const { attempt } = access;
  const isSelfTest = attempt.mode === 'selftest';

  if (attempt.status === 'submitted') {
    const r = attempt.result;
    // questions is always set on real attempts, but guard partial/legacy records
    const reviews = (attempt.questions ?? []).map((q, i) => {
      const rec = r?.perQ?.[q.id];
      return toReview(q, i + 1, rec?.given ?? '—', rec?.expected ?? '', Boolean(rec?.correct), rec);
    });
    // streak for the celebration banner — the slim feed carries every
    // submitted-at this needs, without the fat collection read.
    // The milestone is captured at submit time and STORED on the attempt —
    // re-reading it later always shows the same celebration even if another
    // same-day quiz would now mask the crossing.
    const mySubmits = (await liteForStudent(attempt.studentId))
      .filter((a) => a.status === 'submitted' && a.result && a.mode !== 'selftest')
      .map((a) => a.result?.submittedAt ?? 0);
    return NextResponse.json({
      status: 'submitted',
      mode: attempt.mode,
      title: attempt.assignmentTitle,
      assignmentId: attempt.assignmentId ?? null,
      quizId: attempt.quizId ?? null,
      result: r,
      reviews,
      topicStats: r?.topicStats ?? [],
      streak: streaksFrom(mySubmits).current,
      streakMilestone: attempt.streakMilestone ?? null,
      explanations: attempt.explanations ?? {},
      teacherFeedback: attempt.teacherFeedback ?? null,
    });
  }

  const now = Date.now();
  const limitMs = attempt.timeLimitMin ? attempt.timeLimitMin * 60_000 : null;
  const remainingMs = limitMs ? Math.max(0, limitMs - (now - attempt.startedAt)) : null;
  // written answers persist server-side as they are saved — they are never
  // locked, so resume restores them on any device
  const writtenAnswers: Record<string, string> = {};
  for (const q of attempt.questions ?? []) {
    if (q.type === 'written' && attempt.answers?.[q.id]) writtenAnswers[q.id] = attempt.answers[q.id];
  }
  return NextResponse.json({
    status: 'in-progress',
    mode: isSelfTest ? 'assignment' : attempt.mode, // the runner badge just reads practice/assignment
    selfTest: isSelfTest,
    title: attempt.assignmentTitle,
    assignmentId: attempt.assignmentId ?? null,
    quizId: attempt.quizId ?? null,
    dueAt: attempt.dueAt,
    startedAt: attempt.startedAt,
    timeLimitMin: attempt.timeLimitMin,
    remainingMs,
    serverNow: now,
    questions: toClientQuestions(attempt.questions ?? []),
    // outcomes for questions already confirmed — safe to reveal, and it lets
    // the runner resume exactly where the student left off, on any device
    checked: attempt.checked ?? {},
    writtenAnswers,
  });
}
