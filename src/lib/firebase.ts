// Firebase Realtime Database REST client (server-side only).
// Data lives at https://hgs-business-default-rtdb.europe-west1.firebasedatabase.app under /hgs
//
// Includes a small in-process TTL cache for collection reads: the RTDB lives in
// Belgium, so every uncached read costs a full network round-trip. Writes made
// through this module invalidate the affected collections immediately.

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

/* ---------------- in-process cache ---------------- */

const CACHE_TTL_MS = 5000;
const cache = new Map<string, { at: number; data: unknown }>();

function invalidate(name?: string) {
  if (name) cache.delete(name);
  else cache.clear();
}

export const fb = {
  get<T>(path: string): Promise<T | null> {
    return fbFetch<T | null>('GET', path);
  },
  set(path: string, data: unknown): Promise<void> {
    invalidate(path.split('/')[0]);
    return fbFetch<unknown>('PUT', path, data).then(() => undefined);
  },
  /** Shallow-merge into an object without replacing siblings */
  patch(path: string, data: unknown): Promise<void> {
    invalidate(path.split('/')[0]);
    return fbFetch<unknown>('PATCH', path, data).then(() => undefined);
  },
  remove(path: string): Promise<void> {
    invalidate(path.split('/')[0]);
    return fbFetch<unknown>('DELETE', path).then(() => undefined);
  },
};

/** Read an entire collection (object keyed by id) */
export async function col<T>(name: string): Promise<Record<string, T>> {
  const v = await fb.get<Record<string, T>>(name);
  return v ?? {};
}

/**
 * Read a collection through the TTL cache. Hot paths (dashboards, class lists,
 * results) call this repeatedly; 5s of staleness is invisible to users while
 * cutting response times from ~1.5s to ~5ms.
 */
export async function colCached<T>(name: string, ttlMs: number = CACHE_TTL_MS): Promise<Record<string, T>> {
  const hit = cache.get(name);
  const now = Date.now();
  if (hit && now - hit.at < ttlMs) {
    return (hit.data as Record<string, T>) ?? {};
  }
  const v = (await fb.get<Record<string, T>>(name)) ?? {};
  cache.set(name, { at: now, data: v });
  return v;
}

/** Read one item by id */
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
