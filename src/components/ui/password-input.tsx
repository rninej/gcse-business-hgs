'use client';

// Password input with a show/hide eye toggle — used on every password
// field (sign-in, register, change-password, first-login welcome).
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  function PasswordInput({ className, ...props }, ref) {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={'pr-10 ' + (className ?? '')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          onMouseDown={(e) => e.preventDefault()}
          aria-label={show ? 'Hide password' : 'Show password'}
          title={show ? 'Hide password' : 'Show password'}
          className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-r-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    );
  }
);
