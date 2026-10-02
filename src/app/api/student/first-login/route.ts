import { NextResponse } from 'next/server';
import { item, merge } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import type { Student } from '@/lib/types';

/**
 * Dismiss the one-time first-login password popup (or confirm it was used).
 * Called the first time a brand-new student account reaches its dashboard —
 * after this the popup never shows again.
 */
export async function POST() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const me = await item<Student>('students', session.uid);
  if (!me) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  await merge('students', session.uid, { firstLoginDone: true });
  return NextResponse.json({ ok: true });
}
