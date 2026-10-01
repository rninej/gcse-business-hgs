import { NextResponse } from 'next/server';
import { colCached, merge, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { calendarDaysUntil } from '@/lib/dates';
import { finalizeExpired } from '@/lib/finalize';
import { notifyStudents } from '@/lib/notify';
import { assignmentTargetsStudent, type Attempt, type Assignment, type Student } from '@/lib/types';

export async function GET() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await colCached<Student>('students');
  const me = students[session.uid];
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  // visible = set to the student's class(es) or to them individually; drafts stay hidden
  const now = Date.now();
  const assignments = values(await colCached<Assignment>('assignments'))
    .filter(
      (a) =>
        !a.draft &&
        assignmentTargetsStudent(a, me) &&
        // scheduled assignments stay hidden until their moment passes
        !(typeof a.publishAt === 'number' && a.publishAt > now)
    )
    .sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));

  // a scheduled assignment whose moment has just passed goes LIVE here: ring
  // every targeted student's bell once (records are dedupe-keyed, so racing
  // polls from other students can only replace, never duplicate), then stamp
  // notifiedAt. A failure here must never stop a student seeing their work.
  for (const a of assignments) {
    if (typeof a.publishAt !== 'number' || a.publishAt > now || a.notifiedAt) continue;
    try {
      const recipients = values(students)
        .filter((s) => assignmentTargetsStudent(a, s))
        .map((s) => s.id);
      if (recipients.length === 0) {
        await merge('assignments', a.id, { notifiedAt: Date.now() });
        continue;
      }
      const sent = await notifyStudents(recipients, {
        kind: 'assignment',
        title: `New quiz set: “${a.title}”`,
        body: `${a.classTitle} · ${a.questions.length} questions${
          a.dueAt ? ` · due ${new Date(a.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''
        }`,
        assignmentId: a.id,
        fromId: a.teacherId,
        dedupeKey: `live${a.id}`,
      });
      // only stamp once at least one bell actually rang — otherwise the next
      // poll (bells poll every 60s) retries the whole batch
      if (sent > 0) await merge('assignments', a.id, { notifiedAt: Date.now() });
    } catch {
      // the bell is best-effort; the assignment is still visible below
    }
  }

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
      daysLeft: a.dueAt ? calendarDaysUntil(a.dueAt) : null,
    };
  });

  return NextResponse.json({ assignments: rows, className: session.className });
}
