import { NextResponse } from 'next/server';
import { item } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
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
    return NextResponse.json({
      status: 'submitted',
      mode: attempt.mode,
      title: attempt.assignmentTitle,
      result: r,
      reviews,
      topicStats: r?.topicStats ?? [],
    });
  }

  const now = Date.now();
  const limitMs = attempt.timeLimitMin ? attempt.timeLimitMin * 60_000 : null;
  const remainingMs = limitMs ? Math.max(0, limitMs - (now - attempt.startedAt)) : null;
  return NextResponse.json({
    status: 'in-progress',
    mode: attempt.mode,
    title: attempt.assignmentTitle,
    dueAt: attempt.dueAt,
    startedAt: attempt.startedAt,
    timeLimitMin: attempt.timeLimitMin,
    remainingMs,
    serverNow: now,
    questions: toClientQuestions(attempt.questions),
  });
}
