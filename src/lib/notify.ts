// Server-side notification helpers — writes the little bell messages
// students see when work is set for them or they're nudged about it.
// Records live in Firebase under /hgs/notifications keyed by id.

import { randomUUID } from 'crypto';
import { colCached, put, values } from './firebase';
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
      await put('notifications', record.id, record);
    })
  );
  return results.filter((r) => r.status === 'fulfilled').length;
}

/** All notifications for one student, newest first (server-side only). */
export async function notificationsFor(studentId: string): Promise<StudentNotification[]> {
  const all = values(await colCached<StudentNotification>('notifications'));
  return all
    .filter((n) => n.studentId === studentId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 30);
}

/** Students who were already nudged about this assignment by this teacher
 *  within the cooldown window — mapped to WHEN they were nudged, so the
 *  response can say "last nudged 2h ago". Used to stop repeat-spamming. */
export async function recentlyReminded(
  assignmentId: string,
  fromId: string,
  cooldownMs: number
): Promise<Map<string, number>> {
  const all = values(await colCached<StudentNotification>('notifications'));
  const cutoff = Date.now() - cooldownMs;
  const map = new Map<string, number>();
  for (const n of all) {
    if (n.kind !== 'remind' || n.assignmentId !== assignmentId || n.fromId !== fromId) continue;
    if (n.createdAt < cutoff) continue;
    map.set(n.studentId, Math.max(map.get(n.studentId) ?? 0, n.createdAt));
  }
  return map;
}
