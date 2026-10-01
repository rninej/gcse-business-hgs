'use client';

import { create } from 'zustand';
import type { SessionInfo } from './types';

export type View =
  | { name: 'auth' }
  | { name: 't-home' }
  | { name: 't-classes' }
  | { name: 't-class'; classId: string }
  | { name: 't-assignments' }
  | { name: 't-results'; assignmentId: string }
  | { name: 't-new'; presetQuizId?: string; draftId?: string }
  | { name: 't-library' }
  | { name: 's-home' }
  | { name: 's-practice' }
  | { name: 's-revise' }
  | { name: 's-history' }
  | { name: 'quiz'; attemptId: string }
  | { name: 'result'; attemptId: string };

interface AppState {
  session: SessionInfo | null;
  view: View;
  /** true once the store has been seeded for this page load — flips in a
   * post-hydration effect so the hydration pass itself can render from the
   * server-passed session prop while uSES still reports the frozen initial
   * state (see HomeApp). Stays true through logout — only session changes. */
  booted: boolean;
  start: (session: SessionInfo) => void;
  setSession: (session: SessionInfo | null) => void;
  go: (view: View) => void;
  logout: () => Promise<void>;
}

export const useApp = create<AppState>((set) => ({
  session: null,
  view: { name: 'auth' },
  booted: false,
  start: (session) =>
    set({ session, booted: true, view: session.role === 'teacher' ? { name: 't-home' } : { name: 's-home' } }),
  setSession: (session) => set({ session }),
  go: (view) => {
    set({ view });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  },
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    set({ session: null, view: { name: 'auth' } });
  },
}));
