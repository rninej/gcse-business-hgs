import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { item, put } from '@/lib/firebase';
import { liteForStudent, upsertLite } from '@/lib/attemptLite';
import { requireRole } from '@/lib/session';
import { shuffleMcqOptions } from '@/lib/questions';
import type { Attempt, Assignment, Teacher } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/** Teacher self-test: try your own assignment exactly like a student sees it.
 *  Creates a private selftest attempt that never appears in class statistics,
 *  leaderboards or points. */
export async function POST(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const me = await item<Teacher>('teachers', session.uid);
  if (!me) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

  const assignment = await item<Assignment>('assignments', id);
  if (!assignment || assignment.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
  }

  // resume an unfinished self-test of this assignment (own slim feed — no
  // full-collection read)
  const title = `${assignment.title} · self-test`;
  const existing = (await liteForStudent(session.uid)).find(
    (a) => a.mode === 'selftest' && a.status === 'in-progress' && a.assignmentTitle === title
  );
  if (existing) return NextResponse.json({ ok: true, attemptId: existing.id, resumed: true });

  const attemptId = `at_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const attempt: Attempt = {
    id: attemptId,
    mode: 'selftest',
    status: 'in-progress',
    studentId: session.uid, // the teacher's own id — access control checks this
    studentName: `${me.name} (self-test)`,
    teacherId: session.uid,
    classId: null,
    assignmentId: assignment.id,
    assignmentTitle: title,
    startedAt: Date.now(),
    dueAt: null,
    timeLimitMin: null, // no timer for the teacher's own dry run
    questions: shuffleMcqOptions(assignment.questions.map((q) => ({ ...q }))),
    answers: {},
    checked: {},
    perQ: {},
    events: [],
    wallMs: 0,
    hiddenMs: 0,
    result: null,
  };
  await put('attempts', attemptId, attempt);
  await upsertLite(attempt);
  return NextResponse.json({ ok: true, attemptId, resumed: false });
}
