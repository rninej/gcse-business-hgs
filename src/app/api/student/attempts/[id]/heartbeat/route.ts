import { NextResponse } from 'next/server';
import { merge } from '@/lib/firebase';
import { loadAccessibleAttempt } from '@/lib/attemptAccess';

type Ctx = { params: Promise<{ id: string }> };

/**
 * Heartbeat from the quiz runner: "the student is inside this timed quiz
 * right now". While beats keep arriving the attempt stays resumable; if they
 * stop (tab closed, student left), the attempt is auto-submitted once the
 * grace window passes — leaving a timed quiz ends it, rejoining is only for
 * untimed quizzes. Untimed attempts ignore heartbeats entirely.
 */
export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const access = await loadAccessibleAttempt(id);
  if (!access) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  const attempt = access.attempt;
  if (attempt.status !== 'in-progress') {
    return NextResponse.json({ ok: true, status: 'submitted' });
  }
  if (attempt.timeLimitMin) {
    await merge('attempts', attempt.id, { lastSeenAt: Date.now() });
  }
  return NextResponse.json({ ok: true });
}
