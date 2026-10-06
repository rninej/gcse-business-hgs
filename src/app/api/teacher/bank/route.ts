import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { QUIZZES } from '@/data/bank';
import { SUBTOPIC_MAP, TOPIC_MAP } from '@/lib/topics';
import type { Question, QuestionType } from '@/lib/types';

const VALID_TYPES: QuestionType[] = ['mcq', 'term', 'fib', 'numeric', 'truefalse', 'written'];
const MAX_ROWS = 100;

/**
 * The question-bank picker behind "My questions" in the new-assignment wizard.
 * Flattens the ENTIRE bank (both audiences — teachers may dip into the
 * practice pool too), filters server-side and returns full question objects
 * (answers included: this is teacher-only, and teachers can preview answers
 * anyway — student-facing routes still strip answers before sending).
 *
 * Query params:
 *   topic     — a single topic id, e.g. '1.4' (omit = every topic)
 *   subtopic  — a single official sub-topic id, e.g. '2.1.3' (needs topic too)
 *   type      — a single question type (omit = every type)
 *   q         — case-insensitive search over question stems
 *   counts    — '1' returns { subtopicCounts } for the whole bank instead
 *               (used to badge sub-topic chips with bank coverage numbers)
 * Response: { questions: (Question & { quizTitle })[], total } — total counts
 * every match so the UI can say "showing 100 of 245".
 */
export async function GET(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);

  // lightweight mode: per-sub-topic bank coverage for the picker UI
  if (url.searchParams.get('counts') === '1') {
    const counts: Record<string, number> = {};
    for (const quiz of QUIZZES) {
      for (const question of quiz.questions) {
        if (question.subtopic) counts[question.subtopic] = (counts[question.subtopic] ?? 0) + 1;
      }
    }
    return NextResponse.json({ subtopicCounts: counts });
  }

  const topic = url.searchParams.get('topic')?.trim().slice(0, 8) ?? '';
  const subtopic = url.searchParams.get('subtopic')?.trim().slice(0, 8) ?? '';
  const typeParam = url.searchParams.get('type')?.trim() ?? '';
  const type = VALID_TYPES.includes(typeParam as QuestionType) ? typeParam : '';
  const q = url.searchParams.get('q')?.trim().toLowerCase().slice(0, 80) ?? '';

  const topicOk = TOPIC_MAP[topic] !== undefined;
  const subOk = SUBTOPIC_MAP[subtopic] !== undefined;

  const matched: (Question & { quizTitle: string })[] = [];
  // bank order is pedagogical (definition → application → exam-style), so the
  // picker preserves each quiz's internal order
  for (const quiz of QUIZZES) {
    for (const question of quiz.questions) {
      if (topicOk && question.topic !== topic) continue;
      // sub-topic filter narrows WITHIN the topic (topic param optional but
      // the wizard always sends both together)
      if (subOk && question.subtopic !== subtopic) continue;
      if (!topicOk && !subOk && (topic || subtopic)) continue; // invalid ids → no matches
      if (type && question.type !== type) continue;
      if (q && !question.stem.toLowerCase().includes(q)) continue;
      matched.push({ ...question, quizTitle: quiz.title });
    }
  }

  return NextResponse.json({
    questions: matched.slice(0, MAX_ROWS),
    total: matched.length,
  });
}
