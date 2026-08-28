import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Shared "nothing here yet" state — used instead of pre-populating screens
 * with sample data. Every list/table view should render this when its real
 * dataset is empty, explaining what to do next. */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface-muted/60 px-6 py-14 text-center',
      className
    )}
  >
    {Icon && (
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
        <Icon className="h-6 w-6 text-brand-600" />
      </div>
    )}
    <h3 className="text-sm font-bold text-ink-900">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-xs text-ink-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
