// Achievements / badges — the beyond-Educake motivator.
// Shared definitions + a PURE computeBadges(input) function: the student
// overview route computes the input facts from the attempts it already loads
// and ships the resulting BadgeState[] to the client, which renders the grid
// and fires unlock toasts. No server-only imports here on purpose.

import { TOPICS } from './topics';

/** Facts about a student's quiz history — everything the unlock maths needs. */
export interface BadgeInput {
  /** submitted quizzes with a result */
  quizzesDone: number;
  /** total points across all submitted quizzes */
  points: number;
  /** best single-quiz percentage, null before the first quiz */
  bestPct: number | null;
  /** average percentage across all quizzes, null before the first quiz */
  avgPct: number | null;
  /** longest streak of consecutive study days, ever */
  streakBest: number;
  /** quizzes finished with 100% */
  perfectCount: number;
  /** distinct topic ids the student has answered questions in */
  topicsSeen: string[];
  /** hours of day (0–23) quizzes were submitted at */
  submitHours: number[];
  /** true when a gap of 7+ days between submissions was followed by
   *  another quiz — reserved: no shipped badge consumes it yet, but the
   *  fact is cheap and keeps the client/contract stable for badge #13. */
  comeback: boolean;
}

export interface BadgeProgress {
  current: number;
  target: number;
}

export interface BadgeState {
  id: string;
  title: string;
  desc: string;
  /** lucide icon key — resolved to a component on the client */
  icon: string;
  unlocked: boolean;
  /** shown on locked badges that support progress ("3/5") */
  progress?: BadgeProgress;
}

interface BadgeDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  test: (i: BadgeInput) => boolean;
  progress: (i: BadgeInput) => BadgeProgress | null;
}

const cap = (v: number, target: number) => Math.max(0, Math.min(v, target));

/* The 12-badge set — order is the display order on the dashboard. */
const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'first-quiz',
    title: 'Off the mark',
    desc: 'Complete your first quiz.',
    icon: 'flag',
    test: (i) => i.quizzesDone >= 1,
    progress: (i) => ({ current: cap(i.quizzesDone, 1), target: 1 }),
  },
  {
    id: 'five-quizzes',
    title: 'Warming up',
    desc: 'Complete 5 quizzes.',
    icon: 'activity',
    test: (i) => i.quizzesDone >= 5,
    progress: (i) => ({ current: cap(i.quizzesDone, 5), target: 5 }),
  },
  {
    id: 'twenty-quizzes',
    title: 'Quiz machine',
    desc: 'Complete 20 quizzes.',
    icon: 'zap',
    test: (i) => i.quizzesDone >= 20,
    progress: (i) => ({ current: cap(i.quizzesDone, 20), target: 20 }),
  },
  {
    id: 'fifty-quizzes',
    title: 'Unstoppable',
    desc: 'Complete 50 quizzes.',
    icon: 'rocket',
    test: (i) => i.quizzesDone >= 50,
    progress: (i) => ({ current: cap(i.quizzesDone, 50), target: 50 }),
  },
  {
    id: 'perfect',
    title: 'Flawless',
    desc: 'Score 100% on any quiz.',
    icon: 'gem',
    test: (i) => i.perfectCount >= 1,
    progress: (i) => ({ current: cap(i.perfectCount, 1), target: 1 }),
  },
  {
    id: 'high-avg',
    title: 'Consistent',
    desc: 'Average 80%+ across 3 or more quizzes.',
    icon: 'target',
    test: (i) => i.quizzesDone >= 3 && (i.avgPct ?? 0) >= 80,
    // first the quiz count has to qualify, then the average climbs
    progress: (i) =>
      i.quizzesDone < 3
        ? { current: cap(i.quizzesDone, 3), target: 3 }
        : { current: cap(Math.floor(i.avgPct ?? 0), 80), target: 80 },
  },
  {
    id: 'streak-3',
    title: 'Hat-trick',
    desc: 'Study 3 days in a row.',
    icon: 'flame',
    test: (i) => i.streakBest >= 3,
    progress: (i) => ({ current: cap(i.streakBest, 3), target: 3 }),
  },
  {
    id: 'streak-7',
    title: 'On fire',
    desc: 'Study 7 days in a row.',
    icon: 'flame-kindling',
    test: (i) => i.streakBest >= 7,
    progress: (i) => ({ current: cap(i.streakBest, 7), target: 7 }),
  },
  {
    id: 'points-1k',
    title: 'Point collector',
    desc: 'Earn 1,000 points.',
    icon: 'coins',
    test: (i) => i.points >= 1000,
    progress: (i) => ({ current: cap(i.points, 1000), target: 1000 }),
  },
  {
    id: 'points-5k',
    title: 'Point legend',
    desc: 'Earn 5,000 points.',
    icon: 'crown',
    test: (i) => i.points >= 5000,
    progress: (i) => ({ current: cap(i.points, 5000), target: 5000 }),
  },
  {
    id: 'all-topics',
    title: 'All-rounder',
    desc: 'Answer questions in all 10 topics.',
    icon: 'orbit',
    test: (i) => i.topicsSeen.length >= TOPICS.length,
    progress: (i) => ({ current: cap(i.topicsSeen.length, TOPICS.length), target: TOPICS.length }),
  },
  {
    id: 'night-owl',
    title: 'Night owl',
    desc: 'Finish a quiz after 9pm.',
    icon: 'moon-star',
    test: (i) => i.submitHours.some((h) => h >= 21),
    // no partial credit for staying up — progress stays hidden until it pops
    progress: () => null,
  },
];

/** Total badges in the set — the "N of 12" denominator. */
export const BADGE_COUNT = BADGE_DEFS.length;

/** Pure unlock maths: facts in, badge states out (definition order). */
export function computeBadges(input: BadgeInput): BadgeState[] {
  return BADGE_DEFS.map((d) => {
    const unlocked = d.test(input);
    const state: BadgeState = {
      id: d.id,
      title: d.title,
      desc: d.desc,
      icon: d.icon,
      unlocked,
    };
    if (!unlocked) {
      const progress = d.progress(input);
      if (progress) state.progress = progress;
    }
    return state;
  });
}
