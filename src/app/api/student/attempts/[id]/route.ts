import { NextResponse } from 'next/server';
import { colCached, item, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { streaksFrom } from '@/lib/streaks';
import { toClientQuestions, toReview } from '@/lib/sanitize';
import type { Attempt } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const attempt = await item<Attempt>('attempts', id);
  if (!attempt || attempt.studentId !== session.uid) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  if (attempt.status === 'submitted') {
    const r = attempt.result;
    const reviews = attempt.questions.map((q, i) => {
      const rec = r?.perQ?.[q.id];
      return toReview(q, i + 1, rec?.given ?? '—', rec?.expected ?? '', Boolean(rec?.correct));
    });
    // streak for the celebration banner (cheap: collection read is cached)
    const mySubmits = values(await colCached<Attempt>('attempts'))
      .filter((a) => a.studentId === session.uid && a.status === 'submitted' && a.result)
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
    });
  }

  const now = Date.now();
  const limitMs = attempt.timeLimitMin ? attempt.timeLimitMin * 60_000 : null;
  const remainingMs = limitMs ? Math.max(0, limitMs - (now - attempt.startedAt)) : null;
  return NextResponse.json({
    status: 'in-progress',
    mode: attempt.mode,
    title: attempt.assignmentTitle,
    assignmentId: attempt.assignmentId ?? null,
    quizId: attempt.quizId ?? null,
    dueAt: attempt.dueAt,
    startedAt: attempt.startedAt,
    timeLimitMin: attempt.timeLimitMin,
    remainingMs,
    serverNow: now,
    questions: toClientQuestions(attempt.questions),
    // outcomes for questions already confirmed — safe to reveal, and it lets
    // the runner resume exactly where the student left off, on any device
    checked: attempt.checked ?? {},
  });
}
