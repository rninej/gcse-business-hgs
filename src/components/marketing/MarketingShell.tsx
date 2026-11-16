// Shared chrome for every public marketing page (demo, pricing, topics, legal).
// Server component — no client state here on purpose.

import Link from 'next/link';
import type { ReactNode } from 'react';
import { CONTACT_EMAIL } from '@/lib/pricing';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { TrafficBeacon } from '@/components/marketing/TrafficBeacon';

// `always` keeps a link visible on phones; the rest are hidden below sm so the
// header stays one row now that the theme toggle shares the space. Pricing is
// still reachable from every page footer.
// A teacher arriving from a search result lands on Topics or a calculator, not
// on the offer — so the offer travels with them in the header.
const NAV = [
  { href: '/free', label: 'Free trial', always: true },
  { href: '/demo', label: 'Try a quiz', always: true },
  { href: '/topics', label: 'Topics' },
  { href: '/tools', label: 'Calculators' },
  { href: '/pricing', label: 'Pricing' },
];

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TrafficBeacon />
      <header className="border-b border-white/40 bg-background/60 backdrop-blur-xl backdrop-saturate-150">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 min-h-16 py-2.5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-baseline gap-2 group">
            <span className="text-lg font-bold tracking-tight">
              gcse<span className="text-primary">business</span>
            </span>
            <span className="hidden sm:inline text-[11px] uppercase tracking-widest text-muted-foreground">
              Edexcel 1BS0
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors ${n.always ? '' : 'hidden sm:inline-block'}`}
              >
                {n.label}
              </Link>
            ))}
            {/* The public pages had no way to switch theme — dark mode was only
                reachable from inside the app. Same toggle, same stored choice. */}
            <ThemeToggle />
            <Link
              href="/"
              className="ml-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">{children}</main>

      <footer className="mt-auto border-t border-white/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p>
            © {new Date().getFullYear()} gcsebusiness · Edexcel GCSE (9–1) Business, spec 1BS0 ·{' '}
            <a className="underline hover:text-foreground" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="flex flex-wrap items-center gap-3">
            <Link href="/legal" className="underline hover:text-foreground">
              Privacy, DPA &amp; terms
            </Link>
            <Link href="/pricing" className="underline hover:text-foreground">
              Pricing
            </Link>
            <span>Built by a student.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
