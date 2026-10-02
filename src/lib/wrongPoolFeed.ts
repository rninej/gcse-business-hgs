// Per-student wrong-answer pool feed: wrongPool/{studentId}/{qid} entries,
// maintained at submit / finalize / AI-written-marking time. Same semantics
// as collectWrongPool (a question stays in the pool while its MOST RECENT
// outcome is wrong) but stored incrementally, so the student dashboard and
// the smart-practice builder read a few KB of their own data instead of the
// whole 700KB attempts collection. The teacher's class "mistake fixer" reads
// every student's feed through the versioned cache — also tiny.
//
// timesWrong is incremented per wrong outcome and survives across quizzes;
// a later correct answer (e.g. on a retry) removes the entry.

import { colCached, fb } from './firebase';
import type { Question, PerQRecord } from './types';
import type { WrongPoolEntry } from './wrongPool';

export type WrongPoolFeed = Record<string, WrongPoolEntry>;

/** One student's own pool (versioned cache — re-reads are ~free). */
export async function readWrongPool(studentId: string): Promise<WrongPoolFeed> {
  return (await colCached<WrongPoolEntry>(`wrongPool/${studentId}`)) ?? {};
}

/** All students' pools, grouped — teacher-side mistake-fixer input. */
export async function readAllWrongPools(): Promise<Record<string, WrongPoolFeed>> {
  return (await colCached<WrongPoolFeed>('wrongPool')) ?? {};
}

function isWrongOutcome(q: Question, rec: PerQRecord): boolean {
  // written answers only count once the AI examiner has awarded marks
  return q.type === 'written' ? rec.awarded !== undefined && rec.awarded < q.marks : !rec.correct;
}

/** Fold one submission's outcomes into a pool (pure). Pass `onlyQids` to
 *  re-fold a subset — the written-marking path updates just the questions
 *  the examiner marked, so timesWrong never double-counts. */
export function applyOutcomes(
  feed: WrongPoolFeed,
  questions: Question[],
  perQ: Record<string, PerQRecord>,
  submittedAt: number,
  onlyQids?: Set<string>
): WrongPoolFeed {
  const next: WrongPoolFeed = { ...feed };
  for (const q of questions) {
    if (onlyQids && !onlyQids.has(q.id)) continue;
    const rec = perQ?.[q.id];
    if (!rec) continue; // unanswered — no record to learn from
    if (isWrongOutcome(q, rec)) {
      const prev = next[q.id];
      next[q.id] = {
        q: { ...q },
        timesWrong: (prev?.timesWrong ?? 0) + 1,
        lastWrongAt: submittedAt,
      };
    } else {
      delete next[q.id]; // most recent outcome is correct — it's learned
    }
  }
  return next;
}

/** Read a student's pool, fold a submission's outcomes in, write it back. */
export async function syncWrongPool(
  studentId: string,
  questions: Question[],
  perQ: Record<string, PerQRecord>,
  submittedAt: number,
  onlyQids?: Set<string>
): Promise<void> {
  try {
    const feed = await readWrongPool(studentId);
    const next = applyOutcomes(feed, questions, perQ, submittedAt, onlyQids);
    await fb.set(`wrongPool/${studentId}`, next);
  } catch {
    // the pool is a study aid — never let it break a submit flow
  }
}
