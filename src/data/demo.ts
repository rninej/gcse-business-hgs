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

/**
 * Rotate MCQ options per question.
 *
 * The bank authors each case study with the right answer first, and the demo
 * serves that order raw — so all three multiple-choice questions in the demo had
 * their correct option in slot A. A teacher trying the page notices immediately
 * and concludes the thing is staged. The real product shuffles per attempt; the
 * demo rotates by a hash of the question id instead, so the page and the marking
 * route (two separate processes) always agree on the same order without sending
 * any answer data to the browser.
 */
function rotateOptions(q: Question): Question {
  if (q.type !== 'mcq' || q.options.length < 3) return q;
  let hash = 0;
  for (const ch of q.id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  const shift = 1 + (hash % (q.options.length - 1)); // 1..n-1, never a no-op
  const n = q.options.length;
  const options = q.options.map((_, i) => q.options[(i + shift) % n]);
  const correct = (q.correct - shift + n * 2) % n;
  return { ...q, options, correct };
}

export const DEMO_QUESTIONS: Question[] = DEMO_IDS.map((id) => pool.get(id))
  .filter((q): q is Question => Boolean(q))
  .map(rotateOptions);

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
