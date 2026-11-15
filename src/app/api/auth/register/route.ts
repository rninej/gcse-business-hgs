import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { colCached, put, values } from '@/lib/firebase';
import { hashPassword } from '@/lib/passwords';
import { trialEndFrom } from '@/lib/plan';
import { setSessionCookie } from '@/lib/session';
import type { SessionInfo, Teacher } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      ref?: string;
      referrer?: string;
    };
    const name = (body.name ?? '').toString().trim();
    const email = (body.email ?? '').toString().trim().toLowerCase();
    const password = (body.password ?? '').toString();

    if (name.length < 2 || name.length > 60) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const teachers = await colCached<Teacher>('teachers');
    const clash = values(teachers).some((t) => t.email === email);
    if (clash) {
      return NextResponse.json({ error: 'An account with this email already exists. Try logging in.' }, { status: 409 });
    }

    const id = `t_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const teacher: Teacher = {
      id,
      name,
      email,
      pw: hashPassword(password),
      createdAt: Date.now(),
      // 30 days of the full product, no card. When it ends the account keeps
      // one class for free rather than losing the work.
      trialEndsAt: trialEndFrom(),
      // first-touch source, so a published listing can be judged on trials
      signupRef: (body.ref ?? '').toString().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 32) || undefined,
      signupReferrer: (body.referrer ?? '').toString().slice(0, 200) || undefined,
    };
    await put('teachers', id, teacher);
    const session: SessionInfo = { uid: id, role: 'teacher', name, sub: email };
    await setSessionCookie(session);
    return NextResponse.json({ ok: true, session });
  } catch {
    return NextResponse.json({ error: 'Could not create account. Please try again.' }, { status: 500 });
  }
}
