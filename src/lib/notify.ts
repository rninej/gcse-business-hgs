// Server-side notification helpers — writes the little bell messages
// students see when work is set for them or they're nudged about it.
//
// Storage is per-student: notifFeed/{studentId}/{notificationId}. A student's
// bell only ever downloads their own feed (~1KB) instead of the whole school's
// notification collection, and the version channel makes the 60-second bell
// poll cost ~200 bytes when nothing changed. Records are ALSO mirrored to the
// legacy flat /notifications collection so an older deployment never breaks.

import { randomUUID } from 'crypto';
import { colCached, fb, flatValues, put, values } from './firebase';
import type { StudentNotification, NotificationKind } from './types';

export interface NewNote {
  kind: NotificationKind;
  title: string;
  body: string;
  assignmentId?: string;
  attemptId?: string;
  fromId?: string;
  /** When set, the record id becomes n_{dedupeKey}_{studentId} instead of a
   *  random one — racing or retried writes land on the SAME record and
   *  replace it rather than duplicating (used by the scheduled go-live flip,
   *  where several students' polls can pass in the same moment). */
  dedupeKey?: string;
}

/** Create one notification per student — writes fly in parallel (each is an
 *  independent RTDB round-trip to Belgium, so batches stay ~one trip long).
 *  Failures are swallowed per-student so a single bad record can't break the
 *  publish/nudge flow. */
export async function notifyStudents(studentIds: string[], note: NewNote): Promise<number> {
  const results = await Promise.allSettled(
    studentIds.map(async (studentId) => {
      const record: StudentNotification = {
        id: note.dedupeKey
          ? `n_${note.dedupeKey}_${studentId}`
          : `n_${randomUUID().replace(/-/g, '').slice(0, 10)}`,
        studentId,
        kind: note.kind,
        title: note.title.slice(0, 90),
        body: note.body.slice(0, 240),
        createdAt: Date.now(),
        readAt: null,
        ...(note.assignmentId ? { assignmentId: note.assignmentId } : {}),
        ...(note.attemptId ? { attemptId: note.attemptId } : {}),
        ...(note.fromId ? { fromId: note.fromId } : {}),
      };
      // per-student feed (the read path) + legacy flat mirror (rollback safety)
      await Promise.all([
        fb.set(`notifFeed/${studentId}/${record.id}`, record),
        put('notifications', record.id, record),
      ]);
    })
  );
  return results.filter((r) => r.status === 'fulfilled').length;
}

/** All notifications for one student, newest first (server-side only). */
export async function notificationsFor(studentId: string): Promise<StudentNotification[]> {
  const feed = await colCached<StudentNotification>(`notifFeed/${studentId}`);
  return values(feed)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 30);
}

/** Mark every unread notification of one student as read — one PATCH with
 *  slash-separated keys (RTDB merges those as server-side paths), so the
 *  record bodies are untouched and it stays a single round-trip. */
export async function markAllRead(studentId: string): Promise<number> {
  const feed = await colCached<StudentNotification>(`notifFeed/${studentId}`);
  const unread = values(feed).filter((n) => !n.readAt);
  if (unread.length === 0) return 0;
  const now = Date.now();
  const patch: Record<string, number> = {};
  for (const n of unread) patch[`${n.id}/readAt`] = now;
  await fb.patch(`notifFeed/${studentId}`, patch);
  return unread.length;
}

/** Students who were already nudged about this assignment by this teacher
 *  within the cooldown window — mapped to WHEN they were nudged, so the
 *  response can say "last nudged 2h ago". Used to stop repeat-spamming. */
export async function recentlyReminded(
  assignmentId: string,
  fromId: string,
  cooldownMs: number
): Promise<Map<string, number>> {
  const nested = await colCached<Record<string, StudentNotification>>('notifFeed');
  const all = flatValues(nested);
  const cutoff = Date.now() - cooldownMs;
  const map = new Map<string, number>();
  for (const n of all) {
    if (n.kind !== 'remind' || n.assignmentId !== assignmentId || n.fromId !== fromId) continue;
    if (n.createdAt < cutoff) continue;
    map.set(n.studentId, Math.max(map.get(n.studentId) ?? 0, n.createdAt));
  }
  return map;
}
