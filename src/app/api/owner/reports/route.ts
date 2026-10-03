import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { colCached, fb, item, put } from '@/lib/firebase';
import { currentSession, isOwnerUnlocked } from '@/lib/session';
import type { Attempt } from '@/lib/types';

/** Problem reports sent from inside a quiz (the ⋯ menu → "Report a
 *  problem"). Anyone signed in can report; only the unlocked /debug owner
 *  can read and resolve them. Stored tiny — a stem snippet, not the whole
 *  question — so the reports channel stays cheap on Firebase bandwidth. */

export interface ProblemReport {
  id: string;
  at: number;
  byId: string;
  byName: string;
  role: 'teacher' | 'student';
  kind: 'answer' | 'typo' | 'unclear' | 'unfair' | 'other';
  message: string;
  /** context (optional — filled in when reported from inside a quiz) */
  attemptId?: string;
  quizTitle?: string;
  qNumber?: number;
  qid?: string;
  topic?: string;
  stemSnippet?: string;
}

const KINDS = new Set(['answer', 'typo', 'unclear', 'unfair', 'other']);

/** POST — submit a report (any signed-in user). */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    kind?: unknown;
    message?: unknown;
    attemptId?: unknown;
    qid?: unknown;
  };
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 800) : '';
  const kind = typeof body.kind === 'string' && KINDS.has(body.kind) ? body.kind : 'other';
  if (message.length < 3) {
    return NextResponse.json({ error: 'Tell us a little more — at least a few words.' }, { status: 400 });
  }

  const report: ProblemReport = {
    id: `rp_${randomUUID().replace(/-/g, '').slice(0, 10)}`,
    at: Date.now(),
    byId: session.uid,
    byName: session.name,
    role: session.role,
    kind: kind as ProblemReport['kind'],
    message,
  };

  // enrich with quiz context when reported mid-quiz (subpath read, ~KBs)
  if (typeof body.attemptId === 'string' && body.attemptId.length < 40) {
    const attempt = await item<Attempt>('attempts', body.attemptId);
    if (attempt && attempt.studentId === session.uid) {
      report.attemptId = attempt.id;
      report.quizTitle = attempt.assignmentTitle.slice(0, 90);
      const qid = typeof body.qid === 'string' ? body.qid : undefined;
      const qi = qid ? attempt.questions.findIndex((q) => q.id === qid) : -1;
      if (qi >= 0) {
        const q = attempt.questions[qi];
        report.qid = q.id;
        report.qNumber = qi + 1;
        report.topic = q.topic;
        report.stemSnippet = q.stem.slice(0, 200);
      }
    }
  }

  await put('reports', report.id, report as unknown as Record<string, unknown>);
  return NextResponse.json({ ok: true });
}

/** GET — list reports (owner only, newest first). */
export async function GET() {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Locked' }, { status: 401 });
  }
  const all = await colCached<ProblemReport>('reports', 15_000);
  const list = Object.values(all).filter(Boolean).sort((a, b) => b.at - a.at).slice(0, 100);
  return NextResponse.json({ reports: list });
}

/** DELETE ?id= — resolve a report (owner only). */
export async function DELETE(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Locked' }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !/^rp_[a-z0-9]{4,20}$/.test(id)) {
    return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  }
  await fb.remove(`reports/${id}`);
  return NextResponse.json({ ok: true });
}
