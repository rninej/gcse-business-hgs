'use client';

// Records a page view once per page per session. Deliberately tiny: no cookies
// of its own beyond the session marker, no third party, no personal data — just
// path + source so a published link can be shown to produce traffic.

import { useEffect } from 'react';
import { captureFirstTouch } from '@/lib/attribution';

export function TrafficBeacon() {
  useEffect(() => {
    const ref = captureFirstTouch();
    try {
      const key = `hgs.seen:${window.location.pathname}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: window.location.pathname, ref }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  return null;
}
