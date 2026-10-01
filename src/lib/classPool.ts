import { colCached, values } from '@/lib/firebase';
import { collectClassWrongPool, collectWrongPool, rankClassWrongPool } from '@/lib/wrongPool';
import type { ClassWrongStats } from '@/lib/wrongPool';
import type { Attempt, Assignment } from '@/lib/types';

/** Questions from quizzes set within this window are treated as "fresh" and
 *  excluded from the mistake fixer — students just saw them, so re-asking
 *  immediately reads as a repeat. They rejoin the pool after a day. */
export const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface ClassPoolResult {
  /** ranked fixable questions (fresh ones excluded) — what a fixer would set */
  ranked: ClassWrongStats[];
  /** distinct wrong questions before the freshness filter */
  totalQuestions: number;
  /** how many were excluded because they were set in the last 24h */
  freshExcluded: number;
  /** students currently stuck on at least one FIXABLE question */
  studentsAffected: number;
}

/**
 * The class-wide wrong pool with the freshness rule applied. Shared by the
 * class detail card, the mistake-fixer POST route and the teacher dashboard
 * so all three always agree on what a fixer would contain.
 */
export async function classFixPool(classId: string, teacherId: string): Promise<ClassPoolResult> {
  const attempts = values(await colCached<Attempt>('attempts')).filter(
    (a) => a.classId === classId && a.studentId && a.status === 'submitted' && a.result
  );

  const perStudent = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const list = perStudent.get(a.studentId) ?? [];
    list.push(a);
    perStudent.set(a.studentId, list);
  }
  const perStudentAttempts = [...perStudent.values()];

  const all = rankClassWrongPool(collectClassWrongPool(perStudentAttempts));

  // questions from assignments this teacher set for this class in the last
  // 24 hours are "fresh" — exclude them from the fixable pool
  const freshIds = new Set(
    values(await colCached<Assignment>('assignments'))
      .filter(
        (x) =>
          x.teacherId === teacherId &&
          (x.classId === classId || x.classIds?.includes(classId)) &&
          Date.now() - x.createdAt < FRESH_WINDOW_MS
      )
      .flatMap((x) => (Array.isArray(x.questions) ? x.questions.map((q) => q.id) : []))
  );

  const ranked = all.filter((e) => !freshIds.has(e.q.id));
  const studentsAffected = perStudentAttempts.filter((atts) =>
    collectWrongPool(atts).some((e) => !freshIds.has(e.q.id))
  ).length;

  return {
    ranked,
    totalQuestions: all.length,
    freshExcluded: all.length - ranked.length,
    studentsAffected,
  };
}
