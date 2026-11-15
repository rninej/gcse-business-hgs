import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { colCached, del, put, values } from '@/lib/firebase';
import { isOwnerUnlocked } from '@/lib/session';
import { CONTACT_EMAIL } from '@/lib/pricing';
import type { Enquiry } from '@/lib/types';

/**
 * The buy path, without a mail client.
 *
 * A teacher on a school device often cannot click a mailto: link — the handler
 * is blocked by policy — so the enquiry has to be submittable on the page
 * itself. Every submission is stored, which means it cannot be silently lost
 * even when the owner is asleep.
 *
 * Delivery: with RESEND_API_KEY set the entry is emailed to CONTACT_EMAIL from
 * enquiries@gcse.business (the domain is verified in Resend) with the teacher as
 * Reply-To, and the teacher gets a short acknowledgement so they know it landed.
 * The outcome is stored on the entry — `emailed: sent | failed | skipped` plus
 * the provider id or the error — so a silent mail failure is visible to the
 * owner at /debug instead of disappearing.
 */

const RATE = new Map<string, { count: number; at: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const FROM = 'gcse.business <enquiries@gcse.business>';

function tooMany(ip: string): boolean {
  const now = Date.now();
  const hit = RATE.get(ip);
  if (!hit || now - hit.at > WINDOW_MS) {
    RATE.set(ip, { count: 1, at: now });
    return false;
  }
  hit.count += 1;
  return hit.count > MAX_PER_WINDOW;
}

function isEmail(value: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

type SendResult = { ok: true; id?: string } | { ok: false; error: string };

async function send(key: string, payload: Record<string, unknown>): Promise<SendResult> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
    if (!res.ok) {
      return { ok: false, error: `${res.status} ${data.name ?? ''} ${data.message ?? ''}`.trim().slice(0, 300) };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: `network: ${(e as Error).message}`.slice(0, 300) };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  if (tooMany(ip)) {
    return NextResponse.json({ error: 'Too many enquiries from this connection. Try again later.' }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (k: string, max: number) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, max) : '');
  const name = str('name', 80);
  const school = str('school', 120);
  const email = str('email', 160).toLowerCase();
  const role = str('role', 80);
  const message = str('message', 1500);

  if (name.length < 2) return NextResponse.json({ error: 'Please add your name.' }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: 'Please add an email address we can reply to.' }, { status: 400 });
  if (school.length < 2) return NextResponse.json({ error: 'Please add the school name.' }, { status: 400 });

  const entry: Enquiry = {
    id: `enq_${randomUUID().replace(/-/g, '').slice(0, 10)}`,
    name,
    school,
    email,
    role: role || undefined,
    message: message || undefined,
    createdAt: Date.now(),
    seen: false,
  };
  await put('enquiries', entry.id, entry);

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    entry.emailed = 'skipped';
    await put('enquiries', entry.id, entry);
    return NextResponse.json({ ok: true, id: entry.id, delivered: false });
  }

  // 1. To the owner, with the teacher as Reply-To so a plain "Reply" reaches them.
  const owner = await send(key, {
    from: FROM,
    to: [CONTACT_EMAIL],
    reply_to: email,
    subject: `Licence enquiry — ${school}`,
    text: [
      `${name}${role ? ` (${role})` : ''}`,
      school,
      email,
      '',
      message || '(no message — the form was sent without a note)',
      '',
      '— sent from gcse.business/upgrade · reply to this email to answer the teacher',
    ].join('\n'),
    html: [
      `<p><strong>${escapeHtml(name)}</strong>${role ? ` (${escapeHtml(role)})` : ''}<br>`,
      `${escapeHtml(school)}<br>`,
      `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>`,
      `<p>${escapeHtml(message || '(no message — the form was sent without a note)').replace(/\n/g, '<br>')}</p>`,
      `<p style="color:#666">Sent from gcse.business/upgrade at ${new Date().toUTCString()}. Reply to this email to answer the teacher directly.</p>`,
    ].join(''),
  });

  entry.emailed = owner.ok ? 'sent' : 'failed';
  if (owner.ok) entry.emailId = owner.id;
  else entry.emailError = owner.error;

  // 2. A short acknowledgement, so the teacher is not left wondering whether the
  //    form worked. Failures here never affect the owner's copy.
  const ack = await send(key, {
    from: FROM,
    to: [email],
    reply_to: CONTACT_EMAIL,
    subject: 'We have your gcse.business licence request',
    text: [
      `Hi ${name.split(' ')[0] || 'there'},`,
      '',
      `Thanks — your request for ${school} is with me. I reply to every school myself, normally within one working day, from ${CONTACT_EMAIL}.`,
      '',
      'In the meantime you can carry on in the free trial: 30 days free, unlimited students, no card. Everything is unlocked — classes, marking, analytics, AI question generation.',
      '',
      'If your head of department or finance team needs the DPA, a quote with a PO number, or a short call, just reply to this email and I will send it over.',
      '',
      'Arnav',
      'gcse.business',
    ].join('\n'),
  });
  entry.ackEmailed = ack.ok;

  await put('enquiries', entry.id, entry);

  return NextResponse.json({
    ok: true,
    id: entry.id,
    delivered: owner.ok,
    acknowledged: ack.ok,
    ...(owner.ok ? {} : { note: 'Your request was saved; the email copy could not be sent.' }),
  });
}

export async function GET() {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const all = values<Enquiry>(await colCached<Enquiry>('enquiries', 5_000));
  all.sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ enquiries: all });
}

/** Owner-only: mark a request as read. */
export async function PATCH(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get('id')?.slice(0, 32) ?? '';
  if (!/^enq_[a-z0-9]+$/.test(id)) {
    return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  }
  const body = (await req.json().catch(() => ({}))) as { seen?: unknown };
  const entry = values<Enquiry>(await colCached<Enquiry>('enquiries', 0)).find((e) => e.id === id);
  if (!entry) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  await put('enquiries', id, { ...entry, seen: body.seen === true });
  return NextResponse.json({ ok: true });
}

/** Owner-only removal, for clearing a test submission. */
export async function DELETE(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get('id')?.slice(0, 32) ?? '';
  if (!/^enq_[a-z0-9]+$/.test(id)) {
    return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  }
  await del('enquiries', id);
  return NextResponse.json({ ok: true });
}
