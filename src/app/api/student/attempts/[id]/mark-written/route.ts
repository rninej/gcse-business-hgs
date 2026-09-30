import { NextResponse } from 'next/server';
import { loadAccessibleAttempt } from '@/lib/attemptAccess';
import { markPendingWritten } from '@/lib/writtenMarking';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/student/attempts/[id]/mark-written
 * Kick off AI marking of the written answers on this attempt. Called by the
 * result screen right after submitting (without blocking navigation) and by
 * the "mark now" retry button. Idempotent — already-marked answers are kept.
 */
export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const access = await loadAccessibleAttempt(id);
  if (!access) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });

  try {
    const run = await markPendingWritten(id);
    return NextResponse.json({ ok: true, ...run });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
