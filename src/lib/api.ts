'use client';

// Typed-ish client fetch helpers. Throws Error(message) on API errors.
// GETs are memoised for a short window and any successful mutation clears the
// memo, so clicking around the app feels instant while data stays correct.
//
// Every request also ticks a global in-flight counter — the slim progress bar
// at the top of the app subscribes to it, so ANY button that kicks off a
// request shows visible activity the instant it is pressed.

const GET_TTL_MS = 10_000;
const memo = new Map<string, { at: number; data: unknown }>();

function bust() {
  memo.clear();
}

/* ---------------- global in-flight tracker ---------------- */

let pending = 0;
const busyListeners = new Set<() => void>();

/** The progress-bar visibility lives in THIS module (an external store), not
 *  in component state: it shows the instant a request starts and lingers
 *  ~350ms after the last one settles so quick bursts never flicker. */
let barVisible = false;
let barHideTimer: ReturnType<typeof setTimeout> | null = null;

function notifyBusy(): void {
  busyListeners.forEach((l) => l());
}

function updateBar(): void {
  if (pending > 0) {
    if (barHideTimer) {
      clearTimeout(barHideTimer);
      barHideTimer = null;
    }
    if (!barVisible) {
      barVisible = true;
      notifyBusy();
    }
  } else if (barVisible && !barHideTimer) {
    barHideTimer = setTimeout(() => {
      barHideTimer = null;
      if (pending === 0) {
        barVisible = false;
        notifyBusy();
      }
    }, 350);
  }
}

/** Subscribe to progress-bar visibility changes. */
export function subscribeApiBusy(cb: () => void): () => void {
  busyListeners.add(cb);
  return () => busyListeners.delete(cb);
}

/** Is the progress bar currently visible? (client snapshot) */
export function apiBarVisible(): boolean {
  return barVisible;
}

function beginRequest(): void {
  pending += 1;
  updateBar();
}

function endRequest(): void {
  pending = Math.max(0, pending - 1);
  updateBar();
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  beginRequest();
  try {
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
  } finally {
    endRequest();
  }
}

async function getAndMemo<T>(path: string, fresh: boolean): Promise<T> {
  if (!fresh) {
    const hit = memo.get(path);
    const now = Date.now();
    if (hit && now - hit.at < GET_TTL_MS) {
      return Promise.resolve(hit.data as T);
    }
  }
  return request<T>('GET', path).then((data) => {
    memo.set(path, { at: Date.now(), data });
    return data;
  });
}

export const api = {
  get: <T>(path: string): Promise<T> => getAndMemo<T>(path, false),
  /** GET that skips the short memo — for polls that must see brand-new data
   *  (result-screen written-marking / AI-feedback upgrades). */
  getFresh: <T>(path: string): Promise<T> => getAndMemo<T>(path, true),
  post: <T>(path: string, body?: unknown): Promise<T> => {
    bust();
    return request<T>('POST', path, body ?? {});
  },
  put: <T>(path: string, body?: unknown): Promise<T> => {
    bust();
    return request<T>('PUT', path, body ?? {});
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
