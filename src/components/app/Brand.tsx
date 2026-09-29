'use client';

// HGS Business brand mark — an ascending bar chart in a deep emerald tile,
// with the growth bar picked out in amber. Crisp at 16px (favicon) and 40px.

export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden role="img">
      <rect width="48" height="48" rx="11" fill="#0d5c46" />
      <rect x="10.5" y="24" width="6" height="13.5" rx="2" fill="#ffffff" opacity="0.82" />
      <rect x="21" y="17" width="6" height="20.5" rx="2" fill="#ffffff" />
      <rect x="31.5" y="10" width="6" height="27.5" rx="2" fill="#f0a63c" />
      <rect x="10.5" y="40" width="27" height="2" rx="1" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className={compact ? 'h-8 w-8' : 'h-9 w-9'} />
      <div className="leading-none">
        <div className="font-extrabold tracking-tight text-[15px] text-foreground">
          HGS <span className="text-primary">Business</span>
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
