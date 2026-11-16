import { NextResponse } from 'next/server';
import { colCached, merge } from '@/lib/firebase';
import { hashPassword } from '@/lib/passwords';
import { isOwnerUnlocked } from '@/lib/session';
import type { Teacher } from '@/lib/types';

/**
 * Owner-only password reset.
 *
 * There is no self-service "forgot password" flow (no mail transport inside the
 * app), so without this a teacher who forgets their password is locked out of a
 * paid-for school with no way back in. The owner sets a temporary password here
 * and passes it on; the teacher changes it from the app menu.
 */
export async function POST(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { email?: unknown; newPassword?: unknown };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter the teacher’s email address.' }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'The new password must be at least 6 characters.' }, { status: 400 });
  }
  if (/\s/.test(newPassword)) {
    return NextResponse.json({ error: 'Passwords cannot contain spaces.' }, { status: 400 });
  }

  const teachers = await colCached<Teacher>('teachers');
  const found = Object.values(teachers).find((t) => t.email === email);
  if (!found) {
    return NextResponse.json({ error: 'No teacher with that email.' }, { status: 404 });
  }

  await merge('teachers', found.id, { pw: hashPassword(newPassword) });
  return NextResponse.json({ ok: true, email: found.email, name: found.name });
}
