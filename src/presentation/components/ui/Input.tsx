import React from 'react';
import { cn } from '../../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-stone-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-rose-500 focus:ring-rose-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
