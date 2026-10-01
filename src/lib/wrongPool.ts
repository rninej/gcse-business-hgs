import type { Attempt, Question } from '@/lib/types';

export interface WrongPoolEntry {
  q: Question;
  /** how many times this question was answered wrong */
  timesWrong: number;
  /** when it was last answered wrong */
  lastWrongAt: number;
}

/**
 * Collects every question this student got wrong across ALL submitted quizzes,
 * with a spaced-repetition twist: a question is only in the pool while its
 * MOST RECENT outcome is wrong — get it right later (e.g. on a retry) and it
 * drops out of the pool, so the list always reflects what still needs work.
 *
 * Written answers awaiting the AI examiner are skipped (outcome unknown);
 * marked-written answers count as wrong when awarded < full marks.
 */
export function collectWrongPool(attempts: Attempt[]): WrongPoolEntry[] {
  // chronological so "most recent outcome" is simply the last one seen
  const sorted = [...attempts].sort((a, b) => (a.result?.submittedAt ?? 0) - (b.result?.submittedAt ?? 0));

  const pool = new Map<string, WrongPoolEntry>();

  for (const at of sorted) {
    if (at.status !== 'submitted' || !at.result) continue;
    for (const q of at.questions) {
      const rec = at.result.perQ?.[q.id];
      if (!rec) continue; // unanswered — covered by "not quite" below? no: unanswered scores 0 but has no record
      const wrong =
        q.type === 'written'
          ? rec.awarded !== undefined && rec.awarded < q.marks // only marked-written wrongs
          : !rec.correct;
      if (wrong) {
        const e = pool.get(q.id);
        if (e) {
          e.timesWrong += 1;
          e.lastWrongAt = at.result.submittedAt;
          e.q = { ...q }; // keep the latest copy of the question
        } else {
          pool.set(q.id, { q: { ...q }, timesWrong: 1, lastWrongAt: at.result.submittedAt });
        }
      } else if (pool.has(q.id)) {
        pool.delete(q.id); // most recent outcome is correct — it's learned
      }
    }
  }

  return [...pool.values()];
}

/**
 * Priority order for a smart-practice quiz: repeatedly-missed questions come
 * first, then the longest-standing wrongs. Returns a NEW array.
 */
export function rankWrongPool(pool: WrongPoolEntry[]): WrongPoolEntry[] {
  return [...pool].sort((a, b) => b.timesWrong - a.timesWrong || a.lastWrongAt - b.lastWrongAt);
}
