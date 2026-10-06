'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import type { SessionInfo } from '@/lib/types';
import type { View } from '@/lib/store';
import { AppShell } from '@/components/app/AppShell';
import { AuthView } from '@/components/app/AuthView';
import { PwaProvider } from '@/components/app/PwaProvider';
import { InstallPrompt } from '@/components/app/InstallPrompt';

import { TeacherHome } from '@/components/app/teacher/TeacherHome';
import { ClassesView } from '@/components/app/teacher/ClassesView';
import { AssignmentsView } from '@/components/app/teacher/AssignmentsView';
import { NewAssignment } from '@/components/app/teacher/NewAssignment';
import { ResultsView } from '@/components/app/teacher/ResultsView';
import { LibraryView } from '@/components/app/teacher/LibraryView';
import { StudentHome } from '@/components/app/student/StudentHome';
import { PracticeView } from '@/components/app/student/PracticeView';
import { FlashcardView } from '@/components/app/student/FlashcardView';
import { StudentHistory } from '@/components/app/student/StudentHistory';
import { QuizRunner } from '@/components/quiz/QuizRunner';
import { ResultScreen } from '@/components/quiz/ResultScreen';

function homeView(s: SessionInfo): View {
  return s.role === 'teacher' ? { name: 't-home' } : { name: 's-home' };
}

/* Deep links — /?quiz=<attemptId> (or /?result=<attemptId>) drop a signed-in
 * user straight into that screen; the teacher self-test opens its own tab at
 * such a link, so the sample test plays like a separate site. The params are
 * read by the SERVER (page.tsx) and arrive as props — the SSR paint, the
 * hydration-pass fallback and the post-hydration store seed all agree on the
 * same view, so no phase can flash or strand the dashboard. The param stays
 * on the URL on purpose: refreshing the self-test tab re-enters the quiz,
 * which resumes from its autosave. */
function bootView(s: SessionInfo, deepQuiz?: string | null, deepResult?: string | null): View {
  if (deepQuiz) return { name: 'quiz', attemptId: deepQuiz };
  if (deepResult) return { name: 'result', attemptId: deepResult };
  return homeView(s);
}

// Hydration-safe session bootstrapping. The server reads the session cookie
// and passes it down, so SSR always paints the right shell (dashboard for
// signed-in users, login for guests). On the client, zustand's
// useSyncExternalStore returns the store's INITIAL (frozen, empty) state
// during the hydration pass — a mid-render setState is invisible to it — so
// the first client render must also read the server-passed prop for the
// trees to match. A post-hydration effect then seeds the store from the same
// prop and flags it booted; the store subscription re-renders us onto store
// state, which login/logout keep in sync for the rest of the SPA session.
// No flash of the wrong screen, no hydration error, no React setState in an
// effect (the flag lives in the external store, not component state).
export function HomeApp({
  initialSession,
  deepQuiz,
  deepResult,
}: {
  initialSession: SessionInfo | null;
  deepQuiz?: string | null;
  deepResult?: string | null;
}) {
  // every visit (signed in or not) refreshes the shared AI model-health
  // snapshot in the background — quota-stricken models rotate out automatically
  useEffect(() => {
    fetch('/api/ai/health').catch(() => undefined);
  }, []);

  // post-hydration: adopt the server-known session into the store (if the
  // store is still empty) and mark the store booted — from then on the
  // component renders from the store, never from the prop again
  useEffect(() => {
    if (initialSession && !useApp.getState().session) {
      useApp.setState({ session: initialSession, view: bootView(initialSession, deepQuiz, deepResult), booted: true });
    } else if (!useApp.getState().booted) {
      useApp.setState({ booted: true });
    }
  }, [initialSession, deepQuiz, deepResult]);

  const storeSession = useApp((s) => s.session);
  const storeView = useApp((s) => s.view);
  const booted = useApp((s) => s.booted);
  const session = booted ? storeSession : initialSession;
  const view: View = booted
    ? storeView
    : initialSession
      ? bootView(initialSession, deepQuiz, deepResult)
      : { name: 'auth' };

  const content = !session ? (
    <AuthView />
  ) : (
    <AppShell active={view.name}>
      {view.name === 't-home' ? <TeacherHome /> : null}
      {view.name === 't-classes' ? <ClassesView /> : null}
      {view.name === 't-class' ? <ClassesView initialClassId={view.classId} /> : null}
      {view.name === 't-assignments' ? <AssignmentsView /> : null}
      {view.name === 't-results' ? <ResultsView assignmentId={view.assignmentId} /> : null}
      {view.name === 't-new' ? <NewAssignment presetQuizId={view.presetQuizId} draftId={view.draftId} /> : null}
      {view.name === 't-library' ? <LibraryView /> : null}
      {view.name === 's-home' ? <StudentHome /> : null}
      {view.name === 's-practice' ? <PracticeView /> : null}
      {view.name === 's-revise' ? <FlashcardView /> : null}
      {view.name === 's-history' ? <StudentHistory /> : null}
      {view.name === 'quiz' ? <QuizRunner key={view.attemptId} attemptId={view.attemptId} /> : null}
      {view.name === 'result' ? <ResultScreen key={view.attemptId} attemptId={view.attemptId} /> : null}
    </AppShell>
  );

  // The ambient aurora gradients live on the body itself (globals.css), so
  // no photo layer is needed here — images only appear during quizzes (the
  // forest backdrops in QuizRunner/ResultScreen). The auth card and the app
  // shell cross-fade through one AnimatePresence, so signing in feels like
  // the dashboard emerges from the login screen.
  return (
    <>
      <PwaProvider />
      <InstallPrompt />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={session ? 'app' : 'auth'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.18, ease: 'easeIn' } }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
