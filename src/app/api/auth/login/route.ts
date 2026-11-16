import { NextResponse } from 'next/server';
import { colCached, item } from '@/lib/firebase';
import { verifyPassword } from '@/lib/passwords';
import { clearFailures, loginKeys, noteFailure, retryAfterSeconds } from '@/lib/loginThrottle';
import { setSessionCookie } from '@/lib/session';
import type { SessionInfo, Student, StudentClass, Teacher } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { role?: string; identifier?: string; password?: string };
    const role = body.role === 'teacher' ? 'teacher' : body.role === 'student' ? 'student' : null;
    const identifier = (body.identifier ?? '').toString().trim().toLowerCase();
    const password = (body.password ?? '').toString();
    if (!role || !identifier || !password) {
      return NextResponse.json({ error: 'Enter your login details.' }, { status: 400 });
    }

    // Ten wrong guesses per account, per ten minutes — enough that a pupil
    // cannot grind a classmate's password, far above what a real login needs.
    const keys = loginKeys(role, identifier);
    const wait = Math.max(...keys.map(retryAfterSeconds));
    if (wait > 0) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} minute${wait > 60 ? 's' : ''}.` },
        { status: 429, headers: { 'Retry-After': String(wait) } }
      );
    }
    const failed = () => {
      for (const key of keys) noteFailure(key);
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    };

    if (role === 'teacher') {
      const teachers = await colCached<Teacher>('teachers');
      const teacher = Object.values(teachers).find((t) => t.email === identifier);
      if (!teacher || !verifyPassword(password, teacher.pw)) {
        return failed();
      }
      clearFailures(keys[0]);
      const session: SessionInfo = { uid: teacher.id, role: 'teacher', name: teacher.name, sub: teacher.email };
      await setSessionCookie(session);
      return NextResponse.json({ ok: true, session });
    }

    const students = await colCached<Student>('students');
    const student = Object.values(students).find((s) => s.username === identifier);
    if (!student || !verifyPassword(password, student.pw)) {
      return failed();
    }
    clearFailures(keys[0]);
    const cls = await item<StudentClass>('classes', student.classId);
    const session: SessionInfo = {
      uid: student.id,
      role: 'student',
      name: student.displayName,
      sub: student.username,
      classId: student.classId,
      className: cls?.name ?? 'Class',
    };
    await setSessionCookie(session);
    return NextResponse.json({ ok: true, session });
  } catch {
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
