import { NextResponse } from 'next/server';
import { colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { finalizeExpired } from '@/lib/finalize';
import type { Attempt, Assignment, Student } from '@/lib/types';

export async function GET() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await colCached<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const assignments = values(await colCached<Assignment>('assignments'))
    .filter((a) => a.classId === me.classId)
    .sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));
  let attempts = values(await colCached<Attempt>('attempts')).filter((a) => a.studentId === session.uid);

  // finalize timed attempts whose clock ran out while the student was away,
  // so expired quizzes don't sit "in progress" forever
  attempts = await finalizeExpired(attempts);

  const rows = assignments.map((a) => {
    // a student may redo an assignment — every go is a separate attempt;
    // the latest one decides the status shown
    const mine = attempts
      .filter((x) => x.assignmentId === a.id)
      .sort((x, y) => x.startedAt - y.startedAt);
    const at = mine.length ? mine[mine.length - 1] : undefined;
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
      attemptCount: mine.length,
      bestPct: mine.length
        ? Math.max(...mine.map((m) => m.result?.pct ?? 0))
        : null,
      result: at?.status === 'submitted' ? at.result : null,
      daysLeft: a.dueAt ? Math.ceil((a.dueAt - Date.now()) / 86400000) : null,
    };
  });

  return NextResponse.json({ assignments: rows, className: session.className });
}
