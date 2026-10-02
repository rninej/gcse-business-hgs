import { colCached, values } from '@/lib/firebase';
import { readAllWrongPools } from '@/lib/wrongPoolFeed';
import type { ClassWrongStats, WrongPoolEntry } from '@/lib/wrongPool';
import type { Assignment, Student } from '@/lib/types';

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

/** Combine per-student wrong-pool feed entries into class-level stats —
 *  a question counts as "still wrong" per student only while its most recent
 *  outcome for THAT student is wrong (the feed maintains exactly that). */
function combineClassPool(perStudentEntries: WrongPoolEntry[][]): ClassWrongStats[] {
  const combined = new Map<string, ClassWrongStats>();
  for (const entries of perStudentEntries) {
    for (const e of entries) {
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

/**
 * The class-wide wrong pool with the freshness rule applied. Shared by the
 * class detail card, the mistake-fixer POST route and the teacher dashboard
 * so all three always agree on what a fixer would contain. Reads the
 * per-student wrong-pool feeds (maintained at submit time) — a few KB per
 * class instead of the whole attempts collection.
 */
export async function classFixPool(classId: string, teacherId: string): Promise<ClassPoolResult> {
  const [students, pools, assignments] = await Promise.all([
    colCached<Student>('students'),
    readAllWrongPools(),
    colCached<Assignment>('assignments'),
  ]);

  const studentIds = new Set(values(students).filter((s) => s.classId === classId).map((s) => s.id));
  const perStudentEntries: WrongPoolEntry[][] = [];
  for (const sid of studentIds) {
    const feed = pools[sid];
    if (feed && Object.keys(feed).length > 0) perStudentEntries.push(Object.values(feed));
  }

  const all = combineClassPool(perStudentEntries).sort(
    (a, b) => b.studentsWrong - a.studentsWrong || b.timesWrong - a.timesWrong || a.lastWrongAt - b.lastWrongAt
  );

  // questions from assignments this teacher set for this class in the last
  // 24 hours are "fresh" — exclude them from the fixable pool
  const freshIds = new Set(
    values(assignments)
      .filter(
        (x) =>
          x.teacherId === teacherId &&
          (x.classId === classId || x.classIds?.includes(classId)) &&
          Date.now() - x.createdAt < FRESH_WINDOW_MS
      )
      .flatMap((x) => (Array.isArray(x.questions) ? x.questions.map((q) => q.id) : []))
  );

  const ranked = all.filter((e) => !freshIds.has(e.q.id));
  const studentsAffected = perStudentEntries.filter((entries) =>
    entries.some((e) => !freshIds.has(e.q.id))
  ).length;

  return {
    ranked,
    totalQuestions: all.length,
    freshExcluded: all.length - ranked.length,
    studentsAffected,
  };
}
