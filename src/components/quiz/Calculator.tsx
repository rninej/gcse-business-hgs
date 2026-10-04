'use client';

// On-screen calculator for numeric questions — sits in a dialog so it works
// identically on desktop and touch. Pure client-side arithmetic (no eval):
// a classic immediate-execution calculator with chaining, ±, % and a running
// expression line, plus full keyboard support while open.

import { useCallback, useEffect, useState } from 'react';
import { Calculator as CalcIcon, Delete } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ---------------- calculator engine (pure state machine) ---------------- */

interface State {
  /** what the student has typed / the last result */
  display: string;
  /** accumulated left-hand side while an operator is pending */
  acc: number | null;
  /** pending operator: + − × ÷ */
  op: '+' | '-' | '*' | '/' | null;
  /** true → the next digit starts a fresh number (after = or an operator) */
  fresh: boolean;
  error: boolean;
}

const INITIAL: State = { display: '0', acc: null, op: null, fresh: true, error: false };

const MAX_LEN = 12; // digits on screen — plenty for GCSE arithmetic

function fmt(n: number): string {
  if (!Number.isFinite(n)) return 'Error';
  // keep it short: round away floating dust like 0.30000000000000004
  const s = Number(n.toPrecision(10)).toString();
  if (s.length > MAX_LEN + 3) return n.toExponential(6);
  return s;
}

function apply(a: number, b: number, op: State['op']): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function press(s: State, key: string): State {
  if (s.error && key !== 'C') return s; // only Clear escapes an error

  // digits
  if (/^[0-9]$/.test(key)) {
    if (s.fresh) return { ...s, display: key, fresh: false };
    if (s.display.replace(/[-.]/g, '').length >= MAX_LEN) return s;
    return { ...s, display: s.display === '0' ? key : s.display + key };
  }

  switch (key) {
    case '.':
      if (s.fresh) return { ...s, display: '0.', fresh: false };
      return s.display.includes('.') ? s : { ...s, display: s.display + '.' };
    case 'C':
      return INITIAL;
    case 'back': {
      if (s.fresh) return s;
      const next = s.display.slice(0, -1);
      return { ...s, display: next === '' || next === '-' ? '0' : next };
    }
    case 'neg':
      return s.display.startsWith('-')
        ? { ...s, display: s.display.slice(1) }
        : s.display === '0'
          ? s
          : { ...s, display: '-' + s.display };
    case '%': {
      const v = parseFloat(s.display);
      if (!Number.isFinite(v)) return s;
      return { ...s, display: fmt(v / 100), fresh: true };
    }
    case '+':
    case '-':
    case '*':
    case '/': {
      const v = parseFloat(s.display);
      // pressing an operator right after another swaps it
      if (s.acc !== null && s.op && !s.fresh) {
        const r = apply(s.acc, v, s.op);
        if (!Number.isFinite(r)) return { ...INITIAL, display: 'Error', error: true };
        return { display: fmt(r), acc: r, op: key, fresh: true, error: false };
      }
      return { display: fmt(v), acc: v, op: key, fresh: true, error: false };
    }
    case '=': {
      if (s.acc === null || !s.op) return { ...s, fresh: true };
      const v = parseFloat(s.display);
      const r = apply(s.acc, v, s.op);
      if (!Number.isFinite(r)) return { ...INITIAL, display: 'Error', error: true };
      return { ...INITIAL, display: fmt(r) };
    }
    default:
      return s;
  }
}

/* ---------------- keys layout ---------------- */

interface KeyDef {
  k: string;
  label: string;
  variant?: 'op' | 'fn' | 'eq' | 'wide';
  aria: string;
}

const KEYS: KeyDef[] = [
  { k: 'C', label: 'AC', variant: 'fn', aria: 'All clear' },
  { k: 'neg', label: '±', variant: 'fn', aria: 'Plus minus' },
  { k: '%', label: '%', variant: 'fn', aria: 'Percent' },
  { k: '/', label: '÷', variant: 'op', aria: 'Divide' },
  { k: '7', label: '7', aria: '7' },
  { k: '8', label: '8', aria: '8' },
  { k: '9', label: '9', aria: '9' },
  { k: '*', label: '×', variant: 'op', aria: 'Multiply' },
  { k: '4', label: '4', aria: '4' },
  { k: '5', label: '5', aria: '5' },
  { k: '6', label: '6', aria: '6' },
  { k: '-', label: '−', variant: 'op', aria: 'Subtract' },
  { k: '1', label: '1', aria: '1' },
  { k: '2', label: '2', aria: '2' },
  { k: '3', label: '3', aria: '3' },
  { k: '+', label: '+', variant: 'op', aria: 'Add' },
  { k: '0', label: '0', variant: 'wide', aria: '0' },
  { k: '.', label: '.', aria: 'Decimal point' },
  { k: '=', label: '=', variant: 'eq', aria: 'Equals' },
];

const OP_SYMBOL: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };

/* ---------------- component ---------------- */

export function CalculatorButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>(INITIAL);

  const tap = useCallback((k: string) => setState((s) => press(s, k)), []);

  // keyboard support while the dialog is open — the keys mirror a physical
  // calculator so students can just type their working
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const k = e.key;
      if (/^[0-9.]$/.test(k)) tap(k);
      else if (k === '+' || k === '-' || k === '*') tap(k);
      else if (k === '/') tap('/');
      else if (k === 'Enter' || k === '=') tap('=');
      else if (k === 'Backspace') tap('back');
      else if (k === 'Escape') setOpen(false);
      else if (k.toLowerCase() === 'c') tap('C');
      else return;
      e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, tap]);

  // fresh slate each time it opens — reset from the open-change event (an
  // effect would cascade renders)
  function handleOpenChange(o: boolean) {
    setOpen(o);
    if (o) setState(INITIAL);
  }

  // expression line: "12 × 3 =" style trail of the pending operation
  const trail =
    state.acc !== null && state.op
      ? `${fmt(state.acc)} ${OP_SYMBOL[state.op]} ${state.fresh ? '' : state.display}`
      : '';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className={cn('gap-1.5', !compact && 'h-9')}
          aria-label="Open the calculator"
          title="Open the calculator"
        >
          <CalcIcon className="h-4 w-4" aria-hidden />
          <span>Calculator</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[320px] p-0 overflow-hidden gap-0"
        aria-describedby="calc-desc"
      >
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalcIcon className="h-4 w-4 text-primary" aria-hidden /> Calculator
          </DialogTitle>
          <DialogDescription id="calc-desc" className="text-xs">
            Quick working space — nothing here is sent anywhere. Keyboard works too.
          </DialogDescription>
        </DialogHeader>

        {/* display */}
        <div className="mx-5 rounded-xl bg-[var(--sidebar)] border border-border/80 px-4 py-3 text-right" aria-live="polite">
          <div className="h-4 text-[11px] text-muted-foreground tabular-nums truncate" aria-hidden>
            {trail}
          </div>
          <div
            className={cn(
              'text-2xl sm:text-[28px] font-semibold tabular-nums leading-tight truncate',
              state.error && 'text-[var(--danger)]'
            )}
            role="textbox"
            aria-readonly
            aria-label={`Calculator display: ${state.display}`}
          >
            {state.display}
          </div>
        </div>

        {/* backspace row */}
        <div className="px-5 pt-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs justify-center gap-1.5"
            onClick={() => tap('back')}
            aria-label="Delete last digit"
          >
            <Delete className="h-3.5 w-3.5" aria-hidden /> Delete
          </Button>
        </div>

        {/* keys */}
        <div className="p-5 pt-2.5 grid grid-cols-4 gap-2">
          {KEYS.map((key) => (
            <button
              key={key.k}
              type="button"
              onClick={() => tap(key.k)}
              aria-label={key.aria}
              className={cn(
                'h-12 sm:h-12 rounded-xl text-lg font-semibold tabular-nums transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-primary select-none',
                key.variant === 'wide' && 'col-span-2',
                key.variant === 'op' &&
                  'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
                key.variant === 'eq' &&
                  'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
                key.variant === 'fn' && 'bg-secondary text-foreground hover:bg-secondary/70 border border-border',
                !key.variant && 'bg-card border border-border hover:bg-secondary/60'
              )}
            >
              {key.label}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
