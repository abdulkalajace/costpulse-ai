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
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Building2,
  Building,
  Sliders,
  DollarSign,
  Activity,
  Settings,
  Database,
  Sparkles,
  LogOut,
  LogIn,
  KeyRound,
} from 'lucide-react';
import { Company, UserProfile, UserRole, IndustryVertical } from '../types';

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
  onToggleAppMode,
  potentialSavingsCount = 0,
  pendingApprovalsCount = 0,
  anomaliesCount = 0,
  companies = [],
  selectedCompany,
  onSelectCompany,
  currentUser,
  onOpenAuthModal,
}) => {
  const [isGroupTreeExpanded, setIsGroupTreeExpanded] = useState(true);
  const isEmployee = userRole === 'EMPLOYEE';

  const activeComp = selectedCompany || companies[0] || {
    id: 'default',
    name: 'Enterprise',
    isGroup: false,
  };

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
          badgeColor: 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200',
          visible: !isEmployee,
        },
        {
          id: 'DEPARTMENT_WORKFLOWS' as NavTab,
          label: '39 Depts & P&L Ceilings',
          icon: Building2,
          badge: 'Live Burn',
          badgeColor: 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200',
          visible: true,
        },
        {
          id: 'APP_SYNC' as NavTab,
          label: 'App Sync & Ingestion',
          icon: Zap,
          badge: 'Live Sync',
          badgeColor: 'bg-blue-50 text-blue-700 font-bold border border-blue-200',
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
          badgeColor: 'bg-rose-50 text-rose-700 font-bold border border-rose-200',
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
          badgeColor: 'bg-purple-50 text-purple-700 font-bold border border-purple-200',
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
          badgeColor:
            appMode === 'PRODUCTION'
              ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
              : 'bg-amber-100 text-amber-800 font-bold border border-amber-300',
          visible: true,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#E5E7EB] bg-white flex flex-col justify-between overflow-y-auto">
      <div className="p-3.5 space-y-3">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <span className="text-white font-black text-xs">CI</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight text-[#111827] truncate">CostPulse AI</h1>
              <p className="text-[10px] text-gray-400 font-medium truncate">Cost Intelligence & Burn</p>
            </div>
          </div>
        </div>

        {/* Environment Mode Status Card */}
        <div
          onClick={() => onSelectTab('SETTINGS')}
          className={`cursor-pointer rounded-lg p-2 border transition-all text-xs flex items-center justify-between ${
            appMode === 'PRODUCTION'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
              : 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100/70'
          }`}
          title="Click to open Settings & Mode Manager"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                appMode === 'PRODUCTION' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <div className="min-w-0">
              <div className="font-bold text-[11px] leading-tight truncate">
                {appMode === 'PRODUCTION' ? 'Live Real Database' : 'Demo Sandbox Mode'}
              </div>
              <div className="text-[9px] text-gray-500 truncate">
                {appMode === 'PRODUCTION' ? 'Local storage persistent' : 'Pre-loaded mock data'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-semibold underline text-blue-700 shrink-0">
            Manage
          </span>
        </div>

        {/* Operating Organizations Tree */}
        {parentGroup && (
          <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-2 space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-600" />
                <span>Operating Entities</span>
              </span>
              <button
                onClick={() => setIsGroupTreeExpanded(!isGroupTreeExpanded)}
                className="text-slate-400 hover:text-slate-600 text-[10px]"
              >
                {isGroupTreeExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            </div>

            {isGroupTreeExpanded && (
              <div className="space-y-1 pt-0.5">
                {/* Master Group */}
                <button
                  onClick={() => onSelectCompany && onSelectCompany(parentGroup)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${
                    selectedCompany?.id === parentGroup.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-800 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="truncate">{parentGroup.name}</span>
                  <span
                    className={`text-[9px] px-1 rounded font-mono ${
                      selectedCompany?.id === parentGroup.id
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ROLLUP
                  </span>
                </button>

                {/* Subsidiaries */}
                <div className="pl-2 space-y-0.5 border-l border-slate-200 ml-1.5">
                  {groupSubsidiaries.map((sub) => {
                    const isSelected = selectedCompany?.id === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSelectCompany && onSelectCompany(sub)}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-colors text-left ${
                          isSelected
                            ? 'bg-blue-100 text-blue-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate max-w-[130px]">{sub.name.replace('Skandhanshi ', '')}</span>
                        <span className="text-[9px] text-slate-400 font-mono">
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
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items
                  .filter((item) => item.visible)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#111827]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] shrink-0 font-bold ${
                              item.badgeColor || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Card with Auth & Sign In / Sign Out */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/70">
        {!isAuthenticated ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                <LogIn className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800 truncate">Not Signed In</p>
                <p className="text-[10px] text-gray-500 truncate">Guest Session Mode</p>
              </div>
            </div>
            <button
              onClick={onSignIn || onOpenAuthModal}
              className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Organization</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <img
                src={safeUser.avatar}
                alt={safeUser.name}
                className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#111827] truncate">{safeUser.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{safeUser.role.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {onOpenAuthModal && appMode === 'DEMO' && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-1.5 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Switch Demo Persona"
                >
                  Switch
                </button>
              )}
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Sign Out of Enterprise Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
