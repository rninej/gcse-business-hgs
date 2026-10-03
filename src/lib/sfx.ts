// Tiny Web-Audio sound effects for quiz feedback (Seneca-style, but quieter
// and class-room friendly). No audio files — every sound is synthesised, so
// nothing downloads and playback is instant. The student can switch sounds
// off from the ⋯ menu in a quiz (persisted per browser).

const SOUNDS_KEY = 'hgs.sounds';

export function soundsPref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SOUNDS_KEY) !== 'off';
  } catch {
    return true;
  }
}

/* ---- tiny external store so UI toggles re-render without effects ---- */

const soundListeners = new Set<() => void>();

export function subscribeSounds(cb: () => void): () => void {
  soundListeners.add(cb);
  return () => soundListeners.delete(cb);
}

export function getSoundsSnapshot(): boolean {
  return soundsPref();
}

export function getSoundsServerSnapshot(): boolean {
  return true; // on by default; corrected on the client before first paint
}

export function setSoundsPref(on: boolean): void {
  try {
    localStorage.setItem(SOUNDS_KEY, on ? 'on' : 'off');
  } catch {
    /* private mode — just this session then */
  }
  soundListeners.forEach((l) => l());
}

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    // browsers suspend the context until a user gesture — resume if needed
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** one soft sine blip */
function tone(
  ac: AudioContext,
  freq: number,
  at: number,
  dur: number,
  gain = 0.07,
  type: OscillatorType = 'sine'
): void {
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, ac.currentTime + at);
  env.gain.linearRampToValueAtTime(gain, ac.currentTime + at + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
  osc.connect(env).connect(ac.destination);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + dur + 0.02);
}

/** gentle two-note rise — "got it" */
export function playCorrect(): void {
  if (!soundsPref()) return;
  const ac = audio();
  if (!ac) return;
  tone(ac, 659.25, 0, 0.1); // E5
  tone(ac, 987.77, 0.09, 0.16, 0.055); // B5
}

/** soft low thud — "not quite" (kind, never punishing) */
export function playWrong(): void {
  if (!soundsPref()) return;
  const ac = audio();
  if (!ac) return;
  tone(ac, 233.08, 0, 0.14, 0.05, 'triangle'); // A#3
  tone(ac, 174.61, 0.1, 0.18, 0.045, 'triangle'); // F3
}

/** little fanfare — quiz submitted */
export function playFinish(): void {
  if (!soundsPref()) return;
  const ac = audio();
  if (!ac) return;
  tone(ac, 523.25, 0, 0.1); // C5
  tone(ac, 659.25, 0.1, 0.1); // E5
  tone(ac, 783.99, 0.2, 0.24, 0.06); // G5
}
