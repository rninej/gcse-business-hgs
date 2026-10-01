'use client';

import { useEffect, useRef } from 'react';

/* ------------------------------------------------------------------ */
/* Celebration confetti — a one-shot canvas burst for brilliant        */
/* results (score ≥ 80%). Hand-rolled physics, zero dependencies:      */
/* two side "cannons" spray brand-coloured pieces that fall, spin      */
/* and fade. Fully skipped for prefers-reduced-motion, and never       */
/* captures pointer events or breaks layout (fixed, transparent).      */
/* ------------------------------------------------------------------ */

const COLORS = ['#0d5c46', '#12805f', '#e8a13a', '#d97706', '#0f766e', '#f5f0e6', '#65a30d'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vrot: number;
  color: string;
  born: number;
}

const DURATION_MS = 3400;
const PIECES_PER_SIDE = 55;

export function Confetti({ trigger }: { trigger: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    // nothing to celebrate, or motion unwelcome. No "already fired" ref
    // guard here on purpose: the effect only re-runs when the trigger VALUE
    // changes, and React StrictMode's dev double-mount would otherwise
    // swallow the one and only burst (cleanup cancels it, the remount sees
    // the guard and gives up).
    if (!trigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const now = performance.now();
    const pieces: Piece[] = [];

    // launch a piece from a side cannon (left cannon fires up-right, etc.)
    const launch = (fromLeft: boolean) => {
      const x = fromLeft ? 12 : W - 12;
      const speed = 620 + Math.random() * 380; // px/s upward-ish
      const angle = (fromLeft ? -70 : -110) + (Math.random() * 26 - 13); // degrees
      const rad = (angle * Math.PI) / 180;
      pieces.push({
        x,
        y: H * 0.72,
        vx: Math.cos(rad) * speed,
        vy: Math.sin(rad) * speed,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 9,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        born: now,
      });
    };

    // staggered double-burst per side for a richer shower
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < PIECES_PER_SIDE; i++) {
      const fromLeft = i % 2 === 0;
      if (i % 8 === 4) timeouts.push(setTimeout(() => launch(fromLeft), 220));
      else launch(fromLeft);
    }

    let last = now;
    const step = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); // clamp tab-switch gaps
      last = t;
      ctx.clearRect(0, 0, W, H);

      let alive = false;
      for (const p of pieces) {
        const age = t - p.born;
        if (age > DURATION_MS) continue;
        alive = true;

        // physics: gravity + air drag + spin
        p.vy += 900 * dt;
        p.vx *= Math.pow(0.55, dt); // strong horizontal drag
        p.vy *= Math.pow(0.82, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;

        // fade out over the last 800ms
        const fade = age > DURATION_MS - 800 ? (DURATION_MS - age) / 800 : 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, fade);
        ctx.fillStyle = p.color;
        // paper look: slightly rounded rectangle, "flips" via width oscillation
        const flip = 0.55 + 0.45 * Math.abs(Math.sin(p.rot * 1.7));
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(-p.w * flip, -p.h / 2, p.w * 2 * flip, p.h, 1.5);
          ctx.fill();
        } else {
          // older browsers: plain rectangle still reads as confetti
          ctx.fillRect(-p.w * flip, -p.h / 2, p.w * 2 * flip, p.h);
        }
        ctx.restore();
      }

      if (alive) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      for (const t of timeouts) clearTimeout(t);
      ctx.clearRect(0, 0, W, H);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{ display: trigger ? 'block' : 'none' }}
    />
  );
}
