'use client';

// One-time "install the app" prompt for phones.
// - Chrome/Android (and anything else that supports it) fires
//   beforeinstallprompt → we show a glass card whose Install button opens the
//   native install dialog.
// - iOS Safari never fires it → the same card teaches Share → Add to Home
//   Screen instead.
// - Desktop never sees it; already-installed browsers never see it; and the
//   card is shown AT MOST ONCE per browser (localStorage flag set the moment
//   it appears), so a student who dismisses it is never nagged again.

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Share, PlusSquare, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandMark } from './Brand';

const FLAG = 'hgs.pwa.prompted';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'native' | 'ios' | null>(null);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);
  const shown = useRef(false);
  const autoHide = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let disposed = false;

    // already running as an installed app → never show
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    // already asked once (this browser) → never show again.
    // null = never asked; '' = storage blocked (show rather than never).
    let asked: string | null = null;
    try {
      asked = localStorage.getItem(FLAG);
    } catch {
      asked = null; // storage blocked — rather show once too often than never
    }
    if (standalone || asked === '1') return;

    // mobile detection — phones only (coarse pointer or mobile UA)
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const phoneUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (!(coarse || phoneUA)) return;

    // iOS (incl. iPadOS masquerading as macOS Safari)
    const ua = navigator.userAgent;
    const isIOS =
      (/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred.current = e as BeforeInstallPromptEvent;
    };
    const onInstalled = () => setOpen(false);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    const markAsked = () => {
      try {
        localStorage.setItem(FLAG, '1');
      } catch {
        /* private mode — nothing we can persist */
      }
    };

    // decide when to show — give beforeinstallprompt a moment to arrive first
    const check = () => {
      if (disposed || shown.current) return;
      if (isIOS) {
        setMode('ios');
      } else if (deferred.current) {
        setMode('native');
      } else {
        return; // no native prompt available — stay quiet
      }
      shown.current = true;
      markAsked();
      setOpen(true);
      // polite auto-dismiss — the flag is already set, so a student who
      // doesn't react is never bothered by it again
      autoHide.current = window.setTimeout(() => setOpen(false), 25000);
    };
    const t1 = window.setTimeout(check, 3200);
    const t2 = window.setTimeout(check, 9000); // late-arriving prompt gets one more chance

    return () => {
      disposed = true;
      clearTimeout(t1);
      clearTimeout(t2);
      if (autoHide.current) clearTimeout(autoHide.current);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    const ev = deferred.current;
    if (ev) {
      try {
        await ev.prompt();
        await ev.userChoice; // accepted or dismissed — either way we're done
      } catch {
        /* browser refused — closing the card is the best we can do */
      }
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && mode ? (
        <motion.div
          key="install-card"
          data-install-card=""
          role="dialog"
          aria-label="Install gcsebusiness"
          initial={{ opacity: 0, y: 96, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 48, scale: 0.97, transition: { duration: 0.22, ease: 'easeIn' } }}
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          className="fixed z-[70] inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+84px)] md:bottom-8 mx-auto w-auto max-w-md rounded-2xl border border-white/60 bg-card/90 backdrop-blur-2xl backdrop-saturate-150 p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.65),0_32px_80px_-20px_rgb(13_92_70/0.45)]"
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="rounded-xl bg-white/60 ring-1 ring-white/70 p-1 shrink-0 shadow-sm">
              <BrandMark className="h-11 w-11" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[15px] leading-tight">Install gcsebusiness</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed mt-1">
                {mode === 'native'
                  ? 'Put it on your home screen — it opens straight to your homework, full screen.'
                  : 'Add it to your home screen — it opens straight to your homework, full screen.'}
              </p>
            </div>
          </div>

          {mode === 'ios' ? (
            <ol className="mt-4 space-y-2.5 text-[13px]">
              {[
                [<Share key="s" className="h-4 w-4 shrink-0 mt-0.5 text-primary" />, 'In Safari, tap the Share button in the toolbar.'],
                [<PlusSquare key="p" className="h-4 w-4 shrink-0 mt-0.5 text-primary" />, 'Scroll down and choose “Add to Home Screen”.'],
                [<Smartphone key="m" className="h-4 w-4 shrink-0 mt-0.5 text-primary" />, 'Launch it from your home screen any time.'],
              ].map(([icon, text], i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 font-bold text-[11px] text-primary" aria-hidden>
                    {i + 1}
                  </span>
                  <span className="flex gap-2 items-start">
                    {icon}
                    <span className="leading-relaxed">{text as string}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="mt-4 flex gap-2">
            {mode === 'native' ? (
              <>
                <Button className="flex-1 h-10" onClick={() => void install()}>
                  Install
                </Button>
                <Button variant="ghost" className="h-10 px-4" onClick={() => setOpen(false)}>
                  Not now
                </Button>
              </>
            ) : (
              <Button className="w-full h-10" onClick={() => setOpen(false)}>
                Got it
              </Button>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
