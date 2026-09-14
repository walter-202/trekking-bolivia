import React from 'react';
import { cn } from '../../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer';

    const variants = {
      default: 'bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600 shadow-sm',
      accent: 'bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500 shadow-sm',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm',
      outline: 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 focus-visible:ring-stone-400',
      secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200 focus-visible:ring-stone-400',
      ghost: 'text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-400',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs gap-1.5',
      md: 'h-11 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
