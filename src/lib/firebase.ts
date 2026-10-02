// Firebase Realtime Database REST client (server-side only).
// Data lives at https://hgs-business-default-rtdb.europe-west1.firebasedatabase.app under /hgs
//
// Bandwidth model: RTDB bills every byte downloaded, and this app's fat
// collections (attempts ≈ 16KB per record) were re-downloaded whole on every
// 5s TTL expiry — polls and dashboards burned hundreds of MB a month for a
// handful of users. Two layers fix that:
//
//   1. Version channel — every write bumps a tiny stamp under meta/versions
//      (~200 bytes for ALL collections). When a cached read's TTL expires we
//      re-check that stamp first: unchanged data extends the cache for another
//      TTL cycle at the cost of one tiny round-trip instead of a full
//      collection download. Works across serverless instances because the
//      stamps live in Firebase itself.
//   2. Slim feeds (attemptLite / notifFeed / wrongPool, maintained by the
//      write paths) mean even genuine re-downloads move a few KB, not the
//      whole 700KB attempts collection — see src/lib/attemptLite.ts.
//
// Writes made through this module invalidate the affected collections
// immediately and bump their version stamp.

const BASE = (
  process.env.FIREBASE_DB_URL ??
  'https://hgs-business-default-rtdb.europe-west1.firebasedatabase.app'
).replace(/\/+$/, '');
const NS = 'hgs';

async function fbFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE}/${NS}/${path}.json`;
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`firebase ${method} ${path} -> ${res.status} ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/* ---------------- version channel ---------------- */

/** Unique per bump — never reuses a value, so two writes inside the same
 *  millisecond can never cancel each other out for a reader. */
function newStamp(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

let versionCache: { at: number; map: Record<string, string> } | null = null;
let versionInflight: Promise<Record<string, string> | null> | null = null;

/** Bursts (a dashboard revalidating four collections at once) share a single
 *  version fetch; the window is tiny so our own writes are visible fast. */
const VERSION_MICRO_MS = 250;

async function bumpVersion(segment: string): Promise<void> {
  const stamp = newStamp();
  try {
    await fbFetch<unknown>('PATCH', 'meta/versions', { [segment]: stamp });
    // optimistically refresh the local map so this instance sees its own bump
    if (versionCache) {
      versionCache = { at: 0, map: { ...versionCache.map, [segment]: stamp } };
    }
  } catch {
    /* the data write itself succeeded; worst case readers re-download once */
  }
}

/** Fresh-ish snapshot of every collection's version stamp. Returns null when
 *  the channel is unreachable — callers then fall back to re-downloading. */
async function getVersionMap(): Promise<Record<string, string> | null> {
  const now = Date.now();
  if (versionCache && now - versionCache.at < VERSION_MICRO_MS) return versionCache.map;
  if (versionInflight) return versionInflight;
  versionInflight = (async () => {
    try {
      const map = (await fbFetch<Record<string, string>>('GET', 'meta/versions')) ?? {};
      versionCache = { at: Date.now(), map };
      return map;
    } catch {
      return null;
    } finally {
      versionInflight = null;
    }
  })();
  return versionInflight;
}

/* ---------------- in-process cache ---------------- */

/** Slow-changing reference data keeps longer TTLs; hot quiz data re-checks
 *  sooner. With the version channel these are only "how often do we spend
 *  ~200 bytes confirming nothing changed", not "how stale can data get" —
 *  any write anywhere bumps the stamp and forces a true refresh. */
const COLLECTION_TTL_MS: Record<string, number> = {
  teachers: 60_000,
  classes: 60_000,
  students: 60_000,
  avatars: 120_000,
  assignments: 30_000,
  notifications: 30_000,
  notifFeed: 30_000,
  wrongPool: 30_000,
  attempts: 20_000,
  attemptLite: 20_000,
};
const DEFAULT_TTL_MS = 20_000;

interface CacheEntry {
  at: number;
  data: unknown;
  /** version stamp captured BEFORE the download — a stamp newer than the data
   *  would be unsafe (we'd skip a needed refresh); older is merely redundant. */
  ver: string | null;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function invalidate(name?: string) {
  if (!name) {
    cache.clear();
    versionCache = null;
    return;
  }
  for (const key of [...cache.keys()]) {
    if (key === name || key.startsWith(`${name}/`)) cache.delete(key);
  }
}

export const fb = {
  get<T>(path: string): Promise<T | null> {
    return fbFetch<T | null>('GET', path);
  },
  async set(path: string, data: unknown): Promise<void> {
    const seg = path.split('/')[0];
    invalidate(seg);
    await fbFetch<unknown>('PUT', path, data);
    await bumpVersion(seg);
  },
  /** Shallow-merge into an object without replacing siblings */
  async patch(path: string, data: unknown): Promise<void> {
    const seg = path.split('/')[0];
    invalidate(seg);
    await fbFetch<unknown>('PATCH', path, data);
    await bumpVersion(seg);
  },
  async remove(path: string): Promise<void> {
    const seg = path.split('/')[0];
    invalidate(seg);
    await fbFetch<unknown>('DELETE', path);
    await bumpVersion(seg);
  },
};

/** Read an entire collection (object keyed by id) — always a fresh download.
 *  Cold paths only; hot paths should use colCached (or a slim feed). */
export async function col<T>(name: string): Promise<Record<string, T>> {
  const v = await fb.get<Record<string, T>>(name);
  return v ?? {};
}

/**
 * Read a collection (or a nested feed path like `attemptLite/{studentId}`)
 * through the versioned TTL cache. On expiry the ~200-byte version map is
 * re-checked first: unchanged data costs one tiny round-trip, changed data
 * is re-downloaded once (concurrent readers share the request).
 */
export async function colCached<T>(name: string, ttlMs?: number): Promise<Record<string, T>> {
  const seg = name.split('/')[0];
  const ttl = ttlMs ?? COLLECTION_TTL_MS[seg] ?? DEFAULT_TTL_MS;
  const now = Date.now();
  const hit = cache.get(name);
  if (hit && now - hit.at < ttl) {
    return (hit.data as Record<string, T>) ?? {};
  }

  // capture the stamp BEFORE any download (see CacheEntry.ver note)
  const map = await getVersionMap();
  const stampBefore = map?.[seg] ?? null;

  if (hit && map && stampBefore !== null && hit.ver === stampBefore) {
    hit.at = now; // nothing changed since we cached it — free freshness extension
    return (hit.data as Record<string, T>) ?? {};
  }

  let p = inflight.get(name);
  if (!p) {
    p = (async () => {
      const v = (await fbFetch<Record<string, T> | null>('GET', name)) ?? {};
      cache.set(name, { at: Date.now(), data: v, ver: stampBefore });
      return v;
    })();
    inflight.set(name, p);
    p.finally(() => inflight.delete(name)).catch(() => undefined);
  }
  return (await p) as Record<string, T>;
}

/** Read one item by id (fresh — detail views want the latest). */
export async function item<T>(name: string, id: string): Promise<T | null> {
  const v = await fb.get<T>(`${name}/${id}`);
  return v ?? null;
}

/** Write one item (full replace of that key) */
export async function put<T>(name: string, id: string, data: T): Promise<void> {
  return fb.set(`${name}/${id}`, data);
}

/** Merge fields into an existing item */
export async function merge(name: string, id: string, partial: object): Promise<void> {
  return fb.patch(`${name}/${id}`, partial);
}

export function del(name: string, id: string): Promise<void> {
  return fb.remove(`${name}/${id}`);
}

/** Query helper: filter a collection object */
export function values<T>(obj: Record<string, T>): T[] {
  return Object.values(obj ?? {});
}

/** Flatten a two-level collection ({studentId: {id: record}}) — the shape the
 *  per-student feeds (attemptLite / notifFeed / wrongPool) use at the top. */
export function flatValues<T>(obj: Record<string, Record<string, T>> | null | undefined): T[] {
  return Object.values(obj ?? {}).flatMap((inner) => Object.values(inner ?? {}));
}
