import { NextResponse } from 'next/server';
import { col, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import type { Attempt, Assignment, Student } from '@/lib/types';

export async function GET() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await col<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const assignments = values(await col<Assignment>('assignments'))
    .filter((a) => a.classId === me.classId)
    .sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));
  const attempts = values(await col<Attempt>('attempts')).filter((a) => a.studentId === session.uid);
  const byAssignment = new Map(attempts.map((a) => [a.assignmentId, a]));

  const rows = assignments.map((a) => {
    const at = byAssignment.get(a.id);
    const status: 'not-started' | 'in-progress' | 'submitted' =
      at?.status === 'submitted' ? 'submitted' : at ? 'in-progress' : 'not-started';
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      dueAt: a.dueAt,
      timeLimitMin: a.timeLimitMin,
      questionCount: a.questions.length,
      totalMarks: a.questions.reduce((x, q) => x + q.marks, 0),
      status,
      attemptId: at?.id ?? null,
      result: at?.status === 'submitted' ? at.result : null,
      daysLeft: a.dueAt ? Math.ceil((a.dueAt - Date.now()) / 86400000) : null,
    };
  });

  return NextResponse.json({ assignments: rows, className: session.className });
}
