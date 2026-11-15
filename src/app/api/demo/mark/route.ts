// Marks the public demo. Deterministic and server-side, exactly like the real
// product — answers never reach the browser until the student has submitted.

import { NextResponse } from 'next/server';
import { DEMO_QUESTIONS } from '@/data/demo';
import { markQuestion } from '@/lib/marking';

function cleanAnswers(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k === 'string' && typeof v === 'string') out[k] = v.slice(0, 500);
  }
  return out;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Could not read that submission.' }, { status: 400 });
  }

  const answers = cleanAnswers((body as { answers?: unknown } | null)?.answers);

  let score = 0;
  let total = 0;
  const results = DEMO_QUESTIONS.map((q) => {
    const outcome = markQuestion(q, answers[q.id]);
    total += q.marks;
    if (outcome.correct) score += q.marks;
    return {
      id: q.id,
      correct: outcome.correct,
      expected: outcome.expectedDisplay,
      given: outcome.givenDisplay,
      explain: q.explain,
      marks: q.marks,
    };
  });

  return NextResponse.json({ results, score, total });
}
