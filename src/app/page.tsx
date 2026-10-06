import { currentSession } from '@/lib/session';
import { HomeApp } from '@/components/app/HomeApp';

// The session cookie is read on the server, so the first paint already knows
// who is logged in — no boot splash, no /api/auth/me round-trip. Deep links
// (/?quiz=<attemptId> from a teacher's self-test tab, /?result=<id>) are read
// here too, so the server itself paints the quiz — no dashboard flash in the
// new tab, and no dependence on post-hydration store propagation.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([currentSession(), searchParams]);
  const one = (k: string): string | null => {
    const v = params?.[k];
    if (typeof v === 'string' && v) return v;
    if (Array.isArray(v) && typeof v[0] === 'string' && v[0]) return v[0];
    return null;
  };
  return <HomeApp initialSession={session} deepQuiz={one('quiz')} deepResult={one('result')} />;
}
