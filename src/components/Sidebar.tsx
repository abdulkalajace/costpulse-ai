import React from 'react';
import {
  House,
  TrendingDown,
  Receipt,
  Layers,
  Store,
  CircleCheck,
  FileText,
  Upload,
  Settings,
} from 'lucide-react';
import { UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type NavTab =
  | 'DASHBOARD'
  | 'DEPARTMENT_WORKFLOWS'
  | 'APP_SYNC'
  | 'SAVINGS_CENTER'
  | 'AI_ANALYST'
  | 'EXPENSES'
  | 'SUBSCRIPTIONS'
  | 'VENDORS'
  | 'REPORTS'
  | 'AUDIT_LOGS'
  | 'BUDGETS'
  | 'PROCUREMENT'
  | 'APPROVALS'
  | 'ASSETS'
  | 'PROPERTY'
  | 'IMPORT'
  | 'INDUSTRY_VERTICALS'
  | 'SETTINGS';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  appMode?: 'PRODUCTION' | 'DEMO';
  pendingApprovalsCount?: number;
  renewalsSoonCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  appMode = 'PRODUCTION',
  pendingApprovalsCount = 0,
  renewalsSoonCount = 0,
}) => {
  const isEmployee = userRole === 'EMPLOYEE';

  // Plain nouns, one list. Badges only for counts that need someone's action.
  // Other views (departments, assets, property, sync, industry) stay reachable
  // from in-app links but are off the main nav until they're rebuilt.
  const canApprove = !isEmployee;
  const navItems: { id: NavTab; label: string; icon: React.ElementType; count?: number; visible: boolean }[] = [
    { id: 'DASHBOARD', label: 'Home', icon: House, visible: true },
    { id: 'EXPENSES', label: isEmployee ? 'My expenses' : 'Spend', icon: Receipt, visible: true },
    { id: 'SUBSCRIPTIONS', label: 'Subscriptions', icon: Layers, count: renewalsSoonCount, visible: !isEmployee },
    { id: 'VENDORS', label: 'Vendors', icon: Store, visible: canApprove },
    { id: 'APPROVALS', label: 'Approvals', icon: CircleCheck, count: pendingApprovalsCount, visible: canApprove },
    { id: 'SAVINGS_CENTER', label: 'Savings', icon: TrendingDown, visible: !isEmployee },
    { id: 'REPORTS', label: 'Reports', icon: FileText, visible: !isEmployee },
  ];
  const secondaryItems: typeof navItems = [
    { id: 'IMPORT', label: 'Import data', icon: Upload, visible: !isEmployee },
    { id: 'SETTINGS', label: 'Settings', icon: Settings, visible: true },
  ];

  const renderItem = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    return (
      <Button
        key={item.id}
        variant="ghost"
        onClick={() => onSelectTab(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'w-full justify-between px-2.5 h-9 rounded-md text-sm font-medium',
          isActive
            ? 'bg-accent text-foreground hover:bg-accent'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
      >
        <span className="flex items-center gap-2.5 truncate">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </span>
        {!!item.count && (
          <span className="rounded-full bg-primary px-1.5 min-w-5 text-center text-xs font-medium text-primary-foreground tabular-nums">
            {item.count}
          </span>
        )}
      </Button>
    );
  };

  return (
    <aside className="w-60 flex-shrink-0 border-r bg-card flex flex-col overflow-y-auto">
      <div className="p-3.5 space-y-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-xs">CP</span>
          </div>
          <span className="font-semibold text-sm text-foreground truncate">CostPulse</span>
        </div>

        {appMode === 'DEMO' && (
          <button
            onClick={() => onSelectTab('SETTINGS')}
            className="w-full rounded-md border border-dashed px-2.5 py-2 text-left text-xs text-muted-foreground hover:bg-accent"
          >
            You're viewing sample data. <span className="font-medium text-foreground underline">Use your own</span>
          </button>
        )}

        <nav className="space-y-0.5">{navItems.filter((i) => i.visible).map(renderItem)}</nav>
        <Separator />
        <nav className="space-y-0.5">{secondaryItems.filter((i) => i.visible).map(renderItem)}</nav>
      </div>

    </aside>
  );
};
