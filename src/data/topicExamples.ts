// Two worked examples per topic, published openly on /topics/[topic].
//
// Why this exists: search is the only acquisition channel that needs neither
// an ad budget nor a social account. A teacher (or a student) typing
// "Edexcel GCSE Business 1.3 questions" should land on a page that actually
// contains questions and answers, not a login screen.
//
// Deliberately a small slice: 2 of the 245 questions per topic, so the public
// pages are genuinely useful (and indexable) without giving the product away.
// Written-response questions are excluded because they are AI-marked and the
// worked answer is a mark scheme, not a single answer.
//
// If you ever want to pull these back behind the login, delete the section in
// app/topics/[topic]/page.tsx — nothing else depends on this file.

import { QUIZZES } from '@/data/bank';
import type { Question } from '@/lib/types';

export function examplesForTopic(topicId: string, count = 2): Question[] {
  const picked: Question[] = [];
  for (const quiz of QUIZZES) {
    for (const q of quiz.questions) {
      if (q.topic !== topicId) continue;
      if (q.type === 'written') continue;
      if (picked.some((p) => p.id === q.id)) continue;
      picked.push(q);
      if (picked.length >= count) break;
    }
    if (picked.length >= count) break;
  }
  return picked;
}

/** One worked example for a single spec sub-topic page (/spec/[subtopic]).
 *  Only questions explicitly tagged with that sub-topic are eligible — if the
 *  bank has none, the page simply omits the section rather than borrowing a
 *  question from elsewhere in the topic. */
export function examplesForSubtopic(subtopicId: string, count = 1): Question[] {
  const picked: Question[] = [];
  for (const quiz of QUIZZES) {
    for (const q of quiz.questions) {
      if (q.subtopic !== subtopicId) continue;
      if (q.type === 'written') continue;
      if (picked.some((p) => p.id === q.id)) continue;
      picked.push(q);
      if (picked.length >= count) break;
    }
    if (picked.length >= count) break;
  }
  return picked;
}
