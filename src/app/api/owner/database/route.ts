import { NextResponse } from 'next/server';
import {
  dbHealth,
  fb,
  getMode,
  probeFirestore,
  rtdbShallowKeys,
  setMode,
  type DbEvent,
} from '@/lib/firebase';
import { fsList, getVersionsDoc } from '@/lib/firestoreRest';
import { isOwnerUnlocked } from '@/lib/session';
import type { CopyReport } from '@/lib/migrateDb';

/** /debug database-engine control room — GET status / PUT switch engine.
 *  Owner-gated like the rest of the dashboard. */

interface Status {
  mode: 'rtdb' | 'firestore';
  probe: { ok: boolean; ms: number; error?: string; status?: number };
  health: {
    dualWriteErrors: number;
    lastDualWriteError: DbEvent | null;
    fsReadFallbacks: number;
    lastFsReadFallback: DbEvent | null;
  };
  migration: CopyReport | null;
  counts: { rtdb: Record<string, number>; fs: Record<string, number> };
}

async function buildStatus(): Promise<Status> {
  const [mode, probe, health, migration] = await Promise.all([
    getMode(),
    probeFirestore(),
    Promise.resolve(dbHealth()),
    fb.get<CopyReport | null>('meta/migration'),
  ]);

  // doc counts on both engines (RTDB: shallow key reads; Firestore: listings)
  const counts: Status['counts'] = { rtdb: {}, fs: {} };
  try {
    const names = new Set<string>(['meta', 'ownerLock', 'reports']);
    for (const k of await rtdbShallowKeys('')) names.add(k);
    try {
      const v = await getVersionsDoc();
      if (v) for (const k of Object.keys(v)) names.add(k);
    } catch {
      /* optional */
    }
    await Promise.all(
      [...names]
        .filter((n) => !n.startsWith('__'))
        .sort()
        .map(async (n) => {
          try {
            if (n === 'ownerLock') {
              counts.rtdb.ownerLock = 1;
              counts.fs.ownerLock = (await fsList('ownerLock')) ? 1 : 0;
            } else {
              const [r, f] = await Promise.all([
                fb.get<Record<string, unknown>>(n),
                fsList(n),
              ]);
              counts.rtdb[n] = r ? Object.keys(r).length : 0;
              counts.fs[n] = f ? Object.keys(f).length : 0;
            }
          } catch {
            /* leave that row blank */
          }
        })
    );
  } catch {
    /* counts are advisory */
  }

  return { mode, probe, health, migration: migration ?? null, counts };
}

export async function GET() {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  try {
    return NextResponse.json(await buildStatus());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { mode?: unknown };
  if (body.mode !== 'rtdb' && body.mode !== 'firestore') {
    return NextResponse.json({ error: 'mode must be "rtdb" or "firestore".' }, { status: 400 });
  }

  if (body.mode === 'firestore') {
    // guardrail: refuse to switch onto an unreachable / read-only Firestore
    const probe = await probeFirestore();
    if (!probe.ok) {
      return NextResponse.json(
        {
          error: `Firestore is not usable yet (${probe.error ?? 'probe failed'}). Fix access first — nothing has been changed.`,
        },
        { status: 400 }
      );
    }
  }

  try {
    await setMode(body.mode);
    return NextResponse.json({ ok: true, mode: body.mode });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
