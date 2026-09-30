// Question view transformers: client-safe (pre-submission) and review (post-submission)
import type { ClientQuestion, QExtract, Question, QReview } from './types';

export function toClientQuestion(q: Question, n: number): ClientQuestion {
  const base: ClientQuestion = {
    id: q.id,
    n,
    type: q.type,
    topic: q.topic,
    marks: q.marks,
    stem: q.stem,
    extract: q.extract,
    diagram: q.diagram,
    image: q.image,
  };
  if (q.type === 'mcq') {
    return { ...base, type: 'mcq', options: q.options };
  }
  if (q.type === 'numeric') {
    return { ...base, type: 'numeric', unit: q.unit, dp: q.dp };
  }
  return base;
}

export function toClientQuestions(qs: Question[]): ClientQuestion[] {
  return qs.map((q, i) => toClientQuestion(q, i + 1));
}

export function toReview(q: Question, n: number, given: string, expected: string, correct: boolean): QReview {
  const review: QReview = {
    qid: q.id,
    n,
    type: q.type,
    topic: q.topic,
    stem: q.stem,
    extract: q.extract,
    diagram: q.diagram,
    image: q.image,
    options: q.type === 'mcq' ? q.options : undefined,
    given,
    expected,
    correct,
    marks: q.marks,
    explain: q.explain,
  };
  return review;
}
