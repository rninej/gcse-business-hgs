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
  start: (session: SessionInfo) => void;
  setSession: (session: SessionInfo | null) => void;
  go: (view: View) => void;
  logout: () => Promise<void>;
}

export const useApp = create<AppState>((set) => ({
  session: null,
  view: { name: 'auth' },
  start: (session) =>
    set({ session, view: session.role === 'teacher' ? { name: 't-home' } : { name: 's-home' } }),
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
