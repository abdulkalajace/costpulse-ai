import React from 'react';
import { cn } from '../../utils/cn';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-ink-700 border-gray-200',
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
      toneClasses[tone],
      className
    )}
    {...props}
  >
    {children}
  </span>
);
