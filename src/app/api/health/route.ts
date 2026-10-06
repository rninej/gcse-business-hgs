import { NextResponse } from 'next/server';
import { fb } from '@/lib/firebase';

/** Build marker — bumped every deploy round so the production rollout can be
 *  verified from outside (Vercel serves the old build until it's live). */
const BUILD = 'r37';

export async function GET() {
  try {
    await fb.get('meta/heartbeat');
    return NextResponse.json({ ok: true, db: 'connected', build: BUILD, ts: Date.now() });
  } catch {
    return NextResponse.json({ ok: false, db: 'unreachable', build: BUILD }, { status: 503 });
  }
}
