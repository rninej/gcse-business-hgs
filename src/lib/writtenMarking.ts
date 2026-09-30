// AI marking of written answers on a submitted attempt.
// Marks every written question that has an answer but no marks yet (idempotent
// — safe to call repeatedly from the student's result screen or the teacher's
// results view), then recomputes the attempt's score from the stored
// per-question records.

import { item, merge } from './firebase';
import { markWrittenAnswer } from './ai';
import { scoreFromPerQ } from './marking';
import { pointsFor } from './risk';
import type { Attempt, PerQRecord } from './types';

export interface WrittenMarkRun {
  marked: number;
  pendingLeft: number;
}

export async function markPendingWritten(attemptId: string): Promise<WrittenMarkRun> {
  const attempt = await item<Attempt>('attempts', attemptId);
  if (!attempt) throw new Error('Attempt not found');
  if (attempt.status !== 'submitted' || !attempt.result) {
    throw new Error('Attempt is not submitted yet');
  }

  const perQ: Record<string, PerQRecord> = { ...(attempt.result.perQ ?? {}) };
  let marked = 0;

  for (const q of attempt.questions) {
    if (q.type !== 'written') continue;
    const answer = (attempt.answers?.[q.id] ?? '').toString().trim();
    if (!answer) continue; // blank answers stay at 0 — nothing to mark
    const rec = perQ[q.id];
    if (rec && rec.awarded !== undefined && rec.awarded !== null) continue; // already marked

    const mark = await markWrittenAnswer(q, answer);
    perQ[q.id] = {
      correct: mark.awarded >= q.marks,
      given: rec?.given ?? answer,
      expected: rec?.expected ?? `Marked by AI · ${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}`,
      awarded: mark.awarded,
      comment: mark.comment,
      markedBy: mark.by,
      pointResults: mark.points,
    };
    marked += 1;
    // persist per-question as we go — a timeout mid-way loses nothing
    await merge('attempts', attempt.id, { [`result/perQ/${q.id}`]: perQ[q.id] });
  }

  const pendingLeft = attempt.questions.filter(
    (q) =>
      q.type === 'written' &&
      (attempt.answers?.[q.id] ?? '').toString().trim().length > 0 &&
      (perQ[q.id]?.awarded === undefined || perQ[q.id]?.awarded === null)
  ).length;

  if (marked > 0) {
    const score = scoreFromPerQ(attempt.questions, perQ);
    const points = attempt.mode === 'selftest' ? 0 : pointsFor(score.score, score.total, score.pct);
    await merge('attempts', attempt.id, {
      'result/score': score.score,
      'result/total': score.total,
      'result/pct': score.pct,
      'result/topicStats': score.topicStats,
      'result/points': points,
      'result/writtenPending': pendingLeft,
    });
  } else if ((attempt.result.writtenPending ?? 0) !== pendingLeft) {
    await merge('attempts', attempt.id, { 'result/writtenPending': pendingLeft });
  }

  return { marked, pendingLeft };
}
