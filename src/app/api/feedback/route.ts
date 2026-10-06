import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { col, del, item, merge, put, values } from '@/lib/firebase';
import { isOwnerUnlocked, requireRole } from '@/lib/session';
import type { FeedbackEntry, Teacher } from '@/lib/types';

/**
 * The teacher needs channel — the product asking teachers what they want,
 * not the other way round.
 *
 *   GET  (teacher) ?state=1       → { onboarded } — whether the one-time
 *                                    questionnaire has been shown/sent
 *   GET  (owner, /debug unlock)   → every entry, newest first
 *   POST (teacher)                → { kind, message, meta?, onboarded? }
 *                                    stores the entry; onboarded=true also
 *                                    sets the teacher's questionnaire flag
 *   PATCH (owner) ?id=            → { seen } mark read
 *   DELETE (owner) ?id=           → remove an entry
 */

const KINDS = ['onboarding', 'feature', 'issue', 'other'] as const;
const MAX_MSG = 2000;

export async function GET(req: Request) {
  const url = new URL(req.url);

  // teacher state check (used by the onboarding prompt on the dashboard)
  if (url.searchParams.get('state') === '1') {
    const session = await requireRole('teacher');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const me = await item<Teacher>('teachers', session.uid);
    return NextResponse.json({ onboarded: Boolean(me?.feedbackOnboarded) });
  }

  // owner inbox (the /debug panel)
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  try {
    const all = values<FeedbackEntry>(await col<FeedbackEntry>('feedback'));
    all.sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ entries: all });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requireRole('teacher');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    kind?: unknown;
    message?: unknown;
    meta?: unknown;
    onboarded?: unknown;
  };
  const kind = KINDS.includes(body.kind as (typeof KINDS)[number])
    ? (body.kind as (typeof KINDS)[number])
    : 'other';
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, MAX_MSG) : '';
  const meta = typeof body.meta === 'string' ? body.meta.slice(0, 1200) : undefined;
  if (message.length < 3 && !meta) {
    return NextResponse.json({ error: 'Tell us a little more than that.' }, { status: 400 });
  }

  const me = await item<Teacher>('teachers', session.uid);
  const entry: FeedbackEntry = {
    id: `fb_${randomUUID().replace(/-/g, '').slice(0, 10)}`,
    teacherId: session.uid,
    teacherName: me?.name ?? session.name ?? 'A teacher',
    kind,
    message: message || '(no comment — questionnaire answers only)',
    meta,
    createdAt: Date.now(),
    seen: false,
  };
  await put('feedback', entry.id, entry);
  // questionnaire submissions stop the prompt from ever nagging again
  if (body.onboarded === true) {
    await merge('teachers', session.uid, { feedbackOnboarded: true });
  }
  return NextResponse.json({ ok: true, id: entry.id });
}

export async function PATCH(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get('id')?.slice(0, 32) ?? '';
  const body = (await req.json().catch(() => ({}))) as { seen?: unknown };
  if (!id || !/^[a-z0-9_]+$/.test(id)) {
    return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  }
  await merge('feedback', id, { seen: body.seen !== false });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get('id')?.slice(0, 32) ?? '';
  if (!id || !/^[a-z0-9_]+$/.test(id)) {
    return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  }
  await del('feedback', id);
  return NextResponse.json({ ok: true });
}
