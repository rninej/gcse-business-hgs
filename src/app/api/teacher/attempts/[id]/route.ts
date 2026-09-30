import { NextResponse } from 'next/server';
import { item } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { toReview } from '@/lib/sanitize';
import type { Attempt, QReview, RiskBand } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/teacher/attempts/[id]
 * One submitted attempt with the student's exact answer to every question —
 * the teacher's view for marking and feedback. Teacher self-tests cannot be
 * read here (they belong to the teacher's own private flow, not a student's).
 */
export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const attempt = await item<Attempt>('attempts', id);
  if (!attempt || attempt.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  const r = attempt.result;
  const reviews: QReview[] = attempt.questions.map((q, i) => {
    const rec = r?.perQ?.[q.id];
    return toReview(q, i + 1, rec?.given ?? '—', rec?.expected ?? '', Boolean(rec?.correct));
  });

  return NextResponse.json({
    id: attempt.id,
    mode: attempt.mode,
    status: attempt.status,
    studentId: attempt.studentId,
    studentName: attempt.studentName,
    assignmentId: attempt.assignmentId,
    title: attempt.assignmentTitle,
    startedAt: attempt.startedAt,
    score: r?.score ?? null,
    total: r?.total ?? null,
    pct: r?.pct ?? null,
    timeTakenSec: r?.timeTakenSec ?? null,
    submittedAt: r?.submittedAt ?? null,
    riskScore: r?.riskScore ?? null,
    riskBand: (r?.riskBand ?? null) as RiskBand | null,
    riskSignals: r?.riskSignals ?? [],
    aiFeedback: r?.feedback ?? null,
    teacherFeedback: attempt.teacherFeedback ?? null,
    reviews,
  });
}
