import { NextResponse } from 'next/server';
import { fb } from '@/lib/firebase';
import { hashPassword, verifyPassword } from '@/lib/passwords';
import { clearOwnerCookie, isOwnerUnlocked, setOwnerCookie } from '@/lib/session';

/** The /debug owner dashboard is hidden — no link points at it. Access is
 *  claimed by the FIRST person who ever arrives: they set the password, it's
 *  stored (scrypt-hashed) in Firebase, and every visit after that needs it.
 *  A valid unlock holds for 12 hours via a signed httpOnly cookie. */

interface OwnerLock {
  hash: string;
  createdAt: number;
}

async function loadLock(): Promise<OwnerLock | null> {
  const v = await fb.get<OwnerLock | null>('ownerLock');
  return v && typeof v.hash === 'string' ? v : null;
}

/** GET — gate state for the page: is the lock claimed, is this browser unlocked. */
export async function GET() {
  const [lock, unlocked] = await Promise.all([loadLock(), isOwnerUnlocked()]);
  return NextResponse.json({ claimed: Boolean(lock), unlocked: unlocked && Boolean(lock) });
}

/** POST { password } — claim (first visitor) or unlock (everyone after). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === 'string' ? body.password : '';
  if (password.length < 4 || password.length > 100) {
    return NextResponse.json(
      { error: 'Pick a password between 4 and 100 characters.' },
      { status: 400 }
    );
  }

  const lock = await loadLock();

  // first one here claims it — the password they choose is the one that
  // guards the dashboard from this moment on
  if (!lock) {
    await fb.set('ownerLock', { hash: hashPassword(password), createdAt: Date.now() });
    await setOwnerCookie();
    return NextResponse.json({ ok: true, claimed: true, unlocked: true });
  }

  if (!verifyPassword(password, lock.hash)) {
    return NextResponse.json({ error: 'Wrong password.', unlocked: false }, { status: 401 });
  }

  await setOwnerCookie();
  return NextResponse.json({ ok: true, claimed: true, unlocked: true });
}

/** DELETE — lock this browser again (the 12-hour hold is only per browser). */
export async function DELETE() {
  await clearOwnerCookie();
  return NextResponse.json({ ok: true, unlocked: false });
}
