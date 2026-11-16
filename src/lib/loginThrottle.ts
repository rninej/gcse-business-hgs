// Failed-login throttle.
//
// Serverless instances do not share memory, so this is a speed bump rather than
// a wall: a script that lands on a warm instance is slowed to ten tries per ten
// minutes, and every new instance starts empty. That is still the difference
// between grinding a classmate's password in a minute and not being able to
// grind it at all, and it is deliberately per-identifier: a whole class behind
// one school NAT address must never be able to lock itself out.
//
// The key is the account (role + email/username), never the caller's address: a
// whole class shares one school NAT address, and one pupil fat-fingering their
// password must not lock the other twenty-nine out. Limiting the account is what
// actually blocks grinding a classmate's password.

const WINDOW_MS = 10 * 60 * 1000;
const BLOCK_MS = 10 * 60 * 1000;
const MAX_FAILS = 10;
const MAX_KEYS = 5000; // a full table is cleared rather than grown without bound

interface Entry {
  count: number;
  first: number;
  blockedUntil: number;
}

const failures = new Map<string, Entry>();

function prune(now: number) {
  if (failures.size < MAX_KEYS) return;
  for (const [key, entry] of failures) {
    if (entry.blockedUntil <= now && now - entry.first > WINDOW_MS) failures.delete(key);
  }
  if (failures.size >= MAX_KEYS) failures.clear();
}

/** Seconds the caller must wait, or 0 when they may try now. */
export function retryAfterSeconds(key: string): number {
  const entry = failures.get(key);
  if (!entry) return 0;
  const now = Date.now();
  if (entry.blockedUntil > now) return Math.ceil((entry.blockedUntil - now) / 1000);
  if (now - entry.first > WINDOW_MS) failures.delete(key);
  return 0;
}

export function noteFailure(key: string): void {
  const now = Date.now();
  prune(now);
  const entry = failures.get(key);
  // Only a brand-new key or a key whose window has passed starts over. (An
  // earlier version also reset whenever blockedUntil was in the past, which is
  // always true for an un-blocked entry — so the counter never reached the
  // threshold. The test below is the reason that check exists.)
  if (!entry || now - entry.first > WINDOW_MS) {
    failures.set(key, { count: 1, first: now, blockedUntil: 0 });
    return;
  }
  entry.count += 1;
  if (entry.count >= MAX_FAILS) entry.blockedUntil = now + BLOCK_MS;
}

export function clearFailures(key: string): void {
  failures.delete(key);
}

/** The throttle key for one attempt: the account being tried. */
export function loginKeys(role: string, identifier: string): string[] {
  return [`id:${role}:${identifier}`];
}
