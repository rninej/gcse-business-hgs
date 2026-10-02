import { NextResponse } from 'next/server';
import { col, colCached, del, fb, merge, values } from '@/lib/firebase';
import { encryptPassword, hashPassword, memorablePassword } from '@/lib/passwords';
import { requireRole } from '@/lib/session';
import type { Attempt, Student } from '@/lib/types';

type Ctx = { params: Promise<{ id: string; sid: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, sid } = await ctx.params;

  const students = await col<Student>('students');
  const student = students[sid];
  if (!student || student.classId !== id || student.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const attempts = values(await col<Attempt>('attempts')).filter((a) => a.studentId === sid);
  await Promise.all([
    del('students', sid),
    ...attempts.map((a) => del('attempts', a.id)),
    // slim-feed mirrors go too, or dashboards would show ghost quizzes
    ...attempts.map((a) => fb.remove(`attemptLite/${sid}/${a.id}`)),
    fb.remove(`wrongPool/${sid}`),
    fb.remove(`notifFeed/${sid}`),
  ]);
  return NextResponse.json({ ok: true });
}

/**
 * Teacher edits a student's login: username, password and display name.
 * Passwords can be typed or regenerated as a memorable word pair.
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, sid } = await ctx.params;

  const students = await col<Student>('students');
  const student = students[sid];
  if (!student || student.classId !== id || student.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
    regenerate?: boolean;
    displayName?: string;
  };

  const update: Partial<Student> = {};

  if (typeof body.displayName === 'string' && body.displayName.trim().length >= 2) {
    update.displayName = body.displayName.replace(/\s+/g, ' ').trim().slice(0, 40);
  }

  if (typeof body.username === 'string' && body.username.trim()) {
    const username = body.username.trim().toLowerCase().replace(/[^a-z0-9.]/g, '');
    if (username.length < 3) {
      return NextResponse.json({ error: 'Usernames need at least 3 letters.' }, { status: 400 });
    }
    if (username !== student.username) {
      const taken = values(students).some((s) => s.id !== sid && s.username === username);
      if (taken) {
        return NextResponse.json({ error: 'That username is already taken by another student.' }, { status: 409 });
      }
      update.username = username;
    }
  }

  let newPassword: string | null = null;
  if (body.regenerate) {
    newPassword = memorablePassword();
  } else if (typeof body.password === 'string' && body.password.length > 0) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    newPassword = body.password;
  }

  if (newPassword) {
    update.pw = hashPassword(newPassword);
    update.pwEnc = encryptPassword(newPassword);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  await merge('students', sid, update);
  return NextResponse.json({
    ok: true,
    username: update.username ?? student.username,
    displayName: update.displayName ?? student.displayName,
    password: newPassword,
  });
}
