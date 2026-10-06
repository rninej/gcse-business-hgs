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
  Library,
  Dices,
  Search,
  SearchX,
  X,
  Clock,
  Zap,
  CalendarClock,
  Check,
  FlaskConical,
  Loader2,
  Share2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/store';
import { PageHeader, MarksChip, TypeBadge, ErrorNote } from '@/components/shared';
import { SUBTOPIC_MAP, subtopicsOf, targetLabel, topicTitle, TOPICS } from '@/lib/topics';
import { AskFirst, PURPOSE_PROMPT, difficultyLabel, purposeLabel, typesLabel } from './AskFirst';
import type { Question, QuestionType, WrittenPoint, WrittenQuestion } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ClassRow { id: string; name: string; studentCount: number }
interface StudentLite { id: string; displayName: string; username: string; classId: string; className: string }
interface QuizRow { id: string; title: string; blurb: string; theme: 1 | 2; topics: string[]; subtopics?: string[]; questionCount: number; types: QuestionType[] }

type Mode = 'library' | 'ai' | 'custom';

/** the server caps custom assignments at 40 questions — surface it early */
const CUSTOM_MAX = 40;

/** one row of the bank picker (Question is a union, so intersect it) */
type BankRow = Question & { quizTitle: string };

const BANK_TYPE_CHIPS: [QuestionType, string][] = [
  ['mcq', 'Multiple choice'],
  ['term', 'Type the term'],
  ['fib', 'Fill the blank'],
  ['numeric', 'Calculations'],
  ['truefalse', 'True / false'],
  ['written', 'Written'],
];

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
  // step 2 — Generate is the default: it is the fastest path to a great quiz
  const [mode, setMode] = useState<Mode>(presetQuizId ? 'library' : 'ai');
  const [tryingSelf, setTryingSelf] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [quizId, setQuizId] = useState(presetQuizId ?? '');
  // ai
  const [aiTopics, setAiTopics] = useState<string[]>(['2.1']);
  // individually selected sub-topics ('2.1.3') — hard boundaries the AI
  // and the bank fallback must respect (globalisation means globalisation)
  const [aiSubtopics, setAiSubtopics] = useState<string[]>([]);
  // bank coverage per sub-topic, shown on the chips so teachers can see
  // what the human-written bank already covers
  const [subCounts, setSubCounts] = useState<Record<string, number> | null>(null);
  const [aiBrief, setAiBrief] = useState('');
  const [aiCount, setAiCount] = useState(12);
  const [aiTypes, setAiTypes] = useState<QuestionType[]>([]);
  const [aiDifficulty, setAiDifficulty] = useState<'1' | '2' | '3' | 'mixed'>('mixed');
  const [aiCases, setAiCases] = useState(true);
  const [aiPurpose, setAiPurpose] = useState('');
  // the ask-first interview: 1–6 = the question on screen, 7 = the brief summary
  const [askStep, setAskStep] = useState(1);
  // hidden once questions exist (brief bar takes over); "Change answers" reopens it at the summary
  const [showInterview, setShowInterview] = useState(true);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<Question[] | null>(null);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  // custom
  const [custom, setCustom] = useState<Question[]>([]);
  // ids of the custom questions that came from the bank (vs typed) — drives
  // the little “Bank” badge in the lists
  const [bankIds, setBankIds] = useState<Set<string>>(new Set());
  // a quiz imported from another teacher's share code — shows attribution
  const [sharedFrom, setSharedFrom] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  // the share-code entry stays collapsed behind a quiet link until asked for —
  // it's a rare flow and shouldn't compete with the three main sources
  const [shareOpen, setShareOpen] = useState(false);
  // teacher-added written questions — append to any question source
  const [extraWritten, setExtraWritten] = useState<Question[]>([]);
  // drafts
  const [updatingDraftId, setUpdatingDraftId] = useState<string | null>(null);
  // step 3
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // step 3: send now vs schedule
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [publishLocal, setPublishLocal] = useState('');

  useEffect(() => {
    api.get<{ classes: ClassRow[] }>('/api/teacher/classes').then((d) => {
      setClasses(d.classes);
      if (d.classes.length > 0 && !presetQuizId && !draftId) setClassIds([d.classes[0].id]);
    }).catch((e) => setError((e as Error).message));
    api.get<{ students: StudentLite[] }>('/api/teacher/students').then((d) => setStudents(d.students)).catch(() => undefined);
    api.get<{ quizzes: QuizRow[]; subtopicCounts?: Record<string, number> }>('/api/quizzes?audience=assignment')
      .then((d) => {
        setQuizzes(d.quizzes);
        if (d.subtopicCounts) setSubCounts(d.subtopicCounts);
      })
      .catch(() => undefined);
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
        setShowInterview(false);
      })
      .catch((e) => setError((e as Error).message));
  }, [draftId]);

  const dueAt = useMemo(() => {
    if (!dueLocal) return null;
    const t = new Date(dueLocal).getTime();
    return Number.isFinite(t) ? t : null;
  }, [dueLocal]);

  // scheduled go-live moment (step 3) — null when sending now
  const publishAt = useMemo(() => {
    if (sendMode !== 'schedule' || !publishLocal) return null;
    const t = new Date(publishLocal).getTime();
    return Number.isFinite(t) ? t : null;
  }, [sendMode, publishLocal]);
  const scheduleReady = sendMode === 'now' || (publishAt !== null && publishAt > Date.now());
  const scheduleAfterDue = dueAt !== null && publishAt !== null && publishAt > dueAt;

  /** Redeem another teacher's share code: loads their whole question set into
   *  the editable list (mode switches to “My questions”) so this teacher can
   *  tweak anything before setting it to their own classes. */
  async function redeemShare() {
    const code = shareCode.replace(/[\s-]/g, '').toUpperCase();
    if (code.length !== 6) {
      setShareError('Share codes are 6 characters, like K7P2XQ.');
      return;
    }
    setShareBusy(true);
    setShareError(null);
    try {
      const res = await api.get<{ title: string; fromName: string; questionCount: number; questions: Question[] }>(
        `/api/teacher/share?code=${code}`
      );
      const qs = res.questions.slice(0, CUSTOM_MAX);
      setCustom(qs);
      setSharedFrom(res.fromName);
      setMode('custom');
      if (!title.trim()) setTitle(res.title);
      setShareCode('');
      toast({
        title: `Loaded “${res.title}”`,
        description: `${res.questionCount} questions from ${res.fromName} — edit anything you like, then assign it.`,
      });
    } catch (e) {
      setShareError((e as Error).message);
    } finally {
      setShareBusy(false);
    }
  }

  /** Append bank questions to the SAME list typed questions use — deduped by
   *  id and clamped to the 40-question cap, with a toast that says exactly
   *  what happened. */
  function addBankQuestions(picked: Question[]) {
    if (picked.length === 0) return;
    const existing = new Set(custom.map((q) => q.id));
    const fresh = picked.filter((q) => !existing.has(q.id));
    const room = Math.max(0, CUSTOM_MAX - custom.length);
    const added = fresh.slice(0, room);
    if (added.length === 0) {
      toast({
        title: 'Nothing added',
        description:
          custom.length >= CUSTOM_MAX
            ? 'This assignment is full — up to 40 questions.'
            : 'Those questions are already in the list.',
      });
      return;
    }
    setCustom([...custom, ...added]);
    setBankIds((prev) => {
      const next = new Set(prev);
      for (const q of added) next.add(q.id);
      return next;
    });
    const skippedDupes = picked.length - fresh.length;
    const skippedCap = fresh.length - added.length;
    toast({
      title: `${added.length} bank question${added.length === 1 ? '' : 's'} added`,
      description:
        [
          skippedDupes > 0 ? `${skippedDupes} already in the list` : '',
          skippedCap > 0 ? `list is full at ${CUSTOM_MAX}` : '',
        ]
          .filter(Boolean)
          .join(' · ') || `${custom.length + added.length} question${custom.length + added.length === 1 ? '' : 's'} in this assignment so far.`,
    });
  }

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

  /** topic chips: tap to select the WHOLE topic, tap again to clear it */
  function toggleTopic(id: string) {
    if (aiTopics.includes(id)) {
      setAiTopics(aiTopics.filter((x) => x !== id));
    } else {
      setAiTopics([...aiTopics, id]);
    }
    // any partial picks for that topic are replaced by the whole-topic choice
    setAiSubtopics(aiSubtopics.filter((s) => !s.startsWith(id + '.')));
  }

  /** 'Whole topic' chip inside a topic's panel */
  function pickWhole(id: string) {
    if (aiTopics.includes(id)) return;
    setAiTopics([...aiTopics, id]);
    setAiSubtopics(aiSubtopics.filter((s) => !s.startsWith(id + '.')));
  }

  /** sub-topic chips: tapping one while the WHOLE topic is selected means
   *  'actually, just this bit' — exactly the teacher's intent (2.1.3-only
   *  quizzes). Tapping more adds them; unticking all clears the topic. */
  function toggleSub(topicId: string, subId: string) {
    if (aiTopics.includes(topicId)) {
      setAiTopics(aiTopics.filter((x) => x !== topicId));
      setAiSubtopics([...aiSubtopics.filter((s) => !s.startsWith(topicId + '.')), subId]);
      return;
    }
    const next = aiSubtopics.includes(subId)
      ? aiSubtopics.filter((x) => x !== subId)
      : [...aiSubtopics, subId];
    setAiSubtopics(next);
  }

  // the brief sent to the AI: the purpose answer from the interview + the
  // teacher's free note — one text the model follows closely
  const briefOut = useMemo(
    () =>
      [
        aiPurpose ? PURPOSE_PROMPT[aiPurpose] : '',
        aiBrief.trim(),
      ]
        .filter(Boolean)
        .join('\n') || undefined,
    [aiPurpose, aiBrief]
  );

  async function generate() {
    setAiBusy(true);
    setError(null);
    try {
      const res = await api.post<{
        provider: string;
        note: string;
        questions: Question[];
      }>('/api/teacher/generate', {
        topics: aiTopics,
        subtopics: aiSubtopics,
        brief: briefOut,
        count: aiCount,
        types: aiTypes,
        difficulty: aiDifficulty === 'mixed' ? 'mixed' : Number(aiDifficulty),
        caseStudies: aiCases,
      });
      setAiQuestions(res.questions);
      setAiProvider(res.provider);
      setShowInterview(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  }

  /** dry-run the current question set as a private self-test — exactly what
   *  students would experience, without assigning anything */
  async function tryItYourself() {
    if (!finalQuestions || tryingSelf) return;
    setTryingSelf(true);
    try {
      const res = await api.post<{ attemptId: string }>('/api/teacher/selftest', {
        title: title.trim() || 'Draft quiz',
        questions: finalQuestions,
      });
      go({ name: 'quiz', attemptId: res.attemptId });
    } catch (e) {
      setTryingSelf(false);
      toast({ title: 'Could not start the self-test', description: (e as Error).message, variant: 'destructive' });
    }
  }

  async function assign(asDraft: boolean) {
    setCreating(true);
    setError(null);
    try {
      const scheduled = !asDraft && sendMode === 'schedule' && publishAt !== null && publishAt > Date.now();
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
            ? { topics: aiTopics, subtopics: aiSubtopics, brief: briefOut, count: aiQuestions?.length ?? aiCount, types: aiTypes, difficulty: aiDifficulty === 'mixed' ? 'mixed' : Number(aiDifficulty), caseStudies: aiCases }
            : undefined,
        // the reviewed (and possibly edited) preview goes with the request —
        // the server uses it directly instead of generating a second set
        previewQuestions: mode === 'ai' && aiQuestions ? aiQuestions : undefined,
        customQuestions: mode === 'custom' ? custom : undefined,
        // AI-marked written questions ride on top of any source
        extraWritten: mode !== 'custom' && extraWritten.length > 0 ? extraWritten : undefined,
        draft: asDraft,
        updateId: updatingDraftId ?? undefined,
        // scheduled publishing — only when the task actually goes out now
        publishAt: scheduled ? publishAt : undefined,
      };
      const res = await api.post<{
        assignmentId: string;
        questionCount: number;
        draft?: boolean;
        scheduled?: boolean;
      }>('/api/teacher/assignments', body);
      if (asDraft) {
        toast({ title: res.draft ? 'Draft saved' : 'Draft updated', description: 'Find it under Assignments — publish it whenever you’re ready.' });
        go({ name: 't-assignments' });
      } else if (scheduled && publishAt) {
        toast({
          title: 'Task scheduled',
          description: `Goes live ${new Date(publishAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} — students see it and hear their bells then.`,
        });
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
              { v: 'ai' as Mode, icon: Sparkles, t: 'Generate', d: 'It asks you a few questions first, then writes it' },
              { v: 'library' as Mode, icon: BookOpen, t: 'Quiz library', d: 'Hand-written banks, ready to go' },
              { v: 'custom' as Mode, icon: PenLine, t: 'My questions', d: 'Type your own — any style' },
            ].map((o) => (
              <label key={o.v} className={cn('cursor-pointer glass-soft rounded-xl p-4 flex gap-3 items-start transition-all', mode === o.v ? 'glass-selected' : 'hover:border-primary/30')}>
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
                <LibraryGrid quizzes={quizzes} quizId={quizId} onPick={setQuizId} />
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
              {/* the ask-first interview — a trial teacher said it plainly:
                  "you didn't ask me any questions. You're meant to satisfy
                  need and you don't know what we want." So the builder asks
                  first: purpose, exact sub-topics, count, difficulty, styles,
                  free note — then writes. Shown until questions exist; the
                  brief bar takes over afterwards. */}
              {showInterview || !aiQuestions ? (
                <AskFirst
                  step={askStep}
                  onStep={setAskStep}
                  purpose={aiPurpose}
                  onPurpose={setAiPurpose}
                  topics={aiTopics}
                  subtopics={aiSubtopics}
                  subCounts={subCounts}
                  onToggleTopic={toggleTopic}
                  onPickWhole={pickWhole}
                  onToggleSub={toggleSub}
                  count={aiCount}
                  onCount={setAiCount}
                  difficulty={aiDifficulty}
                  onDifficulty={setAiDifficulty}
                  types={aiTypes}
                  onTypes={setAiTypes}
                  cases={aiCases}
                  onCases={setAiCases}
                  note={aiBrief}
                  onNote={setAiBrief}
                  busy={aiBusy}
                  onGenerate={generate}
                />
              ) : aiProvider === 'draft' ? (
                <div className="glass-soft rounded-xl p-4 flex flex-wrap items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Pencil className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <p className="min-w-0 flex-1 text-sm">
                    Editing a saved draft — tweak the questions below, or change the brief and write a fresh set.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAskStep(1);
                      setShowInterview(true);
                    }}
                  >
                    Change the brief
                  </Button>
                </div>
              ) : (
                <div className="glass-soft rounded-xl p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Wand2 className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <p className="min-w-0 flex-1 text-sm">
                    <span className="font-semibold">Your brief:</span>{' '}
                    <span className="text-muted-foreground">
                      {[
                        purposeLabel(aiPurpose) || 'No particular purpose',
                        targetLabel(aiTopics, aiSubtopics),
                        `${aiQuestions.length} questions`,
                        difficultyLabel(aiDifficulty),
                        typesLabel(aiTypes, aiCases),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAskStep(7);
                        setShowInterview(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> Change answers
                    </Button>
                    <Button size="sm" onClick={generate} disabled={aiBusy}>
                      {aiBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <RotateCw className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {aiBusy ? 'Writing…' : 'Generate again'}
                    </Button>
                  </div>
                </div>
              )}

              {aiQuestions && !aiBusy ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-sm flex items-center gap-1.5 text-[var(--success)]">
                    <CheckCircle2 className="h-4 w-4" /> {aiQuestions.length} questions · {totalMarks} marks
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Edit, delete or reorder anything below before you set it.
                  </span>
                </div>
              ) : null}

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
            <div>
              {sharedFrom ? (
                <div className="flex flex-wrap items-center gap-2 mb-3 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2.5">
                  <Share2 className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
                  <span className="text-xs text-muted-foreground">
                    Shared quiz loaded — <span className="font-medium text-foreground">{sharedFrom}</span>&rsquo;s questions. Edit
                    anything before assigning.
                  </span>
                  <button
                    type="button"
                    onClick={() => setSharedFrom(null)}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ) : null}
              <CustomBuilder
                list={custom}
                setList={setCustom}
                bankIds={bankIds}
                setBankIds={setBankIds}
                onAddBank={addBankQuestions}
              />
            </div>
          ) : null}

          {/* AI-marked written questions — available on top of any source */}
          {mode !== 'custom' ? (
            <WrittenSection list={extraWritten} setList={setExtraWritten} />
          ) : null}

          {/* redeem another teacher's shared quiz — a rare flow, so it hides
            * behind this quiet link at the bottom instead of a big card up
            * top; expanding reveals the compact code entry */}
          <div className="pt-1">
            {!shareOpen ? (
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary rounded-sm"
              >
                <Share2 className="h-3 w-3" aria-hidden />
                Have a share code from another teacher?
              </button>
            ) : (
              <div className="rounded-lg border bg-card px-3.5 py-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="share-code" className="text-xs text-muted-foreground">
                      Enter the 6-character share code
                    </Label>
                    <Input
                      id="share-code"
                      value={shareCode}
                      onChange={(e) => {
                        setShareCode(e.target.value.toUpperCase());
                        setShareError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void redeemShare();
                        }
                      }}
                      placeholder="e.g. K7P2XQ"
                      className="font-mono tracking-widest uppercase h-9 max-w-[200px]"
                      maxLength={10}
                      autoComplete="off"
                      aria-label="Quiz share code"
                      autoFocus
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void redeemShare()}
                    disabled={shareBusy || shareCode.replace(/[\s-]/g, '').length === 0}
                    className="gap-1.5"
                  >
                    {shareBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
                    {shareBusy ? 'Loading…' : 'Load quiz'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShareOpen(false);
                      setShareError(null);
                    }}
                    aria-label="Hide the share code entry"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
                {shareError ? (
                  <p className="text-xs text-[var(--danger)]" role="alert">{shareError}</p>
                ) : sharedFrom ? (
                  <p className="text-xs text-[var(--success)] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    {sharedFrom}&rsquo;s quiz is loaded — tweak anything, then assign it.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Codes come from another teacher&rsquo;s Assignments page → Share.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Details</Button>
            <div className="flex flex-wrap justify-end gap-2">
              {(finalQuestions?.length ?? 0) > 0 ? (
                <Button variant="outline" onClick={() => void tryItYourself()} disabled={tryingSelf} className="border-primary/40 text-primary hover:bg-primary/5" title="Do this quiz yourself — exactly as students see it — without assigning it">
                  <FlaskConical className={tryingSelf ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
                  {tryingSelf ? 'Starting…' : 'Test it yourself'}
                </Button>
              ) : null}
              <Button disabled={!canStep3} onClick={() => setStep(3)}>
                Review <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
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
              [
                'Goes live',
                sendMode === 'schedule' && publishAt
                  ? new Date(publishAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Straight away',
              ],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-3 border-b py-1.5 last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-right">{v}</span>
              </div>
            ))}
          </div>

          {/* send now vs schedule */}
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" aria-hidden /> When should it go out?
            </div>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Send timing">
              {([
                { v: 'now' as const, icon: Zap, t: 'Send now', d: 'Students see it straight away — bells ring immediately.' },
                { v: 'schedule' as const, icon: CalendarClock, t: 'Schedule', d: 'Pick a moment — it appears and rings bells then.' },
              ]).map((o) => {
                const on = sendMode === o.v;
                return (
                  <button
                    key={o.v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSendMode(o.v)}
                    className={cn(
                      'glass-soft rounded-xl p-3.5 text-left transition-all hover:border-primary/30',
                      on && 'glass-selected'
                    )}
                  >
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <o.icon className="h-4 w-4 text-primary" aria-hidden /> {o.t}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-1">{o.d}</span>
                  </button>
                );
              })}
            </div>
            {sendMode === 'schedule' ? (
              <div className="space-y-2">
                <Label htmlFor="a-publish">Goes live</Label>
                <Input
                  id="a-publish"
                  type="datetime-local"
                  min={toLocalInput(Date.now())}
                  value={publishLocal}
                  onChange={(e) => setPublishLocal(e.target.value)}
                />
                {publishAt && publishAt > Date.now() ? (
                  <p className="text-xs text-muted-foreground">
                    Hidden from students until{' '}
                    {new Date(publishAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.
                    The schedule applies when it goes out — saving it as a draft keeps it a plain draft.
                  </p>
                ) : (
                  <p className="text-xs text-[var(--warn)] flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Pick a moment in the future.
                  </p>
                )}
                {scheduleAfterDue ? (
                  <p className="text-xs text-[var(--warn)] flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> That is after the due date — students
                    will see it as already due.
                  </p>
                ) : null}
              </div>
            ) : null}
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

          {finalQuestions ? <QuestionPreviewList questions={finalQuestions} readOnly bankIds={bankIds} /> : null}

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Questions</Button>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => void tryItYourself()}
                disabled={creating || tryingSelf || !finalQuestions || finalQuestions.length === 0}
                className="border-primary/40 text-primary hover:bg-primary/5"
                title="Do this quiz yourself — exactly as students see it — without assigning it"
              >
                <FlaskConical className={tryingSelf ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
                {tryingSelf ? 'Starting…' : 'Test it yourself'}
              </Button>
              <Button
                variant="outline"
                onClick={() => void assign(true)}
                disabled={creating}
                title="Save it now, publish it later — students won't see it yet"
              >
                <Save className="h-4 w-4" /> {creating ? 'Saving…' : 'Save as draft'}
              </Button>
              <Button
                onClick={() => void assign(false)}
                disabled={creating || !scheduleReady}
              >
                {creating ? (
                  sendMode === 'schedule' ? 'Scheduling…' : 'Setting…'
                ) : sendMode === 'schedule' ? (
                  <>
                    Schedule task <CalendarClock className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Set assignment <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
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
  bankIds,
}: {
  questions: Question[];
  onRemove?: (id: string) => void;
  onEdit?: (id: string, q: Question) => void;
  readOnly?: boolean;
  /** ids of questions that came from the bank — they get a small Bank badge */
  bankIds?: Set<string>;
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
                  {bankIds?.has(q.id) ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 text-primary border-primary/30"
                    >
                      <Library className="h-3 w-3" aria-hidden /> Bank
                    </Badge>
                  ) : null}
                  <MarksChip marks={q.marks} />
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {q.subtopic ? `${q.subtopic} ${SUBTOPIC_MAP[q.subtopic]?.short ?? ''}` : `${q.topic} ${topicTitle(q.topic).split(' ')[0]}`}
                  </span>
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

/* custom question builder: bank picker + typed questions, one shared list */
function CustomBuilder({
  list,
  setList,
  bankIds,
  setBankIds,
  onAddBank,
}: {
  list: Question[];
  setList: (q: Question[]) => void;
  bankIds: Set<string>;
  setBankIds: (s: Set<string>) => void;
  onAddBank: (qs: Question[]) => void;
}) {
  const [type, setType] = useState<QuestionType>('mcq');
  const [topic, setTopic] = useState('2.1');
  const [subtopic, setSubtopic] = useState('');
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
    const base = { id: `c${Date.now().toString(36)}`, topic, subtopic: subtopic || undefined, marks, stem: stem.trim(), explain: explain.trim(), extract };
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
      {/* source 1 of 2 — the hand-written question bank */}
      <div className="glass rounded-xl p-5">
        <div className="text-sm font-semibold flex items-center gap-2">
          <Library className="h-4 w-4 text-primary" aria-hidden /> Pick from the gcsebusiness bank
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Hundreds of hand-written questions — filter by topic, type or keyword, tick the ones you
          want, or grab a lucky dip. They mix with your typed questions below.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <BankPicker existingIds={new Set(list.map((q) => q.id))} onAdd={onAddBank} />
          {bankIds.size > 0 ? (
            <Badge variant="secondary" className="gap-1">
              <Library className="h-3 w-3" aria-hidden /> {bankIds.size} bank{' '}
              {bankIds.size === 1 ? 'question' : 'questions'} in the list
            </Badge>
          ) : null}
        </div>
      </div>

      {/* source 2 of 2 — type your own */}
      {type === 'written' ? (
        <WrittenFields onAdd={(q) => setList([...list, q])} />
      ) : (
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <PenLine className="h-4 w-4 text-primary" aria-hidden /> Type your own
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Any style — they join the bank questions above.</p>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {list.length}/{CUSTOM_MAX} question{list.length === 1 ? '' : 's'}
          </span>
        </div>
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
            <Select
              value={topic}
              onValueChange={(v) => {
                setTopic(v);
                setSubtopic('');
              }}
            >
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.id} · {t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Sub-topic <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Select value={subtopic} onValueChange={setSubtopic}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Whole topic" /></SelectTrigger>
              <SelectContent>
                {subtopicsOf(topic).map((st) => (
                  <SelectItem key={st.id} value={st.id}>{st.id} · {st.title}</SelectItem>
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
          bankIds={bankIds}
          onRemove={(id) => {
            setList(list.filter((q) => q.id !== id));
            if (bankIds.has(id)) {
              const next = new Set(bankIds);
              next.delete(id);
              setBankIds(next);
            }
          }}
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
  const [subtopic, setSubtopic] = useState('');
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
      subtopic: subtopic || undefined,
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

      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <Label>Topic</Label>
          <Select
            value={topic}
            onValueChange={(v) => {
              setTopic(v);
              setSubtopic('');
            }}
          >
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TOPICS.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.id} · {t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Sub-topic <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Select value={subtopic} onValueChange={setSubtopic}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Whole topic" /></SelectTrigger>
            <SelectContent>
              {subtopicsOf(topic).map((st) => (
                <SelectItem key={st.id} value={st.id}>{st.id} · {st.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

/* ------------------------------------------------------------------ */
/* Library grid — quiz cards with an official sub-topic filter.        */
/* Teachers browse by exact spec sub-topic (2.1.3 Globalisation…),     */
/* and every card shows which sub-topics its questions actually cover. */
/* ------------------------------------------------------------------ */
function LibraryGrid({
  quizzes,
  quizId,
  onPick,
}: {
  quizzes: QuizRow[];
  quizId: string;
  onPick: (id: string) => void;
}) {
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');

  const shown = quizzes.filter((q) => {
    if (topic && !q.topics.includes(topic)) return false;
    if (subtopic && !(q.subtopics ?? []).includes(subtopic)) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* filter: topic area → sub-topic drill-down, official spec numbers */}
      <div className="flex gap-1.5 overflow-x-auto scroll-slim pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="Filter library by topic">
        <button
          type="button"
          aria-pressed={topic === ''}
          onClick={() => {
            setTopic('');
            setSubtopic('');
          }}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
            topic === '' ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
          )}
        >
          All topics
        </button>
        {TOPICS.map((t) => {
          const on = topic === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setTopic(on ? '' : t.id);
                setSubtopic('');
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
              )}
            >
              {t.id} {t.short}
            </button>
          );
        })}
      </div>
      {topic ? (
        <div className="flex gap-1.5 overflow-x-auto scroll-slim pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="Filter library by sub-topic">
          <button
            type="button"
            aria-pressed={subtopic === ''}
            onClick={() => setSubtopic('')}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0',
              subtopic === '' ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
            )}
          >
            All of {topic}
          </button>
          {subtopicsOf(topic).map((st) => {
            const on = subtopic === st.id;
            return (
              <button
                key={st.id}
                type="button"
                aria-pressed={on}
                onClick={() => setSubtopic(on ? '' : st.id)}
                title={st.title}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0',
                  on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                )}
              >
                {st.id} {st.short}
              </button>
            );
          })}
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <div className="text-sm font-medium">No library quizzes in {subtopic || topic} yet</div>
          <p className="text-xs text-muted-foreground mt-1">
            Try the Generate tab — the AI writes a quiz on any sub-topic — or pick bank questions under My questions.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {shown.map((q) => (
            <button
              key={q.id}
              onClick={() => onPick(q.id)}
              aria-pressed={quizId === q.id}
              className={cn(
                'relative glass-soft rounded-xl p-4 text-left transition-all',
                quizId === q.id ? 'glass-selected' : 'hover:border-primary/30'
              )}
            >
              <span
                className={cn(
                  'absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full transition-all',
                  quizId === q.id
                    ? 'bg-primary text-primary-foreground scale-100 shadow-md'
                    : 'scale-0 opacity-0'
                )}
                aria-hidden
              >
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div className="flex items-center justify-between gap-2 pr-8">
                <span className="font-semibold text-sm">{q.title}</span>
                <Badge variant="secondary" className="tabular-nums shrink-0">Theme {q.theme}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{q.blurb}</p>
              {/* exact spec coverage — what a teacher plans by */}
              <div className="flex flex-wrap gap-1 mt-2">
                {q.subtopics && q.subtopics.length > 0 ? (
                  <>
                    {q.subtopics.slice(0, 4).map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] text-muted-foreground">
                        {s} {SUBTOPIC_MAP[s]?.short ?? ''}
                      </Badge>
                    ))}
                    {q.subtopics.length > 4 ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        +{q.subtopics.length - 4} more
                      </Badge>
                    ) : null}
                  </>
                ) : (
                  q.topics.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] text-muted-foreground">
                      {t} {topicTitle(t).split(' ')[0]}
                    </Badge>
                  ))
                )}
              </div>
              <p className="text-xs mt-2">
                <span className="font-semibold tabular-nums">{q.questionCount}</span> questions
                {subtopic ? (
                  <span className="text-[var(--success)]"> · covers {subtopic}</span>
                ) : null}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bank picker — a dialog of every bank question, filterable by topic, */
/* type and keyword. Tick rows (they survive filter changes), then add */
/* them to the same list typed questions use — or press Lucky dip to  */
/* grab N random questions matching the current filters instantly.     */
/* ------------------------------------------------------------------ */
function BankPicker({
  existingIds,
  onAdd,
}: {
  /** ids already in the custom list (typed + earlier bank picks) */
  existingIds: Set<string>;
  /** deliver the picked questions to the shared list */
  onAdd: (qs: Question[]) => void;
}) {
  const [open, setOpen] = useState(false);
  // filters (single-select each — '' = all)
  const [topic, setTopic] = useState('');
  // official sub-topic drill-down within the chosen topic ('' = all of it)
  const [subtopic, setSubtopic] = useState('');
  const [type, setType] = useState('');
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [reload, setReload] = useState(0);
  // results are keyed by the filter set they belong to — while the key doesn't
  // match the current filters the picker is "loading", with no sync setState
  // in the effect (that's a cascading-render lint error)
  const [result, setResult] = useState<{ key: string; rows: BankRow[] | null; total: number; err: string | null } | null>(null);
  // selection survives filter changes — a tick stays ticked
  const [picked, setPicked] = useState<Map<string, BankRow>>(new Map());
  // lucky-dip size
  const [dipN, setDipN] = useState(10);

  const reqKey = `${topic}|${subtopic}|${type}|${q}|${reload}`;
  const current = result && result.key === reqKey ? result : null;
  const rows = current?.rows ?? null;
  const total = current?.total ?? 0;
  const err = current?.err ?? null;

  // debounce the search box so typing doesn't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 250);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const params = new URLSearchParams();
    if (topic) params.set('topic', topic);
    if (topic && subtopic) params.set('subtopic', subtopic);
    if (type) params.set('type', type);
    if (q) params.set('q', q);
    api
      .get<{ questions: BankRow[]; total: number }>(`/api/teacher/bank?${params.toString()}`)
      .then((d) => {
        if (cancelled) return;
        setResult({ key: reqKey, rows: d.questions, total: d.total, err: null });
      })
      .catch((e) => {
        if (!cancelled) setResult({ key: reqKey, rows: null, total: 0, err: (e as Error).message });
      });
    return () => {
      cancelled = true;
    };
  }, [open, reqKey, topic, subtopic, type, q]);

  const capped = rows !== null && total > rows.length;

  function toggle(row: BankRow) {
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.set(row.id, row);
      return next;
    });
  }

  function addSelected() {
    if (picked.size === 0) return;
    onAdd([...picked.values()]);
    setPicked(new Map());
    setOpen(false);
  }

  /** Educake's "random question selector" — N random questions matching the
   *  current filters, added instantly. */
  function luckyDip() {
    if (!rows || rows.length === 0) return;
    const pool = [...rows];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const n = Math.max(1, Math.min(50, Number(dipN) || 10));
    const chosen: BankRow[] = [];
    for (const r of pool) {
      if (chosen.length >= n) break;
      if (existingIds.has(r.id) || picked.has(r.id)) continue;
      chosen.push(r);
    }
    if (chosen.length === 0) return;
    onAdd(chosen);
    setPicked(new Map());
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Search className="h-4 w-4" aria-hidden /> Browse the bank
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col overflow-y-auto scroll-slim">
        <DialogHeader className="text-left shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Library className="h-4 w-4 text-primary" aria-hidden /> Pick from the gcsebusiness bank
          </DialogTitle>
          <DialogDescription>
            Tick questions to add to this assignment — they mix with your typed ones. Both themes,
            every question style, case studies included.
          </DialogDescription>
        </DialogHeader>

        {/* filters */}
        <div className="glass-soft rounded-lg p-3 space-y-3 shrink-0">
          <div className="space-y-1.5">
            <span className="text-xs font-medium">Topic</span>
            {/* wraps on wide screens; a single swipeable strip on phones so the
                filters never squeeze the question list out of the dialog */}
            <div className="flex gap-1.5 overflow-x-auto scroll-slim pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="Filter by topic">
              <button
                type="button"
                aria-pressed={topic === ''}
                onClick={() => {
                  setTopic('');
                  setSubtopic('');
                }}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                  topic === '' ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                )}
              >
                All topics
              </button>
              {TOPICS.map((t) => {
                const on = topic === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setTopic(on ? '' : t.id);
                      setSubtopic('');
                    }}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                      on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                    )}
                  >
                    {t.id} {t.short}
                  </button>
                );
              })}
            </div>
          </div>
          {topic ? (
            <div className="space-y-1.5">
              <span className="text-xs font-medium">Sub-topic within {topic}</span>
              <div className="flex gap-1.5 overflow-x-auto scroll-slim pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="Filter by sub-topic">
                <button
                  type="button"
                  aria-pressed={subtopic === ''}
                  onClick={() => setSubtopic('')}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0',
                    subtopic === '' ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  )}
                >
                  All of {topic}
                </button>
                {subtopicsOf(topic).map((st) => {
                  const on = subtopic === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSubtopic(on ? '' : st.id)}
                      title={st.title}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0',
                        on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                      )}
                    >
                      {st.id} {st.short}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <span className="text-xs font-medium">Question type</span>
            <div className="flex gap-1.5 overflow-x-auto scroll-slim pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="Filter by question type">
              <button
                type="button"
                aria-pressed={type === ''}
                onClick={() => setType('')}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                  type === '' ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                )}
              >
                All types
              </button>
              {BANK_TYPE_CHIPS.map(([v, label]) => {
                const on = type === v;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setType(on ? '' : v)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                      on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search questions…"
              aria-label="Search question stems"
              className="pl-8 pr-8 h-9"
            />
            {qInput ? (
              <button
                type="button"
                onClick={() => setQInput('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>

        {/* count line */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground shrink-0">
          <span aria-live="polite">
            {rows === null
              ? 'Loading the bank…'
              : `Showing ${rows.length} of ${total} question${total === 1 ? '' : 's'}`}
            {capped ? ' — narrow the filters to see the rest' : ''}
          </span>
          {picked.size > 0 ? (
            <span className="text-primary font-medium shrink-0">{picked.size} ticked</span>
          ) : null}
        </div>

        {/* the list — the only scrolling region: it takes whatever space the
            filters leave behind, so the footer always stays pinned */}
        {err ? (
          <div className="space-y-2 shrink-0">
            <ErrorNote message={err} />
            <Button variant="outline" size="sm" onClick={() => setReload(reload + 1)}>
              <RotateCw className="h-3.5 w-3.5" aria-hidden /> Try again
            </Button>
          </div>
        ) : rows === null ? (
          <div className="space-y-2 overflow-y-auto scroll-slim" aria-busy>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-soft rounded-lg h-[76px] animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center flex flex-col items-center gap-2 shrink-0">
            <div className="rounded-full bg-secondary p-3 anim-float">
              <SearchX className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <div className="text-sm font-medium">Nothing matches those filters</div>
            <p className="text-xs text-muted-foreground">
              Try another topic or type, or clear the search.
            </p>
          </div>
        ) : (
          <ul className="flex-1 min-h-0 max-h-[28rem] overflow-y-auto scroll-slim space-y-2 pr-0.5">
            {rows.map((row) => {
              const on = picked.has(row.id);
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => toggle(row)}
                    aria-pressed={on}
                    aria-label={`${row.stem.slice(0, 80)} — ${on ? 'selected' : 'not selected'}`}
                    className={cn(
                      'w-full text-left glass-soft rounded-lg p-3 flex gap-3 items-start transition-all hover:border-primary/40',
                      on && 'glass-selected'
                    )}
                  >
                    {/* purely visual checkbox — the row button carries the
                        state (aria-pressed); a real Checkbox would nest a
                        button inside a button (invalid HTML) */}
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                        on
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-card/60'
                      )}
                    >
                      {on ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 flex-wrap">
                        <TypeBadge type={row.type} />
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          {row.subtopic ?? row.topic}
                        </Badge>
                        <MarksChip marks={row.marks} />
                      </span>
                      <span className="block text-sm mt-1 leading-snug line-clamp-2">{row.stem}</span>
                      <span className="block text-[10px] text-muted-foreground mt-1 truncate">
                        from {row.quizTitle}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* pinned footer — always visible below the scrolling list */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between pt-3 border-t shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap" id="dip-label">
              Lucky dip
            </span>
            <Input
              type="number"
              min={1}
              max={50}
              value={dipN}
              onChange={(e) => setDipN(Math.max(1, Math.min(50, Number(e.target.value) || 10)))}
              aria-labelledby="dip-label"
              className="h-8 w-16 tabular-nums"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={luckyDip}
              disabled={!rows || rows.length === 0}
              title="Add N random questions matching the current filters"
            >
              <Dices className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Add {dipN} random</span>
              <span className="sm:hidden">{dipN}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            {picked.size > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setPicked(new Map())}>
                Clear
              </Button>
            ) : null}
            <Button size="sm" onClick={addSelected} disabled={picked.size === 0}>
              <PlusCircle className="h-4 w-4" aria-hidden /> Add {picked.size}{' '}
              {picked.size === 1 ? 'question' : 'questions'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
