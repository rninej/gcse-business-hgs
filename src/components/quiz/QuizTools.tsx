'use client';

// The ⋯ (triple-dot) tools menu inside a quiz — one quiet button that holds
// everything a student might need mid-question:
//   • Read this question aloud  (Web Speech API — the device's own voice,
//     nothing downloads, works offline once the voice is cached)
//   • Nature background on/off  (mobile only — the calm landscape scene)
//   • Sound effects on/off      (the little correct/wrong chimes)
//   • Report a problem          (goes straight to the owner's /debug board)

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  Flag,
  Leaf,
  MoreHorizontal,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  getNatureServerSnapshot,
  getNatureSnapshot,
  setNaturePref,
  subscribeNature,
} from './QuizBackdrop';
import type { BackdropDefault } from './QuizBackdrop';
import {
  getSoundsServerSnapshot,
  getSoundsSnapshot,
  setSoundsPref,
  subscribeSounds,
} from '@/lib/sfx';
import { cn } from '@/lib/utils';
import type { ClientQuestion } from '@/lib/types';

interface QuizToolsProps {
  attemptId: string;
  question: ClientQuestion;
  questionNumber: number;
  /** what phones show by default (owner switch from /debug) — an explicit
   *  student choice from this menu always beats it */
  backdropDefault?: BackdropDefault;
}

const REPORT_KINDS = [
  { v: 'answer', label: 'The answer looks wrong' },
  { v: 'typo', label: 'Typo or wording' },
  { v: 'unclear', label: "I don't understand it" },
  { v: 'unfair', label: 'It gives away another answer' },
  { v: 'other', label: 'Something else' },
] as const;

/* ---- viewport store: is this a phone? (nature scene is mobile-only) ---- */

const mobileMq =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: 767px)')
    : null;

function subscribeMobile(cb: () => void): () => void {
  if (!mobileMq) return () => undefined;
  mobileMq.addEventListener('change', cb);
  return () => mobileMq.removeEventListener('change', cb);
}

function getMobileSnapshot(): boolean {
  return mobileMq?.matches ?? false;
}

function getMobileServerSnapshot(): boolean {
  return false;
}

export function QuizTools({ attemptId, question, questionNumber, backdropDefault = 'nature' }: QuizToolsProps) {
  const { toast } = useToast();
  // tri-state: 'on'/'off' = the student picked; null = follow the default
  const natureChoice = useSyncExternalStore(subscribeNature, getNatureSnapshot, getNatureServerSnapshot);
  const natureOn = natureChoice === null ? backdropDefault === 'nature' : natureChoice === 'on';
  const soundsOn = useSyncExternalStore(subscribeSounds, getSoundsSnapshot, getSoundsServerSnapshot);
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
  /** the question currently being read aloud (id) — the button shows "stop"
   *  only when it matches the on-screen question */
  const [readingQid, setReadingQid] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const speaking = readingQid === question.id;

  // moving to another question (or leaving the quiz) stops any reading —
  // syncing with the speech engine is an external system, not state seeding
  useEffect(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* not supported */
    }
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [question.id]);

  /** read the current question (stem + options) with the device voice */
  function toggleReadAloud() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({
        title: 'Reading aloud is not available',
        description: 'This browser cannot speak text.',
        variant: 'destructive',
      });
      return;
    }
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setReadingQid(null);
      return;
    }
    const parts = [`Question ${questionNumber}.`, question.stem];
    if (question.type === 'mcq' && question.options) {
      question.options.forEach((o, i) => parts.push(`Option ${String.fromCharCode(65 + i)}: ${o}`));
    } else if (question.type === 'truefalse') {
      parts.push('True or false?');
    }
    if (question.extract) {
      // case study first, so it reads like a lesson
      parts.splice(1, 0, `Case study: ${question.extract.title}. ${question.extract.text}`);
    }
    const u = new SpeechSynthesisUtterance(parts.join(' '));
    u.rate = 0.97;
    u.lang = 'en-GB';
    const voice =
      synth.getVoices().find((v) => v.lang === 'en-GB') ??
      synth.getVoices().find((v) => v.lang.startsWith('en'));
    if (voice) u.voice = voice;
    u.onend = () => setReadingQid((cur) => (cur === question.id ? null : cur));
    u.onerror = () => setReadingQid((cur) => (cur === question.id ? null : cur));
    setReadingQid(question.id);
    synth.speak(u);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Quiz options — read aloud, backgrounds, sounds, report a problem"
            className="h-8 w-8 shrink-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem onClick={toggleReadAloud} aria-label="Read this question aloud">
            {speaking ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {speaking ? 'Stop reading' : 'Read this question aloud'}
          </DropdownMenuItem>

          {isMobile ? (
            <DropdownMenuItem onClick={() => setNaturePref(!natureOn)} aria-label="Toggle the nature background">
              <Leaf className={cn('h-4 w-4', natureOn && 'text-primary')} />
              Nature background
              <span className={cn('ml-auto text-xs font-semibold', natureOn ? 'text-primary' : 'text-muted-foreground')}>
                {natureOn ? 'On' : 'Off'}
              </span>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem onClick={() => setSoundsPref(!soundsOn)} aria-label="Toggle sound effects">
            {soundsOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Sound effects
            <span className={cn('ml-auto text-xs font-semibold', soundsOn ? 'text-primary' : 'text-muted-foreground')}>
              {soundsOn ? 'On' : 'Off'}
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setReportOpen(true)} aria-label="Report a problem with this question">
            <Flag className="h-4 w-4" />
            Report a problem
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        attemptId={attemptId}
        question={question}
        questionNumber={questionNumber}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

function ReportDialog({
  open,
  onOpenChange,
  attemptId,
  question,
  questionNumber,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  attemptId: string;
  question: ClientQuestion;
  questionNumber: number;
}) {
  const { toast } = useToast();
  const [kind, setKind] = useState<(typeof REPORT_KINDS)[number]['v']>('answer');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function send() {
    if (sending || message.trim().length < 3) return;
    setSending(true);
    try {
      await api.post('/api/owner/reports', {
        kind,
        message: message.trim(),
        attemptId,
        qid: question.id,
      });
      toast({ title: 'Report sent — thank you', description: 'It goes straight to the people who fix the questions.' });
      onOpenChange(false);
      setMessage('');
    } catch (e) {
      toast({ title: 'Could not send the report', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report a problem</DialogTitle>
          <DialogDescription>
            Question {questionNumber}
            {question.topic ? ` · ${question.topic}` : ''} — what looks wrong?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-1.5" role="radiogroup" aria-label="What is wrong?">
            {REPORT_KINDS.map((k) => (
              <button
                key={k.v}
                type="button"
                role="radio"
                aria-checked={kind === k.v}
                onClick={() => setKind(k.v)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  kind === k.v ? 'border-primary bg-primary/10 font-medium' : 'hover:bg-secondary/70'
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={800}
            placeholder="Anything else we should know? (optional)"
            aria-label="Extra detail (optional)"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void send()} disabled={sending || message.trim().length < 3}>
            {sending ? 'Sending…' : 'Send report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
