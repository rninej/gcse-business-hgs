import { NextResponse } from 'next/server';
import { fb, item } from '@/lib/firebase';
import { currentSession } from '@/lib/session';

/**
 * The signed-in user's own avatar. Avatars live in their own Firebase
 * collection (`avatars/{uid}` = { img }) so the hot `students`/`teachers`
 * collections stay small — only the leaderboard, profile pages and this
 * route ever read them.
 *
 * `img` is either a tiny client-processed data URL (a 128×128 JPEG, a few
 * KB — the browser crops and shrinks the photo before it is sent) or an
 * "emoji:🦊" pick. null removes the avatar (back to themed initials).
 */

const MAX_IMG_CHARS = 150_000; // ~110 KB decoded; a 128px JPEG is a few KB
const DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

function isValidAvatar(v: unknown): v is string {
  if (typeof v !== 'string' || v.length === 0) return false;
  if (v.startsWith('emoji:')) {
    const e = v.slice(6);
    return [...e].length === 1 && /\p{Extended_Pictographic}/u.test(e);
  }
  return v.length <= MAX_IMG_CHARS && DATA_URL_RE.test(v);
}

export async function GET() {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rec = await item<{ img?: string }>('avatars', session.uid);
  return NextResponse.json({ avatar: rec?.img ?? null });
}

export async function PATCH(req: Request) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { avatar?: unknown };
  try {
    body = (await req.json()) as { avatar?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (body.avatar === null) {
    await fb.remove(`avatars/${session.uid}`);
    return NextResponse.json({ avatar: null });
  }
  if (!isValidAvatar(body.avatar)) {
    return NextResponse.json(
      { error: 'That avatar will not work — upload a JPG/PNG/WebP picture or pick an emoji.' },
      { status: 400 }
    );
  }
  const img = body.avatar as string;
  await fb.set(`avatars/${session.uid}`, { img });
  return NextResponse.json({ avatar: img });
}
