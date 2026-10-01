import { NextResponse } from 'next/server';
import { col, del, merge, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import type { Attempt, Assignment } from '@/lib/types';

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

/** Publish a draft (flips draft off — students see it from this moment). */
export async function PATCH(_req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const assignments = await col<Assignment>('assignments');
  const a = assignments[id];
  if (!a || a.teacherId !== session.uid) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }
  if (!a.draft) return NextResponse.json({ ok: true, alreadyLive: true });
  await merge('assignments', id, { draft: false, createdAt: Date.now() });
  return NextResponse.json({ ok: true });
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
