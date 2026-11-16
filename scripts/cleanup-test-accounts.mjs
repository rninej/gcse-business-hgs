#!/usr/bin/env node
// Removes the test accounts this project keeps creating while checking the
// funnel, so the owner's /debug counts and class lists contain real teachers
// only. Every record is matched by its owner, never by position.
//
//   node scripts/cleanup-test-accounts.mjs           # dry run, lists what would go
//   node scripts/cleanup-test-accounts.mjs --apply   # actually delete
//
// A teacher is a test account only when its address is an obvious throwaway:
// @example.com, or a plus-tag this project uses for checks (qa, alerttest,
// firstrun, funnelcheck, teacher.demo, enqtest, cronpath, pricingpath).
// Mr Noel's real account never matches.

const APPLY = process.argv.includes('--apply');

const FS_PROJECT = process.env.FIRESTORE_PROJECT || 'hgs-business';
const FS_KEY = process.env.FIRESTORE_API_KEY || 'AIzaSyAZKUb-r_QOfstkeD-Ysjje3c8h7QlIj40';
const FS_DOCS = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT}/databases/%28default%29/documents`;
const RTDB = (process.env.FIREBASE_DB_URL || 'https://hgs-business-default-rtdb.europe-west1.firebasedatabase.app').replace(/\/+$/, '');

const TEST_TEACHER =
  /@example\.(com|org|net)$|@test\.(com|uk)$|(\+(qa|alerttest|firstrun|funnelcheck|teacher\.demo|enqtest|cronpath|pricingpath|trialtest)\w*@)/i;

/** Older rounds named their throwaways by prefix ("qa-r33a@school.uk",
 *  "e2e-lb@test.uk", "trial.qa@example.com"). Those prefixes are not used by
 *  real teachers, and the domain is irrelevant once the prefix matches. */
const TEST_PREFIX = /^(qa|qa[-._]|e2e[-._]|trial[-._]|gh[._-]verify|test|r\d+qa)/i;

function isTestTeacher(t) {
  const email = (t.email || '').toLowerCase();
  if (TEST_TEACHER.test(email)) return true;
  return TEST_PREFIX.test(email.split('@')[0] || '');
}

async function listCollection(name) {
  const out = [];
  let pageToken = '';
  for (let page = 0; page < 20; page++) {
    const url = `${FS_DOCS}/${name}?key=${FS_KEY}&pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`list ${name} ${res.status}: ${(await res.text()).slice(0, 160)}`);
    const data = await res.json();
    for (const doc of data.documents || []) {
      const raw = doc.fields?.j?.stringValue;
      if (!raw) continue;
      try {
        out.push({ id: doc.name.split('/').pop(), record: JSON.parse(raw) });
      } catch {
        /* not a JSON record */
      }
    }
    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }
  return out;
}

async function remove(collection, id) {
  if (!APPLY) return;
  const fs = await fetch(`${FS_DOCS}/${collection}/${id}?key=${FS_KEY}`, { method: 'DELETE', signal: AbortSignal.timeout(20000) });
  if (!fs.ok && fs.status !== 404) console.log('warn firestore', collection, id, fs.status);
  const rtdb = await fetch(`${RTDB}/hgs/${collection}/${id}.json`, { method: 'DELETE', signal: AbortSignal.timeout(20000) }).catch(() => null);
  if (rtdb && !rtdb.ok && rtdb.status !== 404) console.log('warn rtdb', collection, id, rtdb.status);
}

const teachers = await listCollection('teachers');
const testTeachers = teachers.filter(({ record: t }) => isTestTeacher(t));
const ids = new Set(testTeachers.map((t) => t.id));

const classes = (await listCollection('classes')).filter(({ record: c }) => ids.has(c.teacherId));
const students = (await listCollection('students')).filter(({ record: s }) => ids.has(s.teacherId));
const studentIds = new Set(students.map((s) => s.id));
const assignments = (await listCollection('assignments')).filter(({ record: a }) => ids.has(a.teacherId));
const assignmentIds = new Set(assignments.map((a) => a.id));
const attempts = (await listCollection('attempts')).filter(
  ({ record: a }) => studentIds.has(a.studentId) || assignmentIds.has(a.assignmentId)
);

console.log(`teachers matched : ${testTeachers.length}`);
for (const { record: t } of testTeachers) console.log(`   ${t.email}`);
console.log(`classes          : ${classes.length}`);
console.log(`students         : ${students.length}`);
console.log(`assignments      : ${assignments.length}`);
console.log(`attempts         : ${attempts.length}`);
console.log(`mode             : ${APPLY ? 'APPLY (deleting)' : 'dry run (nothing deleted)'}`);

if (APPLY) {
  for (const { id } of attempts) await remove('attempts', id);
  for (const { id } of assignments) await remove('assignments', id);
  for (const { id } of students) await remove('students', id);
  for (const { id } of classes) await remove('classes', id);
  for (const { id } of testTeachers) await remove('teachers', id);
  console.log('done');
}
