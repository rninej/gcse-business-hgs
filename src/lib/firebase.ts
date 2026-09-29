// Firebase Realtime Database REST client (server-side only).
// Data lives at https://hgs-business-default-rtdb.europe-west1.firebasedatabase.app under /hgs

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

export const fb = {
  get<T>(path: string): Promise<T | null> {
    return fbFetch<T | null>('GET', path);
  },
  set(path: string, data: unknown): Promise<void> {
    return fbFetch<unknown>('PUT', path, data).then(() => undefined);
  },
  /** Shallow-merge into an object without replacing siblings */
  patch(path: string, data: unknown): Promise<void> {
    return fbFetch<unknown>('PATCH', path, data).then(() => undefined);
  },
  remove(path: string): Promise<void> {
    return fbFetch<unknown>('DELETE', path).then(() => undefined);
  },
};

/** Read an entire collection (object keyed by id) */
export async function col<T>(name: string): Promise<Record<string, T>> {
  const v = await fb.get<Record<string, T>>(name);
  return v ?? {};
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
