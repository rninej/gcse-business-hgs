'use client';

// Light/dark mode switch. The choice is per-browser (localStorage 'hgs.theme')
// and defaults to the device's colour scheme on first visit. A tiny inline
// script in the root layout applies the class before first paint, so there is
// never a flash of the wrong theme.

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const THEME_KEY = 'hgs.theme';

/* ---- tiny external store (document class + localStorage) ---- */

const listeners = new Set<() => void>();

export function subscribeTheme(cb: () => void): () => void {
  listeners.add(cb);
  // another tab flipped the theme
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) listeners.forEach((l) => l());
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export function getThemeSnapshot(): boolean {
  return document.documentElement.classList.contains('dark');
}

export function getThemeServerSnapshot(): boolean {
  return false; // the pre-paint script corrects this before hydration
}

export function applyTheme(dark: boolean): void {
  const el = document.documentElement;
  el.classList.toggle('dark', dark);
  el.style.colorScheme = dark ? 'dark' : 'light';
  try {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  } catch {
    /* private mode — this session only */
  }
  listeners.forEach((l) => l());
}

export function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'row' }) {
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  function flip() {
    applyTheme(!dark);
  }

  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={flip}
        aria-label={label}
        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-left text-muted-foreground hover:text-foreground hover:bg-[var(--sidebar-accent)]/70 transition-colors"
      >
        <span className="relative h-[17px] w-[17px]">
          <Sun className={cn('absolute inset-0 h-[17px] w-[17px] transition-all duration-300', dark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0')} aria-hidden />
          <Moon className={cn('absolute inset-0 h-[17px] w-[17px] transition-all duration-300', dark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100')} aria-hidden />
        </span>
        <span>{dark ? 'Light mode' : 'Dark mode'}</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={flip}
      aria-label={label}
      className="relative h-9 w-9"
    >
      <Sun className={cn('absolute h-[18px] w-[18px] transition-all duration-300', dark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0')} aria-hidden />
      <Moon className={cn('absolute h-[18px] w-[18px] transition-all duration-300', dark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100')} aria-hidden />
    </Button>
  );
}
