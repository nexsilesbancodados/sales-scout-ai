import * as React from 'react';
import { cn } from '@/lib/utils';

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'liquid-btn inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold text-primary-foreground border border-primary/20 cursor-pointer',
          className
        )}
        {...props}
      >
        <span className="liquid-btn-text flex items-center gap-2">{children}</span>
        <div className="liquid-fill" />
      </button>
    );
  }
);
LiquidButton.displayName = 'LiquidButton';

export { LiquidButton };
