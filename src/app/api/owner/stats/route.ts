import { NextResponse } from 'next/server';
import { colCached, fb } from '@/lib/firebase';
import { isOwnerUnlocked } from '@/lib/session';
import { planOf } from '@/lib/plan';
import type { Teacher } from '@/lib/types';

/** Owner-only readout: what traffic arrived, from where, and which trials it
 *  produced. This is the evidence a published listing either worked or did not. */

interface Traffic {
  total?: number;
  firstSeenAt?: number;
  daily?: Record<string, number>;
  refs?: Record<string, number>;
  paths?: Record<string, number>;
  last?: { path: string; ref: string; at: number };
}

export async function GET() {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const [traffic, teachers] = await Promise.all([
    fb.get<Traffic | null>('meta/traffic'),
    colCached<Teacher>('teachers'),
  ]);
  const t = traffic ?? {};
  const today = new Date().toISOString().slice(0, 10);

  const signups = Object.values(teachers)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((x) => ({
      email: x.email,
      createdAt: x.createdAt,
      at: new Date(x.createdAt).toISOString(),
      ref: x.signupRef ?? null,
      referrer: x.signupReferrer ?? null,
      plan: planOf(x),
      trialEndsAt: x.trialEndsAt ?? null,
    }));

  const byRef = signups.reduce<Record<string, number>>((acc, s) => {
    const k = s.ref || 'unknown';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    visits: {
      total: t.total ?? 0,
      today: t.daily?.[today] ?? 0,
      firstSeenAt: t.firstSeenAt ?? null,
      byRef: t.refs ?? {},
      byPath: t.paths ?? {},
      last: t.last ?? null,
      daily: t.daily ?? {},
    },
    signups: {
      total: signups.length,
      byRef,
      recent: signups.slice(0, 15),
    },
  });
}
