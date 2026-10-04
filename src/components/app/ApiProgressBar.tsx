'use client';

// The global "something is happening" strip. Any in-flight API request (see
// lib/api.ts's in-flight store) slides a slim indeterminate bar along the very
// top of the viewport — every button that talks to the server visibly reacts
// the instant it is pressed, even before per-button spinners kick in. The
// linger logic (no flicker on quick bursts) lives in the store itself.

import { useSyncExternalStore } from 'react';
import { apiBarVisible, subscribeApiBusy } from '@/lib/api';

function getServerSnapshot(): boolean {
  return false; // nothing in flight during SSR
}

export function ApiProgressBar() {
  const visible = useSyncExternalStore(subscribeApiBusy, apiBarVisible, getServerSnapshot);
  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[80] h-[3px] overflow-hidden print:hidden motion-reduce:hidden"
      role="progressbar"
      aria-label="Working"
    >
      <div className="api-bar-inner h-full w-1/3 rounded-full bg-primary shadow-[0_0_10px_rgb(16_185_129/0.55)]" />
    </div>
  );
}
