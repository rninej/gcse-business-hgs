import { NextResponse } from 'next/server';
import { item, merge } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { notifyStudents } from '@/lib/notify';
import type { Attempt } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/teacher/attempts/[id]/feedback   body: { text: string }
 * Save (or clear, with an empty text) the teacher's written feedback on a
 * student's quiz. The student sees it the next time they open their result —
 * and now their bell rings the moment it lands.
 */
export async function POST(req: Request, ctx: Ctx) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const body = (await req.json().catch(() => ({}))) as { text?: unknown };
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : '';
  if (typeof body.text !== 'string') {
    return NextResponse.json({ error: 'Missing feedback text' }, { status: 400 });
  }

  const attempt = await item<Attempt>('attempts', id);
  if (!attempt || attempt.teacherId !== session.uid || attempt.mode === 'selftest') {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  if (text.length === 0) {
    await merge('attempts', id, { teacherFeedback: null });
    return NextResponse.json({ ok: true, cleared: true });
  }

  const teacherFeedback = { text, at: Date.now(), byName: session.name };
  await merge('attempts', id, { teacherFeedback });

  // ring the student's bell — but only when the note is genuinely new (not a
  // re-save of identical text), so a teacher's typo edits never double-ring
  if (attempt.teacherFeedback?.text !== text) {
    void notifyStudents([attempt.studentId], {
      kind: 'feedback',
      title: `Feedback on “${attempt.assignmentTitle || 'your quiz'}”`,
      body: `${session.name} wrote: “${text.length > 180 ? `${text.slice(0, 180)}…` : text}” — tap to read it on your result.`,
      assignmentId: attempt.assignmentId ?? undefined,
      attemptId: attempt.id,
      fromId: session.uid,
    });
  }

  return NextResponse.json({ ok: true, teacherFeedback });
}
