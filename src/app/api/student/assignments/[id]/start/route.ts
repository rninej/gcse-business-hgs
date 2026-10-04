import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { item, put } from '@/lib/firebase';
import { liteForStudent, upsertLite } from '@/lib/attemptLite';
import { requireRole } from '@/lib/session';
import { shuffleMcqOptions, shuffleQuestionOrder } from '@/lib/questions';
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

  // the two reads are independent — fetch them in parallel so "Start" feels
  // instant instead of paying two sequential round trips
  const [me, a] = await Promise.all([
    item<Student>('students', session.uid),
    item<Assignment>('assignments', id),
  ]);
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  if (
    !a ||
    a.draft ||
    // scheduled assignments can't be started before their moment passes
    (typeof a.publishAt === 'number' && a.publishAt > Date.now()) ||
    !assignmentTargetsStudent(a, me)
  ) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }

  const mine = (await liteForStudent(session.uid))
    .filter((x) => x.assignmentId === id)
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
    // fresh copy with randomised MCQ option order AND a shuffled question
    // order — the correct answer must not always sit in the same position
    // across attempts and students, and the question types must interleave
    // (mcq, fib, numeric, mcq…) rather than arrive in authored type blocks
    questions: shuffleMcqOptions(shuffleQuestionOrder(a.questions.map((q) => ({ ...q })))),
    answers: {},
    checked: {},
    perQ: {},
    events: [],
    wallMs: 0,
    hiddenMs: 0,
    result: null,
  };
  // both writes are independent documents — they fly in parallel, and their
  // version bumps continue after the response (the records themselves are
  // durable before it)
  await Promise.all([
    put('attempts', attemptId, attempt, { bg: true }),
    upsertLite(attempt, { bg: true }),
  ]);
  // attemptN tells the client which go this is (1st, 2nd, …) for the header
  return NextResponse.json({ ok: true, attemptId, resumed: false, attemptN: mine.length + 1 });
}
