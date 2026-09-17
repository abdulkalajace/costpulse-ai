import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingDown,
  Receipt,
  Layers,
  Store,
  Bot,
  FileText,
  Zap,
  ChevronDown,
  ChevronRight,
  Building2,
  Settings,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Company, UserProfile, UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  | 'EMPLOYEES'
  | 'IMPORT'
  | 'INDUSTRY_VERTICALS'
  | 'SETTINGS';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
  onSignIn?: () => void;
  appMode?: 'PRODUCTION' | 'DEMO';
  onToggleAppMode?: () => void;
  potentialSavingsCount?: number;
  pendingApprovalsCount?: number;
  anomaliesCount?: number;
  companies?: Company[];
  selectedCompany?: Company;
  onSelectCompany?: (company: Company) => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  isAuthenticated = true,
  onSignOut,
  onSignIn,
  appMode = 'PRODUCTION',
  potentialSavingsCount = 0,
  anomaliesCount = 0,
  companies = [],
  selectedCompany,
  onSelectCompany,
  currentUser,
  onOpenAuthModal,
}) => {
  const [isGroupTreeExpanded, setIsGroupTreeExpanded] = useState(true);
  const isEmployee = userRole === 'EMPLOYEE';

  const safeUser = currentUser || {
    id: 'usr-guest',
    name: 'Guest Session',
    email: 'guest@enterprise.internal',
    role: userRole,
    departmentName: 'Public Access',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  const parentGroup = companies.find((c) => c.isGroup) || companies[0] || null;
  const groupSubsidiaries = parentGroup
    ? companies.filter((c) => c.parentGroupId === parentGroup.id)
    : [];

  const navSections = [
    {
      title: 'FINANCIAL INTELLIGENCE',
      items: [
        {
          id: 'DASHBOARD' as NavTab,
          label: selectedCompany?.isGroup ? 'Group Rollup Command' : 'Executive Command',
          icon: LayoutDashboard,
          visible: true,
        },
        {
          id: 'SAVINGS_CENTER' as NavTab,
          label: 'Cost Reduction & Savings',
          icon: TrendingDown,
          badge: potentialSavingsCount > 0 ? `${potentialSavingsCount} Leaks` : 'Active',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          visible: !isEmployee,
        },
        {
          id: 'DEPARTMENT_WORKFLOWS' as NavTab,
          label: '39 Depts & P&L Ceilings',
          icon: Building2,
          badge: 'Live Burn',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          visible: true,
        },
        {
          id: 'APP_SYNC' as NavTab,
          label: 'App Sync & Ingestion',
          icon: Zap,
          badge: 'Live Sync',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          visible: true,
        },
      ],
    },
    {
      title: 'SPEND & CONTRACT CONTROL',
      items: [
        {
          id: 'EXPENSES' as NavTab,
          label: isEmployee ? 'My Expenses' : 'Spend & Expense Audits',
          icon: Receipt,
          badge: anomaliesCount > 0 && !isEmployee ? `${anomaliesCount} alerts` : undefined,
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          visible: true,
        },
        {
          id: 'SUBSCRIPTIONS' as NavTab,
          label: 'SaaS & Cloud FinOps',
          icon: Layers,
          visible: !isEmployee,
        },
        {
          id: 'VENDORS' as NavTab,
          label: 'Vendors & Procurement',
          icon: Store,
          visible: ['MASTER', 'MD_CEO', 'CFO', 'CTO', 'DEPT_HEAD'].includes(userRole),
        },
      ],
    },
    {
      title: 'GOVERNANCE & AUDIT',
      items: [
        {
          id: 'AI_ANALYST' as NavTab,
          label: 'AI FinOps Copilot',
          icon: Bot,
          badge: 'Gemini 3.7',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          visible: true,
        },
        {
          id: 'REPORTS' as NavTab,
          label: 'Board Reports & Audit',
          icon: FileText,
          visible: !isEmployee,
        },
      ],
    },
    {
      title: 'SYSTEM & ENVIRONMENT',
      items: [
        {
          id: 'SETTINGS' as NavTab,
          label: 'Settings & Demo Sandbox',
          icon: Settings,
          badge: appMode === 'PRODUCTION' ? 'LIVE DATA' : 'DEMO MODE',
          badgeClass:
            appMode === 'PRODUCTION'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-amber-100 text-amber-800 border-amber-300',
          visible: true,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card flex flex-col justify-between overflow-y-auto">
      <div className="p-3.5 space-y-3">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-1.5 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <span className="text-primary-foreground font-black text-xs">CI</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight text-foreground truncate">CostPulse AI</h1>
              <p className="text-[10px] text-muted-foreground font-medium truncate">Cost Intelligence & Burn</p>
            </div>
          </div>
        </div>
        <Separator />

        {/* Environment Mode Status Card */}
        <button
          onClick={() => onSelectTab('SETTINGS')}
          className={cn(
            'w-full cursor-pointer rounded-lg p-2 border transition-all text-xs flex items-center justify-between text-left',
            appMode === 'PRODUCTION'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
              : 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100/70'
          )}
          title="Click to open Settings & Mode Manager"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                'h-2 w-2 rounded-full shrink-0',
                appMode === 'PRODUCTION' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              )}
            />
            <div className="min-w-0">
              <div className="font-bold text-[11px] leading-tight truncate">
                {appMode === 'PRODUCTION' ? 'Live Real Database' : 'Demo Sandbox Mode'}
              </div>
              <div className="text-[9px] text-muted-foreground truncate">
                {appMode === 'PRODUCTION' ? 'Synced to your account' : 'Pre-loaded mock data'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-semibold underline text-primary shrink-0">Manage</span>
        </button>

        {/* Operating Organizations Tree */}
        {parentGroup && (
          <div className="rounded-xl bg-muted/50 border p-2 space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3 h-3 text-primary" />
                <span>Operating Entities</span>
              </span>
              <button
                onClick={() => setIsGroupTreeExpanded(!isGroupTreeExpanded)}
                className="text-muted-foreground hover:text-foreground text-[10px]"
              >
                {isGroupTreeExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            </div>

            {isGroupTreeExpanded && (
              <div className="space-y-1 pt-0.5">
                {/* Master Group */}
                <button
                  onClick={() => onSelectCompany && onSelectCompany(parentGroup)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left',
                    selectedCompany?.id === parentGroup.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <span className="truncate">{parentGroup.name}</span>
                  <span
                    className={cn(
                      'text-[9px] px-1 rounded font-mono',
                      selectedCompany?.id === parentGroup.id
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    ROLLUP
                  </span>
                </button>

                {/* Subsidiaries */}
                <div className="pl-2 space-y-0.5 border-l ml-1.5">
                  {groupSubsidiaries.map((sub) => {
                    const isSelected = selectedCompany?.id === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSelectCompany && onSelectCompany(sub)}
                        className={cn(
                          'w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-colors text-left',
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <span className="truncate max-w-[130px]">{sub.name.replace('Skandhanshi ', '')}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {sub.industryVertical?.substring(0, 4) || 'SUB'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items
                  .filter((item) => item.visible)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => onSelectTab(item.id)}
                        className={cn(
                          'w-full justify-between px-2.5 py-1.5 h-auto rounded-lg text-xs font-medium',
                          isActive
                            ? 'bg-primary/10 text-primary font-bold border border-primary/20 hover:bg-primary/10 hover:text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge
                            variant="outline"
                            className={cn('text-[9px] font-bold shrink-0', item.badgeClass)}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Card with Auth & Sign In / Sign Out */}
      <div className="p-3 border-t bg-muted/40">
        {!isAuthenticated ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback>
                  <LogIn className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">Not Signed In</p>
                <p className="text-[10px] text-muted-foreground truncate">Guest Session Mode</p>
              </div>
            </div>
            <Button onClick={onSignIn || onOpenAuthModal} className="w-full" size="sm">
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Organization</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="w-7 h-7 border">
                <AvatarImage src={safeUser.avatar} alt={safeUser.name} />
                <AvatarFallback>{safeUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{safeUser.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{safeUser.role.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {onOpenAuthModal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenAuthModal}
                  className="px-1.5 py-1 h-auto text-[10px] font-semibold text-primary hover:bg-primary/10"
                  title="Switch Persona or Manage Identity"
                >
                  Switch
                </Button>
              )}
              {onSignOut && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSignOut}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Sign Out of Enterprise Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
