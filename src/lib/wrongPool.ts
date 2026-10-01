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
    // questions can be missing on partial/legacy records — nothing to learn from those
    if (at.status !== 'submitted' || !at.result || !Array.isArray(at.questions)) continue;
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

/* ------------------------------------------------------------------ */
/* Class-wide wrong pool — powers the teacher's "mistake fixer":      */
/* questions this class's students keep getting wrong, ranked by how  */
/* many DIFFERENT students are currently stuck on them.              */
/* ------------------------------------------------------------------ */

export interface ClassWrongStats {
  q: Question;
  /** how many distinct students are currently stuck on this question */
  studentsWrong: number;
  /** total wrong answers across those students (severity) */
  timesWrong: number;
  /** most recent wrong answer (oldest problems surface first on ties) */
  lastWrongAt: number;
}

/**
 * Combines every student's individual wrong pool (see collectWrongPool)
 * into class-level stats. A question counts as "still wrong" per student
 * only while its most recent outcome for THAT student is wrong — exactly
 * the material each of them would be revisiting on their own dashboard.
 */
export function collectClassWrongPool(perStudentAttempts: Attempt[][]): ClassWrongStats[] {
  const combined = new Map<string, ClassWrongStats>();

  for (const attempts of perStudentAttempts) {
    for (const e of collectWrongPool(attempts)) {
      const agg = combined.get(e.q.id);
      if (agg) {
        agg.studentsWrong += 1;
        agg.timesWrong += e.timesWrong;
        agg.lastWrongAt = Math.max(agg.lastWrongAt, e.lastWrongAt);
      } else {
        combined.set(e.q.id, {
          q: { ...e.q },
          studentsWrong: 1,
          timesWrong: e.timesWrong,
          lastWrongAt: e.lastWrongAt,
        });
      }
    }
  }

  return [...combined.values()];
}

/** Most-students-stuck first, then most total misses, then oldest wrongs. */
export function rankClassWrongPool(pool: ClassWrongStats[]): ClassWrongStats[] {
  return [...pool].sort(
    (a, b) =>
      b.studentsWrong - a.studentsWrong ||
      b.timesWrong - a.timesWrong ||
      a.lastWrongAt - b.lastWrongAt
  );
}
