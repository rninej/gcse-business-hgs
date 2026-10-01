import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { put } from '@/lib/firebase';
import { loadAccessibleAttempt } from '@/lib/attemptAccess';
import { shuffleMcqOptions } from '@/lib/questions';
import type { Attempt } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * "Practise the ones you got wrong": builds a fresh self-study attempt from
 * ONLY the questions this student answered incorrectly on a submitted quiz
 * (skips written answers still awaiting the AI examiner — their outcome is
 * unknown yet). The retry is a normal untimed practice attempt, so it earns
 * points, feeds the progress map and never touches assignment statistics.
 */
export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const access = await loadAccessibleAttempt(id);
  if (!access) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  const attempt = access.attempt;

  if (attempt.status !== 'submitted' || !attempt.result) {
    return NextResponse.json({ error: 'Finish the quiz first — then you can retry the ones you got wrong.' }, { status: 400 });
  }

  const wrong = attempt.questions.filter((q) => {
    const rec = attempt.result?.perQ?.[q.id];
    if (!rec) return false;
    if (q.type === 'written') {
      // only retry written answers the examiner has actually marked wrong
      return rec.awarded !== undefined && rec.awarded < q.marks;
    }
    return !rec.correct;
  });

  if (wrong.length === 0) {
    return NextResponse.json({ error: 'Nothing to retry — everything was correct!' }, { status: 400 });
  }

  // "Enterprise & Entrepreneurship · practice" → "Enterprise & Entrepreneurship"
  const baseTitle = attempt.assignmentTitle.replace(/\s·\s(practice|self-test)$/i, '');
  const title = `Retry · ${baseTitle}`;

  const attemptId = `at_${randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const retry: Attempt = {
    id: attemptId,
    mode: 'practice',
    status: 'in-progress',
    studentId: attempt.studentId,
    studentName: attempt.studentName,
    teacherId: attempt.teacherId,
    classId: attempt.classId,
    assignmentId: null,
    assignmentTitle: title,
    quizId: attempt.quizId,
    startedAt: Date.now(),
    dueAt: null,
    timeLimitMin: null,
    questions: shuffleMcqOptions(wrong.map((q) => ({ ...q }))),
    answers: {},
    checked: {},
    perQ: {},
    events: [],
    wallMs: 0,
    hiddenMs: 0,
    result: null,
  };
  await put('attempts', attemptId, retry);
  return NextResponse.json({ ok: true, attemptId, questionCount: wrong.length });
}
