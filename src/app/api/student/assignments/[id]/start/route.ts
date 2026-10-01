import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, put, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { shuffleMcqOptions } from '@/lib/questions';
import { assignmentTargetsStudent, type Attempt, type Assignment, type Student } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * Start (or resume) an assignment attempt. Students may redo the whole
 * assignment once they have submitted — every go is a separate attempt and
 * the teacher sees all of them. Timed attempts cannot be resumed after the
 * student leaves (the heartbeat goes stale → auto-submit) — rejoining is a
 * feature of untimed quizzes only.
 */
export async function POST(_req: Request, ctx: Ctx) {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const students = await col<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const assignments = await col<Assignment>('assignments');
  const a = assignments[id];
  if (
    !a ||
    a.draft ||
    // scheduled assignments can't be started before their moment passes
    (typeof a.publishAt === 'number' && a.publishAt > Date.now()) ||
    !assignmentTargetsStudent(a, me)
  ) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }

  const attempts = values(await col<Attempt>('attempts')).filter((x) => x.assignmentId === id);
  const mine = attempts
    .filter((x) => x.studentId === session.uid)
    .sort((x, y) => x.startedAt - y.startedAt);
  const inProgress = mine.find((x) => x.status !== 'submitted');
  if (inProgress) {
    return NextResponse.json({ ok: true, attemptId: inProgress.id, resumed: true });
  }

  const attemptId = `at_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const attempt: Attempt = {
    id: attemptId,
    mode: 'assignment',
    status: 'in-progress',
    studentId: session.uid,
    studentName: me.displayName,
    teacherId: a.teacherId,
    classId: me.classId,
    assignmentId: a.id,
    assignmentTitle: a.title,
    startedAt: Date.now(),
    dueAt: a.dueAt,
    timeLimitMin: a.timeLimitMin,
    lastSeenAt: Date.now(),
    // fresh copy with randomised MCQ option order — the correct answer must
    // not always sit in the same position across attempts and students
    questions: shuffleMcqOptions(a.questions.map((q) => ({ ...q }))),
    answers: {},
    checked: {},
    perQ: {},
    events: [],
    wallMs: 0,
    hiddenMs: 0,
    result: null,
  };
  await put('attempts', attemptId, attempt);
  // attemptN tells the client which go this is (1st, 2nd, …) for the header
  return NextResponse.json({ ok: true, attemptId, resumed: false, attemptN: mine.length + 1 });
}
