'use client';

// The 2D character cast for profile avatars — hand-drawn flat SVG busts in
// one consistent style (soft tint background, rounded bust, dot eyes, warm
// palette; no blue/indigo). Pure inline SVG: nothing downloads, they render
// crisp at any size, and they work in light and dark mode unchanged.
//
// Shared helpers keep every character on the same proportions so the picker
// grid looks like a set, not a collage.

import type { ReactNode } from 'react';
import { CHARACTERS } from '@/lib/characters';
import {
  type AvatarBuild,
  SKINS,
  HAIRS,
  HAIR_COLORS,
  EYES,
  CLOTHES,
  CLOTHES_COLORS,
  BGS,
} from '@/lib/avatarBuilder';
import { cn } from '@/lib/utils';

/* ---------------- shared bits ---------------- */

const INK = '#3a2e25'; // eyes + smiles

/** the standard friendly face — dot eyes, soft smile, optional blush */
function Face({
  eyeY = 31,
  smileY = 37,
  blush = true,
  eye = INK,
}: {
  eyeY?: number;
  smileY?: number;
  blush?: boolean;
  eye?: string;
}) {
  return (
    <g>
      <circle cx={26.5} cy={eyeY} r={1.7} fill={eye} />
      <circle cx={37.5} cy={eyeY} r={1.7} fill={eye} />
      <path
        d={`M27 ${smileY} Q32 ${smileY + 3.6} 37 ${smileY}`}
        stroke={eye}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      {blush ? (
        <g fill="#f4726b" opacity={0.3}>
          <ellipse cx={23.5} cy={smileY - 1.5} rx={2.4} ry={1.4} />
          <ellipse cx={40.5} cy={smileY - 1.5} rx={2.4} ry={1.4} />
        </g>
      ) : null}
    </g>
  );
}

/** torso bust in the outfit colour, with an optional chest emblem */
function Bust({ color, emblem }: { color: string; emblem?: ReactNode }) {
  return (
    <g>
      <path d="M11 64 C11 51.5 20 45.5 32 45.5 C44 45.5 53 51.5 53 64 Z" fill={color} />
      {emblem}
    </g>
  );
}

/** neck + head ellipse in a skin tone */
function Head({ skin, shade }: { skin: string; shade?: string }) {
  return (
    <g>
      <rect x={28} y={41} width={8} height={7} rx={3} fill={shade ?? skin} />
      <ellipse cx={32} cy={31} rx={13} ry={14} fill={skin} />
    </g>
  );
}

/** a simple hair cap hugging the top of the head */
function Hair({ color, lift = 1 }: { color: string; lift?: number }) {
  return (
    <path
      d={`M18.5 ${33 - lift} C17.5 15.5 46.5 15.5 45.5 ${33 - lift} C43.5 24 20.5 24 18.5 ${33 - lift} Z`}
      fill={color}
    />
  );
}

/* ---------------- the cast ---------------- */

const ART: Record<string, () => ReactNode> = {
  maya: () => (
    <g>
      <circle cx={17} cy={17.5} r={6.4} fill="#2d2118" />
      <circle cx={47} cy={17.5} r={6.4} fill="#2d2118" />
      <Bust color="#10b981" />
      <Head skin="#9c6644" shade="#85553a" />
      <Hair color="#2d2118" />
      <g stroke="#f59e0b" strokeWidth={1.3} fill="none">
        <circle cx={19} cy={37.5} r={2.1} />
        <circle cx={45} cy={37.5} r={2.1} />
      </g>
      <Face />
    </g>
  ),

  theo: () => (
    <g>
      <Bust color="#f59e0b" />
      <Head skin="#ffd9b8" shade="#eec39a" />
      <Hair color="#c9973f" />
      <path d="M31 18.5 C31 15.5 34.5 14.5 36 16.5" stroke="#c9973f" strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <g stroke={INK} strokeWidth={1.35} fill="none">
        <circle cx={26.5} cy={31.5} r={4.4} />
        <circle cx={37.5} cy={31.5} r={4.4} />
        <path d="M30.9 31.5 h2.2" />
      </g>
      <circle cx={26.5} cy={31.5} r={1.5} fill={INK} />
      <circle cx={37.5} cy={31.5} r={1.5} fill={INK} />
      <path d="M27.5 39 Q32 42.4 36.5 39" stroke={INK} strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </g>
  ),

  amara: () => (
    <g>
      <circle cx={32} cy={23} r={16.5} fill="#1c1c22" />
      <Bust color="#f43f5e" />
      <Head skin="#7a4a2b" shade="#683f24" />
      <g fill="#f59e0b">
        <circle cx={19.5} cy={36.5} r={1.4} />
        <circle cx={44.5} cy={36.5} r={1.4} />
      </g>
      <Face />
      <path d="M40 21 C44 23 45 26 44.5 29" stroke="#1c1c22" strokeWidth={2.6} strokeLinecap="round" fill="none" />
    </g>
  ),

  finn: () => (
    <g>
      <Bust color="#14b8a6" />
      <Head skin="#eab88f" shade="#d8a274" />
      <g fill="#b45309" opacity={0.55}>
        <circle cx={24.5} cy={34} r={0.8} />
        <circle cx={27} cy={35.5} r={0.8} />
        <circle cx={37} cy={35.5} r={0.8} />
        <circle cx={39.5} cy={34} r={0.8} />
      </g>
      <Face blush={false} />
      <path d="M18.5 31 C17.5 16 46.5 16 45.5 31 C41 26.5 23 26.5 18.5 31 Z" fill="#14b8a6" />
      <rect x={9.5} y={27.5} width={11} height={4.4} rx={2.2} fill="#0d9488" />
      <circle cx={32} cy={15.5} r={1.6} fill="#0d9488" />
    </g>
  ),

  scholar: () => (
    <g>
      <Bust
        color="#065f46"
        emblem={<path d="M32 45.5 L26 53 L32 64 L38 53 Z" fill="#fef3c7" />}
      />
      <Head skin="#eab88f" shade="#d8a274" />
      <Hair color="#2d2118" />
      <Face />
      <polygon points="32,7.5 53,14.5 32,21.5 11,14.5" fill="#1c1c22" />
      <path d="M32 21.5 V27" stroke="#1c1c22" strokeWidth={2.6} />
      <path d="M53 14.5 V24" stroke="#f59e0b" strokeWidth={1.4} />
      <circle cx={53} cy={25.5} r={1.9} fill="#f59e0b" />
    </g>
  ),

  ember: () => (
    <g>
      <Bust color="#ea580c" />
      <Head skin="#ffd9b8" shade="#eec39a" />
      <path d="M32 4.5 C41.5 10.5 46.5 18.5 43.5 27.5 L20.5 27.5 C17.5 18.5 22.5 10.5 32 4.5 Z" fill="#f97316" />
      <path d="M32 11.5 C37.5 15.5 39.5 20.5 37.5 26.5 L26.5 26.5 C24.5 20.5 26.5 15.5 32 11.5 Z" fill="#fbbf24" />
      <Face smileY={36.5} />
    </g>
  ),

  archer: () => (
    <g>
      <circle cx={49.5} cy={36} r={5.6} fill="#5b3a24" />
      <Bust
        color="#e7e5e4"
        emblem={
          <g>
            <circle cx={32} cy={55} r={5.6} fill="#f43f5e" />
            <circle cx={32} cy={55} r={3.4} fill="#e7e5e4" />
            <circle cx={32} cy={55} r={1.4} fill="#f43f5e" />
          </g>
        }
      />
      <Head skin="#c98a5e" shade="#b0764d" />
      <Hair color="#5b3a24" />
      <path d="M18.6 25.5 C24 22.5 40 22.5 45.4 25.5 L45.4 29 C40 26.5 24 26.5 18.6 29 Z" fill="#f59e0b" />
      <Face />
    </g>
  ),

  prism: () => (
    <g>
      <Bust color="#10b981" />
      <polygon points="20,24 25.5,10 32,18 38.5,7 44,24" fill="#14b8a6" />
      <polygon points="25.5,10 32,18 28,24" fill="#0d9488" opacity={0.55} />
      <polygon points="38.5,7 44,24 36,24" fill="#0d9488" opacity={0.55} />
      <polygon points="19,29 32,21 45,29 41,45 23,45" fill="#99f6e4" />
      <g stroke="#14b8a6" strokeWidth={0.9} opacity={0.8}>
        <path d="M32 21 V45" />
        <path d="M19 29 L45 29" />
        <path d="M23 45 L32 29 L41 45" />
      </g>
      <circle cx={27} cy={32.5} r={1.6} fill="#0f766e" />
      <circle cx={37} cy={32.5} r={1.6} fill="#0f766e" />
      <path d="M27.5 38.5 Q32 41.5 36.5 38.5" stroke="#0f766e" strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </g>
  ),

  circuit: () => (
    <g>
      <path d="M32 11 V5" stroke="#a8a29e" strokeWidth={1.8} />
      <circle cx={32} cy={4.4} r={2.3} fill="#f43f5e" />
      <rect x={14.5} y={23} width={3.6} height={7} rx={1.6} fill="#a8a29e" />
      <rect x={45.9} y={23} width={3.6} height={7} rx={1.6} fill="#a8a29e" />
      <Bust color="#d6d3d1" emblem={
        <g>
          <circle cx={27.5} cy={54} r={2.2} fill="#f59e0b" />
          <circle cx={36.5} cy={54} r={2.2} fill="#10b981" />
        </g>
      } />
      <rect x={18} y={12} width={28} height={27} rx={8.5} fill="#e7e5e4" stroke="#a8a29e" strokeWidth={1.2} />
      <rect x={22} y={17.5} width={20} height={15.5} rx={4.5} fill="#26332e" />
      <circle cx={27.8} cy={23.5} r={1.9} fill="#34d399" />
      <circle cx={36.2} cy={23.5} r={1.9} fill="#34d399" />
      <path d="M28 28 Q32 30.8 36 28" stroke="#34d399" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <rect x={24.5} y={38} width={15} height={1.8} rx={0.9} fill="#a8a29e" />
    </g>
  ),

  regent: () => (
    <g>
      <Bust color="#064e3b" />
      <ellipse cx={21} cy={49} rx={5.4} ry={4} fill="#fef3c7" />
      <ellipse cx={43} cy={49} rx={5.4} ry={4} fill="#fef3c7" />
      <Head skin="#ffd9b8" shade="#eec39a" />
      <Hair color="#8a5a44" />
      <Face />
      <path d="M22 15.5 L25 6.5 L29 12 L32 4.5 L35 12 L39 6.5 L42 15.5 Z" fill="#fbbf24" />
      <rect x={22} y={15.5} width={20} height={2.6} rx={1.3} fill="#f59e0b" />
      <g fill="#f43f5e">
        <circle cx={25} cy={13} r={1.2} />
        <circle cx={32} cy={11.5} r={1.2} />
        <circle cx={39} cy={13} r={1.2} />
      </g>
    </g>
  ),

  orbit: () => (
    <g>
      <Bust color="#f8fafc" emblem={
        <g>
          <rect x={22} y={52} width={9} height={7} rx={2} fill="#10b981" />
          <rect x={34} y={54} width={6} height={5} rx={1.5} fill="#f59e0b" />
        </g>
      } />
      <circle cx={32} cy={29} r={19.5} fill="#f8fafc" stroke="#e7e5e4" strokeWidth={2} />
      <path d="M17.5 27 C17.5 14.5 46.5 14.5 46.5 27 C46.5 35.5 40 40.5 32 40.5 C24 40.5 17.5 35.5 17.5 27 Z" fill="#292524" />
      <path d="M21.5 22.5 C24 18.5 30 17 34 18.5" stroke="#a8a29e" strokeWidth={1.7} strokeLinecap="round" fill="none" opacity={0.85} />
      <circle cx={27.5} cy={27} r={2} fill="#fef3c7" />
      <circle cx={36.5} cy={27} r={2} fill="#fef3c7" />
      <path d="M28 33.5 Q32 36 36 33.5" stroke="#fef3c7" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <rect x={26} y={46} width={12} height={3.4} rx={1.7} fill="#e7e5e4" />
    </g>
  ),

  whoo: () => (
    <g>
      <polygon points="15,14 22,10 21,19" fill="#8a6a4a" />
      <polygon points="49,14 42,10 43,19" fill="#8a6a4a" />
      <Bust color="#8a6a4a" emblem={<ellipse cx={32} cy={56} rx={8} ry={9} fill="#d9c5a3" />} />
      <circle cx={32} cy={27} r={17} fill="#9c7a55" />
      <circle cx={25.5} cy={26.5} r={6.6} fill="#fff7ed" />
      <circle cx={38.5} cy={26.5} r={6.6} fill="#fff7ed" />
      <circle cx={26} cy={27} r={2.7} fill="#292524" />
      <circle cx={38} cy={27} r={2.7} fill="#292524" />
      <circle cx={26.9} cy={26.1} r={0.85} fill="#fff" />
      <circle cx={38.9} cy={26.1} r={0.85} fill="#fff" />
      <polygon points="28.5,31 32,28.6 35.5,31 32,35.4" fill="#f59e0b" />
      <g stroke="#d9c5a3" strokeWidth={1.4} strokeLinecap="round">
        <path d="M27 41.5 L29.5 43.5 M34 43.5 L36.5 41.5" />
      </g>
    </g>
  ),
};

/* soft tinted background per character — warm, on-palette, no blue */
const TINTS: Record<string, string> = {
  maya: '#d1fae5',
  theo: '#fef3c7',
  amara: '#ffe4e6',
  finn: '#ccfbf1',
  scholar: '#e7e5e4',
  ember: '#ffedd5',
  archer: '#fef3c7',
  prism: '#ccfbf1',
  circuit: '#f5f5f4',
  regent: '#fef9c3',
  orbit: '#fafaf9',
  whoo: '#ecfccb',
};

/** A character avatar SVG at any size — fills its container (the Avatar
 *  circle clips it to a round crop). Unknown ids render null so callers can
 *  fall back to initials. */
export function CharAvatar({ id, className }: { id: string; className?: string }) {
  const art = ART[id];
  if (!art) return null;
  return (
    <svg viewBox="0 0 64 64" className={cn('h-full w-full', className)} aria-hidden>
      <circle cx={32} cy={32} r={32} fill={TINTS[id] ?? '#f5f5f4'} />
      {art()}
    </svg>
  );
}

/* ================================================================
 * The character BUILDER — a custom avatar assembled from layered
 * options (see lib/avatarBuilder.ts for the option lists and the
 * validation maths). Same 64×64 stage, same flat style as the cast:
 * backdrop tint → back hair → bust + outfit → head → face → hair →
 * point-unlocked accessories on top.
 * ================================================================ */

const BUILD_INK = '#3a2e25';

/** darken a hex colour by a factor (outfit shading, hoods, bands) */
function shadeHex(hex: string, f = 0.8): string {
  const n = hex.replace('#', '');
  const r = Math.round(parseInt(n.slice(0, 2), 16) * f);
  const g = Math.round(parseInt(n.slice(2, 4), 16) * f);
  const b = Math.round(parseInt(n.slice(4, 6), 16) * f);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** bust geometry per body size — inset narrows the shoulders (tank/dress) */
const BUST: Record<'p' | 'a' | 't', { x0: number; x1: number; c0: number; c1: number; y: number }> = {
  p: { x0: 16.5, x1: 47.5, c0: 23.5, c1: 40.5, y: 47.5 },
  a: { x0: 11, x1: 53, c0: 20, c1: 44, y: 45.5 },
  t: { x0: 7.5, x1: 56.5, c0: 19, c1: 45, y: 44 },
};
const NECK: Record<'p' | 'a' | 't', { x: number; y: number; w: number; h: number; r: number }> = {
  p: { x: 29, y: 42.5, w: 6, h: 5.5, r: 2.5 },
  a: { x: 28, y: 41, w: 8, h: 7, r: 3 },
  t: { x: 27.5, y: 40, w: 9, h: 8.5, r: 3.2 },
};
function bustD(sz: 'p' | 'a' | 't', inset = 0): string {
  const b = BUST[sz];
  const x0 = b.x0 + inset;
  const x1 = b.x1 - inset;
  const c0 = b.c0 + inset;
  const c1 = b.c1 - inset;
  return `M${x0} 64 C${x0} ${b.y + 8.5} ${c0} ${b.y} 32 ${b.y} C${c1} ${b.y} ${x1} ${b.y + 8.5} ${x1} 64 Z`;
}

/** a small 4-point star (sparkles, star eyes, auras) */
function starD(cx: number, cy: number, r: number): string {
  const s = r * 0.32;
  return `M${cx} ${cy - r} L${cx + s} ${cy - s} L${cx + r} ${cy} L${cx + s} ${cy + s} L${cx} ${cy + r} L${cx - s} ${cy + s} L${cx - r} ${cy} L${cx - s} ${cy - s} Z`;
}
/** a tiny heart (heart eyes) */
function heartD(cx: number, cy: number, s: number): string {
  return `M${cx} ${cy + s} C${cx - s * 1.7} ${cy - s * 0.5} ${cx - s * 0.7} ${cy - s * 1.4} ${cx} ${cy - s * 0.45} C${cx + s * 0.7} ${cy - s * 1.4} ${cx + s * 1.7} ${cy - s * 0.5} ${cx} ${cy + s} Z`;
}

/* ---- hair art: [back layer, front layer] relative to the fixed head
 * ellipse (cx 32, cy 31, rx 13, ry 14). null layer = nothing. ---- */
function hairBack(id: string, color: string): ReactNode | null {
  switch (id) {
    case 'long':
      return (
        <path
          d="M18.5 30 C18.5 15 45.5 15 45.5 30 L47.5 50 C42 53 22 53 16.5 50 Z"
          fill={color}
        />
      );
    case 'bob':
      return (
        <path
          d="M18.5 30 C18.5 15 45.5 15 45.5 30 L46.5 40.5 C41 43 23 43 17.5 40.5 Z"
          fill={color}
        />
      );
    case 'ponytail':
      return (
        <path
          d="M43 19.5 C50 23 51.5 33 47 42.5 C44.5 37.5 43.5 28 43 19.5 Z"
          fill={color}
        />
      );
    case 'twin':
      return (
        <g fill={color}>
          <path d="M18.5 25 C12 29 10.5 41 13.5 50 C17.5 46 19.5 34 18.5 25 Z" />
          <path d="M45.5 25 C52 29 53.5 41 50.5 50 C46.5 46 44.5 34 45.5 25 Z" />
        </g>
      );
    case 'afro':
      return <circle cx={32} cy={21.5} r={14.5} fill={color} />;
    default:
      return null;
  }
}

function hairFront(id: string, color: string): ReactNode | null {
  switch (id) {
    case 'buzz':
      return (
        <path d="M19.8 28.5 C19.2 17.5 44.8 17.5 44.2 28.5 C39 24.8 25 24.8 19.8 28.5 Z" fill={color} />
      );
    case 'short':
      return <Hair color={color} />;
    case 'sidepart':
      return (
        <path
          d="M18.5 31 C17.5 16 40 14.5 45.5 31 C42.5 22.5 34 20.5 28.5 23.5 C24.5 25.5 20.8 27.5 18.5 31 Z"
          fill={color}
        />
      );
    case 'fringe':
      return (
        <path
          d="M18.5 32 C17.5 15.5 46.5 15.5 45.5 32 C44.5 28 42.5 26.3 41.4 27.6 C41.8 24.2 38.2 22.6 36.2 24.8 C35.2 21.8 28.8 21.8 27.8 24.8 C25.8 22.6 22.2 24.2 22.6 27.6 C21.5 26.3 19.5 28 18.5 32 Z"
          fill={color}
        />
      );
    case 'curly':
      return (
        <g fill={color}>
          <path d="M19 29 C18.5 18 45.5 18 45 29 C40 25.5 24 25.5 19 29 Z" />
          <circle cx={24} cy={19.5} r={4.1} />
          <circle cx={32} cy={16.8} r={4.6} />
          <circle cx={40} cy={19.5} r={4.1} />
          <circle cx={20.2} cy={25.5} r={3.2} />
          <circle cx={43.8} cy={25.5} r={3.2} />
        </g>
      );
    case 'afro':
      return (
        <path d="M19.5 27 C19.5 17 44.5 17 44.5 27 C39 23.5 25 23.5 19.5 27 Z" fill={color} />
      );
    case 'buns':
      return (
        <g fill={color}>
          <circle cx={17.5} cy={18} r={5.4} />
          <circle cx={46.5} cy={18} r={5.4} />
          <Hair color={color} />
        </g>
      );
    case 'ponytail':
      return <Hair color={color} />;
    case 'long':
      return <Hair color={color} />;
    case 'bob':
      return <Hair color={color} />;
    case 'spiky':
      return (
        <path
          d="M19 27.5 L21.5 16 L25.5 24 L29.5 13.5 L33.5 23 L37.5 14.5 L41 24 L44.8 17 L45.5 28.5 C40 25 24 25 19 28.5 Z"
          fill={color}
        />
      );
    case 'twin':
      return <Hair color={color} />;
    default:
      return <Hair color={color} />;
  }
}

/* ---- eyes: art at fixed positions (26.5 / 37.5, y≈31) ---- */
function eyesArt(id: string): ReactNode {
  const L = 26.5;
  const R = 37.5;
  switch (id) {
    case 'big':
      return (
        <g fill={BUILD_INK}>
          <circle cx={L} cy={31} r={2.6} />
          <circle cx={R} cy={31} r={2.6} />
          <circle cx={L + 0.9} cy={30} r={0.75} fill="#fff" />
          <circle cx={R + 0.9} cy={30} r={0.75} fill="#fff" />
        </g>
      );
    case 'round':
      return (
        <g>
          <circle cx={L} cy={31} r={3.3} fill="#fff" />
          <circle cx={R} cy={31} r={3.3} fill="#fff" />
          <circle cx={L} cy={31.2} r={1.6} fill={BUILD_INK} />
          <circle cx={R} cy={31.2} r={1.6} fill={BUILD_INK} />
        </g>
      );
    case 'sleepy':
      return (
        <g>
          <path d={`M${L - 2.6} 30.6 Q${L} 32.6 ${L + 2.6} 30.6`} stroke={BUILD_INK} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <path d={`M${R - 2.6} 30.6 Q${R} 32.6 ${R + 2.6} 30.6`} stroke={BUILD_INK} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <circle cx={L} cy={32} r={1.15} fill={BUILD_INK} />
          <circle cx={R} cy={32} r={1.15} fill={BUILD_INK} />
        </g>
      );
    case 'wink':
      return (
        <g>
          <circle cx={L} cy={31} r={1.7} fill={BUILD_INK} />
          <path d={`M${R - 2.6} 31.6 Q${R} 29.4 ${R + 2.6} 31.6`} stroke={BUILD_INK} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        </g>
      );
    case 'happy':
      return (
        <g stroke={BUILD_INK} strokeWidth={1.6} strokeLinecap="round" fill="none">
          <path d={`M${L - 2.2} 32 Q${L} 28.6 ${L + 2.2} 32`} />
          <path d={`M${R - 2.2} 32 Q${R} 28.6 ${R + 2.2} 32`} />
        </g>
      );
    case 'star':
      return (
        <g fill="#f59e0b">
          <path d={starD(L, 31, 3.1)} />
          <path d={starD(R, 31, 3.1)} />
        </g>
      );
    case 'heart':
      return (
        <g fill="#f43f5e">
          <path d={heartD(L, 31, 2.5)} />
          <path d={heartD(R, 31, 2.5)} />
        </g>
      );
    // 'dot' + fallback
    default:
      return (
        <g fill={BUILD_INK}>
          <circle cx={L} cy={31} r={1.7} />
          <circle cx={R} cy={31} r={1.7} />
        </g>
      );
  }
}

/* ---- outfits: details layered over the bust ---- */
function outfitArt(
  style: string,
  sz: 'p' | 'a' | 't',
  color: string,
  skin: string,
  shade: string
): ReactNode {
  const b = BUST[sz];
  const dark = shadeHex(color, 0.82);
  switch (style) {
    case 'hoodie':
      return (
        <g>
          {/* hood collar tucked behind the neck */}
          <path
            d={`M${b.x0 + 2} ${b.y + 10} C${b.x0 + 4} ${b.y - 7} ${b.x1 - 4} ${b.y - 7} ${b.x1 - 2} ${b.y + 10} Z`}
            fill={dark}
          />
          <path d={bustD(sz)} fill={color} />
          {/* drawstrings */}
          <g stroke={shadeHex(color, 0.6)} strokeWidth={1.3} strokeLinecap="round">
            <path d={`M29 ${b.y + 3} L28.4 ${b.y + 10}`} />
            <path d={`M35 ${b.y + 3} L35.8 ${b.y + 10}`} />
          </g>
          <circle cx={28.4} cy={b.y + 10.8} r={1.1} fill={shadeHex(color, 0.6)} />
          <circle cx={35.8} cy={b.y + 10.8} r={1.1} fill={shadeHex(color, 0.6)} />
        </g>
      );
    case 'shirt':
      return (
        <g>
          <path d={bustD(sz)} fill={color} />
          {/* collar + placket */}
          <g fill="#f8fafc">
            <polygon points={`27.5,${b.y + 0.5} 32,${b.y + 5.5} 29.5,${b.y + 1}`} />
            <polygon points={`36.5,${b.y + 0.5} 32,${b.y + 5.5} 34.5,${b.y + 1}`} />
          </g>
          <path
            d={`M32 ${b.y + 5.5} L32 ${b.y + 14}`}
            stroke={shadeHex(color, 0.65)}
            strokeWidth={1.1}
          />
          <circle cx={32} cy={b.y + 9} r={0.9} fill={shadeHex(color, 0.65)} />
          <circle cx={32} cy={b.y + 13} r={0.9} fill={shadeHex(color, 0.65)} />
        </g>
      );
    case 'jumper':
      return (
        <g>
          <path d={bustD(sz)} fill={color} />
          {/* ribbed crew neck */}
          <rect
            x={26}
            y={b.y - 1.2}
            width={12}
            height={4.2}
            rx={2.1}
            fill={dark}
          />
        </g>
      );
    case 'dress':
      return (
        <g>
          {/* bare shoulders + narrow bodice + straps */}
          <path d={bustD(sz)} fill={skin} />
          <path d={bustD(sz, 4.5)} fill={color} />
          <rect x={b.c0 + 1} y={b.y - 1} width={2.2} height={6.5} rx={1.1} fill={color} />
          <rect x={b.c1 - 3.2} y={b.y - 1} width={2.2} height={6.5} rx={1.1} fill={color} />
        </g>
      );
    case 'blazer':
      return (
        <g>
          <path d={bustD(sz)} fill={color} />
          {/* shirt triangle + lapels */}
          <polygon points={`28,${b.y} 36,${b.y} 32,${b.y + 12}`} fill="#f8fafc" />
          <polygon points={`28,${b.y} 32,${b.y + 12} 29.8,${b.y + 1.5}`} fill={dark} />
          <polygon points={`36,${b.y} 32,${b.y + 12} 34.2,${b.y + 1.5}`} fill={dark} />
        </g>
      );
    case 'sporty':
      return (
        <g>
          <path d={bustD(sz)} fill={color} />
          <rect x={29.9} y={b.y - 1} width={4.2} height={65 - b.y} rx={2.1} fill="#f8fafc" opacity={0.92} />
        </g>
      );
    case 'tank':
      return (
        <g>
          <path d={bustD(sz)} fill={skin} />
          <path d={bustD(sz, 5)} fill={color} />
        </g>
      );
    // 'tee' + fallback: the plain bust IS the t-shirt
    default:
      return (
        <g>
          <path d={bustD(sz)} fill={color} />
          <path
            d={`M28.5 ${b.y + 0.5} Q32 ${b.y + 3.6} 35.5 ${b.y + 0.5}`}
            stroke={dark}
            strokeWidth={1.2}
            fill="none"
          />
        </g>
      );
  }
}

/* ---- accessories: point-locked flair drawn over the hair ---- */
function accessoryArt(id: string): ReactNode | null {
  switch (id) {
    case 'headband':
      return (
        <path
          d="M20 22.5 Q32 13.5 44 22.5"
          stroke="#f43f5e"
          strokeWidth={2.6}
          strokeLinecap="round"
          fill="none"
        />
      );
    case 'cap':
      return (
        <g>
          <path d="M19.5 24.5 C19.5 14 44.5 14 44.5 24.5 C38 21.2 26 21.2 19.5 24.5 Z" fill="#0d9488" />
          <rect x={8.5} y={22.6} width={11.5} height={4.4} rx={2.2} fill="#0f766e" />
          <circle cx={32} cy={15.4} r={1.5} fill="#0f766e" />
        </g>
      );
    case 'glasses':
      return (
        <g stroke="#292524" strokeWidth={1.35} fill="none">
          <circle cx={26.5} cy={31} r={4.4} />
          <circle cx={37.5} cy={31} r={4.4} />
          <path d="M30.9 31 h2.2" />
          <path d="M22.1 31 h-2.6" />
          <path d="M41.9 31 h2.6" />
        </g>
      );
    case 'flower':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle
              key={a}
              cx={45 + 2.6 * Math.cos((a * Math.PI) / 180)}
              cy={18.5 + 2.6 * Math.sin((a * Math.PI) / 180)}
              r={1.8}
              fill="#f472b6"
            />
          ))}
          <circle cx={45} cy={18.5} r={1.5} fill="#f59e0b" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M19 26.5 C19 14.5 45 14.5 45 26.5 Z" fill="#ea580c" />
          <rect x={18.2} y={24.2} width={27.6} height={4.4} rx={2.2} fill="#c2410c" />
          <circle cx={32} cy={13.2} r={2.7} fill="#fdba74" />
        </g>
      );
    case 'shades':
      return (
        <g>
          <rect x={22.4} y={28.4} width={7.9} height={5.6} rx={2.5} fill="#292524" />
          <rect x={33.7} y={28.4} width={7.9} height={5.6} rx={2.5} fill="#292524" />
          <path d="M30.3 31 h2.2" stroke="#292524" strokeWidth={1.4} />
          <circle cx={24.6} cy={29.8} r={0.8} fill="#fff" opacity={0.75} />
          <circle cx={35.9} cy={29.8} r={0.8} fill="#fff" opacity={0.75} />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M16.8 27 C16.8 12.5 47.2 12.5 47.2 27" stroke="#44403c" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <rect x={14.8} y={25.5} width={4.6} height={9} rx={2.3} fill="#44403c" />
          <rect x={44.6} y={25.5} width={4.6} height={9} rx={2.3} fill="#44403c" />
          <rect x={15.9} y={27.2} width={2.4} height={5.6} rx={1.2} fill="#f59e0b" />
          <rect x={45.7} y={27.2} width={2.4} height={5.6} rx={1.2} fill="#f59e0b" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M22 15.5 L25 6.5 L29 12 L32 4.5 L35 12 L39 6.5 L42 15.5 Z" fill="#fbbf24" />
          <rect x={22} y={15.5} width={20} height={2.6} rx={1.3} fill="#f59e0b" />
          <g fill="#f43f5e">
            <circle cx={25} cy={13} r={1.2} />
            <circle cx={32} cy={11.5} r={1.2} />
            <circle cx={39} cy={13} r={1.2} />
          </g>
        </g>
      );
    case 'halo':
      return (
        <g>
          <ellipse cx={32} cy={7.6} rx={9.5} ry={2.5} fill="none" stroke="#fbbf24" strokeWidth={2.2} />
          <ellipse cx={32} cy={7.6} rx={9.5} ry={2.5} fill="none" stroke="#fef3c7" strokeWidth={0.8} opacity={0.9} />
        </g>
      );
    case 'aura':
      return (
        <g fill="#fbbf24">
          <path d={starD(11.5, 19, 2.6)} opacity={0.95} />
          <path d={starD(52.5, 17.5, 2.2)} opacity={0.9} />
          <path d={starD(13, 41, 2)} opacity={0.85} />
          <path d={starD(51, 40, 2.5)} opacity={0.9} />
          <path d={starD(24, 6.5, 1.7)} opacity={0.8} />
          <path d={starD(41, 5, 1.5)} opacity={0.75} />
        </g>
      );
    case 'wizard':
      return (
        <g>
          <polygon points="32,1.5 43.5,23.5 20.5,23.5" fill="#292524" />
          <ellipse cx={32} cy={23.8} rx={15.5} ry={3.1} fill="#1c1917" />
          <rect x={24.4} y={18.6} width={15.2} height={3} rx={1.5} fill="#fbbf24" transform="rotate(-4 32 20)" />
          <path d={starD(33.5, 10.5, 2.2)} fill="#fbbf24" />
          <path d={starD(29, 16, 1.4)} fill="#f59e0b" />
          <circle cx={36.8} cy={15} r={0.8} fill="#fef3c7" />
        </g>
      );
    case 'royal':
      return (
        <g>
          <path d="M20.5 16 L23.5 3.5 L28.5 10.5 L32 1 L35.5 10.5 L40.5 3.5 L43.5 16 Z" fill="#fbbf24" />
          <rect x={20.5} y={16} width={23} height={3.4} rx={1.7} fill="#f59e0b" />
          <circle cx={23.5} cy={19.4} r={1.05} fill="#f8fafc" opacity={0.85} />
          <circle cx={40.5} cy={19.4} r={1.05} fill="#f8fafc" opacity={0.85} />
          <g>
            <circle cx={23.5} cy={12} r={1.5} fill="#f43f5e" />
            <circle cx={32} cy={9.8} r={1.7} fill="#10b981" />
            <circle cx={40.5} cy={12} r={1.5} fill="#f59e0b" />
          </g>
          <circle cx={23.2} cy={11.6} r={0.45} fill="#fff" opacity={0.85} />
          <circle cx={31.6} cy={9.3} r={0.5} fill="#fff" opacity={0.85} />
        </g>
      );
    default:
      return null;
  }
}

/** The custom-built avatar: layers every option of an AvatarBuild into one
 *  64×64 SVG, same stage and crop as the cast so they sit side by side. */
export function BuildAvatar({ build, className }: { build: AvatarBuild; className?: string }) {
  const skin = SKINS[build.sk] ?? SKINS[1];
  const hair = HAIRS[build.h] ?? HAIRS[1];
  const hairColor = (HAIR_COLORS[build.hc] ?? HAIR_COLORS[0]).hex;
  const eye = EYES[build.e] ?? EYES[0];
  const outfit = CLOTHES[build.c] ?? CLOTHES[0];
  const outfitColor = (CLOTHES_COLORS[build.cc] ?? CLOTHES_COLORS[0]).hex;
  const bg = (BGS[build.bg] ?? BGS[0]).hex;
  const sz = build.sz;
  const neck = NECK[sz];
  const ink = BUILD_INK;

  return (
    <svg viewBox="0 0 64 64" className={cn('h-full w-full', className)} aria-hidden>
      <circle cx={32} cy={32} r={32} fill={bg} />
      {/* hair that falls BEHIND the head */}
      {hairBack(hair.id, hairColor)}
      {/* body + outfit */}
      {outfitArt(outfit.id, sz, outfitColor, skin.skin, skin.shade)}
      {/* neck + head */}
      <rect x={neck.x} y={neck.y} width={neck.w} height={neck.h} rx={neck.r} fill={skin.shade} />
      <ellipse cx={32} cy={31} rx={13} ry={14} fill={skin.skin} />
      {/* face */}
      {eyesArt(eye.id)}
      {/* gendered details: lashes (f) / brows (m) */}
      {build.g === 'f' ? (
        <g stroke={ink} strokeWidth={1.1} strokeLinecap="round">
          <path d="M24.2 29.7 l-1.9 -0.5" />
          <path d="M24.5 30.8 l-2 0.2" />
          <path d="M39.8 29.7 l1.9 -0.5" />
          <path d="M39.5 30.8 l2 0.2" />
        </g>
      ) : null}
      {build.g === 'm' ? (
        <g stroke={ink} strokeWidth={1.5} strokeLinecap="round" fill="none">
          <path d="M24 27 Q26.5 25.7 29 27" />
          <path d="M35 27 Q37.5 25.7 40 27" />
        </g>
      ) : null}
      <path d="M27 37.5 Q32 41 37 37.5" stroke={ink} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <g fill="#f4726b" opacity={0.3}>
        <ellipse cx={23.5} cy={35.8} rx={2.4} ry={1.4} />
        <ellipse cx={40.5} cy={35.8} rx={2.4} ry={1.4} />
      </g>
      {/* front hair */}
      {hairFront(hair.id, hairColor)}
      {/* point-unlocked accessories, aura always last */}
      {build.ac.filter((a) => a !== 'aura').map((a) => (
        <g key={a}>{accessoryArt(a)}</g>
      ))}
      {build.ac.includes('aura') ? <g key="aura">{accessoryArt('aura')}</g> : null}
    </svg>
  );
}

export { CHARACTERS as CHARACTER_LIST };
