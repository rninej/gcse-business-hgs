import { NextResponse } from 'next/server';
import { item, merge } from '@/lib/firebase';
import { loadAccessibleAttempt } from '@/lib/attemptAccess';
import { markQuestion } from '@/lib/marking';
import type { Attempt } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * Confirm + mark a single answer the moment a student checks it.
 * The confirmed answer is persisted server-side, so progress survives the
 * browser being closed. A question can only be checked once — repeat calls
 * return the stored outcome, which also makes answer-guessing pointless.
 */
export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const access = await loadAccessibleAttempt(id);
  if (!access) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  const attempt: Attempt = access.attempt;
  if (attempt.status === 'submitted') {
    return NextResponse.json({ error: 'Already submitted.', alreadySubmitted: true }, { status: 409 });
  }

  const body = (await req.json().catch(() => ({}))) as { qid?: string; answer?: string };
  const qid = (body.qid ?? '').toString();
  const q = attempt.questions.find((x) => x.id === qid);
  if (!q) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

  // written answers: saved (and re-savable) but never auto-marked or locked —
  // the AI examiner marks them after submission
  if (q.type === 'written') {
    const answer = (body.answer ?? '').toString().slice(0, 5000);
    await merge('attempts', attempt.id, { [`answers/${qid}`]: answer, lastSeenAt: Date.now() });
    return NextResponse.json({ ok: true, saved: true, marks: q.marks });
  }

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
    lastSeenAt: Date.now(),
  });

  return NextResponse.json({
    ok: true,
    correct: outcome.correct,
    expected: outcome.expectedDisplay,
    explain: q.explain,
    marks: q.marks,
  });
}
