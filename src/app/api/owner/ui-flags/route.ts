import { NextResponse } from 'next/server';
import { fb } from '@/lib/firebase';
import { isOwnerUnlocked } from '@/lib/session';

/** /debug interface flags — server-side presentation switches the owner can
 *  flip for everyone (the fallback/undo panel). Stored at meta/uiFlags,
 *  dual-written to both engines like every other record. Clients receive
 *  them with quiz data and fall back to built-in defaults when absent. */

interface UiFlags {
  /** how a case study is presented on desktop: 'drawer' (new — slide-over
   *  reading panel) or 'side' (classic sticky column next to the question) */
  caseLayout?: 'drawer' | 'side';
}

async function readFlags(): Promise<UiFlags> {
  const v = await fb.get<UiFlags>('meta/uiFlags');
  return v ?? {};
}

export async function GET() {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  try {
    return NextResponse.json(await readFlags());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isOwnerUnlocked())) {
    return NextResponse.json({ error: 'Owner unlock required.' }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { caseLayout?: unknown };
  const flags: UiFlags = {};
  if (body.caseLayout !== undefined) {
    if (body.caseLayout !== 'drawer' && body.caseLayout !== 'side') {
      return NextResponse.json({ error: 'caseLayout must be "drawer" or "side".' }, { status: 400 });
    }
    flags.caseLayout = body.caseLayout;
  }
  try {
    await fb.patch('meta/uiFlags', flags);
    return NextResponse.json({ ok: true, ...(await readFlags()) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
