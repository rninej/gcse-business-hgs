import { NextResponse } from 'next/server';
import { col, del, values } from '@/lib/firebase';
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
  await Promise.all([del('students', sid), ...attempts.map((a) => del('attempts', a.id))]);
  return NextResponse.json({ ok: true });
}
