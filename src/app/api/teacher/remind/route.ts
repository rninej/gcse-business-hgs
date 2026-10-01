import { NextResponse } from 'next/server';
import { col, colCached, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { calendarDaysUntil } from '@/lib/dates';
import { notifyStudents, recentlyReminded } from '@/lib/notify';
import { assignmentTargetsStudent } from '@/lib/types';
import type { Assignment, Attempt, Student } from '@/lib/types';

/** Cooldown before the same teacher can nudge the same student about the
 *  same assignment again — stops a button-masher from spamming a class. */
const REMIND_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

function dueLabel(dueAt: number | null): string {
  if (!dueAt) return 'no deadline';
  // calendar days — must match what the teacher saw on the dashboard card
  const days = calendarDaysUntil(dueAt);
  if (days < 0) return `overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  return `due in ${days} days`;
}

/** POST { assignmentId } — one-tap nudge: every targeted student who hasn't
 *  submitted gets a bell notification to finish the quiz. Students nudged
 *  within the cooldown are skipped, and the response says so. */
export async function POST(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let assignmentId = '';
  try {
    const body = (await req.json()) as { assignmentId?: string };
    assignmentId = (body.assignmentId ?? '').toString();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!assignmentId) return NextResponse.json({ error: 'Which assignment?' }, { status: 400 });

  const assignments = await col<Assignment>('assignments');
  const a = assignments[assignmentId];
  if (!a || a.teacherId !== session.uid || a.draft) {
    return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
  }

  const students = values(await colCached<Student>('students')).filter((s) => s.teacherId === session.uid);
  const targets = students.filter((s) => assignmentTargetsStudent(a, s));
  if (targets.length === 0) {
    return NextResponse.json({ error: 'No students to nudge on this one.' }, { status: 400 });
  }

  const attempts = values(await colCached<Attempt>('attempts'));
  const subIds = new Set(
    attempts.filter((x) => x.assignmentId === a.id && x.status === 'submitted').map((x) => x.studentId)
  );
  const missing = targets.filter((s) => !subIds.has(s.id));
  if (missing.length === 0) {
    return NextResponse.json({ error: 'Everyone has already handed this one in.' }, { status: 400 });
  }

  const alreadyNudged = await recentlyReminded(a.id, session.uid, REMIND_COOLDOWN_MS);
  const toNudge = missing.filter((s) => !alreadyNudged.has(s.id));

  // human "how long ago" for the cooldown message — rounds to the hour
  const ago = (ms: number) => {
    const h = Math.max(1, Math.round((Date.now() - ms) / 3_600_000));
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  };

  if (toNudge.length === 0) {
    const freshest = Math.max(...[...alreadyNudged.values()]);
    return NextResponse.json({
      ok: true,
      sent: 0,
      skipped: missing.length,
      message: `Already nudged ${missing.length === 1 ? 'this student' : 'these students'} — the last nudge went out ${ago(freshest)} (6-hour cooldown).`,
    });
  }

  const sent = await notifyStudents(
    toNudge.map((s) => s.id),
    {
      kind: 'remind',
      title: `Finish “${a.title}”`,
      body: `${a.classTitle} · ${a.questions.length} questions · ${dueLabel(a.dueAt)}. Your teacher is waiting for it.`,
      assignmentId: a.id,
      fromId: session.uid,
    }
  );

  return NextResponse.json({
    ok: true,
    sent,
    skipped: missing.length - sent,
    message:
      sent === 1
        ? 'Nudge sent to 1 student.'
        : `Nudge sent to ${sent} students.`,
  });
}
