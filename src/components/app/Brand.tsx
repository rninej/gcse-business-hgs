'use client';

export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="12" fill="var(--primary)" />
      <path d="M12 32 L20 24 L26 28 L36 16" stroke="white" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 16 H36 V22" stroke="white" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="12" y="36" width="7" height="3" rx="1.5" fill="white" opacity="0.85" />
      <rect x="22" y="36" width="7" height="3" rx="1.5" fill="white" opacity="0.6" />
      <rect x="32" y="36" width="5" height="3" rx="1.5" fill="white" opacity="0.35" />
    </svg>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className={compact ? 'h-8 w-8' : 'h-9 w-9'} />
      <div className="leading-none">
        <div className="font-bold tracking-tight text-[15px]">
          HGS<span className="text-primary">Business</span>
        </div>
        {!compact ? (
          <div className="text-[10.5px] text-muted-foreground mt-1">Edexcel GCSE (9–1) Business</div>
        ) : null}
      </div>
    </div>
  );
}
