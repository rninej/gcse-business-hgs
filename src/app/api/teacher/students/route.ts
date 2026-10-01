import { NextResponse } from 'next/server';
import { colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import type { Student, StudentClass } from '@/lib/types';

/**
 * Lightweight directory of the teacher's own students — powers the
 * "assign to specific individuals" picker in New assignment. No passwords
 * travel with this list (those stay in the class credential views).
 */
export async function GET() {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const classes = values(await colCached<StudentClass>('classes')).filter((c) => c.teacherId === session.uid);
  const students = values(await colCached<Student>('students'))
    .filter((s) => s.teacherId === session.uid)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      displayName: s.displayName,
      username: s.username,
      classId: s.classId,
      className: classes.find((c) => c.id === s.classId)?.name ?? '',
    })),
  });
}
