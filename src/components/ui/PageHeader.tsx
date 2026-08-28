import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
      {description && <p className="mt-1 text-xs text-ink-500">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2.5">{actions}</div>}
  </div>
);
