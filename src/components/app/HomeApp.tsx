'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
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

export function HomeApp({ initialSession }: { initialSession: SessionInfo | null }) {
  const session = useApp((s) => s.session);
  const view = useApp((s) => s.view);

  // adopt the server-known session synchronously on the very first render so
  // the correct screen paints immediately — no splash, no flash
  useState(() => {
    if (initialSession) {
      useApp.setState({
        session: initialSession,
        view: initialSession.role === 'teacher' ? { name: 't-home' } : { name: 's-home' },
      });
    }
    return true;
  });

  if (!session) return <AuthView />;

  return (
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
  );
}
