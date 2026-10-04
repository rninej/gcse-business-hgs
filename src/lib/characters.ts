// Profile characters — the 2D cast students (and teachers) can pick as their
// avatar, next to the emoji picks and photo uploads. Server-safe definitions
// only (no JSX): the SVG art lives in components/characters.tsx and this file
// is what API routes import to validate `char:<id>` avatar values.
//
// Eight of the twelve characters are LOCKED behind achievement badges — the
// unlock is checked client-side from the student's real badge states (the
// server never needs to re-verify: an avatar is cosmetic and self-chosen).

/** A character unlock: null = free for everyone, otherwise the badge id that
 *  unlocks it (see src/lib/badges.ts for the definitions). */
export interface CharacterDef {
  id: string;
  name: string;
  blurb: string;
  /** badge id that unlocks this character */
  badge: string | null;
}

export const CHARACTERS: CharacterDef[] = [
  { id: 'maya', name: 'Maya', blurb: 'Double buns, big ideas', badge: null },
  { id: 'theo', name: 'Theo', blurb: 'Sees the detail others miss', badge: null },
  { id: 'amara', name: 'Amara', blurb: 'Loud, proud, organised', badge: null },
  { id: 'finn', name: 'Finn', blurb: 'Cap on, ready to go', badge: null },
  { id: 'scholar', name: 'Scholar', blurb: 'Graduation-day graduate', badge: 'first-quiz' },
  { id: 'ember', name: 'Ember', blurb: 'Runs hot on a streak', badge: 'streak-3' },
  { id: 'archer', name: 'Archer', blurb: 'Never misses the target', badge: 'high-avg' },
  { id: 'prism', name: 'Prism', blurb: 'Flawless to the facet', badge: 'perfect' },
  { id: 'circuit', name: 'Circuit', blurb: 'Out-quizzes the machines', badge: 'twenty-quizzes' },
  { id: 'regent', name: 'Regent', blurb: 'Rules the point kingdom', badge: 'points-5k' },
  { id: 'orbit', name: 'Orbit', blurb: 'Has seen every topic', badge: 'all-topics' },
  { id: 'whoo', name: 'Whoo', blurb: 'Revising past bedtime', badge: 'night-owl' },
];

export const CHARACTER_IDS = CHARACTERS.map((c) => c.id);

/** Character ids that anyone can pick (no badge needed). */
export const FREE_CHARACTER_IDS = CHARACTERS.filter((c) => c.badge === null).map((c) => c.id);

/** Look up one character definition (null for unknown ids). */
export function characterById(id: string): CharacterDef | null {
  return CHARACTERS.find((c) => c.id === id) ?? null;
}

/** Is this avatar string a pickable character right now? `unlockedBadges`
 *  comes from the signed-in student's real badge states; teachers pass
 *  null, which unlocks the free set only. */
export function characterPickable(id: string, unlockedBadges: Set<string> | null): boolean {
  const c = characterById(id);
  if (!c) return false;
  if (c.badge === null) return true;
  return unlockedBadges?.has(c.badge) ?? false;
}
