import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, put, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import type { Attempt, Assignment, Student } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const students = await col<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const assignments = await col<Assignment>('assignments');
  const a = assignments[id];
  if (!a || a.classId !== me.classId) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }

  const attempts = values(await col<Attempt>('attempts')).filter((x) => x.assignmentId === id);
  const existing = attempts.find((x) => x.studentId === session.uid);
  if (existing?.status === 'submitted') {
    return NextResponse.json(
      { error: 'You have already submitted this assignment.', alreadySubmitted: true, attemptId: existing.id },
      { status: 409 }
    );
  }
  if (existing) {
    return NextResponse.json({ ok: true, attemptId: existing.id, resumed: true });
  }

  const attemptId = `at_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const attempt: Attempt = {
    id: attemptId,
    mode: 'assignment',
    status: 'in-progress',
    studentId: session.uid,
    studentName: me.displayName,
    teacherId: a.teacherId,
    classId: a.classId,
    assignmentId: a.id,
    assignmentTitle: a.title,
    startedAt: Date.now(),
    dueAt: a.dueAt,
    timeLimitMin: a.timeLimitMin,
    questions: a.questions.map((q) => ({ ...q })),
    answers: {},
    checked: {},
    perQ: {},
    events: [],
    wallMs: 0,
    hiddenMs: 0,
    result: null,
  };
  await put('attempts', attemptId, attempt);
  return NextResponse.json({ ok: true, attemptId, resumed: false });
}
