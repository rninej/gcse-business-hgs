import { currentSession } from '@/lib/session';
import { HomeApp } from '@/components/app/HomeApp';

// The session cookie is read on the server, so the first paint already knows
// who is logged in — no boot splash, no /api/auth/me round-trip.
export default async function Page() {
  const session = await currentSession();
  return <HomeApp initialSession={session} />;
}
