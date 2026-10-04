// Firestore in Datastore mode? No — Native Firestore, accessed over the REST
// API from the server (mirroring how firebase.ts talks to the RTDB REST API).
//
// The user's database: project hgs-business, database "(default)", region
// europe-west2 (London). API-key auth (the same public web key the Firebase
// config ships) — the key never reaches the browser; it lives server-side only
// and the Firestore security rules gate what it can do.
//
// DATA MODEL — a faithful 1:1 mirror of the RTDB JSON tree:
//   RTDB  /hgs/{collection}/{id}            → Firestore doc {collection}/{id}
//   RTDB  /hgs/{collection}/{uid}/{entryId} → Firestore doc {collection}/{uid}
//                                            (the entry map lives INSIDE the
//                                             doc, exactly like attemptLite /
//                                             notifFeed / wrongPool feeds)
//   RTDB  /hgs/meta/versions                → typed doc meta/versions (native
//                                            string fields so a single-field
//                                            PATCH is an atomic server-side
//                                            merge — no read-modify-write)
//   RTDB  /hgs/ownerLock (a flat record)    → doc ownerLock/_rec
// Every other document stores its record VERBATIM as JSON in one string field
// {"j": "<record JSON>"} — a perfect byte-for-byte round-trip of what the RTDB
// held (no Firestore typing edge cases: int64-vs-double, nested arrays, empty
// maps, deep nesting). Reads stay 1 document = 1 full record.
//
// BANDWIDTH MODEL — Firestore bills per document read (50k/day free) and never
// per byte delivered, which is what made the RTDB's 875× download-to-storage
// ratio so expensive. The versioned TTL cache in firebase.ts sits unchanged on
// top of this transport, so a "nothing changed" re-check costs exactly 1 tiny
// document read (the meta/versions doc) instead of a collection download.

const PROJECT = process.env.FIRESTORE_PROJECT ?? 'hgs-business';
/** "(default)" is the literal database id in the REST path — it must be
 *  URL-encoded in request URLs (raw parentheses 404 at Google's front line). */
const DB_ID = '(default)';
const KEY = process.env.FIRESTORE_API_KEY ?? 'AIzaSyAZKUb-r_QOfstkeD-Ysjje3c8h7QlIj40';

const DOCS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${encodeURIComponent(DB_ID)}/documents`;
const DOC_NAME = `projects/${PROJECT}/databases/${DB_ID}/documents`;

const FETCH_TIMEOUT_MS = 10_000;

export class FirestoreRestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'FirestoreRestError';
  }
}

async function fsFetch<T>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (e) {
    throw new FirestoreRestError(`firestore unreachable: ${(e as Error).message}`, 0);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = text.slice(0, 300);
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string; status?: string } };
      if (parsed.error?.message) msg = `${parsed.error.status ?? ''} ${parsed.error.message}`.trim();
    } catch {
      /* keep raw text */
    }
    throw new FirestoreRestError(`firestore ${method} ${url.slice(0, 120)} -> ${res.status} ${msg}`, res.status);
  }
  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

function withKey(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}key=${KEY}`;
}

/* ---------------- raw document helpers ---------------- */

interface FsDoc {
  name: string;
  fields?: Record<string, { stringValue?: string }> | null;
  createTime?: string;
  updateTime?: string;
}

/** Document ids we generate from RTDB keys are all [A-Za-z0-9_]; Firestore
 *  only forbids "/", "." and ".." — encode defensively anyway so no future
 *  key can ever 404 silently. */
function encodeId(id: string): string {
  if (id === '.') return '~dot';
  if (id === '..') return '~dotdot';
  return id.replaceAll('/', '~slash');
}
function decodeId(id: string): string {
  if (id === '~dot') return '.';
  if (id === '~dotdot') return '..';
  return id.replaceAll('~slash', '/');
}

function docUrl(col: string, id: string): string {
  return `${DOCS}/${encodeURIComponent(col)}/${encodeURIComponent(encodeId(id))}`;
}

async function getDocRaw(col: string, id: string): Promise<FsDoc | null> {
  try {
    return await fsFetch<FsDoc>('GET', withKey(docUrl(col, id)));
  } catch (e) {
    if (e instanceof FirestoreRestError && e.status === 404) return null;
    throw e;
  }
}

/** PATCH with no updateMask = full-document replace (set semantics). */
async function setDocRaw(col: string, id: string, fields: Record<string, unknown>): Promise<void> {
  await fsFetch<FsDoc>('PATCH', withKey(docUrl(col, id)), { fields });
}

async function deleteDocRaw(col: string, id: string): Promise<boolean> {
  try {
    await fsFetch<Record<string, never>>('DELETE', withKey(docUrl(col, id)));
    return true;
  } catch (e) {
    if (e instanceof FirestoreRestError && e.status === 404) return false;
    throw e;
  }
}

interface ListResponse {
  documents?: FsDoc[];
  nextPageToken?: string;
}

/** Lists every document in a collection (REST pages cap at 300). */
async function listDocsRaw(col: string): Promise<FsDoc[]> {
  const out: FsDoc[] = [];
  let token: string | undefined;
  do {
    let url = `${DOCS}/${encodeURIComponent(col)}?pageSize=300`;
    if (token) url += `&pageToken=${encodeURIComponent(token)}`;
    const page = await fsFetch<ListResponse>('GET', withKey(url));
    out.push(...(page.documents ?? []));
    token = page.nextPageToken;
  } while (token);
  return out;
}

interface CommitWrite {
  update?: { name: string; fields: Record<string, unknown> };
  delete?: string;
}

export type { CommitWrite };

/** Batched commit — up to `CHUNK` writes per request (API max 500; we stay
 *  well under the request-size ceiling too). */
const COMMIT_CHUNK = 150;
async function commitRaw(writes: CommitWrite[]): Promise<number> {
  let done = 0;
  for (let i = 0; i < writes.length; i += COMMIT_CHUNK) {
    const chunk = writes.slice(i, i + COMMIT_CHUNK);
    await fsFetch<{ writeResults?: unknown[] }>(
      'POST',
      withKey(`${DOCS}:commit`),
      { writes: chunk }
    );
    done += chunk.length;
  }
  return done;
}

/* ---------------- blob documents ---------------- */

const MAX_BLOB_CHARS = 950_000; // Firestore hard limit is 1 MiB per document

function toBlob(value: unknown): { j: { stringValue: string } } {
  const s = JSON.stringify(value);
  if (s.length > MAX_BLOB_CHARS) {
    throw new FirestoreRestError(
      `record too large for one Firestore document (${s.length} chars)`,
      400
    );
  }
  return { j: { stringValue: s } };
}

function fromBlob(doc: FsDoc): unknown {
  const raw = doc.fields?.j?.stringValue;
  if (raw === undefined) return null;
  return JSON.parse(raw) as unknown;
}

/* ---------------- the versions doc (typed fields) ---------------- */

const VERSIONS_PATH = 'meta/versions';

export async function getVersionsDoc(): Promise<Record<string, string> | null> {
  const doc = await getDocRaw('meta', 'versions');
  if (!doc || !doc.fields) return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(doc.fields)) {
    if (typeof v?.stringValue === 'string') out[k] = v.stringValue;
  }
  return out;
}

/** Atomic single-request merge of individual version stamps (updateMask). */
export async function patchVersionsDoc(entries: Record<string, string>): Promise<void> {
  const fields: Record<string, unknown> = {};
  const paths: string[] = [];
  for (const [k, v] of Object.entries(entries)) {
    fields[k] = { stringValue: v };
    paths.push(k);
  }
  const qs = paths.map((p) => `updateMask.fieldPaths=${encodeURIComponent(p)}`).join('&');
  await fsFetch<FsDoc>('PATCH', withKey(`${docUrl('meta', 'versions')}?${qs}`), { fields });
}

/** Full typed write (used by the migration copy). */
export async function setVersionsDoc(map: Record<string, string>): Promise<void> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(map)) fields[k] = { stringValue: String(v) };
  await setDocRaw('meta', 'versions', fields);
}

/* ---------------- read-modify-write serialization ----------------
 * Blob PATCHes / deep SETs / deep DELETEs read the doc, mutate the parsed
 * record and write it back. Two concurrent mutations of the same doc on one
 * instance could otherwise drop one writer's change, so mutations queue per
 * document path inside this process. */
const locks = new Map<string, Promise<unknown>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(
    key,
    next.catch(() => undefined)
  );
  return next;
}

/* ---------------- RTDB-path-shaped operations ----------------
 * These mirror the RTDB REST semantics for the exact path shapes the app
 * uses (see firebase.ts for the router). */

/** RTDB roots that are ONE record rather than a collection of records. */
const SINGLE_RECORD_ROOTS = new Set(['ownerLock']);
const SINGLE_RECORD_DOC = '_rec';

interface ParsedPath {
  kind: 'versions' | 'single-root' | 'collection' | 'doc';
  col?: string;
  id?: string;
  sub?: string[];
}

function parsePath(path: string): ParsedPath {
  if (path === VERSIONS_PATH) return { kind: 'versions' };
  const segs = path.split('/').filter((s) => s.length > 0);
  if (segs.length === 0) return { kind: 'collection', col: '' };
  if (segs.length === 1) {
    return SINGLE_RECORD_ROOTS.has(segs[0])
      ? { kind: 'single-root', col: segs[0] }
      : { kind: 'collection', col: segs[0] };
  }
  return { kind: 'doc', col: segs[0], id: segs[1], sub: segs.slice(2) };
}

/** Read a deep sub-path out of a parsed record (`null` where RTDB would). */
function dig(record: unknown, sub: string[]): unknown {
  let cur: unknown = record;
  for (const key of sub) {
    if (cur === null || typeof cur !== 'object') return null;
    cur = (cur as Record<string, unknown>)[key] ?? null;
  }
  return cur === undefined ? null : cur;
}

/** Mutate a parsed record at a deep sub-path. */
function bury(record: Record<string, unknown>, sub: string[], value: unknown, merge: boolean): void {
  if (sub.length === 0) {
    if (merge && value && typeof value === 'object' && !Array.isArray(value)) {
      // RTDB PATCH semantics at the doc root: each payload key is written to
      // its own path. Keys containing '/' (e.g. "answers/q7") are DEEP paths
      // in the RTDB REST API — they must nest, not sit as literal keys. Each
      // such key replaces whatever lives at its leaf, exactly like the RTDB.
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (k.includes('/')) {
          bury(record, k.split('/').filter((s) => s.length > 0), v, false);
        } else {
          record[k] = v;
        }
      }
    } else {
      // replace at the root of the blob — simulate by clearing + assign
      for (const k of Object.keys(record)) delete record[k];
      if (value && typeof value === 'object') Object.assign(record, value as Record<string, unknown>);
      else if (value !== undefined) record.__scalar = value; // defensive; never used by this app
    }
    return;
  }
  let cur: Record<string, unknown> = record;
  for (const key of sub.slice(0, -1)) {
    const next = cur[key];
    if (next === null || typeof next !== 'object' || Array.isArray(next)) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  const last = sub[sub.length - 1];
  if (merge && value && typeof value === 'object' && !Array.isArray(value)) {
    const target = cur[last];
    cur[last] =
      target && typeof target === 'object' && !Array.isArray(target)
        ? { ...(target as Record<string, unknown>), ...(value as Record<string, unknown>) }
        : value;
  } else if (value === undefined) {
    delete cur[last];
  } else {
    cur[last] = value;
  }
}

/** Legacy junk sweep: the window where root-merge keys containing '/' were
 *  stored literally left "answers/q7"-shaped keys behind. They are garbage
 *  (the RTDB never had them) — drop them whenever a merge rewrites the doc
 *  so records self-heal. */
function scrubSlashKeys(record: Record<string, unknown>): void {
  for (const k of Object.keys(record)) {
    if (k.includes('/')) delete record[k];
  }
}

/** GET — any RTDB-shaped path. Returns `null` where the RTDB would. */
export async function fsGet(path: string): Promise<unknown> {
  const p = parsePath(path);
  if (p.kind === 'versions') return getVersionsDoc();
  if (p.kind === 'single-root') {
    const doc = await getDocRaw(p.col!, SINGLE_RECORD_DOC);
    return doc ? fromBlob(doc) : null;
  }
  if (p.kind === 'collection') {
    const docs = await listDocsRaw(p.col!);
    if (docs.length === 0) return null;
    const out: Record<string, unknown> = {};
    for (const d of docs) {
      const id = decodeId(d.name.slice(d.name.lastIndexOf('/') + 1));
      out[id] = fromBlob(d);
    }
    return out;
  }
  const doc = await getDocRaw(p.col!, p.id!);
  if (!doc) return null;
  const value = fromBlob(doc);
  return p.sub && p.sub.length > 0 ? dig(value, p.sub) : value;
}

/** Whole collection as {id: record}; `null` when the collection is empty. */
export async function fsList(col: string): Promise<Record<string, unknown> | null> {
  const docs = await listDocsRaw(col);
  if (docs.length === 0) return null;
  const out: Record<string, unknown> = {};
  for (const d of docs) {
    const id = decodeId(d.name.slice(d.name.lastIndexOf('/') + 1));
    out[id] = fromBlob(d);
  }
  return out;
}

/** SET (PUT) — full replace at the addressed path. */
export async function fsSet(path: string, data: unknown): Promise<void> {
  const p = parsePath(path);
  if (p.kind === 'versions') {
    await setVersionsDoc((data ?? {}) as Record<string, string>);
    return;
  }
  if (p.kind === 'single-root') {
    await setDocRaw(p.col!, SINGLE_RECORD_DOC, toBlob(data));
    return;
  }
  if (p.kind === 'doc') {
    if (!p.sub || p.sub.length === 0) {
      await setDocRaw(p.col!, p.id!, toBlob(data));
      return;
    }
    return withLock(`${p.col}/${p.id}`, async () => {
      const doc = await getDocRaw(p.col!, p.id!);
      const record = (doc ? fromBlob(doc) : null) as Record<string, unknown> | null;
      const base = record && typeof record === 'object' && !Array.isArray(record) ? record : {};
      bury(base, p.sub!, data, false);
      await setDocRaw(p.col!, p.id!, toBlob(base));
    });
  }
  throw new FirestoreRestError(`fsSet: unsupported path '${path}'`, 400);
}

/** PATCH — shallow merge at the addressed path (RTDB PATCH semantics). */
export async function fsPatch(path: string, data: object): Promise<void> {
  const p = parsePath(path);
  if (p.kind === 'versions') {
    await patchVersionsDoc(data as Record<string, string>);
    return;
  }
  if (p.kind === 'single-root') {
    return withLock(`${p.col}/${SINGLE_RECORD_DOC}`, async () => {
      const doc = await getDocRaw(p.col!, SINGLE_RECORD_DOC);
      const record = (doc ? fromBlob(doc) : null) as Record<string, unknown> | null;
      const base = record && typeof record === 'object' && !Array.isArray(record) ? record : {};
      Object.assign(base, data as Record<string, unknown>);
      await setDocRaw(p.col!, SINGLE_RECORD_DOC, toBlob(base));
    });
  }
  if (p.kind === 'doc') {
    return withLock(`${p.col}/${p.id}`, async () => {
      const doc = await getDocRaw(p.col!, p.id!);
      const record = (doc ? fromBlob(doc) : null) as Record<string, unknown> | null;
      const base = record && typeof record === 'object' && !Array.isArray(record) ? record : {};
      scrubSlashKeys(base);
      bury(base, p.sub ?? [], data, true);
      await setDocRaw(p.col!, p.id!, toBlob(base));
    });
  }
  throw new FirestoreRestError(`fsPatch: unsupported path '${path}'`, 400);
}

/** Fast-path merge for hot routes that ALREADY hold a fresh copy of the doc
 *  (e.g. the attempt loaded at the start of the request): applies the
 *  RTDB-shaped sub-path patch to that base and writes it in ONE request —
 *  no read-modify-write re-read, so an answer check costs a single round
 *  trip instead of two. Still under the per-doc lock, so concurrent writes
 *  on this instance stay ordered. */
export async function fsMergeKnown(
  col: string,
  id: string,
  base: unknown,
  patch: object
): Promise<void> {
  const record =
    base && typeof base === 'object' && !Array.isArray(base)
      ? (JSON.parse(JSON.stringify(base)) as Record<string, unknown>)
      : {};
  scrubSlashKeys(record);
  bury(record, [], patch, true);
  await withLock(`${col}/${id}`, async () => {
    await setDocRaw(col, id, toBlob(record));
  });
}

/** DELETE — whole doc, or one key inside a blob doc. */
export async function fsRemove(path: string): Promise<void> {
  const p = parsePath(path);
  if (p.kind === 'versions') {
    await deleteDocRaw('meta', 'versions');
    return;
  }
  if (p.kind === 'single-root') {
    await deleteDocRaw(p.col!, SINGLE_RECORD_DOC);
    return;
  }
  if (p.kind === 'doc') {
    if (!p.sub || p.sub.length === 0) {
      await deleteDocRaw(p.col!, p.id!);
      return;
    }
    return withLock(`${p.col}/${p.id}`, async () => {
      const doc = await getDocRaw(p.col!, p.id!);
      if (!doc) return;
      const record = fromBlob(doc) as Record<string, unknown> | null;
      if (!record || typeof record !== 'object') return;
      bury(record, p.sub!, undefined, false);
      await setDocRaw(p.col!, p.id!, toBlob(record));
    });
  }
  throw new FirestoreRestError(`fsRemove: unsupported path '${path}'`, 400);
}

/* ---------------- migration primitives ---------------- */

/** Blob upsert used by the migration copy (no RMW, no locks — bulk writes). */
export function blobWrite(col: string, id: string, value: unknown): CommitWrite {
  return { update: { name: `${DOC_NAME}/${col}/${encodeId(id)}`, fields: toBlob(value) } };
}

export function versionsWrite(map: Record<string, string>): CommitWrite {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(map)) fields[k] = { stringValue: String(v) };
  return { update: { name: `${DOC_NAME}/meta/versions`, fields } };
}

export function deleteWrite(col: string, id: string): CommitWrite {
  return { delete: `${DOC_NAME}/${col}/${encodeId(id)}` };
}

export async function commit(writes: CommitWrite[]): Promise<number> {
  if (writes.length === 0) return 0;
  return commitRaw(writes);
}

export async function listIds(col: string): Promise<string[]> {
  const docs = await listDocsRaw(col);
  return docs.map((d) => decodeId(d.name.slice(d.name.lastIndexOf('/') + 1)));
}

/* ---------------- connectivity probe ---------------- */

export interface ProbeResult {
  ok: boolean;
  ms: number;
  error?: string;
  status?: number;
}

/** Write → read → delete a probe document: proves rules + region + key. */
export async function fsProbe(): Promise<ProbeResult> {
  const t0 = Date.now();
  try {
    const stamp = `probe-${Date.now()}`;
    await setDocRaw('__dbprobe', 'ping', { j: { stringValue: stamp } });
    const doc = await getDocRaw('__dbprobe', 'ping');
    const ok = doc?.fields?.j?.stringValue === stamp;
    await deleteDocRaw('__dbprobe', 'ping');
    return { ok, ms: Date.now() - t0 };
  } catch (e) {
    const err = e as FirestoreRestError;
    return { ok: false, ms: Date.now() - t0, error: err.message, status: err.status };
  }
}
