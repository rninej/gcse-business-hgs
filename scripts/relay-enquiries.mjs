#!/usr/bin/env node
// Enquiry relay — sends any licence request that the deployed app could not mail.
//
// Why this exists: the app can only send mail when RESEND_API_KEY is present in
// the Vercel environment. That variable is not set on the production deployment
// yet (/api/health reports "email":"none"), so an enquiry submitted on
// /upgrade is stored but never reaches an inbox. This relay closes that gap:
// GitHub Actions runs it every few minutes, it reads the enquiries collection
// straight from Firestore, mails anything still unsent through Resend, and marks
// the record so the same enquiry is never sent twice.
//
// It is deliberately idempotent and capped:
//   • entries older than 14 days are ignored
//   • a copy that already reports emailed:"sent" is skipped
//   • owner attempts stop after 5 tries, acknowledgement after 3
//   • at most 25 sends per run
// When the Vercel environment does get the key, the app sends first and this
// script simply finds nothing to do.
//
// Nothing secret is printed: the key arrives in the environment, and the log
// lines carry ids and statuses only.

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const OWNER = process.env.CONTACT_EMAIL || 'arnavjain@gcse.business';
const FROM = process.env.ENQUIRY_FROM || 'gcse.business <enquiries@gcse.business>';

const FS_PROJECT = process.env.FIRESTORE_PROJECT || 'hgs-business';
const FS_KEY = process.env.FIRESTORE_API_KEY || 'AIzaSyAZKUb-r_QOfstkeD-Ysjje3c8h7QlIj40';
const FS_DOCS = `https://firestore.googleapis.com/v1/projects/${FS_PROJECT}/databases/%28default%29/documents`;
const RTDB = (process.env.FIREBASE_DB_URL || 'https://hgs-business-default-rtdb.europe-west1.firebasedatabase.app').replace(/\/+$/, '');

const DAY = 24 * 60 * 60 * 1000;
const MAX_AGE_MS = 14 * DAY;
const MAX_OWNER_TRIES = 5;
const MAX_ACK_TRIES = 3;
const MAX_SENDS = 25;

const now = Date.now();

/** Addresses the mail provider refuses outright (and that no school uses) — an
 *  acknowledgement to one of these would only burn a retry. */
const TEST_EMAIL = /@(?:[^@\s]*\.)?(?:example\.(?:com|org|net)|test|invalid|localhost)$/i;

function log(...parts) {
  console.log(new Date().toISOString(), ...parts);
}

/** Signup alerts start here. Anything created before this moment already had
 *  its chance to be seen; the point is that the NEXT teacher who starts a trial
 *  is known within minutes, not discovered whenever /debug is next opened. */
const ALERT_SINCE = Date.parse(process.env.ALERT_SINCE || '2026-11-16T00:00:00Z');

async function listCollection(name) {
  const out = [];
  let pageToken = '';
  for (let page = 0; page < 10; page++) {
    const url = `${FS_DOCS}/${name}?key=${FS_KEY}&pageSize=100${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`firestore list ${name} ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    for (const doc of data.documents || []) {
      const raw = doc.fields?.j?.stringValue;
      if (!raw) continue;
      try {
        out.push({ id: doc.name.split('/').pop(), record: JSON.parse(raw) });
      } catch {
        continue;
      }
    }
    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }
  return out;
}

async function saveRecord(collection, id, record) {
  const body = { fields: { j: { stringValue: JSON.stringify(record) } } };
  const fsUrl = `${FS_DOCS}/${collection}/${id}?key=${FS_KEY}&updateMask.fieldPaths=j`;
  const fs = await fetch(fsUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!fs.ok) log('warn', collection, id, 'firestore patch failed', fs.status);
}

/** A trial that starts at 2am and is read at 2pm has lost half a day of the
 *  only month the school gets. One line to the owner the moment it happens. */
async function alertNewSignups() {
  const teachers = await listCollection('teachers');
  const fresh = teachers.filter(({ record: t }) => {
    if (t.signupAlerted === true) return false;
    if (!t.createdAt || t.createdAt < ALERT_SINCE) return false;
    if (!t.email || TEST_EMAIL.test(t.email)) return false;
    if (/\+(qa|funnelcheck|enqtest|cronpath)/i.test(t.email)) return false;
    return true;
  });
  let sent = 0;
  for (const { id, record } of fresh.slice(0, 10)) {
    const when = new Date(record.createdAt).toUTCString();
    const r = await send({
      from: FROM,
      to: [OWNER],
      reply_to: record.email,
      subject: `New trial signup — ${record.name} (${record.email})`,
      text: [
        `${record.name} just started the 30-day trial.`,
        '',
        `Email: ${record.email}`,
        `Signed up: ${when}`,
        record.signupRef ? `Source: ${record.signupRef}` : '',
        record.signupReferrer ? `Came from: ${record.signupReferrer}` : '',
        '',
        'Reply to this email to ask what they are teaching this term — a trial that',
        'gets a reply in the first day is the one that turns into a licence.',
        '',
        '— gcse.business signup alert',
      ]
        .filter(Boolean)
        .join('\n'),
    });
    if (r.ok) {
      record.signupAlerted = true;
      record.signupAlertedAt = Date.now();
      await saveRecord('teachers', id, record);
      sent += 1;
      log('signup-alert', id, r.id);
    } else {
      log('signup-alert-failed', id, r.error);
    }
  }
  log('signups', JSON.stringify({ checked: teachers.length, fresh: fresh.length, sent }));
}

/** A trial that ends without a word from anyone is a silent churn. Two short
 *  notes — a week out and the day before — name the price, name the free class
 *  that stays, and ask one question that is easy to answer. */
async function remindTrials() {
  if (!RESEND_KEY) return;
  const now = Date.now();
  const teachers = await listCollection('teachers');
  let sent = 0;
  for (const { id, record: t } of teachers) {
    if (!t.email || TEST_EMAIL.test(t.email)) continue;
    if (t.plan === 'school' || !t.trialEndsAt) continue;
    if (/arnavjain/i.test(t.email) || /okafor@hgs/i.test(t.email)) continue;
    const days = Math.ceil((t.trialEndsAt - now) / DAY);
    if (days < 0) continue;
    const stage = days <= 1 ? 'last' : days <= 7 ? 'week' : null;
    if (!stage) continue;
    const flag = stage === 'week' ? 'trialWeekReminderAt' : 'trialLastReminderAt';
    if (t[flag]) continue;

    const first = String(t.name || '').split(' ')[0] || 'there';
    const subject =
      stage === 'week'
        ? `Your gcse.business trial ends in ${days} day${days === 1 ? '' : 's'}`
        : 'Your gcse.business trial ends tomorrow';
    const r = await send({
      from: FROM,
      to: [t.email],
      reply_to: OWNER,
      subject,
      text: [
        `Hi ${first},`,
        '',
        stage === 'week'
          ? `Your 30-day trial ends on ${new Date(t.trialEndsAt).toDateString()}. Everything you have set keeps working — after that, one class stays free and the £250-a-year school licence covers the rest (every class, every student, every teacher).`
          : `Your trial ends tomorrow. Your classes and results stay exactly as they are, and one class stays free after the trial — the licence adds unlimited classes for the whole school at £250 a year.`,
        '',
        'The licence page, including the DPA and a PO-ready invoice, is here: https://www.gcse.business/upgrade',
        '',
        'One question, so I can be useful rather than noisy: how many classes are you teaching this term? Reply with a number and I will tell you whether the licence is even worth it for you.',
        '',
        '— Arnav, gcse.business',
      ].join('\n'),
    });
    if (r.ok) {
      t[flag] = Date.now();
      await saveRecord('teachers', id, t);
      sent += 1;
      log('trial-reminder', id, stage, days, r.id);
    } else {
      log('trial-reminder-failed', id, stage, r.error);
    }
  }
  log('trial-reminders', JSON.stringify({ checked: teachers.length, sent }));
}

async function listEnquiries() {
  const out = [];
  let pageToken = '';
  for (let page = 0; page < 10; page++) {
    const url = `${FS_DOCS}/enquiries?key=${FS_KEY}&pageSize=100${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`firestore list ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    for (const doc of data.documents || []) {
      const raw = doc.fields?.j?.stringValue;
      if (!raw) continue;
      let record;
      try {
        record = JSON.parse(raw);
      } catch {
        continue;
      }
      const id = doc.name.split('/').pop();
      out.push({ id, record });
    }
    pageToken = data.nextPageToken || '';
    if (!pageToken) break;
  }
  return out;
}

/** Merge the updated fields back into the stored record, in both engines the
 *  app mirrors between, so the owner queue shows the real delivery state. */
async function save(id, record) {
  const body = { fields: { j: { stringValue: JSON.stringify(record) } } };
  const fsUrl = `${FS_DOCS}/enquiries/${id}?key=${FS_KEY}&updateMask.fieldPaths=j`;
  const fs = await fetch(fsUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!fs.ok) log('warn', id, 'firestore patch failed', fs.status);

  const rtdb = await fetch(`${RTDB}/hgs/enquiries/${id}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailed: record.emailed,
      emailId: record.emailId ?? null,
      emailError: record.emailError ?? null,
      ackEmailed: record.ackEmailed ?? false,
      emailAttempts: record.emailAttempts ?? 0,
      ackAttempts: record.ackAttempts ?? 0,
    }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (rtdb && !rtdb.ok) log('warn', id, 'rtdb patch failed', rtdb.status);
}

async function send(payload) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: `${res.status} ${data.name ?? ''} ${data.message ?? ''}`.trim().slice(0, 300) };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: `network: ${e.message}`.slice(0, 300) };
  }
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function ownerPayload(e) {
  return {
    from: FROM,
    to: [OWNER],
    reply_to: e.email,
    subject: `Licence enquiry — ${e.school}`,
    text: [
      `${e.name}${e.role ? ` (${e.role})` : ''}`,
      e.school,
      e.email,
      '',
      e.message || '(no message — the form was sent without a note)',
      '',
      `— sent from gcse.business/upgrade at ${new Date(e.createdAt).toUTCString()}`,
      'Reply to this email to answer the teacher directly.',
    ].join('\n'),
    html: [
      `<p><strong>${esc(e.name)}</strong>${e.role ? ` (${esc(e.role)})` : ''}<br>`,
      `${esc(e.school)}<br>`,
      `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a></p>`,
      `<p>${esc(e.message || '(no message — the form was sent without a note)').replace(/\n/g, '<br>')}</p>`,
      `<p style="color:#666">Sent from gcse.business/upgrade at ${new Date(e.createdAt).toUTCString()}. Reply to this email to answer the teacher directly.</p>`,
    ].join(''),
  };
}

function ackPayload(e) {
  const first = String(e.name || '').split(' ')[0] || 'there';
  return {
    from: FROM,
    to: [e.email],
    reply_to: OWNER,
    subject: 'We have your gcse.business licence request',
    text: [
      `Hi ${first},`,
      '',
      `Thanks — your request for ${e.school} is with me. I reply to every school myself, normally within one working day, from ${OWNER}.`,
      '',
      'In the meantime you can carry on in the free trial: 30 days free, unlimited students, no card. Everything is unlocked — classes, marking, analytics, AI question generation.',
      '',
      'If your head of department or finance team needs the DPA, a quote with a PO number, or a short call, just reply to this email and I will send it over.',
      '',
      'Arnav',
      'gcse.business',
    ].join('\n'),
  };
}

async function main() {
  await alertNewSignups();
  await remindTrials();

  const all = await listEnquiries();
  log('enquiries', all.length);
  if (!RESEND_KEY) {
    log('no RESEND_API_KEY in this environment — nothing sent');
    return;
  }

  let sends = 0;
  let ownerSent = 0;
  let acksSent = 0;

  for (const { id, record } of all) {
    const e = { ...record };
    if (!e.createdAt || now - e.createdAt > MAX_AGE_MS) continue;
    if (!e.email || TEST_EMAIL.test(e.email)) {
      if (e.emailed !== 'sent') {
        e.emailed = 'skipped';
        e.emailError = 'test address — not sent';
        await save(id, e);
      }
      continue;
    }

    if (e.emailed !== 'sent' && (e.emailAttempts ?? 0) < MAX_OWNER_TRIES) {
      if (sends >= MAX_SENDS) break;
      e.emailAttempts = (e.emailAttempts ?? 0) + 1;
      const r = await send(ownerPayload(e));
      sends += 1;
      if (r.ok) {
        e.emailed = 'sent';
        e.emailId = r.id;
        e.emailError = null;
        ownerSent += 1;
        log('owner-copy', id, r.id);
      } else {
        e.emailed = 'failed';
        e.emailError = r.error;
        log('owner-copy-failed', id, r.error);
      }
      await save(id, e);
    }

    if (e.ackEmailed !== true && (e.ackAttempts ?? 0) < MAX_ACK_TRIES && e.email) {
      if (sends >= MAX_SENDS) break;
      e.ackAttempts = (e.ackAttempts ?? 0) + 1;
      const r = await send(ackPayload(e));
      sends += 1;
      e.ackEmailed = r.ok;
      if (r.ok) acksSent += 1;
      log(r.ok ? 'ack' : 'ack-failed', id, r.ok ? r.id : r.error);
      await save(id, e);
    }
  }

  log('done', JSON.stringify({ ownerSent, acksSent }));
}

main().catch((e) => {
  log('fatal', e.message);
  process.exitCode = 1;
});
