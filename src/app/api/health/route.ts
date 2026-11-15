import { NextResponse } from 'next/server';
import { fb } from '@/lib/firebase';

/** Build marker — bumped every deploy round so the production rollout can be
 *  verified from outside (Vercel serves the old build until it's live). */
const BUILD = 'r47';

export async function GET() {
  try {
    await fb.get('meta/heartbeat');
    return NextResponse.json({
      ok: true,
      db: 'connected',
      build: BUILD,
      // Whether this deployment can actually send mail — the enquiry route needs
      // RESEND_API_KEY; a boolean here is the only safe way to see that from outside.
      email: process.env.RESEND_API_KEY ? 'resend' : 'none',
      contact: process.env.CONTACT_EMAIL || 'arnavjain@gcse.business',
      ts: Date.now(),
    });
  } catch {
    return NextResponse.json({ ok: false, db: 'unreachable', build: BUILD }, { status: 503 });
  }
}
