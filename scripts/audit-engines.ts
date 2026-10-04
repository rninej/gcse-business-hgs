// Read-only audit: deep-compare the RTDB tree against the Firestore mirror.
// Usage: bun run scripts/audit-engines.ts
// Exits 0 when both engines are byte-identical (excluding the by-design
// RTDB-only meta/databaseMode flag), 1 otherwise.
import { rtdb, rtdbShallowKeys } from '../src/lib/firebase';
import { fsList, getVersionsDoc } from '../src/lib/firestoreRest';

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

async function main() {
  const t0 = Date.now();
  let failures = 0;

  // 1. collection name universe: RTDB keys + Firestore side needs prior
  //    knowledge (listCollectionIds needs admin) — use RTDB keys + version map.
  const names = new Set<string>(['meta', 'ownerLock', 'reports']);
  for (const k of await rtdbShallowKeys('')) names.add(k);
  try {
    const v = await getVersionsDoc();
    if (v) for (const k of Object.keys(v)) names.add(k);
  } catch { /* optional */ }

  // 2. whole-tree RTDB snapshot in one read
  const tree = (await rtdb.get<Record<string, unknown>>('')) ?? {};

  for (const name of [...names].sort()) {
    if (name.startsWith('__')) continue; // probe collections
    const src = tree[name] ?? null;

    if (name === 'meta') {
      // RTDB meta vs Firestore meta — versions is a typed doc on the FS side
      const fsMeta = (await fsList('meta')) ?? {};
      const rtdbMeta = (src ?? {}) as Record<string, unknown>;
      const rtdbKeys = Object.keys(rtdbMeta).filter((k) => k !== 'databaseMode');
      const fsKeys = Object.keys(fsMeta);
      let ok = rtdbKeys.length === fsKeys.length;
      const details: string[] = [];
      if (!ok) details.push(`key sets differ: rtdb=[${rtdbKeys}] fs=[${fsKeys}]`);
      for (const k of rtdbKeys) {
        if (k === 'databaseMode') continue;
        const fsVal = k === 'versions' ? (await getVersionsDoc()) : fsMeta[k];
        if (!deepEqual(fsVal, rtdbMeta[k])) {
          ok = false;
          details.push(`meta/${k} differs`);
        }
      }
      console.log(`${ok ? 'OK  ' : 'FAIL'} meta (${rtdbKeys.length} children)${details.length ? ' — ' + details.join('; ') : ''}`);
      if (!ok) failures++;
      continue;
    }

    if (name === 'ownerLock') {
      const fsOl = (await fsList('ownerLock')) ?? {};
      const ok = deepEqual(fsOl['_rec' as string] ?? null, src);
      console.log(`${ok ? 'OK  ' : 'FAIL'} ownerLock`);
      if (!ok) failures++;
      continue;
    }

    // regular collection: RTDB {id: rec} vs FS docs
    const srcRecs = (src ?? {}) as Record<string, unknown>;
    const fsRecs = (await fsList(name)) ?? {};
    const srcIds = new Set(Object.keys(srcRecs));
    const fsIds = new Set(Object.keys(fsRecs));
    const missing = [...srcIds].filter((id) => !fsIds.has(id));
    const extra = [...fsIds].filter((id) => !srcIds.has(id));
    const diffs: string[] = [];
    if (missing.length) diffs.push(`missing on FS: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ` (+${missing.length - 5})` : ''}`);
    if (extra.length) diffs.push(`extra on FS: ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? ` (+${extra.length - 5})` : ''}`);
    for (const id of srcIds) {
      if (fsIds.has(id) && !deepEqual(fsRecs[id], srcRecs[id])) diffs.push(`record ${id} content differs`);
    }
    const ok = diffs.length === 0;
    console.log(
      `${ok ? 'OK  ' : 'FAIL'} ${name} (rtdb ${srcIds.size} / fs ${fsIds.size} records)${diffs.length ? ' — ' + diffs.slice(0, 4).join('; ') : ''}`
    );
    if (!ok) failures++;
  }

  console.log(`\n${failures === 0 ? 'IDENTICAL — both engines in sync' : `${failures} collection(s) OUT OF SYNC`} (${Date.now() - t0}ms)`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('audit crashed:', (e as Error).message);
  process.exit(1);
});
