'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ClipboardList, FlaskConical, PlusCircle, Timer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { PageHeader, ThemedSkeleton, ErrorNote, EmptyState, DueChip, PctChip } from '@/components/shared';
import { cn } from '@/lib/utils';

interface Row {
  id: string;
  title: string;
  classTitle: string;
  dueAt: number | null;
  timeLimitMin: number | null;
  createdAt: number;
  questionCount: number;
  source: 'library' | 'ai' | 'custom';
  submitted: number;
  totalStudents: number;
}

const SOURCE_LABEL: Record<Row['source'], string> = {
  library: 'Bank quiz',
  ai: 'AI generated',
  custom: 'Teacher-written',
};

export function AssignmentsView() {
  const go = useApp((s) => s.go);
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ assignments: Row[] }>('/api/teacher/assignments')
      .then((d) => setRows(d.assignments))
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(load, [load]);

  async function remove(id: string, title: string) {
    try {
      await api.del(`/api/teacher/assignments/${id}`);
      toast({ title: `Deleted “${title}”`, description: 'Student submissions for it were removed too.' });
      load();
    } catch (e) {
      toast({ title: 'Could not delete', description: (e as Error).message, variant: 'destructive' });
    }
  }

  // try your own assignment exactly as a student sees it — a private dry run
  // that never appears in class statistics
  async function selfTest(a: Row) {
    setTesting(a.id);
    try {
      const res = await api.post<{ attemptId: string }>(`/api/teacher/assignments/${a.id}/selftest`);
      go({ name: 'quiz', attemptId: res.attemptId });
    } catch (e) {
      toast({ title: 'Could not start the self-test', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setTesting(null);
    }
  }

  if (error)
    return (
      <>
        <PageHeader title="Assignments" />
        <ErrorNote message={error} />
      </>
    );
  if (!rows)
    return (
      <>
        <PageHeader title="Assignments" />
        <ThemedSkeleton rows={4} />
      </>
    );

  return (
    <>
      <PageHeader
        title="Assignments"
        sub="Every quiz you’ve set, with live hand-in counts."
        actions={
          <Button onClick={() => go({ name: 't-new' })}>
            <PlusCircle className="h-4 w-4" /> New assignment
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nothing set yet"
          body="Set a quiz from the library, generate one with AI, or type your own questions."
          action={
            <Button size="sm" onClick={() => go({ name: 't-new' })}>
              Create assignment
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((a) => {
            const done = a.totalStudents > 0 ? Math.round((a.submitted / a.totalStudents) * 100) : 0;
            return (
              <div
                key={a.id}
                className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors no-print"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <button className="flex-1 min-w-0 text-left" onClick={() => go({ name: 't-results', assignmentId: a.id })}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{a.title}</span>
                      <Badge variant="secondary" className="text-[10px]">{SOURCE_LABEL[a.source]}</Badge>
                      {a.timeLimitMin ? (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Timer className="h-3 w-3" /> {a.timeLimitMin} min
                        </Badge>
                      ) : null}
                      <DueChip dueAt={a.dueAt} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {a.classTitle} · {a.questionCount} questions
                      {a.dueAt ? ` · due ${new Date(a.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                    </div>
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold tabular-nums">
                        {a.submitted}
                        <span className="text-muted-foreground font-normal">/{a.totalStudents}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">handed in</div>
                    </div>
                    <div className="hidden sm:block w-28">
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', done === 100 ? 'bg-[var(--success)]' : 'bg-primary')}
                          style={{ width: `${done}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 text-right">{done}% complete</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void selfTest(a)}
                      disabled={testing === a.id}
                      title="Try this quiz yourself — a private dry run"
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">{testing === a.id ? 'Starting…' : 'Test it'}</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => go({ name: 't-results', assignmentId: a.id })}>
                      Results <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-[var(--danger)]" aria-label={`Delete ${a.title}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete “{a.title}”?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {a.submitted > 0
                              ? `${a.submitted} submission${a.submitted === 1 ? '' : 's'} will be deleted with it.`
                              : 'No one has submitted yet.'}{' '}
                            This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep it</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90"
                            onClick={() => remove(a.id, a.title)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
