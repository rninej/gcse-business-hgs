import { NextResponse } from 'next/server';
import { item, merge } from '@/lib/firebase';
import { markQuestion } from '@/lib/marking';
import { requireRole } from '@/lib/session';
import type { Attempt } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * Confirm + mark a single answer the moment a student checks it.
 * The confirmed answer is persisted server-side, so progress survives the
 * browser being closed. A question can only be checked once — repeat calls
 * return the stored outcome, which also makes answer-guessing pointless.
 */
export async function POST(req: Request, ctx: Ctx) {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  const attempt = await item<Attempt>('attempts', id);
  if (!attempt || attempt.studentId !== session.uid) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }
  if (attempt.status === 'submitted') {
    return NextResponse.json({ error: 'Already submitted.', alreadySubmitted: true }, { status: 409 });
  }

  const body = (await req.json().catch(() => ({}))) as { qid?: string; answer?: string };
  const qid = (body.qid ?? '').toString();
  const q = attempt.questions.find((x) => x.id === qid);
  if (!q) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

  // already confirmed → replay the stored outcome
  const prior = attempt.checked?.[qid];
  if (prior) {
    return NextResponse.json({
      ok: true,
      correct: prior.correct,
      expected: prior.expected,
      explain: prior.explain,
      marks: q.marks,
      replay: true,
    });
  }

  const answer = (body.answer ?? '').toString().slice(0, 300);
  const outcome = markQuestion(q, answer);

  await merge('attempts', attempt.id, {
    [`answers/${qid}`]: answer,
    [`checked/${qid}`]: {
      a: answer,
      correct: outcome.correct,
      expected: outcome.expectedDisplay,
      explain: q.explain,
      at: Date.now(),
    },
  });

  return NextResponse.json({
    ok: true,
    correct: outcome.correct,
    expected: outcome.expectedDisplay,
    explain: q.explain,
    marks: q.marks,
  });
}
