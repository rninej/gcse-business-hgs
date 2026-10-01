'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  PenLine,
  Timer,
  Trash2,
  PlusCircle,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  RotateCw,
  Pencil,
  Save,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { PageHeader, MarksChip, TypeBadge, ErrorNote } from '@/components/shared';
import { topicTitle, TOPICS } from '@/lib/topics';
import type { Question, QuestionType, WrittenPoint, WrittenQuestion } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ClassRow { id: string; name: string; studentCount: number }
interface StudentLite { id: string; displayName: string; username: string; classId: string; className: string }
interface QuizRow { id: string; title: string; blurb: string; theme: 1 | 2; topics: string[]; questionCount: number; types: QuestionType[] }

type Mode = 'library' | 'ai' | 'custom';

/** epoch ms → value for <input type="datetime-local"> */
function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NewAssignment({ presetQuizId, draftId }: { presetQuizId?: string; draftId?: string }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  // step 1
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classIds, setClassIds] = useState<string[]>([]);
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueLocal, setDueLocal] = useState('');
  const [timed, setTimed] = useState(false);
  const [timeLimit, setTimeLimit] = useState(20);
  // step 2
  const [mode, setMode] = useState<Mode>(presetQuizId ? 'library' : 'library');
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [quizId, setQuizId] = useState(presetQuizId ?? '');
  // ai
  const [aiTopics, setAiTopics] = useState<string[]>(['2.1']);
  const [aiCount, setAiCount] = useState(12);
  const [aiTypes, setAiTypes] = useState<QuestionType[]>([]);
  const [aiDifficulty, setAiDifficulty] = useState<'1' | '2' | '3' | 'mixed'>('mixed');
  const [aiCases, setAiCases] = useState(true);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<Question[] | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  // custom
  const [custom, setCustom] = useState<Question[]>([]);
  // teacher-added written questions — append to any question source
  const [extraWritten, setExtraWritten] = useState<Question[]>([]);
  // drafts
  const [updatingDraftId, setUpdatingDraftId] = useState<string | null>(null);
  // step 3
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ classes: ClassRow[] }>('/api/teacher/classes').then((d) => {
      setClasses(d.classes);
      if (d.classes.length > 0 && !presetQuizId && !draftId) setClassIds([d.classes[0].id]);
    }).catch((e) => setError((e as Error).message));
    api.get<{ students: StudentLite[] }>('/api/teacher/students').then((d) => setStudents(d.students)).catch(() => undefined);
    api.get<{ quizzes: QuizRow[] }>('/api/quizzes?audience=assignment').then((d) => setQuizzes(d.quizzes)).catch(() => undefined);
  }, [presetQuizId, draftId]);

  // editing an existing draft: prefill everything, questions land in the
  // editable AI list so the teacher can tweak stems, answers and marks
  useEffect(() => {
    if (!draftId) return;
    api
      .get<{
        assignment: {
          title: string; description: string; dueAt: number | null; timeLimitMin: number | null;
          classId: string; classIds?: string[]; studentIds?: string[];
        };
        questions: Question[];
      }>(`/api/teacher/assignments/${draftId}`)
      .then((d) => {
        const a = d.assignment;
        setTitle(a.title);
        setDescription(a.description ?? '');
        setDueLocal(a.dueAt ? toLocalInput(a.dueAt) : '');
        setTimed(Boolean(a.timeLimitMin));
        if (a.timeLimitMin) setTimeLimit(a.timeLimitMin);
        setClassIds(Array.from(new Set([a.classId, ...(a.classIds ?? [])])).filter(Boolean));
        setStudentIds(a.studentIds ?? []);
        setMode('ai');
        setAiQuestions(d.questions);
        setAiProvider('draft');
        setUpdatingDraftId(draftId);
      })
      .catch((e) => setError((e as Error).message));
  }, [draftId]);

  const dueAt = useMemo(() => {
    if (!dueLocal) return null;
    const t = new Date(dueLocal).getTime();
    return Number.isFinite(t) ? t : null;
  }, [dueLocal]);

  const [libraryQuestions, setLibraryQuestions] = useState<Question[] | null>(null);
  useEffect(() => {
    if (mode === 'library' && quizId) {
      setLibraryQuestions(null);
      api
        .get<{ questions: Question[] }>(`/api/teacher/assignments/preview/${quizId}`)
        .then((d) => setLibraryQuestions(d.questions))
        .catch(() => setLibraryQuestions(null));
    }
  }, [mode, quizId]);

  const baseQuestions = mode === 'library' ? libraryQuestions : mode === 'ai' ? aiQuestions : custom;
  const finalQuestions = baseQuestions ? [...baseQuestions, ...extraWritten] : extraWritten.length > 0 ? extraWritten : null;
  const totalMarks = finalQuestions?.reduce((s, q) => s + q.marks, 0) ?? 0;
  const hasWritten = (finalQuestions ?? []).some((q) => q.type === 'written');

  const canStep2 =
    title.trim().length >= 3 &&
    (classIds.length > 0 || studentIds.length > 0) &&
    (!timed || (timeLimit >= 3 && timeLimit <= 180));
  const canStep3 = updatingDraftId
    ? (finalQuestions?.length ?? 0) >= 1 // editing a draft: any non-empty set is fine
    : mode === 'library'
      ? Boolean(quizId)
      : mode === 'ai'
        ? (aiQuestions?.length ?? 0) >= 4
        : custom.length >= 1;

  async function generate() {
    setAiBusy(true);
    setError(null);
    setAiQuestions(null);
    try {
      const res = await api.post<{
        provider: string;
        note: string;
        questions: Question[];
      }>('/api/teacher/generate', {
        topics: aiTopics,
        count: aiCount,
        types: aiTypes,
        difficulty: aiDifficulty === 'mixed' ? 'mixed' : Number(aiDifficulty),
        caseStudies: aiCases,
      });
      setAiQuestions(res.questions);
      setAiProvider(res.provider);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  }

  async function assign(asDraft: boolean) {
    setCreating(true);
    setError(null);
    try {
      const body = {
        classId: classIds[0],
        classIds,
        studentIds,
        title: title.trim(),
        description: description.trim(),
        dueAt,
        timeLimitMin: timed ? timeLimit : null,
        mode,
        quizId: mode === 'library' ? quizId : undefined,
        aiParams:
          mode === 'ai'
            ? { topics: aiTopics, count: aiQuestions?.length ?? aiCount, types: aiTypes, difficulty: aiDifficulty === 'mixed' ? 'mixed' : Number(aiDifficulty), caseStudies: aiCases }
            : undefined,
        // the reviewed (and possibly edited) preview goes with the request —
        // the server uses it directly instead of generating a second set
        previewQuestions: mode === 'ai' && aiQuestions ? aiQuestions : undefined,
        customQuestions: mode === 'custom' ? custom : undefined,
        // AI-marked written questions ride on top of any source
        extraWritten: mode !== 'custom' && extraWritten.length > 0 ? extraWritten : undefined,
        draft: asDraft,
        updateId: updatingDraftId ?? undefined,
      };
      const res = await api.post<{ assignmentId: string; questionCount: number; draft?: boolean }>(
        '/api/teacher/assignments',
        body
      );
      if (asDraft) {
        toast({ title: res.draft ? 'Draft saved' : 'Draft updated', description: 'Find it under Assignments — publish it whenever you’re ready.' });
        go({ name: 't-assignments' });
      } else {
        const who = classIds.length + studentIds.length > 1 ? 'your classes' : 'your class';
        toast({ title: 'Assignment set', description: `${res.questionCount} questions — ready for ${who}.` });
        go({ name: 't-results', assignmentId: res.assignmentId });
      }
    } catch (e) {
      setError((e as Error).message);
      window.scrollTo({ top: 0 });
    } finally {
      setCreating(false);
    }
  }

  const selectedStudents = students.filter((s) => studentIds.includes(s.id));
  const individualsAvailable = students.filter(
    (s) => classIds.length === 0 || classIds.includes(s.classId)
  );
  const recipientsLabel =
    [
      classIds.length
        ? classes.filter((c) => classIds.includes(c.id)).map((c) => c.name).join(' + ')
        : '',
      selectedStudents.length
        ? `${selectedStudents.length} individual${selectedStudents.length === 1 ? '' : 's'}`
        : '',
    ]
      .filter(Boolean)
      .join(' · ') || '—';

  return (
    <>
      <PageHeader
        title={updatingDraftId ? 'Edit draft' : 'New assignment'}
        sub={
          step === 1
            ? 'The basics — who, when and how long.'
            : step === 2
              ? 'Where do the questions come from?'
              : 'Last check before it goes live.'
        }
        actions={
          step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => go({ name: 't-assignments' })}>
              <ArrowLeft className="h-4 w-4" /> Assignments
            </Button>
          )
        }
      />

      <ol className="flex items-center gap-2 mb-6 text-sm">
        {['Details', 'Questions', 'Review'].map((s, i) => {
          const n = i + 1;
          return (
            <li key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                  step === n ? 'bg-primary text-primary-foreground' : step > n ? 'bg-[var(--success)] text-white' : 'bg-secondary text-muted-foreground'
                )}
              >
                {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
              </span>
              <span className={step === n ? 'font-medium' : 'text-muted-foreground'}>{s}</span>
              {i < 2 ? <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" /> : null}
            </li>
          );
        })}
      </ol>

      {error ? <div className="mb-4"><ErrorNote message={error} /></div> : null}

      {step === 1 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="a-title">Give your assignment a name</Label>
              <Input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Half-term homework" />
              <p className="text-xs text-muted-foreground">Students see this name on their homepage.</p>
            </div>
            <div className="space-y-2">
              <Label>Classes</Label>
              {classes.length === 0 ? (
                <p className="text-sm text-[var(--warn)]">You need a class first — add one under “Classes”.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {classes.map((c) => {
                    const on = classIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setClassIds(on ? classIds.filter((x) => x !== c.id) : [...classIds, c.id])}
                        className={cn(
                          'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                          on ? 'border-primary bg-primary text-primary-foreground' : 'glass-soft rounded-full hover:border-primary/40'
                        )}
                        aria-pressed={on}
                      >
                        {c.name} · {c.studentCount}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Pick as many as you like — the same assignment goes to every class selected.</p>
            </div>

            <Collapsible className="glass-soft rounded-lg">
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" aria-hidden />
                  Also set for specific students
                  {studentIds.length > 0 ? <Badge variant="secondary" className="tabular-nums">{studentIds.length}</Badge> : null}
                </span>
                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Optional — hand it to individual students on top of (or instead of) whole classes.
                </p>
                {individualsAvailable.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No students in the selected classes yet.</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto scroll-slim flex flex-wrap gap-2 pr-1">
                    {individualsAvailable.map((s) => {
                      const on = studentIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStudentIds(on ? studentIds.filter((x) => x !== s.id) : [...studentIds, s.id])}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                            on ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/40 hover:bg-secondary/60'
                          )}
                          aria-pressed={on}
                        >
                          {s.displayName}
                          {classIds.length !== 1 ? <span className="text-muted-foreground"> · {s.className}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
              <Label htmlFor="a-desc">Instructions for students (optional)</Label>
              <Textarea id="a-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Read each case study carefully." />
            </div>
          </div>

          <div className="glass rounded-xl p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="a-due">Due date &amp; time (optional)</Label>
              <Input id="a-due" type="datetime-local" value={dueLocal} onChange={(e) => setDueLocal(e.target.value)} />
              <p className="text-xs text-muted-foreground">Students can still submit after the deadline — it is tagged “late”.</p>
            </div>
            <div className="glass-soft rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium flex items-center gap-2"><Timer className="h-4 w-4" /> Timed conditions</div>
                  <p className="text-xs text-muted-foreground">A countdown appears; it auto-submits at zero.</p>
                </div>
                <Switch checked={timed} onCheckedChange={setTimed} aria-label="Timed conditions" />
              </div>
              {timed ? (
                <div className="space-y-2 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time limit</span>
                    <span className="font-semibold tabular-nums">{timeLimit} min</span>
                  </div>
                  <Slider value={[timeLimit]} min={3} max={90} step={1} onValueChange={(v) => setTimeLimit(v[0] ?? 20)} />
                  <p className="text-xs text-muted-foreground">3–90 minutes. Leaving a timed quiz submits it — students cannot rejoin.</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <Button disabled={!canStep2} onClick={() => setStep(2)}>
              Choose questions <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as Mode)} className="grid gap-3 sm:grid-cols-3">
            {[
              { v: 'library' as Mode, icon: BookOpen, t: 'Quiz library', d: 'Hand-written banks, ready to go' },
              { v: 'ai' as Mode, icon: Sparkles, t: 'Generate', d: 'Fresh questions on your chosen topics' },
              { v: 'custom' as Mode, icon: PenLine, t: 'My questions', d: 'Type your own — any style' },
            ].map((o) => (
              <label key={o.v} className={cn('cursor-pointer glass-soft rounded-xl p-4 flex gap-3 items-start transition-colors', mode === o.v ? 'border-primary ring-1 ring-primary/40' : 'hover:border-primary/30')}>
                <RadioGroupItem value={o.v} id={`mode-${o.v}`} className="mt-1" />
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2"><o.icon className="h-4 w-4 text-primary" /> {o.t}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{o.d}</p>
                </div>
              </label>
            ))}
          </RadioGroup>

          {mode === 'library' ? (
            <div>
              {quizzes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Library is loading…</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {quizzes.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setQuizId(q.id)}
                      className={cn(
                        'glass-soft rounded-xl p-4 text-left transition-colors',
                        quizId === q.id ? 'border-primary ring-1 ring-primary/40' : 'hover:border-primary/30'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">{q.title}</span>
                        <Badge variant="secondary" className="tabular-nums shrink-0">Theme {q.theme}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{q.blurb}</p>
                      <p className="text-xs mt-2">
                        <span className="font-semibold tabular-nums">{q.questionCount}</span> questions
                        <span className="text-muted-foreground"> · {q.topics.map((t) => `${t} ${topicTitle(t).split(' ')[0]}`).join(', ')}</span>
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {quizId && libraryQuestions ? (
                <p className="text-xs text-[var(--success)] mt-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {libraryQuestions.length} questions ready · {totalMarks} marks total
                </p>
              ) : null}
            </div>
          ) : null}

          {mode === 'ai' ? (
            <div className="glass rounded-xl p-5 space-y-5">
              <div className="space-y-2">
                <Label>Topics</Label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => {
                    const on = aiTopics.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => setAiTopics(on ? aiTopics.filter((x) => x !== t.id) : [...aiTopics, t.id])}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                        )}
                        aria-pressed={on}
                      >
                        {t.id} {t.short}
                      </button>
                    );
                  })}
                </div>
                {aiTopics.length === 0 ? <p className="text-xs text-[var(--warn)]">Pick at least one topic.</p> : null}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-semibold tabular-nums">{aiCount}</span>
                  </div>
                  <Slider value={[aiCount]} min={5} max={30} step={1} onValueChange={(v) => setAiCount(v[0] ?? 12)} />
                  <p className="text-xs text-muted-foreground">5–30 questions.</p>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={aiDifficulty} onValueChange={(v) => setAiDifficulty(v as '1' | '2' | '3' | 'mixed')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed (recommended)</SelectItem>
                      <SelectItem value="1">Foundation</SelectItem>
                      <SelectItem value="2">Standard</SelectItem>
                      <SelectItem value="3">Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question styles</Label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['mcq', 'Multiple choice'],
                      ['term', 'Type the term'],
                      ['fib', 'Fill the blank'],
                      ['numeric', 'Calculations'],
                      ['truefalse', 'True / false'],
                      ['written', 'Written · AI marked'],
                    ] as [QuestionType, string][]
                  ).map(([t, label]) => {
                    const on = aiTypes.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => setAiTypes(on ? aiTypes.filter((x) => x !== t) : [...aiTypes, t])}
                        className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors', on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary')}
                        aria-pressed={on}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave all off for a natural mix. Written questions arrive with an AI-built mark scheme and are marked by the AI examiner.
                </p>
              </div>

              <div className="glass-soft rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Include case studies</div>
                  <p className="text-xs text-muted-foreground">Short business extracts above some questions.</p>
                </div>
                <Switch checked={aiCases} onCheckedChange={setAiCases} aria-label="Include case studies" />
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <Button onClick={generate} disabled={aiBusy || aiTopics.length === 0}>
                  {aiBusy ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" /> Writing questions…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" /> {aiQuestions ? 'Generate again' : 'Generate questions'}
                    </>
                  )}
                </Button>
                {aiQuestions ? (
                  <span className="text-sm flex items-center gap-1.5 text-[var(--success)]">
                    <CheckCircle2 className="h-4 w-4" /> {aiQuestions.length} questions · {totalMarks} marks
                  </span>
                ) : null}
              </div>

              {aiBusy ? (
                <div className="space-y-2" aria-live="polite">
                  <p className="text-sm text-muted-foreground">Writing questions, checking facts and arithmetic… this takes up to a minute.</p>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full w-1/3 bg-primary animate-pulse" />
                  </div>
                </div>
              ) : null}

              {aiQuestions ? (
                <QuestionPreviewList
                  questions={aiQuestions}
                  onRemove={(id) => setAiQuestions(aiQuestions.filter((q) => q.id !== id))}
                  onEdit={(id, nq) => setAiQuestions(aiQuestions.map((x) => (x.id === id ? nq : x)))}
                />
              ) : null}
            </div>
          ) : null}

          {mode === 'custom' ? (
            <CustomBuilder list={custom} setList={setCustom} />
          ) : null}

          {/* AI-marked written questions — available on top of any source */}
          {mode !== 'custom' ? (
            <WrittenSection list={extraWritten} setList={setExtraWritten} />
          ) : null}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Details</Button>
            <Button disabled={!canStep3} onClick={() => setStep(3)}>
              Review <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5">
          <div className="glass rounded-xl p-5 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              ['Title', title],
              ['Set for', recipientsLabel],
              ['Due', dueAt ? new Date(dueAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'No deadline'],
              ['Timed', timed ? `${timeLimit} minutes` : 'Untimed'],
              ['Questions', finalQuestions ? `${finalQuestions.length} · ${totalMarks} marks` : '—'],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-3 border-b py-1.5 last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-right">{v}</span>
              </div>
            ))}
          </div>

          {mode === 'ai' && aiProvider === 'bank' ? (
            <p className="text-xs text-[var(--warn)] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> AI providers were unreachable — questions were pulled from the human-written bank instead.
            </p>
          ) : null}
          {hasWritten ? (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <PenLine className="h-4 w-4" /> Written answers are marked by the AI examiner against the mark scheme after students submit.
            </p>
          ) : null}

          {finalQuestions ? <QuestionPreviewList questions={finalQuestions} readOnly /> : null}

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Questions</Button>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => void assign(true)}
                disabled={creating}
                title="Save it now, publish it later — students won't see it yet"
              >
                <Save className="h-4 w-4" /> {creating ? 'Saving…' : 'Save as draft'}
              </Button>
              <Button onClick={() => void assign(false)} disabled={creating}>
                {creating ? 'Setting…' : <>Set assignment <CheckCircle2 className="h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Preview list — every question can be edited inline (stem, answer,  */
/* marks, mark scheme) before the assignment goes out                 */
/* ------------------------------------------------------------------ */
function QuestionPreviewList({
  questions,
  onRemove,
  onEdit,
  readOnly,
}: {
  questions: Question[];
  onRemove?: (id: string) => void;
  onEdit?: (id: string, q: Question) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="glass rounded-xl">
      <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium">
        <span>{readOnly ? `Preview ${questions.length} questions` : `Questions · ${questions.length} — tap any Edit to tweak it`}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="px-5 pb-5 space-y-3 max-h-[520px] overflow-y-auto scroll-slim">
          {questions.map((q, i) =>
            editingId === q.id && onEdit ? (
              <li key={q.id} className="glass-soft rounded-lg p-3">
                <QuestionEditor
                  q={q}
                  onCancel={() => setEditingId(null)}
                  onSave={(nq) => {
                    onEdit(q.id, nq);
                    setEditingId(null);
                  }}
                />
              </li>
            ) : (
              <li key={q.id} className="glass-soft rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-primary tabular-nums">{i + 1}</span>
                  <TypeBadge type={q.type} />
                  <MarksChip marks={q.marks} />
                  <span className="text-[10px] text-muted-foreground ml-auto">{q.topic} {topicTitle(q.topic).split(' ')[0]}</span>
                  {!readOnly && onEdit ? (
                    <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Edit question" onClick={() => setEditingId(q.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                  {!readOnly && onRemove ? (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-[var(--danger)]" aria-label="Remove question" onClick={() => onRemove(q.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
                {q.extract ? (
                  <p className="text-xs italic text-muted-foreground border-l-2 pl-2 my-1.5">[{q.extract.title}] {q.extract.text.slice(0, 120)}…</p>
                ) : null}
                <p>{q.stem}</p>
                {q.type === 'written' ? (
                  <div className="mt-1.5">
                    <p className="text-xs text-muted-foreground">
                      {q.marks} {q.marks === 1 ? 'mark' : 'marks'} · AI marked · mark scheme:
                    </p>
                    <ol className="list-decimal pl-5 mt-1 space-y-0.5">
                      {(q as WrittenQuestion).points.map((p, pi) => (
                        <li key={pi} className="text-xs text-muted-foreground">
                          {p.text} <span className="text-foreground font-medium">({p.marks})</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {q.type === 'mcq'
                      ? `Correct: ${q.options[q.correct]}`
                      : q.type === 'numeric'
                        ? `Answer: ${q.value}${q.unit ?? ''} ± ${q.tol}`
                        : q.type === 'truefalse'
                          ? `Answer: ${q.answer ? 'True' : 'False'}`
                          : `Accept: ${q.accept.join(' / ')}`}
                  </p>
                )}
              </li>
            )
          )}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* Inline editor for one question — works for every question type. */
function QuestionEditor({ q, onSave, onCancel }: { q: Question; onSave: (q: Question) => void; onCancel: () => void }) {
  const [stem, setStem] = useState(q.stem);
  const [explain, setExplain] = useState(q.explain);
  const [marks, setMarks] = useState(q.marks);
  const [options, setOptions] = useState(q.type === 'mcq' ? [...q.options] : ['', '', '', '']);
  const [correct, setCorrect] = useState(q.type === 'mcq' ? q.correct : 0);
  const [accept, setAccept] = useState(q.type === 'term' || q.type === 'fib' ? q.accept.join(', ') : '');
  const [value, setValue] = useState(q.type === 'numeric' ? String(q.value) : '');
  const [tol, setTol] = useState(q.type === 'numeric' ? String(q.tol) : '0.5');
  const [tf, setTf] = useState(q.type === 'truefalse' ? q.answer : true);
  const [points, setPoints] = useState<WrittenPoint[]>(
    q.type === 'written' ? (q as WrittenQuestion).points.map((p) => ({ ...p })) : [{ text: '', marks: 1 }]
  );

  const writtenTotal = points.reduce((s, p) => s + (Number(p.marks) || 0), 0);

  const ready =
    stem.trim().length >= 8 &&
    explain.trim().length >= (q.type === 'written' ? 10 : 5) &&
    (q.type === 'mcq'
      ? options.every((o) => o.trim())
      : q.type === 'term' || q.type === 'fib'
        ? accept.trim().length > 0
        : q.type === 'numeric'
          ? value !== '' && Number.isFinite(Number(value)) && Number.isFinite(Number(tol))
          : q.type === 'written'
            ? points.filter((p) => p.text.trim().length >= 5).length >= 2 && writtenTotal >= 2 && writtenTotal <= 12
            : true);

  function save() {
    if (!ready) return;
    const base = { ...q, stem: stem.trim(), explain: explain.trim() };
    let out: Question;
    if (q.type === 'mcq') {
      out = { ...base, type: 'mcq', options: options.map((o) => o.trim()), correct, marks };
    } else if (q.type === 'term' || q.type === 'fib') {
      out = { ...base, type: q.type, accept: accept.split(',').map((a) => a.trim()).filter(Boolean), marks };
    } else if (q.type === 'numeric') {
      out = { ...base, type: 'numeric', value: Number(value), tol: Number(tol), marks };
    } else if (q.type === 'truefalse') {
      out = { ...base, type: 'truefalse', answer: tf, marks };
    } else {
      const pts = points.filter((p) => p.text.trim().length >= 5);
      out = {
        ...base,
        type: 'written',
        points: pts.map((p) => ({ text: p.text.trim(), marks: Math.max(1, Math.min(3, Number(p.marks) || 1)) })),
        marks: writtenTotal,
      };
    }
    onSave(out);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <TypeBadge type={q.type} />
        {q.type !== 'written' ? (
          <div className="flex items-center gap-1.5 ml-auto">
            <Label className="text-xs">Marks</Label>
            <Select value={String(marks)} onValueChange={(v) => setMarks(Number(v))}>
              <SelectTrigger className="h-8 w-[72px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Badge variant="outline" className="tabular-nums ml-auto">{writtenTotal} {writtenTotal === 1 ? 'mark' : 'marks'}</Badge>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Question</Label>
        <Textarea value={stem} onChange={(e) => setStem(e.target.value)} rows={2} />
      </div>

      {q.type === 'mcq' ? (
        <div className="grid sm:grid-cols-2 gap-2">
          {options.map((o, i) => (
            <div key={i} className="flex gap-2 items-center">
              <RadioGroup value={String(correct)} onValueChange={(v) => setCorrect(Number(v))} className="flex">
                <RadioGroupItem value={String(i)} id={`e-opt-${i}`} aria-label={`Option ${i + 1} correct`} />
              </RadioGroup>
              <Input
                value={o}
                onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className={cn('h-9', correct === i && 'border-[var(--success)]')}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground sm:col-span-2">The dot marks the correct option.</p>
        </div>
      ) : null}

      {q.type === 'term' || q.type === 'fib' ? (
        <div className="space-y-1">
          <Label className="text-xs">Accepted answers (comma separated)</Label>
          <Input value={accept} onChange={(e) => setAccept(e.target.value)} className="h-9" />
        </div>
      ) : null}

      {q.type === 'numeric' ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Answer</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">± tolerance</Label>
            <Input value={tol} onChange={(e) => setTol(e.target.value)} inputMode="decimal" className="h-9" />
          </div>
        </div>
      ) : null}

      {q.type === 'truefalse' ? (
        <RadioGroup value={tf ? 't' : 'f'} onValueChange={(v) => setTf(v === 't')} className="flex gap-4">
          <div className="flex items-center gap-2"><RadioGroupItem value="t" id="e-tf-t" /><Label htmlFor="e-tf-t" className="text-xs">True</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="f" id="e-tf-f" /><Label htmlFor="e-tf-f" className="text-xs">False</Label></div>
        </RadioGroup>
      ) : null}

      {q.type === 'written' ? (
        <div className="space-y-2">
          <Label className="text-xs">Mark scheme (each point 1–3 marks)</Label>
          {points.map((p, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-start">
              <Textarea
                value={p.text}
                onChange={(e) => setPoints(points.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                rows={1}
                className="flex-1 min-w-[200px]"
              />
              <Select value={String(p.marks)} onValueChange={(v) => setPoints(points.map((x, j) => (j === i ? { ...x, marks: Number(v) } : x)))}>
                <SelectTrigger className="w-[74px] shrink-0" aria-label={`Marks for point ${i + 1}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 mark</SelectItem>
                  <SelectItem value="2">2 marks</SelectItem>
                  <SelectItem value="3">3 marks</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[var(--danger)] shrink-0"
                aria-label="Remove marking point"
                disabled={points.length === 1}
                onClick={() => setPoints(points.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" disabled={points.length >= 8} onClick={() => setPoints([...points, { text: '', marks: 1 }])}>
            <PlusCircle className="h-3.5 w-3.5" /> Add marking point
          </Button>
        </div>
      ) : null}

      <div className="space-y-1">
        <Label className="text-xs">{q.type === 'written' ? 'Model answer' : 'Explanation'} (students see this after marking)</Label>
        <Textarea value={explain} onChange={(e) => setExplain(e.target.value)} rows={2} />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={save} disabled={!ready}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Save changes
        </Button>
      </div>
    </div>
  );
}

/* custom question builder */
function CustomBuilder({ list, setList }: { list: Question[]; setList: (q: Question[]) => void }) {
  const [type, setType] = useState<QuestionType>('mcq');
  const [topic, setTopic] = useState('2.1');
  const [stem, setStem] = useState('');
  const [marks, setMarks] = useState(1);
  const [explain, setExplain] = useState('');
  const [extractOn, setExtractOn] = useState(false);
  const [extractTitle, setExtractTitle] = useState('');
  const [extractText, setExtractText] = useState('');
  // mcq
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  // text
  const [accept, setAccept] = useState('');
  // numeric
  const [value, setValue] = useState('');
  const [tol, setTol] = useState('0.5');
  const [unit, setUnit] = useState('%');
  const [dp, setDp] = useState('1');
  // tf
  const [tf, setTf] = useState(true);

  function add() {
    const extract =
      extractOn && extractTitle.trim() && extractText.trim().length >= 20
        ? { title: extractTitle.trim(), text: extractText.trim() }
        : undefined;
    const base = { id: `c${Date.now().toString(36)}`, topic, marks, stem: stem.trim(), explain: explain.trim(), extract };
    let q: Question | null = null;
    if (type === 'mcq') {
      if (options.some((o) => !o.trim())) q = null;
      else q = { ...base, type: 'mcq', difficulty: 2, options: options.map((o) => o.trim()), correct };
    } else if (type === 'term' || type === 'fib') {
      const acc = accept.split(',').map((a) => a.trim()).filter(Boolean);
      q = acc.length ? { ...base, type, difficulty: 2, accept: acc } : null;
    } else if (type === 'numeric') {
      const v = Number(value);
      const t = Number(tol);
      q = Number.isFinite(v) && value !== '' && Number.isFinite(t)
        ? { ...base, type: 'numeric', difficulty: 2, value: v, tol: t, unit: unit === 'none' ? undefined : unit, dp: Number(dp) || undefined }
        : null;
    } else {
      q = { ...base, type: 'truefalse', difficulty: 2, answer: tf };
    }
    if (!q || q.stem.length < 8 || q.explain.length < 5) {
      return; // the Add button is disabled until required fields are filled
    }
    setList([...list, q]);
    setStem('');
    setExplain('');
    setAccept('');
    setValue('');
    setOptions(['', '', '', '']);
    setExtractText('');
    setExtractTitle('');
    return undefined;
  }

  const ready =
    stem.trim().length >= 8 &&
    explain.trim().length >= 5 &&
    (type === 'mcq'
      ? options.every((o) => o.trim())
      : type === 'term' || type === 'fib'
        ? accept.trim().length > 0
        : type === 'numeric'
          ? value !== '' && Number.isFinite(Number(value))
          : true);

  return (
    <div className="space-y-4">
      {type === 'written' ? (
        <WrittenFields onAdd={(q) => setList([...list, q])} />
      ) : (
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple choice</SelectItem>
                <SelectItem value="term">Type the term</SelectItem>
                <SelectItem value="fib">Fill the blank</SelectItem>
                <SelectItem value="numeric">Calculation</SelectItem>
                <SelectItem value="truefalse">True / false</SelectItem>
                <SelectItem value="written">Written · AI marked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.id} · {t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Marks</Label>
            <Select value={String(marks)} onValueChange={(v) => setMarks(Number(v))}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="c-stem">Question</Label>
          <Textarea id="c-stem" value={stem} onChange={(e) => setStem(e.target.value)} rows={2} placeholder={type === 'fib' ? 'A ________ business operates in more than one country. What one word completes the sentence?' : 'What does PLC stand for?'} />
        </div>

        {type === 'mcq' ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {options.map((o, i) => (
              <div key={i} className="flex gap-2 items-center">
                <RadioGroup value={String(correct)} onValueChange={(v) => setCorrect(Number(v))} className="flex">
                  <RadioGroupItem value={String(i)} id={`opt-${i}`} aria-label={`Option ${i + 1} correct`} />
                </RadioGroup>
                <Input
                  value={o}
                  onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className={correct === i ? 'border-[var(--success)]' : ''}
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground sm:col-span-2">Select the dot next to the correct option.</p>
          </div>
        ) : null}

        {type === 'term' || type === 'fib' ? (
          <div className="space-y-1">
            <Label htmlFor="c-accept">Accepted answers (comma separated)</Label>
            <Input id="c-accept" value={accept} onChange={(e) => setAccept(e.target.value)} placeholder="public limited company, plc" />
            <p className="text-xs text-muted-foreground">Matching ignores capitals, punctuation and extra spaces.</p>
          </div>
        ) : null}

        {type === 'numeric' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1"><Label htmlFor="c-val">Answer</Label><Input id="c-val" value={value} onChange={(e) => setValue(e.target.value)} placeholder="59.8" inputMode="decimal" /></div>
            <div className="space-y-1"><Label htmlFor="c-tol">± tolerance</Label><Input id="c-tol" value={tol} onChange={(e) => setTol(e.target.value)} inputMode="decimal" /></div>
            <div className="space-y-1">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="%">%</SelectItem>
                  <SelectItem value="£">£</SelectItem>
                  <SelectItem value="loaves">loaves</SelectItem>
                  <SelectItem value="units">units</SelectItem>
                  <SelectItem value="none">none</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Decimal places</Label>
              <Select value={dp} onValueChange={setDp}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 dp</SelectItem>
                  <SelectItem value="1">1 dp</SelectItem>
                  <SelectItem value="2">2 dp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        {type === 'truefalse' ? (
          <RadioGroup value={tf ? 't' : 'f'} onValueChange={(v) => setTf(v === 't')} className="flex gap-4">
            <div className="flex items-center gap-2"><RadioGroupItem value="t" id="tf-t" /><Label htmlFor="tf-t">True</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="f" id="tf-f" /><Label htmlFor="tf-f">False</Label></div>
          </RadioGroup>
        ) : null}

        <div className="glass-soft rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Case study extract (optional)</span>
            <Switch checked={extractOn} onCheckedChange={setExtractOn} aria-label="Add case study" />
          </div>
          {extractOn ? (
            <>
              <Input value={extractTitle} onChange={(e) => setExtractTitle(e.target.value)} placeholder="Case study title (e.g. The Dough House)" />
              <Textarea value={extractText} onChange={(e) => setExtractText(e.target.value)} rows={3} placeholder="2–4 sentences of business context…" />
            </>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label htmlFor="c-explain">Explanation (students see this after marking)</Label>
          <Textarea id="c-explain" value={explain} onChange={(e) => setExplain(e.target.value)} rows={2} placeholder="Break-even = fixed costs ÷ contribution per unit…" />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {list.length} question{list.length === 1 ? '' : 's'} in this assignment
          </p>
          <Button variant="outline" onClick={() => { if (ready) add(); }} disabled={!ready}>
            <PlusCircle className="h-4 w-4" /> Add question
          </Button>
        </div>
      </div>
      )}

      {list.length > 0 ? (
        <QuestionPreviewList
          questions={list}
          onRemove={(id) => setList(list.filter((q) => q.id !== id))}
          onEdit={(id, nq) => setList(list.map((x) => (x.id === id ? nq : x)))}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Written (AI-marked) question builder — used on its own in step 2    */
/* (on top of library/AI quizzes) and inside the custom builder        */

function WrittenFields({ onAdd }: { onAdd: (q: Question) => void }) {
  const [topic, setTopic] = useState('2.1');
  const [stem, setStem] = useState('');
  const [points, setPoints] = useState<{ text: string; marks: number }[]>([{ text: '', marks: 1 }]);
  const [model, setModel] = useState('');
  const [extractOn, setExtractOn] = useState(false);
  const [extractTitle, setExtractTitle] = useState('');
  const [extractText, setExtractText] = useState('');

  const total = points.reduce((s, p) => s + (Number(p.marks) || 0), 0);
  const ready =
    stem.trim().length >= 15 &&
    model.trim().length >= 10 &&
    points.length >= 1 &&
    points.every((p) => p.text.trim().length >= 5) &&
    total >= 2 &&
    total <= 12;

  function add() {
    const extract =
      extractOn && extractTitle.trim() && extractText.trim().length >= 20
        ? { title: extractTitle.trim(), text: extractText.trim() }
        : undefined;
    onAdd({
      id: `w${Date.now().toString(36)}`,
      type: 'written',
      topic,
      difficulty: 3,
      marks: total,
      stem: stem.trim(),
      explain: model.trim(),
      extract,
      points: points.map((p) => ({ text: p.text.trim(), marks: Math.max(1, Math.min(3, Number(p.marks) || 1)) })),
    });
    setStem('');
    setPoints([{ text: '', marks: 1 }]);
    setModel('');
    setExtractText('');
    setExtractTitle('');
  }

  return (
    <div className="rounded-xl border border-primary/25 glass-soft p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold flex items-center gap-2">
          <PenLine className="h-4 w-4 text-primary" aria-hidden /> Written question — marked by the AI examiner
        </div>
        <Badge variant="outline" className="tabular-nums">{total} {total === 1 ? 'mark' : 'marks'}</Badge>
      </div>

      <div className="space-y-1">
        <Label>Topic</Label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.id} · {t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="w-stem">Question</Label>
        <Textarea
          id="w-stem"
          value={stem}
          onChange={(e) => setStem(e.target.value)}
          rows={2}
          placeholder="e.g. Discuss the likely benefits and drawbacks of this growth strategy for Maya's bakery. Refer to the case study in your answer."
        />
        <p className="text-xs text-muted-foreground">Ask for analysis, justification or evaluation — the things a one-word answer can't show.</p>
      </div>

      <div className="glass-soft rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Mark scheme</span>
          <span className="text-xs text-muted-foreground">each point = 1–3 marks · total {total}/12</span>
        </div>
        <div className="space-y-2">
          {points.map((p, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-start">
              <span className="text-xs font-bold text-muted-foreground mt-2.5 w-4 shrink-0 tabular-nums">{i + 1}.</span>
              <Textarea
                value={p.text}
                onChange={(e) => setPoints(points.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                rows={1}
                placeholder={i === 0 ? 'e.g. Identifies a benefit, e.g. higher revenue from more customers (1 mark)' : 'Another marking point…'}
                className="flex-1 min-w-[220px]"
              />
              <Select value={String(p.marks)} onValueChange={(v) => setPoints(points.map((x, j) => (j === i ? { ...x, marks: Number(v) } : x)))}>
                <SelectTrigger className="w-[74px] shrink-0" aria-label={`Marks for point ${i + 1}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 mark</SelectItem>
                  <SelectItem value="2">2 marks</SelectItem>
                  <SelectItem value="3">3 marks</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[var(--danger)] shrink-0"
                aria-label="Remove marking point"
                disabled={points.length === 1}
                onClick={() => setPoints(points.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={points.length >= 8} onClick={() => setPoints([...points, { text: '', marks: 1 }])}>
            <PlusCircle className="h-3.5 w-3.5" /> Add marking point
          </Button>
          <span className="text-xs text-muted-foreground">{points.length}/8 points</span>
        </div>
      </div>

      <div className="glass-soft rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Case study extract (optional)</span>
          <Switch checked={extractOn} onCheckedChange={setExtractOn} aria-label="Add case study" />
        </div>
        {extractOn ? (
          <>
            <Input value={extractTitle} onChange={(e) => setExtractTitle(e.target.value)} placeholder="Case study title (e.g. Maya's Bakery)" />
            <Textarea value={extractText} onChange={(e) => setExtractText(e.target.value)} rows={3} placeholder="2–4 sentences of business context students answer from…" />
          </>
        ) : null}
      </div>

      <div className="space-y-1">
        <Label htmlFor="w-model">Model answer (students see this after marking)</Label>
        <Textarea id="w-model" value={model} onChange={(e) => setModel(e.target.value)} rows={3} placeholder="A short model answer covering every marking point — shown once the AI has marked the response." />
      </div>

      <Button onClick={add} disabled={!ready} className="w-full sm:w-auto">
        <PlusCircle className="h-4 w-4" /> Add written question · {total} {total === 1 ? 'mark' : 'marks'}
      </Button>
      {!ready ? (
        <p className="text-xs text-muted-foreground">Needs a question (15+ characters), at least one marking point (5+ characters), a model answer and 2–12 marks in total.</p>
      ) : null}
    </div>
  );
}

/* Step-2 wrapper: the list of added written questions + the builder */
function WrittenSection({ list, setList }: { list: Question[]; setList: (q: Question[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border border-primary/25 glass-soft">
      <CollapsibleTrigger className="w-full flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm font-medium">
        <span className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-primary" aria-hidden /> Add a written question — marked by AI
          {list.length > 0 ? (
            <Badge variant="secondary" className="tabular-nums">{list.length} added</Badge>
          ) : null}
        </span>
        <span className="text-xs text-muted-foreground">{open ? 'close' : 'optional'}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-5 pb-5 space-y-3">
        <p className="text-xs text-muted-foreground">
          Students write a long answer; the AI examiner marks it against your mark scheme and shows exactly which points earned marks.
        </p>
        {list.length > 0 ? (
          <ul className="space-y-2">
            {list.map((q, i) => {
              const wq = q as WrittenQuestion;
              return (
              <li key={q.id} className="glass-soft rounded-lg p-3 text-sm flex gap-3 items-start">
                <span className="font-bold text-primary tabular-nums shrink-0">W{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{q.stem}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {q.marks} {q.marks === 1 ? 'mark' : 'marks'} · {wq.points.length} marking {wq.points.length === 1 ? 'point' : 'points'} · {topicTitle(q.topic).split(' ')[0]}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--danger)] shrink-0" aria-label="Remove written question" onClick={() => setList(list.filter((x) => x.id !== q.id))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
              );
            })}
          </ul>
        ) : null}
        <WrittenFields onAdd={(q) => setList([...list, q])} />
      </CollapsibleContent>
    </Collapsible>
  );
}
