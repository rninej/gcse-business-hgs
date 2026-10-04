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

export { CHARACTERS as CHARACTER_LIST };
