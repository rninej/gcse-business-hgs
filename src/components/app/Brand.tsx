'use client';

// gcsebusiness brand mark — an open book over rising emerald business bars
// with a warm-gold growth arrow, on the app's primary-green tile, with a
// large GCSE wordmark. Colours are lifted straight from the theme tokens
// (primary #017953, emerald #10B981, gold #E8A13A) so the mark always
// matches the UI. Crisp from favicon to hero.

export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden role="img">
      {/* tile — theme primary green */}
      <rect width="512" height="512" rx="105" fill="#017953" />
      {/* open book (white pages) — sized to fill the tile now that the
          wordmark is just four letters */}
      <path
        d="M40 67 C106 22 185 33 256 89 C327 33 406 22 472 67 V333 C409 294 329 300 256 351 C183 300 111 294 40 333Z"
        fill="white"
      />
      {/* spine */}
      <path d="M256 89 V351" stroke="#017953" strokeWidth="13" strokeLinecap="round" />
      {/* rising business bars — emerald, same hue family as the tile */}
      <rect x="92" y="215" width="40" height="85" rx="8" fill="#10B981" />
      <rect x="147" y="178" width="40" height="122" rx="8" fill="#10B981" />
      <rect x="202" y="136" width="40" height="164" rx="8" fill="#10B981" />
      <rect x="257" y="100" width="40" height="200" rx="8" fill="#10B981" />
      <rect x="312" y="57" width="40" height="243" rx="8" fill="#10B981" />
      {/* growth arrow — the app's warm gold */}
      <path
        d="M78 205 L147 174 L213 144 L276 107 L390 46"
        fill="none"
        stroke="#E8A13A"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M354 46 L390 46 L386 83"
        fill="none"
        stroke="#E8A13A"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* wordmark — bigger now there's no second line */}
      <text
        x="256"
        y="466"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="122"
        fontWeight="900"
        letterSpacing="-5"
        fill="white"
      >
        GCSE
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
