// Question view transformers: client-safe (pre-submission) and review (post-submission)
import type { ClientQuestion, PerQRecord, QExtract, Question, QReview } from './types';

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

export function toReview(
  q: Question,
  n: number,
  given: string,
  expected: string,
  correct: boolean,
  rec?: PerQRecord | null
): QReview {
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
  if (q.type === 'written') {
    review.points = q.points;
    if (rec) {
      if (rec.awarded !== undefined && rec.awarded !== null) {
        review.awarded = rec.awarded;
        review.correct = rec.awarded >= q.marks;
        review.comment = rec.comment;
        review.markedBy = rec.markedBy;
        review.pointResults = rec.pointResults;
      } else {
        review.pendingMark = true; // saved but not yet AI-marked
      }
    } else {
      review.pendingMark = true;
    }
  }
  return review;
}

/** Human-friendly text for a confirmed answer: MCQ index → "B. option text",
 *  true/false stored as "true"/"false" → "True"/"False". */
export function displayGiven(q: Pick<Question, 'type'> & { options?: string[] }, given: string): string {
  if (!given || given === '—') return given;
  if (q.type === 'mcq' && q.options && q.options.length > 0) {
    const idx = Number.parseInt(given, 10);
    if (Number.isInteger(idx) && idx >= 0 && idx < q.options.length) {
      return `${String.fromCharCode(65 + idx)}. ${q.options[idx]}`;
    }
    return given;
  }
  if (q.type === 'truefalse') return given === 'true' ? 'True' : given === 'false' ? 'False' : given;
  return given;
}
