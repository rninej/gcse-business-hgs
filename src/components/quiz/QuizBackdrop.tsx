'use client';

// Backdrop for quiz-taking. Two variants:
//   • NATURE — a soft hand-drawn landscape (rolling hills, trees, leaves,
//     birds) in quiet watercolour tones. MOBILE ONLY and on by default:
//     students asked for a calm nature scene while quizzing on phones, while
//     desktop keeps the minimalist doodle pattern. Toggled from the ⋯ menu
//     in the quiz header (persisted per browser).
//   • DOODLES — the original minimalist business-doodle tiles (SVG pattern,
//     crisp at every resolution). Desktop always; mobile fallback when the
//     nature scene is switched off.
// Both are pure SVG — nothing is downloaded, nothing can be low-resolution.

import { useMemo, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

export const NATURE_KEY = 'hgs.natureBg';

/** read the persisted nature-scene preference (default: on) */
export function naturePref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(NATURE_KEY) !== 'off';
  } catch {
    return true;
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

export function getNatureSnapshot(): boolean {
  return naturePref();
}

export function getNatureServerSnapshot(): boolean {
  return true; // on by default; corrected on the client before first paint
}

/** flip the preference from the ⋯ menu (same tab + others via storage) */
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

export function QuizBackdrop({ attemptId }: { attemptId: string }) {
  const idx = useMemo(() => pick(attemptId, DOODLE_COUNT), [attemptId]);
  const hill = useMemo(() => pick(attemptId, HILL_COUNT), [attemptId]);
  const natureOn = useSyncExternalStore(subscribeNature, getNatureSnapshot, getNatureServerSnapshot);
  return (
    <>
      {/* nature scene: phones only (below md) — desktop keeps the doodles */}
      <div className={cn(natureOn ? 'md:hidden' : 'hidden')}>
        <NatureBackdrop variant={hill} />
      </div>
      {/* doodle tiles: always on desktop; on mobile only when nature is off */}
      <div className={cn(natureOn ? 'hidden md:block' : 'block')}>
        <DoodleBackdrop idx={idx} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* NATURE SCENE — layered hills, trees and drifting clouds            */
/* ------------------------------------------------------------------ */

const HILL_COUNT = 3;

function NatureBackdrop({ variant }: { variant: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
      {/* soft sky wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === 0
              ? 'linear-gradient(to bottom, oklch(0.955 0.035 150 / 0.85), oklch(0.975 0.02 120 / 0.55) 55%, oklch(0.985 0.015 110 / 0.3))'
              : variant === 1
                ? 'linear-gradient(to bottom, oklch(0.96 0.04 170 / 0.8), oklch(0.975 0.025 140 / 0.5) 55%, oklch(0.985 0.015 110 / 0.3))'
                : 'linear-gradient(to bottom, oklch(0.95 0.045 95 / 0.6), oklch(0.975 0.025 130 / 0.5) 50%, oklch(0.985 0.015 110 / 0.3))',
        }}
      />
      {/* drifting clouds */}
      <svg className="absolute inset-x-0 top-[6%] w-full text-primary/[0.10]" viewBox="0 0 400 90" fill="none" preserveAspectRatio="xMidYMin slice">
        <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M40 40 a14 14 0 0 1 26-6 a12 12 0 0 1 22 4 a10 10 0 0 1-6 16 H52 a12 12 0 0 1-12-14 z" fill="currentColor" fillOpacity="0.55" />
          <path d="M250 22 a11 11 0 0 1 20-5 a9 9 0 0 1 17 3 a8 8 0 0 1-5 12 h-22 a9 9 0 0 1-10-10 z" fill="currentColor" fillOpacity="0.5" />
        </g>
      </svg>
      {/* scattered leaves + birds */}
      <svg className="absolute inset-0 h-full w-full text-primary/[0.12]" viewBox="0 0 300 500" fill="none" preserveAspectRatio="xMidYMid slice">
        <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 120 q10 -16 26 -12 q-2 18 -20 20 q-4 -4 -6 -8 z" />
          <path d="M70 128 q8 -6 14 -14" />
          <path d="M240 200 q-8 -14 -24 -12 q0 16 16 20 q5 -4 8 -8 z" />
          <path d="M232 206 q-6 -5 -12 -12" />
          <path d="M110 300 q9 -13 22 -11 q-2 15 -17 18 q-3 -3 -5 -7 z" />
          <path d="M180 90 q-7 -12 -20 -10 q0 13 13 16 q4 -3 7 -6 z" />
          {/* distant birds */}
          <path d="M150 70 q5 -6 10 0 q5 -6 10 0" />
          <path d="M200 110 q4 -5 8 0 q4 -5 8 0" />
          <path d="M90 220 q4 -5 8 0 q4 -5 8 0" />
        </g>
      </svg>
      {/* rolling hills at the bottom — three layers, hand-drawn wobble */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 400 260"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* far hill */}
        <path
          d={variant === 1 ? 'M0 150 q60 -36 130 -14 q80 26 150 -10 q60 -28 120 4 V260 H0 z' : 'M0 160 q70 -44 150 -16 q70 24 130 -16 q60 -30 120 6 V260 H0 z'}
          fill="oklch(0.72 0.09 155 / 0.20)"
        />
        {/* mid hill */}
        <path
          d={variant === 2 ? 'M0 190 q50 -30 120 -10 q90 26 170 -18 q60 -26 110 8 V260 H0 z' : 'M0 185 q80 -38 160 -12 q70 22 140 -18 q60 -22 100 10 V260 H0 z'}
          fill="oklch(0.62 0.11 158 / 0.24)"
        />
        {/* near hill with a little tree line */}
        <path
          d={variant === 0 ? 'M0 225 q70 -26 150 -8 q100 22 160 -16 q50 -20 90 8 V260 H0 z' : 'M0 220 q60 -22 130 -6 q110 26 180 -20 q50 -16 90 10 V260 H0 z'}
          fill="oklch(0.52 0.12 160 / 0.30)"
        />
        {/* tiny trees on the near hill */}
        <g stroke="oklch(0.45 0.11 158 / 0.35)" strokeWidth="2.4" strokeLinecap="round">
          <path d="M70 226 v-14 M70 212 l-7 -8 M70 214 l7 -9 M70 218 l-9 -5" />
          <path d="M310 230 v-12 M310 218 l-6 -7 M310 220 l6 -8" />
          <path d="M210 236 v-10 M210 226 l-5 -6 M210 228 l5 -7" />
        </g>
      </svg>
      {/* gentle warm light from the top */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/30" />
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
