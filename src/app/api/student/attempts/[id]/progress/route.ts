import { NextResponse } from 'next/server';
import { mergeKnown } from '@/lib/firebase';
import { loadAccessibleAttempt } from '@/lib/attemptAccess';

type Ctx = { params: Promise<{ id: string }> };

/**
 * "I'm looking at question N" — the runner reports its position as the
 * student moves around, so rejoining (on any device, even with no local
 * snapshot) opens the quiz on the exact question they left at.
 * Fire-and-forget from the client: navigations are debounced, and leaving
 * the quiz flushes one final report, so this never adds a visible wait.
 */
export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const access = await loadAccessibleAttempt(id);
  if (!access) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  const attempt = access.attempt;
  if (attempt.status === 'submitted') {
    return NextResponse.json({ ok: true, status: 'submitted' });
  }

  const body = (await req.json().catch(() => ({}))) as { q?: unknown };
  const n = Number(body.q);
  if (!Number.isInteger(n) || n < 0 || n >= (attempt.questions ?? []).length) {
    return NextResponse.json({ error: 'Question index out of range.' }, { status: 400 });
  }
  if (attempt.lastQ === n) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  // the attempt was loaded moments ago in THIS request — mergeKnown turns
  // the write into a single round trip instead of a read-modify-write
  await mergeKnown('attempts', attempt.id, attempt, {
    lastQ: n,
    lastSeenAt: Date.now(),
  });
  return NextResponse.json({ ok: true });
}
