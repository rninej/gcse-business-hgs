'use client';

// Backdrop for quiz-taking. Two variants:
//   • NATURE — the fetched forest photographs (public/quiz-backdrops,
//     deterministic per attempt) with a soft readability veil. MOBILE ONLY:
//     desktop always keeps the minimalist doodle pattern.
//   • DOODLES — the original minimalist business-doodle tiles (SVG pattern,
//     crisp at every resolution).
// Which one a phone shows by DEFAULT is an owner switch in /debug
// (quizBackdropMobile: 'nature' | 'doodles', default nature). Students can
// still override it per browser from the ⋯ menu in the quiz header — an
// explicit choice always beats the default.

import { useMemo, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

export const NATURE_KEY = 'hgs.natureBg';

/** the owner-set default, as served with quiz data ('nature' when absent) */
export type BackdropDefault = 'nature' | 'doodles';

/** read the per-browser preference: 'on' | 'off' when the student chose, or
 *  null when they never touched the ⋯ switch (→ follow the owner default) */
export function explicitNature(): 'on' | 'off' | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(NATURE_KEY);
    return v === 'on' || v === 'off' ? v : null;
  } catch {
    return null;
  }
}

/* ---- tiny external store (localStorage 'hgs.natureBg') so the ⋯ menu
       toggle and every mounted backdrop stay in sync without effects ---- */

const natureListeners = new Set<() => void>();
let storageHooked = false;

function notifyNature(): void {
  natureListeners.forEach((l) => l());
}

function hookStorageOnce(): void {
  if (storageHooked || typeof window === 'undefined') return;
  storageHooked = true;
  window.addEventListener('storage', (e) => {
    if (e.key === NATURE_KEY) notifyNature();
  });
}

export function subscribeNature(cb: () => void): () => void {
  hookStorageOnce();
  natureListeners.add(cb);
  return () => natureListeners.delete(cb);
}

export function getNatureSnapshot(): 'on' | 'off' | null {
  return explicitNature();
}

export function getNatureServerSnapshot(): 'on' | 'off' | null {
  return null; // decided on the client — callers always pass the default too
}

/** flip the preference from the ⋯ menu (same tab + others via storage).
 *  Any tap is an EXPLICIT choice, so it always overrides the owner default. */
export function setNaturePref(on: boolean): void {
  try {
    localStorage.setItem(NATURE_KEY, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  notifyNature();
}

/** Deterministic pick from an attempt id — same quiz, same scene. */
function pick(seed: string, len: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % len;
}

export function QuizBackdrop({ attemptId, mobileDefault = 'nature' }: { attemptId: string; mobileDefault?: BackdropDefault }) {
  const idx = useMemo(() => pick(attemptId, DOODLE_COUNT), [attemptId]);
  const forest = useMemo(() => pick(attemptId, FOREST_COUNT), [attemptId]);
  // explicit per-browser choice beats the owner-set default; no choice yet →
  // whatever /debug says phones should show (nature when the flag is absent)
  const explicit = useSyncExternalStore(subscribeNature, getNatureSnapshot, getNatureServerSnapshot);
  const natureOn = explicit === null ? mobileDefault === 'nature' : explicit === 'on';
  return (
    <>
      {/* nature scene: phones only (below md) — desktop keeps the doodles */}
      <div className={cn(natureOn ? 'md:hidden' : 'hidden')}>
        <NatureBackdrop variant={forest} />
      </div>
      {/* doodle tiles: always on desktop; on mobile only when nature is off */}
      <div className={cn(natureOn ? 'hidden md:block' : 'block')}>
        <DoodleBackdrop idx={idx} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* NATURE SCENE — the fetched forest photographs (public/quiz-backdrops */
/* forest-01..06.jpg), deterministically picked per attempt. A soft     */
/* gradient veil keeps the question card readable over the photo, and a */
/* very slow drift gives the scene life without distracting anyone.     */
/* ------------------------------------------------------------------ */

const FOREST_COUNT = 6;

function NatureBackdrop({ variant }: { variant: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
      {/* the photograph — full cover, same forest every time for this attempt */}
      <img
        src={`/quiz-backdrops/forest-0${variant + 1}.jpg`}
        alt=""
        className="h-full w-full object-cover motion-safe:animate-nature-drift"
        loading="eager"
        decoding="async"
      />
      {/* readability veil — stronger at the top (behind the header) and base */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/15 to-background/55" />
      {/* a whisper of the theme colour so the scene belongs to the app */}
      <div className="absolute inset-0 bg-primary/[0.04]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hand-drawn doodle tiles — business motifs at whisper-quiet opacity */
/* ------------------------------------------------------------------ */

const DOODLE_COUNT = 6;

interface DoodleSpec {
  w: number;
  h: number;
  tile: (id: string) => React.ReactNode;
}

const DOODLES: DoodleSpec[] = [
  // 1 — rising bar charts
  {
    w: 190,
    h: 170,
    tile: (id) => (
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M22 96 h44 M22 96 v-34 M44 96 v-52 M66 96 v-70" />
        <path d="M112 138 h44 M112 138 v-30 M134 138 v-48 M156 138 v-66" />
        <path d="M64 30 l14 -12 10 8 16 -18" />
        <circle cx="150" cy="34" r="3" />
      </g>
    ),
  },
  // 2 — coins & pound signs
  {
    w: 180,
    h: 180,
    tile: (id) => (
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="40" cy="46" r="17" />
        <path d="M35 52 v-12 h9 M35 46 h8" />
        <circle cx="128" cy="118" r="17" />
        <path d="M123 124 v-12 h9 M123 118 h8" />
        <ellipse cx="96" cy="30" rx="7" ry="4.5" transform="rotate(-20 96 30)" />
        <ellipse cx="24" cy="128" rx="7" ry="4.5" transform="rotate(15 24 128)" />
      </g>
    ),
  },
  // 3 — rockets & lightbulbs (enterprise!)
  {
    w: 200,
    h: 190,
    tile: (id) => (
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M46 84 c0 -18 10 -32 10 -32 s10 14 10 32" />
        <path d="M46 84 h20 M56 52 v-6" />
        <path d="M48 84 l-7 12 15 -6 15 6 -7 -12" />
        <path d="M140 96 a16 16 0 1 1 6 -30 a13 13 0 0 1 24 6 a11 11 0 0 1 -4 24 z" transform="translate(-10 -4)" />
        <path d="M138 122 v8 M132 124 l-5 5 M150 124 l5 5" transform="translate(-10 -4)" />
      </g>
    ),
  },
  // 4 — shopping bags & tags
  {
    w: 185,
    h: 175,
    tile: (id) => (
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M34 70 h34 l4 42 h-42 z" />
        <path d="M43 70 a8 8 0 0 1 16 0" />
        <path d="M120 116 h30 l4 38 h-38 z" />
        <path d="M128 116 a7 7 0 0 1 14 0" />
        <path d="M86 34 l22 -10 8 18 -22 10 z M91 44 l9 -4" />
      </g>
    ),
  },
  // 5 — targets & arrows (growth)
  {
    w: 195,
    h: 185,
    tile: (id) => (
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="44" cy="52" r="20" />
        <circle cx="44" cy="52" r="9" />
        <path d="M150 130 l30 -26 M180 104 l-2 12 M180 104 l-12 2" />
        <path d="M96 24 l6 14 15 2 -11 10 3 15 -13 -8 -13 8 3 -15 -11 -10 15 -2 z" />
      </g>
    ),
  },
  // 6 — delivery van & globe (trade)
  {
    w: 200,
    h: 180,
    tile: (id) => (
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 96 h44 v-22 h-44 z M72 74 h18 l12 22 h-30 z" />
        <circle cx="42" cy="102" r="6" />
        <circle cx="86" cy="102" r="6" />
        <circle cx="150" cy="46" r="18" />
        <path d="M132 46 h36 M150 28 v36" />
        <path d="M150 28 a26 26 0 0 1 0 36 a26 26 0 0 1 0 -36" transform="translate(2 0)" />
      </g>
    ),
  },
];

function DoodleBackdrop({ idx }: { idx: number }) {
  const spec = DOODLES[idx];
  const patternId = `qdoodle-${idx}`;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden text-primary/[0.055] dark:text-primary/[0.07] print:hidden"
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern id={patternId} width={spec.w} height={spec.h} patternUnits="userSpaceOnUse" patternTransform="rotate(-6)">
            {spec.tile(patternId)}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/40" />
    </div>
  );
}
