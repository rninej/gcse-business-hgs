import { NextResponse } from 'next/server';
import { askAI } from '@/lib/ai';
import { loadAccessibleAttempt } from '@/lib/attemptAccess';
import { topicTitle } from '@/lib/topics';
import type { Question } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

/** "Explain it to me" — a friendly, step-by-step take on a question the
 *  student got wrong. Works mid-quiz and on the results review. AI-written
 *  with a deterministic fallback, never mentions AI. */

function answerOf(q: Question): string {
  switch (q.type) {
    case 'mcq':
      return q.options[q.correct];
    case 'term':
    case 'fib':
      return q.accept[0];
    case 'numeric':
      return `${q.value}${q.unit ?? ''}`;
    case 'truefalse':
      return q.answer ? 'True' : 'False';
  }
}

function templateExplanation(q: Question, given: string): string {
  const correct = answerOf(q);
  const lines: string[] = [
    `The answer is “${correct}”.`,
    `Why: ${q.explain}`,
  ];
  if (given && given !== correct) {
    lines.push(
      `You put “${given}” — reread the question stem slowly and ask yourself exactly what it is testing (here: ${topicTitle(q.topic)}).`
    );
  }
  lines.push(
    `A good habit: cover the options, write what you think the key term means, then uncover and match it to the closest option.`
  );
  return lines.join(' ');
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const access = await loadAccessibleAttempt(id);
  if (!access) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  const { attempt } = access;

  const body = (await req.json().catch(() => ({}))) as { qid?: string };
  const qid = (body.qid ?? '').toString();
  const q = attempt.questions.find((x) => x.id === qid);
  if (!q) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

  const checked = attempt.checked?.[qid];
  const given =
    checked?.a ??
    attempt.answers?.[qid] ??
    attempt.result?.perQ?.[qid]?.given ??
    '';
  const correct = answerOf(q);
  const givenDisplay =
    q.type === 'mcq' && /^\d+$/.test(given) ? (q.options[Number(given)] ?? given) : given;

  // one explanation per question per attempt — a repeat click replays it
  const cached = attempt.explanations?.[qid];
  if (cached) return NextResponse.json({ ok: true, text: cached.text, by: cached.by });

  const system = `You are a supportive GCSE Business Studies teacher in the UK explaining one quiz question to a student aged 14-16 who got it wrong. British English. Structure: (1) state the correct answer plainly, (2) explain WHY it is correct using the topic idea, (3) point out the trap the student fell into kindly, (4) one memorable tip or real-business example. 4-6 short sentences, no markdown, no lists, no headings. Never mention AI or that an explanation was generated. Be warm but precise.`;

  const parts: string[] = [
    `Topic: ${topicTitle(q.topic)} (${q.topic})`,
    q.extract ? `Case study: ${q.extract.title} — ${q.extract.text}` : '',
    `Question (${q.marks} mark${q.marks > 1 ? 's' : ''}): ${q.stem}`,
    q.type === 'mcq' ? `Options: ${q.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(' ')}` : '',
    `Correct answer: ${correct}`,
    givenDisplay && givenDisplay !== correct ? `The student answered: ${givenDisplay}` : 'The student did not answer.',
    `Teacher's model explanation: ${q.explain}`,
    `Write the explanation now.`,
  ].filter(Boolean);

  const outcome = await askAI({
    system,
    user: parts.join('\n'),
    maxTokens: 450,
    temperature: 0.6,
    timeoutMs: 20_000,
  });

  const text =
    outcome && outcome.text.length > 60 && outcome.text.length < 1500
      ? outcome.text
      : templateExplanation(q, givenDisplay);
  const by = outcome && text === outcome.text ? outcome.provider : 'template';

  // store so a repeat click is instant and free
  try {
    const { merge } = await import('@/lib/firebase');
    await merge('attempts', attempt.id, { [`explanations/${qid}`]: { text, by } });
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({ ok: true, text, by });
}
