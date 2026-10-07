'use client';

// The teacher needs channel. Two faces:
//   • FeedbackDialog — an always-available "Tell us what you need" dialog
//     (sidebar row + dashboard card open it)
//   • OnboardingPrompt — the ONE-TIME "3 quick questions" questionnaire a
//     teacher sees on their dashboard until it is sent or dismissed. This is
//     the product literally asking teachers what they want, and every answer
//     lands in the owner's /debug inbox.

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Lightbulb,
  Loader2,
  MessageSquareHeart,
  Send,
  Sparkles,
  X,
} from 'lucide-react';

/** what the questionnaire offers as "matters most" picks */
const WANTS = [
  'Question banks',
  'AI quiz generation',
  'Progress tracking & reports',
  'Exam-style written questions',
  'Printables & worksheets',
  'Homework scheduling',
  'Intervention / spot-the-gap tools',
  'Integration with my school systems',
] as const;

function Chip({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
      )}
    >
      {children}
    </button>
  );
}

/** the shared submit — posts one entry to the feedback collection */
async function sendFeedback(body: Record<string, unknown>) {
  await api.post('/api/feedback', body);
}

/** General "tell us what you need" dialog — feature requests, problems,
 *  wishes. Teachers reach it from the sidebar and the dashboard card. */
export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { toast } = useToast();
  const [kind, setKind] = useState<'feature' | 'issue' | 'other'>('feature');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (message.trim().length < 3 || busy) return;
    setBusy(true);
    try {
      await sendFeedback({ kind, message: message.trim() });
      toast({
        title: 'Thank you — noted',
        description: 'Your note goes straight to the people building this. Expect changes.',
      });
      setMessage('');
      onOpenChange(false);
    } catch (e) {
      toast({
        title: 'Could not send that',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5 text-primary" aria-hidden />
            Tell us what you need
          </DialogTitle>
          <DialogDescription>
            This platform is built around what teachers actually ask for — this
            note lands directly with the builder. Nothing is too small.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="What kind of note is this?">
            <Chip on={kind === 'feature'} onClick={() => setKind('feature')}>
              <span className="inline-flex items-center gap-1">
                <Lightbulb className="h-3 w-3" aria-hidden /> Feature request
              </span>
            </Chip>
            <Chip on={kind === 'issue'} onClick={() => setKind('issue')}>
              Something is wrong
            </Chip>
            <Chip on={kind === 'other'} onClick={() => setKind('other')}>
              Something else
            </Chip>
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder={
              kind === 'feature'
                ? 'e.g. "Let me set a quiz on just 2.1.3 globalisation for my Year 11s on Friday…" (that one is done — keep them coming)'
                : kind === 'issue'
                  ? 'What happened, and where in the app were you?'
                  : 'Anything at all — wishes, questions, half-formed ideas…'
            }
            aria-label="Your note"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground tabular-nums">{message.length}/2000</p>
            <Button onClick={submit} disabled={busy || message.trim().length < 3}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              {busy ? 'Sending…' : 'Send it'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** The one-time questionnaire. Self-contained: checks the flag, shows the
 *  dialog until sent/dismissed, then never again (the flag lives on the
 *  teacher's record, so it follows them across devices). */
export function OnboardingPrompt() {
  const [show, setShow] = useState(false);
  const [wants, setWants] = useState<string[]>([]);
  const [frustration, setFrustration] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    api
      .get<{ onboarded: boolean }>('/api/feedback?state=1')
      .then((d) => {
        if (!d.onboarded) setShow(true);
      })
      .catch(() => undefined);
  }, []);

  /** both sending and dismissing set the flag — it never nags twice */
  async function close(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await sendFeedback(body);
    } catch {
      /* even if the send fails, stop the prompt — never trap the teacher */
    } finally {
      setShow(false);
      setBusy(false);
    }
  }

  async function submit() {
    await close({
      kind: 'onboarding',
      onboarded: true,
      message:
        [frustration.trim() && `Frustrations: ${frustration.trim()}`, wishlist.trim() && `Wishlist: ${wishlist.trim()}`]
          .filter(Boolean)
          .join('\n') || '(questionnaire sent — see picks in the context line)',
      meta: JSON.stringify({ wants }),
    });
    toast({
      title: 'Thank you',
      description: 'Your answers shape what gets built next.',
    });
  }

  async function dismiss() {
    await close({
      kind: 'onboarding',
      onboarded: true,
      message: '(dismissed the questionnaire without answering)',
      meta: JSON.stringify({ dismissed: true }),
    });
  }

  return (
    <Dialog open={show} onOpenChange={(v) => (!v ? dismiss() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            3 quick questions before you dive in
          </DialogTitle>
          <DialogDescription>
            You teach this course — the builder doesn&rsquo;t. Say what you need and
            it gets built. Takes 40 seconds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">What matters most to you in a platform like this?</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Pick as many as you like">
              {WANTS.map((w) => (
                <Chip
                  key={w}
                  on={wants.includes(w)}
                  onClick={() => setWants((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]))}
                >
                  {w}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              What frustrates you about the tools you already use <span className="text-muted-foreground">(Educake, Kahoot…)?</span>
            </p>
            <Textarea
              value={frustration}
              onChange={(e) => setFrustration(e.target.value)}
              rows={2}
              maxLength={800}
              placeholder="Optional — but honestly, the juicier the better."
              aria-label="Frustrations with other tools"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Anything you wish this platform did?</p>
            <Textarea
              value={wishlist}
              onChange={(e) => setWishlist(e.target.value)}
              rows={2}
              maxLength={800}
              placeholder="Optional — wild ideas welcome."
              aria-label="Wishlist"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={dismiss}
              disabled={busy}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" aria-hidden /> Maybe later
            </button>
            <Button onClick={submit} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              {busy ? 'Sending…' : 'Send answers'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
