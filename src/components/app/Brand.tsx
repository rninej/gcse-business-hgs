'use client';

// gcsebusiness brand mark — the official logo: an open book over rising
// green business bars with a yellow growth arrow, on a blue tile, with the
// GCSE business wordmark baked into the artwork. Crisp from favicon to hero.

export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden role="img">
      <rect width="512" height="512" rx="105" fill="#2563EB" />
      <path
        d="M48 52 C112 15 188 24 256 70 C324 24 400 15 464 52 V270 C395 238 326 243 256 285 C186 243 117 238 48 270Z"
        fill="white"
      />
      <path d="M256 70 V285" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" />
      <rect x="95" y="185" width="34" height="70" rx="7" fill="#22C55E" />
      <rect x="150" y="155" width="34" height="100" rx="7" fill="#22C55E" />
      <rect x="205" y="120" width="34" height="135" rx="7" fill="#22C55E" />
      <rect x="260" y="90" width="34" height="165" rx="7" fill="#22C55E" />
      <rect x="315" y="55" width="34" height="200" rx="7" fill="#22C55E" />
      <path
        d="M85 165 L155 140 L215 115 L275 85 L380 35"
        fill="none"
        stroke="#FACC15"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M350 35 L380 35 L378 65"
        fill="none"
        stroke="#FACC15"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="256"
        y="362"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="92"
        fontWeight="900"
        letterSpacing="-4"
        fill="white"
      >
        GCSE
      </text>
      <text
        x="256"
        y="414"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="36"
        fontWeight="600"
        letterSpacing="2.5"
        fill="#DBEAFE"
      >
        business
      </text>
    </svg>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className={compact ? 'h-8 w-8' : 'h-9 w-9'} />
      <div className="leading-none">
        <div className="font-extrabold tracking-tight text-[15px] text-foreground">
          gcse<span className="text-primary">business</span>
        </div>
        {!compact ? (
          <div className="text-[10.5px] text-muted-foreground mt-1 tracking-wide">
            Edexcel GCSE (9–1) Business
          </div>
        ) : null}
      </div>
    </div>
  );
}
