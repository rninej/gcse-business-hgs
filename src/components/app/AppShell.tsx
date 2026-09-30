'use client';

// Application shell: desktop sidebar + mobile bottom nav + sticky footer.
// Light-mode only. Warms the API cache on mount so clicking around the app
// is instant, and pings the AI health endpoint so model availability stays
// fresh in the background on every visit.
import { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLockup } from './Brand';
import { PasswordDialog } from './PasswordDialog';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import type { View } from '@/lib/store';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  view: View;
}

export function AppShell({ children, active }: { children: React.ReactNode; active: View['name'] }) {
  const session = useApp((s) => s.session);
  const logout = useApp((s) => s.logout);
  const isTeacher = session?.role === 'teacher';

  // prefetch the views the user is most likely to open next (results are
  // per-assignment and only fetched on demand); also ping the AI health
  // endpoint — a background probe refreshes which models have quota left
  useEffect(() => {
    if (!session) return;
    const paths = isTeacher
      ? ['/api/teacher/overview', '/api/teacher/classes', '/api/teacher/assignments', '/api/quizzes?audience=assignment']
      : ['/api/student/assignments', '/api/student/overview', '/api/student/leaderboard', '/api/quizzes?audience=practice'];
    for (const p of paths) {
      api.get(p).catch(() => undefined);
    }
    fetch('/api/ai/health').catch(() => undefined);
     
  }, [session?.uid]);

  const nav: NavItem[] = isTeacher
    ? [
        { label: 'Dashboard', icon: LayoutDashboardIcon, view: { name: 't-home' } },
        { label: 'Classes', icon: UsersIcon, view: { name: 't-classes' } },
        { label: 'Assignments', icon: ClipboardListIcon, view: { name: 't-assignments' } },
        { label: 'New task', icon: PlusCircleIcon, view: { name: 't-new' } },
        { label: 'Library', icon: BookOpenIcon, view: { name: 't-library' } },
      ]
    : [
        { label: 'Home', icon: HomeIcon, view: { name: 's-home' } },
        { label: 'Practice', icon: GraduationCapIcon, view: { name: 's-practice' } },
        { label: 'Revise', icon: LayersIcon, view: { name: 's-revise' } },
        { label: 'Results', icon: HistoryIcon, view: { name: 's-history' } },
      ];

  const isActive = (v: View) => {
    if (v.name === active) return true;
    if (active === 't-class') return v.name === 't-classes';
    if (active === 't-results') return v.name === 't-assignments';
    if (active === 'result' || active === 'quiz') return v.name === 's-home' || v.name === 't-home';
    return false;
  };

  return (
    // no bg-background here: the body provides it, which lets the quiz
    // backdrop photo (fixed, -z-10) show through behind the content
    <div className="min-h-screen flex flex-col">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col border-r bg-[var(--sidebar)] z-40">
        <div className="px-5 pt-5 pb-4 border-b border-[var(--sidebar-border)]">
          <BrandLockup />
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5" aria-label="Main">
          {nav.map((item) => {
            const on = isActive(item.view);
            return (
              <button
                key={item.label}
                onClick={() => useApp.getState().go(item.view)}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
                  on
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-[17px] w-[17px]')} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--sidebar-border)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0" aria-hidden>
              {(session?.name ?? '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{session?.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {isTeacher ? 'Teacher' : `${session?.className ?? 'Class'} · Student`}
              </div>
            </div>
          </div>
          <PasswordDialog />
          <Button variant="outline" size="sm" className="w-full" onClick={() => logout()}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <BrandLockup compact />
          <div className="flex items-center gap-1">
            <PasswordDialog variant="ghost" />
            <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col md:pl-60">
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10">{children}</main>
        <footer className="mt-auto border-t bg-[var(--sidebar)] pb-20 md:pb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} gcsebusiness — for Edexcel GCSE (9–1) Business</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden /> Quiz bank aligned to spec 1BS0
            </span>
          </div>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Main"
      >
        <div className="flex">
          {nav.map((item) => {
            const on = isActive(item.view);
            return (
              <button
                key={item.label}
                onClick={() => useApp.getState().go(item.view)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium min-h-[44px]',
                  on ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-current={on ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* icon wrappers to avoid importing lucide in multiple places */
function LayoutDashboardIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
}
function UsersIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ClipboardListIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>;
}
function PlusCircleIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
}
function BookOpenIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
function HomeIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>;
}
function GraduationCapIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>;
}
function LayersIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>;
}
function HistoryIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
}
