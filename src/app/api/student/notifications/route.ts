import { NextResponse } from 'next/server';
import { colCached, merge, values } from '@/lib/firebase';
import { requireRole } from '@/lib/session';
import { notificationsFor } from '@/lib/notify';
import type { StudentNotification } from '@/lib/types';

/** GET — the signed-in student's bell feed (newest first, last 30) + unread count. */
export async function GET() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await notificationsFor(session.uid);
  const unread = notifications.filter((n) => !n.readAt).length;
  return NextResponse.json({ notifications, unread });
}

/** POST — mark every unread notification as read (fires when the bell panel opens). */
export async function POST() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const all = values(await colCached<StudentNotification>('notifications'));
  const mine = all.filter((n) => n.studentId === session.uid && !n.readAt);
  const now = Date.now();
  await Promise.all(mine.map((n) => merge('notifications', n.id, { readAt: now })));
  return NextResponse.json({ ok: true, marked: mine.length });
}
