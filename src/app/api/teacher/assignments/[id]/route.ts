import { NextResponse } from 'next/server';
import { col, del, merge, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { notifyStudents } from '@/lib/notify';
import { assignmentTargetsStudent, type Attempt, type Assignment, type Student } from '@/lib/types';

 type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const assignments = await col<Assignment>('assignments');
  const a = assignments[id];
  if (!a || a.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }
  const attempts = values(await col<Attempt>('attempts')).filter((x) => x.assignmentId === id);
  return NextResponse.json({
    assignment: {
      id: a.id,
      title: a.title,
      classId: a.classId,
      classTitle: a.classTitle,
      classIds: a.classIds ?? [],
      studentIds: a.studentIds ?? [],
      draft: Boolean(a.draft),
      dueAt: a.dueAt,
      timeLimitMin: a.timeLimitMin,
      createdAt: a.createdAt,
      source: a.source,
      generatedBy: a.generatedBy,
      description: a.description,
    },
    questions: a.questions,
    attempts: attempts.map((x) => ({
      id: x.id,
      studentId: x.studentId,
      studentName: x.studentName,
      status: x.status,
      score: x.result?.score,
      total: x.result?.total,
      pct: x.result?.pct,
    })),
  });
}

/**
 * Publish a draft, or pull a scheduled assignment live early. Either way the
 * assignment is out from this moment: every targeted student's bell rings
 * (once — dedupe-keyed), publishAt is stamped to now and notifiedAt set so no
 * later poll rings the same bell again.
 */
export async function PATCH(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const assignments = await col<Assignment>('assignments');
  const a = assignments[id];
  if (!a || a.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }
  const now = Date.now();
  const scheduledFuture = typeof a.publishAt === 'number' && a.publishAt > now;
  if (!a.draft && !scheduledFuture) {
    return NextResponse.json({ ok: true, alreadyLive: true });
  }

  const students = await col<Student>('students');
  const recipients = values(students)
    .filter((s) => assignmentTargetsStudent(a, s))
    .map((s) => s.id);

  const patch: { draft: boolean; publishAt: number; notifiedAt?: number; createdAt?: number } = {
    draft: false,
    publishAt: now,
  };
  if (recipients.length === 0) {
    patch.notifiedAt = now; // nobody to tell — stamp it done anyway
  } else {
    try {
      const sent = await notifyStudents(recipients, {
        kind: 'assignment',
        title: `New quiz set: “${a.title}”`,
        body: `${a.classTitle} · ${a.questions.length} questions${a.dueAt ? ` · due ${new Date(a.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}`,
        assignmentId: a.id,
        fromId: session.uid,
        dedupeKey: `live${a.id}`,
      });
      if (sent > 0) patch.notifiedAt = now;
    } catch {
      // a failed bell must never block the publish itself
    }
  }
  // keep the old draft-publish behaviour of bumping createdAt to "now"
  if (a.draft) patch.createdAt = now;
  await merge('assignments', id, patch);
  return NextResponse.json({ ok: true, notified: recipients.length });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const assignments = await col<Assignment>('assignments');
  const a = assignments[id];
  if (!a || a.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }
  const attempts = values(await col<Attempt>('attempts')).filter((x) => x.assignmentId === id);
  await Promise.all([del('assignments', id), ...attempts.map((x) => del('attempts', x.id))]);
  return NextResponse.json({ ok: true });
}
