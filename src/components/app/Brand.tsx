'use client';

// Learn Business brand lockup — built around the school's own logo mark
// (open book, mortarboard, bulb, bar chart and globe). The full lockup keeps
// the artwork's baked-in wordmark; compact bars use the icon cluster alone.

export function BrandLogo({ className = 'h-12 w-auto' }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Learn Business"
      className={className}
      width={312}
      height={248}
      draggable={false}
    />
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="inline-flex rounded-md border bg-white p-0.5 shadow-sm">
          <img
            src="/logo-icon.png"
            alt=""
            aria-hidden
            className="h-7 w-auto"
            width={309}
            height={130}
            draggable={false}
          />
        </span>
        <span className="font-extrabold tracking-tight text-[15px] text-foreground leading-none">
          Learn <span className="text-[var(--brand-red)]">Business</span>
        </span>
      </div>
    );
  }
  return (
    <div>
      <span className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
        <BrandLogo className="h-12 w-auto" />
      </span>
      <div className="text-[10.5px] text-muted-foreground mt-1.5 tracking-wide">
        Edexcel GCSE (9–1) Business
      </div>
    </div>
  );
}
