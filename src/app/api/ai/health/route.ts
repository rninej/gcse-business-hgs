import { NextResponse } from 'next/server';
import { healthSnapshot, maybeProbe } from '@/lib/aiHealth';

/** Public, fire-and-forget: each site visit refreshes the shared model-health
 *  snapshot in the background (at most every few minutes) so AI requests
 *  always prefer models with quota left on each provider. The browser cache
 *  keeps multiple mounts (shell + home) from re-firing the same check. */
export async function GET() {
  void maybeProbe(); // never blocks the response
  const snap = await healthSnapshot();
  return NextResponse.json(snap, {
    headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=60' },
  });
}
