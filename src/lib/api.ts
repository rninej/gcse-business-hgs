'use client';

// Typed-ish client fetch helpers. Throws Error(message) on API errors.
// GETs are memoised for a short window and any successful mutation clears the
// memo, so clicking around the app feels instant while data stays correct.

const GET_TTL_MS = 10_000;
const memo = new Map<string, { at: number; data: unknown }>();

function bust() {
  memo.clear();
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string): Promise<T> => {
    const hit = memo.get(path);
    const now = Date.now();
    if (hit && now - hit.at < GET_TTL_MS) {
      return Promise.resolve(hit.data as T);
    }
    return request<T>('GET', path).then((data) => {
      memo.set(path, { at: Date.now(), data });
      return data;
    });
  },
  post: <T>(path: string, body?: unknown): Promise<T> => {
    bust();
    return request<T>('POST', path, body ?? {});
  },
  patch: <T>(path: string, body?: unknown): Promise<T> => {
    bust();
    return request<T>('PATCH', path, body ?? {});
  },
  del: <T>(path: string): Promise<T> => {
    bust();
    return request<T>('DELETE', path);
  },
};
