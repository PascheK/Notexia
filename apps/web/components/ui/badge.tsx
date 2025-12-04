import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'secondary' | 'outline';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-accent text-accent-foreground shadow-sm',
  secondary: 'border border-border bg-muted text-foreground',
  outline: 'border border-border text-foreground',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-tight transition',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
