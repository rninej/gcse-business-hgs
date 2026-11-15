import { NextResponse } from 'next/server';
import { fb } from '@/lib/firebase';

/** Public, unauthenticated page-view counter. Stores only a path, a source
 *  label and a day key — no IP, no user agent, no identifiers. The point is to
 *  prove whether a published link produced traffic, not to profile anyone. */

interface Traffic {
  total?: number;
  firstSeenAt?: number;
  daily?: Record<string, number>;
  refs?: Record<string, number>;
  paths?: Record<string, number>;
  last?: { path: string; ref: string; at: number };
}

const tidy = (v: unknown, max = 40): string =>
  typeof v === 'string' ? v.toLowerCase().replace(/[^a-z0-9._/-]/g, '').slice(0, max) : '';

const bump = (map: Record<string, number> | undefined, key: string, cap = 60): Record<string, number> => {
  const next = { ...(map ?? {}) };
  next[key] = (next[key] ?? 0) + 1;
  const keys = Object.keys(next);
  if (keys.length > cap) {
    keys
      .sort((a, b) => next[a] - next[b])
      .slice(0, keys.length - cap)
      .forEach((k) => delete next[k]);
  }
  return next;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { path?: unknown; ref?: unknown };
    const path = tidy(body.path, 80) || '/';
    const ref = tidy(body.ref, 32) || 'direct';
    const day = new Date().toISOString().slice(0, 10);

    const current = (await fb.get<Traffic | null>('meta/traffic')) ?? {};
    const next: Traffic = {
      total: (current.total ?? 0) + 1,
      firstSeenAt: current.firstSeenAt ?? Date.now(),
      daily: bump(current.daily, day),
      refs: bump(current.refs, ref),
      paths: bump(current.paths, path, 40),
      last: { path, ref, at: Date.now() },
    };
    await fb.set('meta/traffic', next);
    return NextResponse.json({ ok: true });
  } catch {
    // A failed beacon must never surface to a visitor.
    return NextResponse.json({ ok: false });
  }
}
