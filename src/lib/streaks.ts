// Study streak maths — computed from submitted-attempt timestamps.
// Shared by the student overview and the class leaderboard so both always agree.

import { liteForStudent } from './attemptLite';
import type { AttemptLite } from './attemptLite';

function dayKey(ms: number): number {
  // UTC day index — a stable, timezone-independent day boundary.
  return Math.floor(ms / 86_400_000);
}

/** Milestone lines worth celebrating — the result screen fires a special
 *  banner (and golden confetti) the moment a submission pushes the student's
 *  current streak across one of these. 3 hooks them early; 100 is legendary. */
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100] as const;

export interface StreakInfo {
  current: number; // consecutive days ending today (or yesterday, before today's quiz)
  best: number; // longest run ever
  activeDays: number; // total distinct days with at least one submitted quiz
}

export function streaksFrom(submittedAtMs: number[]): StreakInfo {
  if (submittedAtMs.length === 0) return { current: 0, best: 0, activeDays: 0 };

  const days = [...new Set(submittedAtMs.map(dayKey))].sort((a, b) => b - a); // newest first
  const today = dayKey(Date.now());

  // current streak: consecutive days ending today, or ending yesterday
  // (so a student who hasn't logged in yet today doesn't "lose" their streak at midnight)
  let start = days[0] >= today - 1 ? days[0] : -1;
  let current = 0;
  if (start !== -1) {
    current = 1;
    for (let i = 1; i < days.length; i++) {
      if (days[i] === start - 1) {
        current += 1;
        start = days[i];
      } else if (days[i] < start - 1) {
        break;
      }
    }
  }

  // best streak: longest run of consecutive day keys
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === days[i - 1] - 1) {
      run += 1;
      best = Math.max(best, run);
    } else if (days[i] < days[i - 1] - 1) {
      run = 1;
    }
  }

  return { current, best, activeDays: days.length };
}

/** True when any submitted-at falls inside today's UTC day (the same boundary
 *  the streak maths uses) — i.e. the current streak is already safe today. */
export function hasQuizToday(submittedAtMs: number[]): boolean {
  const today = dayKey(Date.now());
  return submittedAtMs.some((ms) => dayKey(ms) === today);
}

/** The milestone line a submission just crossed, if any — pure maths.
 *  Returns null when the streak was already at/after the line (e.g. a second
 *  quiz on the same day must NOT re-unlock the same milestone). */
export function crossedMilestone(before: number, after: number): number | null {
  return STREAK_MILESTONES.find((m) => after >= m && before < m) ?? null;
}

/** Submitted-at timestamps of a student's real (non-self-test) quizzes.
 *  Server-side only — used by the submit/finalize paths to detect a streak
 *  milestone at the moment it happens, so the attempt remembers it forever
 *  (a later same-day quiz would otherwise mask it on re-reads). Reads the
 *  slim per-student feed, not the fat attempts collection. */
export async function studentSubmittedAt(studentId: string): Promise<number[]> {
  const mine: AttemptLite[] = await liteForStudent(studentId);
  return mine
    .filter((a) => a.status === 'submitted' && a.result && a.mode !== 'selftest')
    .map((a) => a.result?.submittedAt ?? 0);
}
