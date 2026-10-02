import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { markAllRead, notificationsFor } from '@/lib/notify';

/** GET — the signed-in student's bell feed (newest first, last 30) + unread
 *  count. Their OWN feed only — a ~1KB read. The short browser cache lets the
 *  two mounted bell variants (mobile icon + desktop row) share one response
 *  instead of firing identical requests on load. */
export async function GET() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await notificationsFor(session.uid);
  const unread = notifications.filter((n) => !n.readAt).length;
  return NextResponse.json(
    { notifications, unread },
    { headers: { 'Cache-Control': 'private, max-age=30' } }
  );
}

/** POST — mark every unread notification as read (fires when the bell panel opens). */
export async function POST() {
  const session = await requireRole('student');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const marked = await markAllRead(session.uid);
  return NextResponse.json({ ok: true, marked });
}
