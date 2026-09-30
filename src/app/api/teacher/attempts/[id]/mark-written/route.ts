import { NextResponse } from 'next/server';
import { item } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { markPendingWritten } from '@/lib/writtenMarking';
import type { Attempt } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/teacher/attempts/[id]/mark-written
 * Teacher-triggered AI marking of a student's written answers (e.g. the
 * student closed the browser before marking finished).
 */
export async function POST(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const attempt = await item<Attempt>('attempts', id);
  if (!attempt || attempt.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  try {
    const run = await markPendingWritten(id);
    return NextResponse.json({ ok: true, ...run });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
