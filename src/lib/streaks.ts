// Study streak maths — computed from submitted-attempt timestamps.
// Shared by the student overview and the class leaderboard so both always agree.

function dayKey(ms: number): number {
  // UTC day index — a stable, timezone-independent day boundary.
  return Math.floor(ms / 86_400_000);
}

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
