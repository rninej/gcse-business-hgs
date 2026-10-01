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

// The zustand store's server snapshot is frozen at store creation, so SSR must
// render from the server-passed session prop. On the client we adopt the
// session into the store ONCE, before the first selector read — the same
// render then paints the same tree the server sent, so hydration matches and
// logged-in users get their dashboard in the very first paint.
let clientBootstrapped = false;

export function HomeApp({ initialSession }: { initialSession: SessionInfo | null }) {
  // every visit (signed in or not) refreshes the shared AI model-health
  // snapshot in the background — quota-stricken models rotate out automatically
  useEffect(() => {
    fetch('/api/ai/health').catch(() => undefined);
  }, []);

  if (typeof window !== 'undefined' && !clientBootstrapped) {
    clientBootstrapped = true;
    if (initialSession) {
      useApp.setState({ session: initialSession, view: homeView(initialSession) });
    }
  }

  const storeSession = useApp((s) => s.session);
  const storeView = useApp((s) => s.view);
  const onServer = typeof window === 'undefined';
  const session = onServer ? initialSession : storeSession;
  const view: View = onServer
    ? initialSession
      ? homeView(initialSession)
      : { name: 'auth' }
    : storeView;

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
