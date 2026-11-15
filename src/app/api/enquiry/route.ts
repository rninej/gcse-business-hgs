import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { colCached, del, put, values } from '@/lib/firebase';
import { isOwnerUnlocked } from '@/lib/session';
import type { Enquiry } from '@/lib/types';

/**
 * The buy path, without a mail client.
 *
 * A teacher on a school device often cannot click a mailto: link — the handler
 * is blocked by policy — so the enquiry has to be submittable on the page
 * itself. Every submission is stored, which means it cannot be silently lost
 * even when the owner is asleep.
 *
 * If RESEND_API_KEY is set the entry is also emailed to CONTACT_EMAIL straight
 * away; without it the entry still lands in the owner's queue at /debug, so the
 * copy on /upgrade promises a reply rather than an instant email.
 */

const RATE = new Map<string, { count: number; at: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

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

  // Optional straight-to-inbox delivery. Absent a key the entry is still stored.
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'gcse.business <onboarding@resend.dev>',
          to: [process.env.CONTACT_EMAIL ?? 'arnavjain1009@gmail.com'],
          reply_to: email,
          subject: `Licence enquiry — ${school}`,
          text: `${name}${role ? ` (${role})` : ''}\n${school}\n${email}\n\n${message || '(no message)'}\n\n— sent from gcse.business/upgrade`,
        }),
      });
    } catch {
      // storage already succeeded; the owner still sees the entry
    }
  }

  return NextResponse.json({ ok: true, id: entry.id });
}

export async function GET() {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const all = values<Enquiry>(await colCached<Enquiry>('enquiries', 5_000));
  all.sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ enquiries: all });
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
