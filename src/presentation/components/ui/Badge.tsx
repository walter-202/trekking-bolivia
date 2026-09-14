import React from 'react';
import { cn } from '../../../lib/utils';
import { RouteDifficulty, RouteStatus } from '../../../core/domain/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'danger';
  difficulty?: RouteDifficulty;
  status?: RouteStatus;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  difficulty,
  status,
  children,
  ...props
}) => {
  let styleClasses = 'bg-stone-100 text-stone-800 border-stone-200';

  if (difficulty) {
    switch (difficulty) {
      case 'facil':
        styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
        break;
      case 'moderado':
        styleClasses = 'bg-blue-50 text-blue-800 border-blue-300';
        break;
      case 'dificil':
        styleClasses = 'bg-amber-50 text-amber-900 border-amber-300';
        break;
      case 'experto':
        styleClasses = 'bg-purple-50 text-purple-900 border-purple-300';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'published':
        styleClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        break;
      case 'in_review':
        styleClasses = 'bg-amber-100 text-amber-800 border-amber-300';
        break;
      case 'rejected':
        styleClasses = 'bg-rose-100 text-rose-800 border-rose-300';
        break;
      case 'draft':
        styleClasses = 'bg-stone-100 text-stone-700 border-stone-300';
        break;
    }
  } else {
    switch (variant) {
      case 'success':
        styleClasses = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        break;
      case 'warning':
        styleClasses = 'bg-amber-100 text-amber-900 border-amber-200';
        break;
      case 'danger':
        styleClasses = 'bg-rose-100 text-rose-800 border-rose-200';
        break;
      case 'outline':
        styleClasses = 'border border-stone-300 text-stone-700 bg-transparent';
        break;
      case 'secondary':
        styleClasses = 'bg-stone-100 text-stone-800';
        break;
      default:
        styleClasses = 'bg-emerald-800 text-white';
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide select-none',
        styleClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
