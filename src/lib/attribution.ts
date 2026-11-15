'use client';

// First-touch attribution. A visitor who lands on ?ref=tes keeps that source
// for 60 days and it is written onto the teacher record at signup, so a trial
// can be traced back to the channel that produced it.

export const REF_KEY = 'hgs.ref';
const TTL_MS = 60 * 24 * 60 * 60 * 1000;

interface RefRecord {
  ref: string;
  at: number;
}

function tidy(value: string | null | undefined, max = 32): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, max);
}

function read(): RefRecord | null {
  try {
    const raw = localStorage.getItem(REF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RefRecord;
    if (!parsed?.ref || !parsed?.at) return null;
    if (Date.now() - parsed.at > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Call once on load. Query string wins, then a stored value, then the
 *  referring host, then "direct". */
export function captureFirstTouch(): string {
  let ref = 'direct';
  try {
    const fromQuery = tidy(new URLSearchParams(window.location.search).get('ref'));
    const stored = read();
    if (fromQuery) {
      ref = fromQuery;
      localStorage.setItem(REF_KEY, JSON.stringify({ ref, at: Date.now() }));
      return ref;
    }
    if (stored) return stored.ref;
    const referrer = document.referrer;
    if (referrer) {
      try {
        ref = tidy(new URL(referrer).hostname.replace(/^www\./, ''));
      } catch {
        ref = 'referral';
      }
    }
    localStorage.setItem(REF_KEY, JSON.stringify({ ref, at: Date.now() }));
  } catch {
    /* private mode — attribution is best effort, never a blocker */
  }
  return ref;
}

/** The stored source, for the signup payload. */
export function currentRef(): string | null {
  const stored = read();
  if (stored) return stored.ref;
  try {
    const fromQuery = tidy(new URLSearchParams(window.location.search).get('ref'));
    return fromQuery || null;
  } catch {
    return null;
  }
}
