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
import type { Question, QuestionType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ClassRow { id: string; name: string; studentCount: number }
interface QuizRow { id: string; title: string; blurb: string; theme: 1 | 2; topics: string[]; questionCount: number; types: QuestionType[] }

type Mode = 'library' | 'ai' | 'custom';

export function NewAssignment({ presetQuizId }: { presetQuizId?: string }) {
  const go = useApp((s) => s.go);
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  // step 1
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classId, setClassId] = useState('');
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
  // step 3
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ classes: ClassRow[] }>('/api/teacher/classes').then((d) => {
      setClasses(d.classes);
      if (d.classes.length > 0 && !presetQuizId) setClassId(d.classes[0].id);
    }).catch((e) => setError((e as Error).message));
    api.get<{ quizzes: QuizRow[] }>('/api/quizzes').then((d) => setQuizzes(d.quizzes)).catch(() => undefined);
     
  }, []);

  const dueAt = useMemo(() => {
    if (!dueLocal) return null;
    const t = new Date(dueLocal).getTime();
    return Number.isFinite(t) ? t : null;
  }, [dueLocal]);

  const questions: Question[] | null =
    mode === 'library'
      ? quizzes.find((q) => q.id === quizId)
        ? (null as unknown as Question[]) // replaced below via preview fetch
        : null
      : mode === 'ai'
        ? aiQuestions
        : custom.length
          ? custom
          : null;

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

  const finalQuestions =
    mode === 'library' ? libraryQuestions : mode === 'ai' ? aiQuestions : custom;
  const totalMarks = finalQuestions?.reduce((s, q) => s + q.marks, 0) ?? 0;

  const canStep2 =
    title.trim().length >= 3 && classId !== '' && (!timed || (timeLimit >= 3 && timeLimit <= 180));
  const canStep3 =
    mode === 'library'
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
      toast({
        title: res.provider === 'bank' ? 'Using the human-written bank' : 'Questions generated',
        description: res.note,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  }

  async function assign() {
    setCreating(true);
    setError(null);
    try {
      const body = {
        classId,
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
        customQuestions: mode === 'custom' ? custom : undefined,
      };
      const res = await api.post<{ assignmentId: string; questionCount: number; generatedBy: string }>(
        '/api/teacher/assignments',
        body
      );
      toast({ title: 'Assignment set', description: `${res.questionCount} questions · ${res.generatedBy}` });
      go({ name: 't-results', assignmentId: res.assignmentId });
    } catch (e) {
      setError((e as Error).message);
      window.scrollTo({ top: 0 });
    } finally {
      setCreating(false);
    }
  }

  const selClass = classes.find((c) => c.id === classId);

  return (
    <>
      <PageHeader
        title="New assignment"
        sub={step === 1 ? 'The basics — who, when and how long.' : step === 2 ? 'Where do the questions come from?' : 'Last check before it goes live.'}
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
          <div className="space-y-4 rounded-xl border bg-card p-5">
            <div className="space-y-2">
              <Label htmlFor="a-title">Give your assignment a name</Label>
              <Input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Half-term homework" />
              <p className="text-xs text-muted-foreground">Students see this name on their homepage.</p>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              {classes.length === 0 ? (
                <p className="text-sm text-[var(--warn)]">You need a class first — add one under “Classes”.</p>
              ) : (
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger><SelectValue placeholder="Choose class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} · {c.studentCount} students
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-desc">Instructions for students (optional)</Label>
              <Textarea id="a-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Read each case study carefully." />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-5">
            <div className="space-y-2">
              <Label htmlFor="a-due">Due date &amp; time (optional)</Label>
              <Input id="a-due" type="datetime-local" value={dueLocal} onChange={(e) => setDueLocal(e.target.value)} />
              <p className="text-xs text-muted-foreground">Students can still submit after the deadline — it is tagged “late”.</p>
            </div>
            <div className="rounded-lg border p-4 space-y-3">
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
                  <p className="text-xs text-muted-foreground">3–90 minutes.</p>
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
              <label key={o.v} className={cn('cursor-pointer rounded-xl border p-4 flex gap-3 items-start transition-colors', mode === o.v ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50')}>
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
                        'rounded-xl border p-4 text-left transition-colors',
                        quizId === q.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary/50'
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
            <div className="rounded-xl border bg-card p-5 space-y-5">
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
                <p className="text-xs text-muted-foreground">Leave all off for a natural mix.</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
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
                    {aiProvider && aiProvider !== 'bank' ? <Badge variant="outline" className="ml-1">{aiProvider}</Badge> : null}
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

              {aiQuestions ? <QuestionPreviewList questions={aiQuestions} onRemove={(id) => setAiQuestions(aiQuestions.filter((q) => q.id !== id))} /> : null}
            </div>
          ) : null}

          {mode === 'custom' ? (
            <CustomBuilder list={custom} setList={setCustom} />
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
          <div className="rounded-xl border bg-card p-5 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              ['Title', title],
              ['Class', selClass ? `${selClass.name} (${selClass.studentCount})` : '—'],
              ['Due', dueAt ? new Date(dueAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'No deadline'],
              ['Timed', timed ? `${timeLimit} minutes` : 'Untimed'],
              ['Questions', finalQuestions ? `${finalQuestions.length} · ${totalMarks} marks` : '—'],
              [
                'Source',
                mode === 'library' ? 'Quiz library' : mode === 'ai' ? (aiProvider === 'bank' ? 'Human-written bank (AI offline)' : 'AI generated') : 'Your questions',
              ],
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

          {finalQuestions ? <QuestionPreviewList questions={finalQuestions} readOnly /> : null}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Questions</Button>
            <Button onClick={assign} disabled={creating}>
              {creating ? 'Setting…' : <>Set assignment <CheckCircle2 className="h-4 w-4" /></>}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* shared preview list */
function QuestionPreviewList({
  questions,
  onRemove,
  readOnly,
}: {
  questions: Question[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border bg-card">
      <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium">
        <span>Preview {questions.length} questions</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="px-5 pb-5 space-y-3 max-h-[480px] overflow-y-auto scroll-slim">
          {questions.map((q, i) => (
            <li key={q.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold text-primary tabular-nums">{i + 1}</span>
                <TypeBadge type={q.type} />
                <MarksChip marks={q.marks} />
                <span className="text-[10px] text-muted-foreground ml-auto">{q.topic} {topicTitle(q.topic).split(' ')[0]}</span>
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
              <p className="text-xs text-muted-foreground mt-1">
                {q.type === 'mcq'
                  ? `Correct: ${q.options[q.correct]}`
                  : q.type === 'numeric'
                    ? `Answer: ${q.value}${q.unit ?? ''} ± ${q.tol}`
                    : q.type === 'truefalse'
                      ? `Answer: ${q.answer ? 'True' : 'False'}`
                      : `Accept: ${q.accept.join(' / ')}`}
              </p>
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
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
      <div className="rounded-xl border bg-card p-5 space-y-4">
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

        <div className="rounded-lg border p-3 space-y-3">
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

      {list.length > 0 ? (
        <QuestionPreviewList questions={list} onRemove={(id) => setList(list.filter((q) => q.id !== id))} />
      ) : null}
    </div>
  );
}
