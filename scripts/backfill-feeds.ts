// One-time (re-runnable, idempotent) migration: builds the slim feeds the
// bandwidth-optimised read paths use, from the existing full records.
//
//   attemptLite/{studentId}/{attemptId}  — slim mirrors of every attempt
//   wrongPool/{studentId}/{qid}          — each student's wrong-answer pool
//   notifFeed/{studentId}/{nid}          — per-student notification feeds
//   meta/versions                        — version stamps for every collection
//
// Run with:  bun run scripts/backfill-feeds.ts
// Safe to re-run — it recomputes everything from the source-of-truth records.

import { fb } from '../src/lib/firebase';
import { toLite } from '../src/lib/attemptLite';
import { collectWrongPool } from '../src/lib/wrongPool';
import type { Attempt, StudentNotification } from '../src/lib/types';

function stamp(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function main() {
  console.log('backfill: reading source collections…');
  const [attemptsRaw, notificationsRaw] = await Promise.all([
    fb.get<Record<string, Attempt>>('attempts'),
    fb.get<Record<string, StudentNotification>>('notifications'),
  ]);
  const attempts = Object.values(attemptsRaw ?? {});
  const notifications = Object.values(notificationsRaw ?? {});
  console.log(`  attempts=${attempts.length} notifications=${notifications.length}`);

  // ---- attemptLite ----
  let liteWritten = 0;
  for (const a of attempts) {
    if (!a?.id || !a?.studentId) continue;
    await fb.set(`attemptLite/${a.studentId}/${a.id}`, toLite(a));
    liteWritten += 1;
  }
  console.log(`  attemptLite: ${liteWritten} entries written`);

  // ---- wrongPool (per student, chronological fold — same maths as the app) ----
  const byStudent = new Map<string, Attempt[]>();
  for (const a of attempts) {
    if (!a?.studentId || a.mode === 'selftest') continue;
    const list = byStudent.get(a.studentId) ?? [];
    list.push(a);
    byStudent.set(a.studentId, list);
  }
  let poolsWritten = 0;
  for (const [sid, mine] of byStudent) {
    const pool = collectWrongPool(mine);
    const feed: Record<string, unknown> = {};
    for (const e of pool) feed[e.q.id] = e;
    await fb.set(`wrongPool/${sid}`, feed);
    poolsWritten += 1;
  }
  console.log(`  wrongPool: ${poolsWritten} student pools written`);

  // ---- notifFeed ----
  let notesWritten = 0;
  for (const n of notifications) {
    if (!n?.id || !n?.studentId) continue;
    await fb.set(`notifFeed/${n.studentId}/${n.id}`, n);
    notesWritten += 1;
  }
  console.log(`  notifFeed: ${notesWritten} entries written`);

  // ---- meta/versions: stamp every collection the cache knows about ----
  const versions: Record<string, string> = {};
  for (const seg of [
    'teachers',
    'classes',
    'students',
    'assignments',
    'attempts',
    'attemptLite',
    'notifications',
    'notifFeed',
    'wrongPool',
    'avatars',
    'aiHealth',
    'ownerLock',
  ]) {
    versions[seg] = stamp();
  }
  await fb.patch('meta/versions', versions);
  console.log('  meta/versions stamped for all collections');
  console.log('backfill complete ✓');
}

main().catch((e) => {
  console.error('backfill failed:', e);
  process.exit(1);
});
