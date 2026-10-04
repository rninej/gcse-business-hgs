import { NextResponse } from 'next/server';
import { fb, resetDbHealth } from '@/lib/firebase';
import { copyFirestoreToRtdb, copyRtdbToFirestore, type CopyReport } from '@/lib/migrateDb';
import { isOwnerUnlocked } from '@/lib/session';

/** One-time (re-runnable) bulk copy between engines, owner-gated. The report
 *  is dual-written to meta/migration so both engines (and this dashboard)
 *  can see the last copy's result. ~750 KB of data, ~10-20 round trips —
 *  well inside the 60s budget. */

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { direction?: unknown };
  const direction = body.direction === 'firestore-to-rtdb' ? 'firestore-to-rtdb' : 'rtdb-to-firestore';

  let report: CopyReport;
  try {
    report = direction === 'rtdb-to-firestore' ? await copyRtdbToFirestore() : await copyFirestoreToRtdb();
  } catch (e) {
    return NextResponse.json({ error: `Copy failed: ${(e as Error).message}` }, { status: 500 });
  }

  // remember the outcome on both engines (dual-write) so the dashboard, and a
  // future flip, can always see the last known good copy
  try {
    await fb.patch('meta/migration', report as unknown as Record<string, unknown>);
  } catch {
    /* report still returned to the caller even if the bookkeeping write failed */
  }
  if (report.ok) resetDbHealth();

  return NextResponse.json(report);
}
