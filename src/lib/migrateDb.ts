// One-time (re-runnable) bulk copy between the two engines:
//   RTDB → Firestore   "migrate" — mirror the whole /hgs tree into Firestore
//   Firestore → RTDB   "restore" — disaster recovery in the other direction
//
// Owned by /api/owner/migrate (owner-gated, wired into the /debug panel).
//
// Mapping (see firestoreRest.ts for the data model):
//   {collection}/{id}            → doc {collection}/{id}   (blob)
//   meta/versions                → typed doc meta/versions
//   meta/{other children}        → blob docs meta/{child}
//   ownerLock (flat record)      → doc ownerLock/_rec      (blob)
//   meta/databaseMode            → NEVER copied — the engine flag lives in the
//                                  RTDB only (the fallback must not depend on
//                                  the engine it falls back from).
//
// Safety:
//   • Idempotent — re-running simply overwrites the destination again.
//   • Prunes stale destination docs that no longer exist in the source
//     (RTDB→FS only; the reverse direction's per-collection PUT replaces
//     whole subtrees and therefore prunes implicitly).
//   • Verifies EVERY collection after the copy with a deep comparison and
//     reports per-collection record counts, bytes and verified ✓/✗.
//   • Concurrent live writes are safe: every runtime write goes to BOTH
//     engines (see firebase.ts), so a record landing mid-copy exists in both
//     and the copy's overwrite is a no-op.

import {
  blobWrite,
  commit,
  deleteWrite,
  fsList,
  getVersionsDoc,
  listIds,
  versionsWrite,
  type CommitWrite,
} from './firestoreRest';
import { rtdb, rtdbShallowKeys } from './firebase';

export type CopyDirection = 'rtdb-to-firestore' | 'firestore-to-rtdb';

export interface CollectionCopy {
  name: string;
  records: number;
  bytes: number;
  verified: boolean;
}

export interface CopyReport {
  direction: CopyDirection;
  at: number;
  ms: number;
  ok: boolean;
  totalRecords: number;
  totalBytes: number;
  pruned: number;
  collections: CollectionCopy[];
  error?: string;
}

const SINGLE_RECORD_DOC = '_rec';

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as Record<string, unknown>);
  const kb = Object.keys(b as Record<string, unknown>);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

function bytesOf(v: unknown): number {
  try {
    return JSON.stringify(v)?.length ?? 0;
  } catch {
    return 0;
  }
}

/* ================= RTDB → Firestore ================= */

export async function copyRtdbToFirestore(): Promise<CopyReport> {
  const t0 = Date.now();
  const report: CopyReport = {
    direction: 'rtdb-to-firestore',
    at: Date.now(),
    ms: 0,
    ok: false,
    totalRecords: 0,
    totalBytes: 0,
    pruned: 0,
    collections: [],
  };

  try {
    // 1 — snapshot the whole RTDB tree in one read (~750 KB)
    const tree = (await rtdb.get<Record<string, unknown>>('')) ?? {};
    if (tree.meta && typeof tree.meta === 'object') {
      delete (tree.meta as Record<string, unknown>).databaseMode;
    }

    const writes: CommitWrite[] = [];
    const srcIds: Record<string, Set<string>> = {};
    const srcRecords: Record<string, Record<string, unknown>> = {};

    for (const [k, v] of Object.entries(tree)) {
      if (v === null || v === undefined) continue;

      if (k === 'meta' && typeof v === 'object') {
        srcIds.meta = new Set();
        srcRecords.meta = {};
        for (const [mk, mv] of Object.entries(v as Record<string, unknown>)) {
          if (mk === 'databaseMode' || mv === null || mv === undefined) continue;
          writes.push(mk === 'versions' ? versionsWrite(mv as Record<string, string>) : blobWrite('meta', mk, mv));
          srcIds.meta.add(mk);
          srcRecords.meta[mk] = mv;
        }
      } else if (k === 'ownerLock') {
        writes.push(blobWrite('ownerLock', SINGLE_RECORD_DOC, v));
        srcIds.ownerLock = new Set([SINGLE_RECORD_DOC]);
        srcRecords.ownerLock = { [SINGLE_RECORD_DOC]: v };
      } else if (typeof v === 'object') {
        srcIds[k] = new Set();
        srcRecords[k] = {};
        for (const [id, rec] of Object.entries(v as Record<string, unknown>)) {
          if (rec === null || rec === undefined) continue;
          writes.push(blobWrite(k, id, rec));
          srcIds[k].add(id);
          srcRecords[k][id] = rec;
        }
      }
    }

    // 2 — write everything (chunked commits, ~150 writes per request)
    await commit(writes);

    // 3 — prune destination docs that no longer exist in the source
    for (const [col, ids] of Object.entries(srcIds)) {
      const have = await listIds(col);
      const stale = have.filter((id) => !ids.has(id));
      if (stale.length > 0) {
        await commit(stale.map((id) => deleteWrite(col, id)));
        report.pruned += stale.length;
      }
    }

    // 4 — verify every collection by reading it back and deep-comparing
    for (const [col, records] of Object.entries(srcRecords)) {
      let verified = false;
      try {
        if (col === 'meta') {
          const listed = (await fsList('meta')) ?? {};
          const rebuilt: Record<string, unknown> = {};
          for (const id of Object.keys(listed)) {
            rebuilt[id] = id === 'versions' ? ((await getVersionsDoc()) ?? {}) : listed[id];
          }
          verified = deepEqual(rebuilt, records);
        } else {
          verified = deepEqual((await fsList(col)) ?? {}, records);
        }
      } catch {
        verified = false;
      }
      const recs = Object.keys(records).length;
      report.collections.push({ name: col, records: recs, bytes: bytesOf(records), verified });
      report.totalRecords += recs;
      report.totalBytes += bytesOf(records);
    }

    report.collections.sort((a, b) => b.records - a.records);
    report.ok = report.collections.every((c) => c.verified);
  } catch (e) {
    report.error = (e as Error).message.slice(0, 400);
  }

  report.ms = Date.now() - t0;
  return report;
}

/* ================= Firestore → RTDB (restore) ================= */

export async function copyFirestoreToRtdb(): Promise<CopyReport> {
  const t0 = Date.now();
  const report: CopyReport = {
    direction: 'firestore-to-rtdb',
    at: Date.now(),
    ms: 0,
    ok: false,
    totalRecords: 0,
    totalBytes: 0,
    pruned: 0,
    collections: [],
  };

  try {
    // 1 — which collections exist? RTDB root keys ∪ version-stamp segments ∪
    //     the known set. (Firestore's listCollectionIds needs admin auth, so
    //     we derive the set from the engines' own bookkeeping instead.)
    const names = new Set<string>(['meta', 'ownerLock', 'reports']);
    try {
      for (const k of await rtdbShallowKeys('')) names.add(k);
    } catch {
      /* RTDB unreachable — restore proceeds from the Firestore side alone */
    }
    try {
      const v = await getVersionsDoc();
      if (v) for (const k of Object.keys(v)) names.add(k);
    } catch {
      /* fine — known set above covers the live app */
    }

    // 2 — copy every record collection (PUT replaces the whole subtree,
    //     which also prunes records deleted while on the Firestore engine)
    for (const col of [...names].sort()) {
      if (col.startsWith('__') || col === 'meta' || col === 'ownerLock') continue;
      const docs = await fsList(col);
      if (docs === null) continue; // nothing stored on the Firestore side
      await rtdb.set(col, docs);
      const back = await rtdb.get<Record<string, unknown>>(col);
      const verified = deepEqual(back ?? {}, docs);
      const recs = Object.keys(docs).length;
      report.collections.push({ name: col, records: recs, bytes: bytesOf(docs), verified });
      report.totalRecords += recs;
      report.totalBytes += bytesOf(docs);
    }

    // 3 — meta: typed versions doc + blob children. PATCH (never PUT) so the
    //     engine flag at meta/databaseMode survives the restore untouched.
    const metaDocs = (await fsList('meta')) ?? {};
    const metaOut: Record<string, unknown> = {};
    for (const [id, val] of Object.entries(metaDocs)) {
      if (id === 'databaseMode') continue;
      metaOut[id] = id === 'versions' ? ((await getVersionsDoc()) ?? {}) : val;
    }
    if (Object.keys(metaOut).length > 0) {
      await rtdb.patch('meta', metaOut);
      const backMeta = (await rtdb.get<Record<string, unknown>>('meta')) ?? {};
      const rebuilt: Record<string, unknown> = {};
      for (const id of Object.keys(metaOut)) rebuilt[id] = backMeta[id];
      const verified = deepEqual(rebuilt, metaOut);
      const recs = Object.keys(metaOut).length;
      report.collections.push({ name: 'meta', records: recs, bytes: bytesOf(metaOut), verified });
      report.totalRecords += recs;
      report.totalBytes += bytesOf(metaOut);
    }

    // 4 — ownerLock (single record)
    const ol = (await fsList('ownerLock')) ?? {};
    if (ol[SINGLE_RECORD_DOC] !== undefined) {
      const rec = ol[SINGLE_RECORD_DOC];
      await rtdb.set('ownerLock', rec);
      const back = await rtdb.get<unknown>('ownerLock');
      const verified = deepEqual(back, rec);
      report.collections.push({ name: 'ownerLock', records: 1, bytes: bytesOf(rec), verified });
      report.totalRecords += 1;
      report.totalBytes += bytesOf(rec);
    }

    report.collections.sort((a, b) => b.records - a.records);
    report.ok = report.collections.length > 0 && report.collections.every((c) => c.verified);
  } catch (e) {
    report.error = (e as Error).message.slice(0, 400);
  }

  report.ms = Date.now() - t0;
  return report;
}
