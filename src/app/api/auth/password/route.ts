import { NextResponse } from 'next/server';
import { colCached, merge } from '@/lib/firebase';
import { currentSession } from '@/lib/session';
import { encryptPassword, hashPassword, verifyPassword } from '@/lib/passwords';
import type { Student, Teacher } from '@/lib/types';

/** Self-service password change for any signed-in account (student or teacher).
 *  Student passwords are also re-encrypted for teacher visibility. */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const body = (await req.json()) as { currentPassword?: string; newPassword?: string };
  const currentPassword = (body.currentPassword ?? '').toString();
  const newPassword = (body.newPassword ?? '').toString();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Enter your current and new password.' }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
  }
  if (/\s/.test(newPassword)) {
    return NextResponse.json({ error: 'Passwords cannot contain spaces.' }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: 'Choose a password you have not used here before.' }, { status: 400 });
  }

  if (session.role === 'teacher') {
    const teachers = await colCached<Teacher>('teachers');
    const me = Object.values(teachers).find((t) => t.id === session.uid);
    if (!me) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    if (!verifyPassword(currentPassword, me.pw)) {
      return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 403 });
    }
    await merge('teachers', me.id, { pw: hashPassword(newPassword) });
    return NextResponse.json({ ok: true });
  }

  const students = await colCached<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  if (!verifyPassword(currentPassword, me.pw)) {
    return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 403 });
  }
  await merge('students', me.id, {
    pw: hashPassword(newPassword),
    pwEnc: encryptPassword(newPassword), // teacher can still see the login
  });
  return NextResponse.json({ ok: true });
}
