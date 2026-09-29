'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { useApp } from '@/lib/store';
import { api } from '@/lib/api';
import type { SessionInfo } from '@/lib/types';
import { AppShell } from '@/components/app/AppShell';
import { AuthView } from '@/components/app/AuthView';

import { TeacherHome } from '@/components/app/teacher/TeacherHome';
import { ClassesView } from '@/components/app/teacher/ClassesView';
import { AssignmentsView } from '@/components/app/teacher/AssignmentsView';
import { NewAssignment } from '@/components/app/teacher/NewAssignment';
import { ResultsView } from '@/components/app/teacher/ResultsView';
import { LibraryView } from '@/components/app/teacher/LibraryView';
import { StudentHome } from '@/components/app/student/StudentHome';
import { PracticeView } from '@/components/app/student/PracticeView';
import { StudentHistory } from '@/components/app/student/StudentHistory';
import { QuizRunner } from '@/components/quiz/QuizRunner';
import { ResultScreen } from '@/components/quiz/ResultScreen';

export default function Home() {
  const { booting, session, view, setSession, go } = useApp();

  useEffect(() => {
    let alive = true;
    api
      .get<SessionInfo & { authenticated: boolean }>('/api/auth/me')
      .then((me) => {
        if (!alive) return;
        if (me && me.authenticated) {
          setSession(me);
          go(me.role === 'teacher' ? { name: 't-home' } : { name: 's-home' });
        } else {
          setSession(null);
          go({ name: 'auth' });
        }
      })
      .catch(() => {
        if (alive) {
          setSession(null);
          go({ name: 'auth' });
        }
      })
      .finally(() => {
        if (alive) useApp.setState({ booting: false });
      });
    return () => {
      alive = false;
    };
     
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading HGSBusiness…</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {!session ? (
        <AuthView />
      ) : (
        <AppShell active={view.name}>
          {view.name === 't-home' ? <TeacherHome /> : null}
          {view.name === 't-classes' ? <ClassesView /> : null}
          {view.name === 't-class' ? <ClassesView initialClassId={view.classId} /> : null}
          {view.name === 't-assignments' ? <AssignmentsView /> : null}
          {view.name === 't-results' ? <ResultsView assignmentId={view.assignmentId} /> : null}
          {view.name === 't-new' ? <NewAssignment presetQuizId={view.presetQuizId} /> : null}
          {view.name === 't-library' ? <LibraryView /> : null}
          {view.name === 's-home' ? <StudentHome /> : null}
          {view.name === 's-practice' ? <PracticeView /> : null}
          {view.name === 's-history' ? <StudentHistory /> : null}
          {view.name === 'quiz' ? <QuizRunner key={view.attemptId} attemptId={view.attemptId} /> : null}
          {view.name === 'result' ? <ResultScreen key={view.attemptId} attemptId={view.attemptId} /> : null}
        </AppShell>
      )}
    </ThemeProvider>
  );
}
