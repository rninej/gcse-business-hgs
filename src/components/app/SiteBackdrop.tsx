'use client';

// Site-wide decorative backdrop. Every website visit picks ONE random
// nature/business photo. The choice is remembered in sessionStorage, so it
// stays stable while the user navigates but disappears when the tab closes —
// the next visit rolls again. The photo sits behind everything at -z-20,
// below the quiz backdrop (-z-10) — during quizzes the quiz photo paints over
// this layer. Low opacity + blur keep it a calm wash; every reading surface
// (bg-card) is opaque on top of it. If the image fails to load, nothing
// renders (transparent page, as before).

import { useState, useSyncExternalStore } from 'react';

/** The pool: 6 scenes made for the site + a few of the quiz business photos. */
const POOL = [
  ...[1, 2, 3, 4, 5, 6].map((n) => `/site-backdrops/${String(n).padStart(2, '0')}.jpg`),
  '/quiz-backdrops/01.jpg',
  '/quiz-backdrops/03.jpg',
  '/quiz-backdrops/05.jpg',
];

/** sessionStorage key for the chosen index — one backdrop per visit. */
const KEY = 'hgs_site_bg';

/** This visit's pick — computed on first read, then cached so repeated
 *  snapshot reads agree (React requires a stable getSnapshot). */
let cached: string | null = null;

function visitBackdrop(): string {
  if (cached) return cached;
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(KEY);
  } catch {
    stored = null; // storage unavailable — fall through to a fresh roll
  }
  let idx = Number.parseInt(stored ?? '', 10);
  if (!Number.isInteger(idx) || idx < 0 || idx >= POOL.length) {
    idx = Math.floor(Math.random() * POOL.length);
    try {
      sessionStorage.setItem(KEY, String(idx));
    } catch {
      /* can't remember it — this visit still gets its random pick */
    }
  }
  cached = POOL[idx];
  return cached;
}

const noopSubscribe = () => () => {}; // the pick never changes within a visit

export function SiteBackdrop() {
  // Hydration-safe read of a browser-only value: SSR/hydration render the
  // empty snapshot (no <img> in the server HTML), then React re-reads the
  // real snapshot after mount and paints the chosen photo.
  const src = useSyncExternalStore(noopSubscribe, visitBackdrop, () => '');
  const [ok, setOk] = useState(true);

  if (!src || !ok) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {/* the scene — strong enough that frosted-glass surfaces have something
          to refract; blur keeps text perfectly readable and the 42s drift
          (a slow Ken Burns pan) makes the whole site feel alive without
          ever drawing attention to itself. Scale hides the blur edges. */}
      <img
        src={src}
        alt=""
        onError={() => setOk(false)}
        className="h-full w-full object-cover opacity-[0.5] blur-[2px] anim-drift will-change-transform"
      />
      {/* soft wash keeps the whole thing airy and light */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/0 to-background/25" />
    </div>
  );
}
