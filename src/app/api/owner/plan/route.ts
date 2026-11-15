import { NextResponse } from 'next/server';
import { colCached, put } from '@/lib/firebase';
import { isOwnerUnlocked } from '@/lib/session';
import type { Teacher } from '@/lib/types';

/** Owner-only switch for the paid licence.
 *
 *  This is the single manual step after an invoice is paid: the owner unlocks
 *  /debug in a browser, or runs one authenticated request, and the teacher's
 *  account becomes 'school'. No payment provider is involved anywhere, so
 *  there is nothing to invent — this endpoint IS the fulfilment step. */

async function teachers(): Promise<Teacher[]> {
  const all = await colCached<Teacher>('teachers');
  return Object.values(all).sort((a, b) => b.createdAt - a.createdAt);
}

export async function GET() {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const rows = (await teachers()).map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    plan: t.plan === 'school' ? 'school' : 'free',
    createdAt: t.createdAt,
    planSetAt: t.planSetAt ?? null,
    planNote: t.planNote ?? null,
  }));
  return NextResponse.json({ teachers: rows });
}

export async function POST(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    email?: unknown;
    plan?: unknown;
    note?: unknown;
  };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const plan = body.plan === 'school' || body.plan === 'free' ? body.plan : null;
  if (!email || !plan) {
    return NextResponse.json({ error: 'email and plan ("school" or "free") are required.' }, { status: 400 });
  }

  const found = (await teachers()).find((t) => t.email === email);
  if (!found) return NextResponse.json({ error: 'No teacher with that email.' }, { status: 404 });

  const updated: Teacher = {
    ...found,
    plan,
    planSetAt: Date.now(),
    ...(typeof body.note === 'string' && body.note.trim() ? { planNote: body.note.trim() } : {}),
  };
  await put('teachers', found.id, updated);
  return NextResponse.json({ ok: true, email, plan });
}
