// Dual-engine data layer (server-side only).
//
// The app used to talk straight to the Firebase Realtime Database (RTDB) REST
// API under /hgs. RTDB bills every byte DOWNLOADED, and even after the
// versioned-TTL-cache + slim-feeds work (see git history) the byte-meter kept
// ticking on every poll. The user provisioned a Firestore database in London
// (europe-west2) — Firestore bills per DOCUMENT READ (50k/day free) and never
// per byte delivered, which structurally removes the download problem.
//
// This module now routes every operation through one of two engines:
//
//   rtdb       the original Realtime Database (always the safe fallback)
//   firestore  the Firestore REST mirror (see ./firestoreRest.ts)
//
// …selected by a tiny flag at meta/databaseMode IN THE RTDB (the fallback
// engine must never depend on the engine it falls back from). The /debug owner
// dashboard flips it; every serverless instance notices within ~15s.
//
// Safety design — "always switchable back":
//   • READS come from the active engine only.
//   • WRITES go to BOTH engines in parallel (RTDB uploads are free; Firestore
//     writes are 20k/day free and this app uses a few hundred a day), awaited
//     together before the response so nothing is dropped by the serverless
//     runtime. Both databases therefore stay byte-identical, and a mode flip
//     is safe at ANY moment, in either direction.
//   • If a Firestore READ fails (outage, rules change), the request silently
//     retries against the RTDB and the failure is counted for the /debug
//     panel — the app keeps working while the owner decides.
//   • The one-time bulk copy lives in ./migrateDb.ts (also wired into /debug).
//
// The versioned TTL cache from the old module is preserved unchanged on top:
// writes bump a ~200-byte stamp in BOTH engines' meta/versions docs, expired
// caches re-check the active engine's stamp (1 tiny read), and unchanged data
// costs one round-trip instead of a re-download.

import { after } from 'next/server';
import {
  FirestoreRestError,
  fsGet,
  fsMergeKnown,
  fsPatch,
  fsProbe,
  fsRemove,
  fsSet,
  getVersionsDoc,
  patchVersionsDoc,
  type ProbeResult,
} from './firestoreRest';

const BASE = (
  process.env.FIREBASE_DB_URL ??
  'https://hgs-business-default-rtdb.europe-west1.firebasedatabase.app'
).replace(/\/+$/, '');
const NS = 'hgs';

export type DbMode = 'rtdb' | 'firestore';

export type { ProbeResult };

/* ---------------- raw RTDB transport ---------------- */

async function rtdbFetch<T>(method: string, path: string, body?: unknown, query?: string): Promise<T> {
  const node = path === '' ? '.json' : `${path}.json`;
  const url = `${BASE}/${NS}/${node}${query ? `?${query}` : ''}`;
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

/** Raw path-shaped RTDB ops — used by the router, the migration and the
 *  /debug engine switch (which must bypass the router by definition). */
export const rtdb = {
  get<T>(path: string): Promise<T | null> {
    return rtdbFetch<T | null>('GET', path);
  },
  async set(path: string, data: unknown): Promise<void> {
    await rtdbFetch<unknown>('PUT', path, data);
  },
  async patch(path: string, data: unknown): Promise<void> {
    await rtdbFetch<unknown>('PATCH', path, data);
  },
  async remove(path: string): Promise<void> {
    await rtdbFetch<unknown>('DELETE', path);
  },
};

/** Top-level keys of an RTDB node without downloading the payloads. */
export async function rtdbShallowKeys(path = ''): Promise<string[]> {
  const v = await rtdbFetch<Record<string, true> | null>('GET', path, undefined, 'shallow=true');
  return Object.keys(v ?? {});
}

/* ---------------- deferred work (post-response) ---------------- */

/** Run a job AFTER the response is sent (Vercel keeps the instance alive via
 *  waitUntil). Used to take slow-but-safe follow-ups — version bumps, slim
 *  feed mirrors, AI feedback — off the user-facing critical path: buttons
 *  feel instant while the data still lands moments later. Falls back to a
 *  floating promise outside a request context (scripts, background jobs). */
export function runAfter(job: () => Promise<unknown>): void {
  const safe = () => Promise.resolve(job()).catch(() => undefined);
  try {
    after(safe);
  } catch {
    void safe();
  }
}

/* ---------------- engine mode (flag lives in the RTDB, always) ---------------- */

let modeState: { at: number; mode: DbMode } | null = null;
let modeInflight: Promise<DbMode> | null = null;
const MODE_TTL_MS = 15_000;

export async function getMode(): Promise<DbMode> {
  if (modeState && Date.now() - modeState.at < MODE_TTL_MS) return modeState.mode;
  if (modeInflight) return modeInflight;
  modeInflight = (async () => {
    let mode: DbMode = 'rtdb';
    try {
      const v = await rtdbFetch<unknown>('GET', 'meta/databaseMode');
      if (v === 'firestore') mode = 'firestore';
    } catch {
      /* flag unreachable — stay on the original engine */
    }
    if (modeState && modeState.mode !== mode) hardReset(); // engine flipped under us
    modeState = { at: Date.now(), mode };
    return mode;
  })();
  try {
    return await modeInflight;
  } finally {
    modeInflight = null;
  }
}

/** Flip the engine (owner-only, called by /api/owner/database). */
export async function setMode(mode: DbMode): Promise<void> {
  if (mode !== 'rtdb' && mode !== 'firestore') throw new Error('unknown engine');
  await rtdbFetch<unknown>('PUT', 'meta/databaseMode', mode);
  modeState = { at: Date.now(), mode };
  hardReset();
}

/* ---------------- health counters (surfaced in /debug) ---------------- */

export interface DbEvent {
  at: number;
  path: string;
  op: string;
  message: string;
}

let dualWriteErrors = 0;
let lastDualWriteError: DbEvent | null = null;
let readFallbacks = 0;
let lastReadFallback: DbEvent | null = null;

export function dbHealth(): {
  dualWriteErrors: number;
  lastDualWriteError: DbEvent | null;
  fsReadFallbacks: number;
  lastFsReadFallback: DbEvent | null;
} {
  return { dualWriteErrors, lastDualWriteError, fsReadFallbacks: readFallbacks, lastFsReadFallback: lastReadFallback };
}

/** Called by the migrate endpoint after a full re-copy: sync issues from
 *  before the copy are ancient history. */
export function resetDbHealth(): void {
  dualWriteErrors = 0;
  lastDualWriteError = null;
  readFallbacks = 0;
  lastReadFallback = null;
}

function noteReadFallback(path: string, e: unknown): void {
  readFallbacks++;
  lastReadFallback = { at: Date.now(), path, op: 'read', message: (e as Error).message.slice(0, 300) };
}

/* ---------------- version channel (both engines, always) ---------------- */

/** Unique per bump — never reuses a value, so two writes inside the same
 *  millisecond can never cancel each other out for a reader. */
function newStamp(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

let versionCache: { at: number; map: Record<string, string> } | null = null;
const versionInflight = new Map<DbMode, Promise<Record<string, string> | null>>();

/** Bursts (a dashboard revalidating four collections at once) share a single
 *  version fetch; the window is tiny so our own writes are visible fast. */
const VERSION_MICRO_MS = 250;

async function readVersionMap(mode: DbMode): Promise<Record<string, string> | null> {
  const now = Date.now();
  if (versionCache && now - versionCache.at < VERSION_MICRO_MS) return versionCache.map;
  let p = versionInflight.get(mode);
  if (!p) {
    p = (async () => {
      try {
        const map = mode === 'firestore' ? await getVersionsDoc() : await rtdb.get<Record<string, string>>('meta/versions');
        versionCache = { at: Date.now(), map: map ?? {} };
        return map;
      } catch {
        return null; // channel unreachable → callers fall back to re-downloading
      } finally {
        versionInflight.delete(mode);
      }
    })();
    versionInflight.set(mode, p);
  }
  return p;
}

/** Bump a collection's stamp in BOTH engines so either engine's caches stay
 *  correct — a mode flip must never serve stale data. Never throws: the data
 *  write already succeeded; worst case readers re-download once. */
async function bumpVersion(segment: string): Promise<void> {
  const stamp = newStamp();
  const mode = await getMode();
  const patch = { [segment]: stamp };
  const [primary, secondary] = await Promise.allSettled([
    mode === 'firestore' ? patchVersionsDoc(patch) : rtdb.patch('meta/versions', patch),
    mode === 'firestore' ? rtdb.patch('meta/versions', patch) : patchVersionsDoc(patch),
  ]);
  if (primary.status === 'rejected' && secondary.status === 'rejected') {
    if (versionCache) versionCache = { at: 0, map: { ...versionCache.map, [segment]: stamp } };
    return; // both engines keep the pre-bump stamp: readers just re-check sooner
  }
  // optimistically refresh the local map so this instance sees its own bump
  if (versionCache) {
    versionCache = { at: 0, map: { ...versionCache.map, [segment]: stamp } };
  }
}

/* ---------------- in-process cache (keyed by engine) ---------------- */

/** Slow-changing reference data keeps longer TTLs; hot quiz data re-checks
 *  sooner. With the version channel these are only "how often do we spend
 *  one tiny read confirming nothing changed", not "how stale can data get" —
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
    if (key === name || key.startsWith(`${name}/`) || key.endsWith(`:${name}`) || key.includes(`:${name}/`)) {
      cache.delete(key);
    }
  }
}

function hardReset(): void {
  cache.clear();
  inflight.clear();
  versionCache = null;
}

/* ---------------- routed reads (Firestore failure → RTDB fallback) ---------------- */

async function backendGet<T>(path: string): Promise<T | null> {
  const mode = await getMode();
  const other: DbMode = mode === 'firestore' ? 'rtdb' : 'firestore';
  try {
    return (mode === 'firestore' ? await fsGet(path) : await rtdb.get(path)) as T | null;
  } catch (e) {
    noteReadFallback(path, e);
    return (other === 'firestore' ? await fsGet(path) : await rtdb.get<T>(path)) as T | null;
  }
}

/** Read a whole collection OR a feed sub-path (`attemptLite/{uid}`) — the RTDB
 *  path router inside firestoreRest handles both shapes. */
async function backendCol<T>(name: string): Promise<Record<string, T> | null> {
  const mode = await getMode();
  const other: DbMode = mode === 'firestore' ? 'rtdb' : 'firestore';
  try {
    return (mode === 'firestore' ? await fsGet(name) : await rtdb.get(name)) as Record<string, T> | null;
  } catch (e) {
    noteReadFallback(name, e);
    return (other === 'firestore' ? await fsGet(name) : await rtdb.get(name)) as Record<string, T> | null;
  }
}

/* ---------------- dual writes (both engines, parallel, awaited) ---------------- */

type WriteOp = 'set' | 'patch' | 'remove';

async function runOp(engine: DbMode, op: WriteOp, path: string, data: unknown): Promise<void> {
  if (engine === 'firestore') {
    if (op === 'set') return fsSet(path, data);
    if (op === 'patch') return fsPatch(path, data as object);
    return fsRemove(path);
  }
  if (op === 'set') return rtdb.set(path, data);
  if (op === 'patch') return rtdb.patch(path, data);
  return rtdb.remove(path);
}

async function dualWrite(op: WriteOp, path: string, data?: unknown): Promise<void> {
  const mode = await getMode();
  const other: DbMode = mode === 'firestore' ? 'rtdb' : 'firestore';
  const [primary, secondary] = await Promise.allSettled([
    runOp(mode, op, path, data),
    runOp(other, op, path, data),
  ]);

  if (primary.status === 'rejected' && secondary.status === 'fulfilled') {
    // The ACTIVE engine missed the write but the mirror caught it: the user's
    // action succeeded (reads fall back the same way), and the miss is
    // counted here — re-running the bulk copy from /debug re-syncs both.
    dualWriteErrors++;
    lastDualWriteError = {
      at: Date.now(),
      path,
      op: `${op} — active engine missed it, mirror served it`,
      message: String((primary.reason as Error)?.message ?? primary.reason).slice(0, 300),
    };
    return;
  }
  if (primary.status === 'rejected') throw primary.reason; // both engines failed
  if (secondary.status === 'rejected') {
    // Active engine is fine; the mirror missed one write. Counted in /debug —
    // re-running the bulk copy from the dashboard re-syncs both engines.
    dualWriteErrors++;
    lastDualWriteError = {
      at: Date.now(),
      path,
      op,
      message: String((secondary.reason as Error)?.message ?? secondary.reason).slice(0, 300),
    };
  }
}

/* ---------------- public surface (unchanged shapes) ---------------- */

function segOf(path: string): string {
  return path.split('/')[0];
}

export const fb = {
  /** Read any RTDB-shaped path from the ACTIVE engine (with automatic
   *  RTDB fallback if the Firestore read fails). */
  get<T>(path: string): Promise<T | null> {
    return backendGet<T>(path);
  },
  /** Full replace at a path — written to BOTH engines. With `{ bg: true }`
   *  the version bump continues after the response: the write itself is
   *  durable in both engines, only other instances' cache refresh waits a
   *  beat (this instance's cache is already invalidated synchronously). */
  async set(path: string, data: unknown, opts?: { bg?: boolean }): Promise<void> {
    invalidate(segOf(path));
    await dualWrite('set', path, data);
    if (opts?.bg) runAfter(() => bumpVersion(segOf(path)));
    else await bumpVersion(segOf(path));
  },
  /** Shallow-merge into an object without replacing siblings — BOTH engines. */
  async patch(path: string, data: unknown, opts?: { bg?: boolean }): Promise<void> {
    invalidate(segOf(path));
    await dualWrite('patch', path, data);
    if (opts?.bg) runAfter(() => bumpVersion(segOf(path)));
    else await bumpVersion(segOf(path));
  },
  /** Delete a node — BOTH engines. */
  async remove(path: string, opts?: { bg?: boolean }): Promise<void> {
    invalidate(segOf(path));
    await dualWrite('remove', path);
    if (opts?.bg) runAfter(() => bumpVersion(segOf(path)));
    else await bumpVersion(segOf(path));
  },
};

/** Read an entire collection (object keyed by id) — always a fresh read.
 *  Cold paths only; hot paths should use colCached (or a slim feed). */
export async function col<T>(name: string): Promise<Record<string, T>> {
  const v = await backendCol<T>(name);
  return v ?? {};
}

/**
 * Read a collection (or a nested feed path like `attemptLite/{studentId}`)
 * through the versioned TTL cache. On expiry the active engine's version
 * stamp is re-checked first (one tiny read): unchanged data costs one
 * round-trip, changed data is re-downloaded once (concurrent readers share
 * the request).
 */
export async function colCached<T>(name: string, ttlMs?: number): Promise<Record<string, T>> {
  const mode = await getMode();
  const seg = name.split('/')[0];
  const ttl = ttlMs ?? COLLECTION_TTL_MS[seg] ?? DEFAULT_TTL_MS;
  const key = `${mode}:${name}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.at < ttl) {
    return (hit.data as Record<string, T>) ?? {};
  }

  // capture the stamp BEFORE any download (see CacheEntry.ver note)
  const map = await readVersionMap(mode);
  const stampBefore = map?.[seg] ?? null;

  if (hit && map && stampBefore !== null && hit.ver === stampBefore) {
    hit.at = now; // nothing changed since we cached it — free freshness extension
    return (hit.data as Record<string, T>) ?? {};
  }

  let p = inflight.get(key);
  if (!p) {
    p = (async () => {
      const other: DbMode = mode === 'firestore' ? 'rtdb' : 'firestore';
      let v: Record<string, T> | null = null;
      try {
        v = (mode === 'firestore' ? await fsGet(name) : await rtdb.get(name)) as Record<string, T> | null;
      } catch (e) {
        noteReadFallback(name, e);
        v = (other === 'firestore' ? await fsGet(name) : await rtdb.get<Record<string, T>>(name)) as Record<string, T> | null;
      }
      const data = v ?? {};
      cache.set(key, { at: Date.now(), data, ver: stampBefore });
      return data;
    })();
    inflight.set(key, p);
    p.finally(() => inflight.delete(key)).catch(() => undefined);
  }
  return (await p) as Record<string, T>;
}

/** Read one item by id (fresh — detail views want the latest). */
export async function item<T>(name: string, id: string): Promise<T | null> {
  return backendGet<T>(`${name}/${id}`);
}

/** Write one item (full replace of that key) */
export async function put<T>(name: string, id: string, data: T, opts?: { bg?: boolean }): Promise<void> {
  return fb.set(`${name}/${id}`, data, opts);
}

/** Merge fields into an existing item */
export async function merge(name: string, id: string, partial: object, opts?: { bg?: boolean }): Promise<void> {
  return fb.patch(`${name}/${id}`, partial, opts);
}

/** HOT-PATH merge for routes that already hold a fresh copy of the record
 *  (they read it at the start of the same request). The ACTIVE engine gets a
 *  single-request write built from that known base — no read-modify-write
 *  re-read — while the mirror engine still receives the same RTDB-shaped
 *  patch (its native PATCH expands deep keys). The version bump continues
 *  after the response. Cuts an answer-check from ~3 sequential round trips
 *  to one read + one write. */
export async function mergeKnown(
  name: string,
  id: string,
  base: unknown,
  partial: object
): Promise<void> {
  invalidate(`${name}/${id}`);
  const mode = await getMode();
  const other: DbMode = mode === 'firestore' ? 'rtdb' : 'firestore';
  const [primary, secondary] = await Promise.allSettled([
    mode === 'firestore'
      ? fsMergeKnown(name, id, base, partial)
      : rtdb.patch(`${name}/${id}`, partial),
    other === 'firestore'
      ? fsMergeKnown(name, id, base, partial)
      : rtdb.patch(`${name}/${id}`, partial),
  ]);
  if (primary.status === 'rejected' && secondary.status === 'fulfilled') {
    dualWriteErrors++;
    lastDualWriteError = {
      at: Date.now(),
      path: `${name}/${id}`,
      op: 'patch(known) — active engine missed it, mirror served it',
      message: String((primary.reason as Error)?.message ?? primary.reason).slice(0, 300),
    };
    runAfter(() => bumpVersion(name));
    return;
  }
  if (primary.status === 'rejected') throw primary.reason; // both engines failed
  if (secondary.status === 'rejected') {
    dualWriteErrors++;
    lastDualWriteError = {
      at: Date.now(),
      path: `${name}/${id}`,
      op: 'patch(known)',
      message: String((secondary.reason as Error)?.message ?? secondary.reason).slice(0, 300),
    };
  }
  runAfter(() => bumpVersion(name));
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

/** Connectivity probe for the Firestore engine (used by /debug). */
export function probeFirestore(): Promise<ProbeResult> {
  return fsProbe();
}

export { FirestoreRestError };
