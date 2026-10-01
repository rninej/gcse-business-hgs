import { NextResponse } from 'next/server';
import { col, colCached, del, values } from '@/lib/firebase';
import { decryptPassword } from '@/lib/passwords';
import { requireRole } from '@/lib/session';
import type { Attempt, Assignment, Student, StudentClass } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const classes = await col<StudentClass>('classes');
  const cls = classes[id];
  if (!cls || cls.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }
  const students = values(await colCached<Student>('students'))
    .filter((s) => s.classId === id)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((s) => ({
      id: s.id,
      username: s.username,
      displayName: s.displayName,
      password: decryptPassword(s.pwEnc),
      createdAt: s.createdAt,
    }));

  // class activity — every submitted quiz by any student in this class:
  // timestamps feed the heatmap, per-student counts feed the table chips
  const studentIds = new Set(students.map((s) => s.id));
  const attempts = values(await colCached<Attempt>('attempts')).filter(
    (a) => a.studentId && studentIds.has(a.studentId) && a.status === 'submitted' && a.result
  );
  const activity = attempts.map((a) => a.result!.submittedAt);
  const quizzesBy = Object.fromEntries(students.map((s) => [s.id, 0])) as Record<string, number>;
  for (const a of attempts) quizzesBy[a.studentId] = (quizzesBy[a.studentId] ?? 0) + 1;

  return NextResponse.json({ class: cls, students, activity, quizzesBy });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const classes = await col<StudentClass>('classes');
  const cls = classes[id];
  if (!cls || cls.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  const students = values(await col<Student>('students')).filter((s) => s.classId === id);
  const attempts = values(await col<Attempt>('attempts')).filter((a) => a.classId === id);
  const assignments = values(await col<Assignment>('assignments')).filter((a) => a.classId === id || a.classIds?.includes(id));

  await Promise.all([
    del('classes', id),
    ...students.map((s) => del('students', s.id)),
    ...attempts.map((a) => del('attempts', a.id)),
    ...assignments.map((a) => del('assignments', a.id)),
  ]);
  return NextResponse.json({ ok: true });
}
