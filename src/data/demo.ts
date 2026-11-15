// The public demo: six questions drawn from the real bank, marked on the
// server. Nothing here is bespoke demo content — a teacher evaluating the
// product should be looking at the same questions their class would get.

import growth from '@/data/bank/growth';
import cashflow from '@/data/bank/cashflow-breakeven';
import { compileQuiz } from '@/lib/bank';
import type { ClientQuestion, Question } from '@/lib/types';

const pool = new Map<string, Question>();
for (const def of [growth, cashflow]) {
  for (const q of compileQuiz(def).questions) pool.set(q.id, q);
}

/** Deliberately one of each question style: case-study MCQ, recall MCQ,
 *  typed term, fill-the-blank and a calculation worth 2 marks.
 *  Ids are prefixed with the quiz SLUG by compileQuiz() — the cashflow quiz's
 *  slug is 'cashflow-breakeven', not the file's local 'cb' prefix. */
const DEMO_IDS = [
  'growth:g2',
  'cashflow-breakeven:cb1',
  'growth:g3',
  'cashflow-breakeven:cb3',
  'cashflow-breakeven:cb4',
  'growth:g9',
];

export const DEMO_QUESTIONS: Question[] = DEMO_IDS.map((id) => pool.get(id)).filter(
  (q): q is Question => Boolean(q)
);

/** Strip every answer field before a question leaves the server. */
export function toClientQuestion(q: Question, n: number): ClientQuestion {
  return {
    id: q.id,
    n,
    type: q.type,
    topic: q.topic,
    marks: q.marks,
    stem: q.stem,
    extract: q.extract,
    diagram: q.diagram,
    image: q.image,
    options: q.type === 'mcq' ? q.options : undefined,
    unit: q.type === 'numeric' ? q.unit : undefined,
    dp: q.type === 'numeric' ? q.dp : undefined,
  };
}

export const DEMO_CLIENT_QUESTIONS: ClientQuestion[] = DEMO_QUESTIONS.map((q, i) =>
  toClientQuestion(q, i + 1)
);
