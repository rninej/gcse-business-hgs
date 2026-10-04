import { NextResponse } from 'next/server';
import { fb } from '@/lib/firebase';
import { isOwnerUnlocked } from '@/lib/session';

/** /debug interface flags — server-side presentation switches the owner can
 *  flip for everyone (the fallback/undo panel). Stored at meta/uiFlags,
 *  dual-written to both engines like every other record. Clients receive
 *  them with quiz data and fall back to built-in defaults when absent.
 *  PUTs are merged field-by-field (read → merge → write), so flipping one
 *  switch never disturbs the others. */

export interface UiFlags {
  /** how a case study is presented on desktop: 'drawer' (new — slide-over
   *  reading panel) or 'side' (classic sticky column next to the question) */
  caseLayout?: 'drawer' | 'side';
  /** the DEFAULT quiz background on phones: 'nature' (the fetched forest
   *  photographs) or 'doodles' (the original hand-drawn business doodles).
   *  Students can still override it per browser from the ⋯ menu in a quiz. */
  quizBackdropMobile?: 'nature' | 'doodles';
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
  const body = (await req.json().catch(() => ({}))) as {
    caseLayout?: unknown;
    quizBackdropMobile?: unknown;
  };
  const incoming: UiFlags = {};
  if (body.caseLayout !== undefined) {
    if (body.caseLayout !== 'drawer' && body.caseLayout !== 'side') {
      return NextResponse.json({ error: 'caseLayout must be "drawer" or "side".' }, { status: 400 });
    }
    incoming.caseLayout = body.caseLayout;
  }
  if (body.quizBackdropMobile !== undefined) {
    if (body.quizBackdropMobile !== 'nature' && body.quizBackdropMobile !== 'doodles') {
      return NextResponse.json({ error: 'quizBackdropMobile must be "nature" or "doodles".' }, { status: 400 });
    }
    incoming.quizBackdropMobile = body.quizBackdropMobile;
  }
  if (Object.keys(incoming).length === 0) {
    return NextResponse.json({ error: 'Nothing to set.' }, { status: 400 });
  }
  try {
    // merge with whatever is already stored so each switch is independent
    const merged: UiFlags = { ...(await readFlags()), ...incoming };
    await fb.patch('meta/uiFlags', merged);
    return NextResponse.json({ ok: true, ...(await readFlags()) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
