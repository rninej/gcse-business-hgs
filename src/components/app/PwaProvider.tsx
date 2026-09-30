'use client';

// Registers the service worker once the page has fully loaded. The SW is
// network-first, so registering in dev is harmless (HMR never breaks) and in
// production it gives the installed PWA an offline shell.
import { useEffect } from 'react';

export function PwaProvider({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    };
    if (document.readyState === 'complete') {
      register();
      return;
    }
    window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);

  return <>{children}</>;
}
