import { NextResponse } from 'next/server';
import { fb } from '@/lib/firebase';

export async function GET() {
  try {
    await fb.get('meta/heartbeat');
    return NextResponse.json({ ok: true, db: 'connected', ts: Date.now() });
  } catch {
    return NextResponse.json({ ok: false, db: 'unreachable' }, { status: 503 });
  }
}
