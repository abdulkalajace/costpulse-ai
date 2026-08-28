import React from 'react';
import {
  Search,
  Sparkles,
  Building2,
  ChevronDown,
  Globe,
  KeyRound,
  Flame,
  Clock,
  Settings,
  Database,
  LogOut,
  LogIn,
  UserCheck,
  User,
  Shield,
} from 'lucide-react';
import { Company, UserProfile, UserRole, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface NavbarProps {
  companies?: Company[];
  selectedCompany?: Company;
  onSelectCompany?: (company: Company) => void;
  currentUser?: UserProfile | null;
  isAuthenticated?: boolean;
  onSelectUser?: (user: UserProfile) => void;
  onSignOut?: () => void;
  onSignIn?: () => void;
  currency: CurrencyCode;
  onChangeCurrency: (curr: CurrencyCode) => void;
  onOpenSearch: () => void;
  onOpenAiChat?: () => void;
  onOpenImport?: () => void;
  onOpenOnboarding?: () => void;
  onOpenAuthModal?: () => void;
  onOpenSettings?: () => void;
  appMode?: 'PRODUCTION' | 'DEMO';
  onToggleAppMode?: () => void;
  pendingApprovalsCount?: number;
  demoUsers?: UserProfile[];
}

export const Navbar: React.FC<NavbarProps> = ({
  companies = [],
  selectedCompany,
  onSelectCompany,
  currentUser,
  isAuthenticated = true,
  onSelectUser,
  onSignOut,
  onSignIn,
  currency,
  onChangeCurrency,
  onOpenSearch,
  onOpenAiChat,
  onOpenImport,
  onOpenOnboarding,
  onOpenAuthModal,
  onOpenSettings,
  appMode = 'PRODUCTION',
  onToggleAppMode,
  pendingApprovalsCount = 0,
  demoUsers = [],
}) => {
  const [showCompanyMenu, setShowCompanyMenu] = React.useState(false);
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const activeComp = selectedCompany || companies[0] || {
    id: 'default',
    name: 'Enterprise',
    isGroup: false,
    monthlyBurn: 145500000,
    totalExpensesYear: 1746000000,
  };

  const safeUser = currentUser || {
    id: 'usr-guest',
    name: 'Guest User',
    email: 'guest@enterprise.internal',
    role: 'EMPLOYEE' as UserRole,
    departmentName: 'Unauthenticated Session',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  const monthlyBurn = activeComp.monthlyBurn || Math.round(activeComp.totalExpensesYear / 12);
  const runwayMonths = (2.5 * (activeComp.totalExpensesYear || monthlyBurn * 12) / monthlyBurn).toFixed(1);

  // Group companies vs Standalone
  const groupCompanies = companies.filter((c) => c.isGroup);
  const standaloneCompanies = companies.filter((c) => !c.isGroup && !c.parentGroupId);
  const subsidiaries = companies.filter((c) => !!c.parentGroupId);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-5 lg:px-7 transition-colors">
      {/* Left: Organization Selector & Context */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium hidden sm:inline">Entity:</span>
          
          {/* Company Selector Dropdown */}
          <div className="relative">
            <button
              id="company-selector-btn"
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-2.5 py-1.5 text-xs font-bold text-[#111827] hover:bg-gray-100 transition-colors shadow-2xs"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              <span className="max-w-[180px] sm:max-w-[240px] truncate">{activeComp.name}</span>
              {activeComp.isGroup ? (
                <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                  GROUP ROLLUP
                </span>
              ) : (
                <span className="bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.2 rounded font-bold">
                  {activeComp.industryVertical || 'SUBSIDIARY'}
                </span>
              )}
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>

            {showCompanyMenu && (
              <div className="absolute left-0 mt-1.5 w-80 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-2xl z-50 max-h-[85vh] overflow-y-auto space-y-2">
                {/* 1. Group Conglomerates */}
                {groupCompanies.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50/80 rounded">
                      Consolidated Group Holdings
                    </div>
                    {groupCompanies.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          if (onSelectCompany) onSelectCompany(comp);
                          setShowCompanyMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                          activeComp.id === comp.id
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold truncate">{comp.name}</div>
                          <div className={`text-[10px] ${activeComp.id === comp.id ? 'text-blue-100' : 'text-gray-400'}`}>
                            {comp.subsidiaryCount || 5} Operating Entities • Consolidated Rollup
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Operating Subsidiaries */}
                {subsidiaries.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 rounded">
                      Operating Subsidiaries
                    </div>
                    {subsidiaries.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          if (onSelectCompany) onSelectCompany(comp);
                          setShowCompanyMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                          activeComp.id === comp.id
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{comp.name}</div>
                          <div className="text-[10px] text-gray-400">
                            {comp.industryVertical || comp.industry}
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 font-mono">
                          {formatCurrency(comp.monthlyBurn, comp.currency, true)}/mo
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Standalone Companies */}
                {standaloneCompanies.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Standalone Companies
                    </div>
                    {standaloneCompanies.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          if (onSelectCompany) onSelectCompany(comp);
                          setShowCompanyMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                          activeComp.id === comp.id
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{comp.name}</div>
                          <div className="text-[10px] text-gray-400">{comp.industry}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Burn & Runway Quick Bar (For Instant Executive Visibility) */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="flex items-center gap-1 rounded bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 text-[11px] font-bold">
            <Flame className="h-3 w-3 text-rose-600" />
            <span>Burn: {formatCurrency(monthlyBurn, currency, true)}/mo</span>
          </div>
          <div className="flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 text-[11px] font-bold">
            <Clock className="h-3 w-3 text-emerald-600" />
            <span>Runway: {runwayMonths} Mo</span>
          </div>
        </div>
      </div>

      {/* Right: Search, Currency, Persona Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Cmd+K Search trigger */}
        <button
          id="global-search-btn"
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-gray-400" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-block rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-gray-200">
            ⌘K
          </kbd>
        </button>

        {/* Mode Switcher (Live Production vs Demo Sandbox) */}
        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-[11px]">
          <button
            onClick={onToggleAppMode}
            className={`flex items-center gap-1 rounded px-2 py-1 font-bold transition-colors ${
              appMode === 'PRODUCTION'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-[#111827]'
            }`}
            title="Real Live Enterprise Data persisted in browser database"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${appMode === 'PRODUCTION' ? 'bg-white' : 'bg-emerald-500'}`} />
            <span>Live Data</span>
          </button>
          <button
            onClick={onToggleAppMode}
            className={`flex items-center gap-1 rounded px-2 py-1 font-bold transition-colors ${
              appMode === 'DEMO'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-[#111827]'
            }`}
            title="Demo Sandbox with pre-loaded mock scenarios"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${appMode === 'DEMO' ? 'bg-white' : 'bg-amber-500'}`} />
            <span>Demo Mode</span>
          </button>
        </div>

        {/* Currency Switcher (INR / USD) */}
        <div className="hidden lg:flex items-center rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-[11px]">
          <button
            onClick={() => onChangeCurrency('INR')}
            className={`rounded px-2 py-1 font-bold transition-colors ${
              currency === 'INR' ? 'bg-white text-[#111827] shadow-xs' : 'text-gray-500 hover:text-[#111827]'
            }`}
            title="Indian Rupee (₹ Lakhs & Crores)"
          >
            ₹ INR
          </button>
          <button
            onClick={() => onChangeCurrency('USD')}
            className={`rounded px-2 py-1 font-bold transition-colors ${
              currency === 'USD' ? 'bg-white text-[#111827] shadow-xs' : 'text-gray-500 hover:text-[#111827]'
            }`}
            title="US Dollar ($)"
          >
            $ USD
          </button>
        </div>

        {/* Primary CTA: Ask AI */}
        <button
          id="nav-ask-ai-btn"
          onClick={onOpenAiChat}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-200" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Settings / Sandbox Trigger */}
        {onOpenSettings && (
          <button
            id="nav-settings-btn"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            title="Settings, Data Import/Export & Demo Management"
          >
            <Settings className="h-3.5 w-3.5 text-gray-600" />
            <span className="hidden xl:inline">Settings</span>
          </button>
        )}

        {/* Authentication & User Session Controls */}
        {!isAuthenticated ? (
          <button
            id="nav-signin-btn"
            onClick={onSignIn || onOpenAuthModal}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Quick Sign Out Action */}
            {onSignOut && (
              <button
                id="nav-quick-signout-btn"
                onClick={onSignOut}
                className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/70 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                title="Sign Out of Enterprise Session"
              >
                <LogOut className="h-3.5 w-3.5 text-red-600" />
                <span className="hidden xl:inline">Sign Out</span>
              </button>
            )}

            {/* Role & Account Selector Badge with dropdown */}
            <div className="relative">
              <button
                id="role-selector-btn"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <img
                  src={safeUser.avatar}
                  alt={safeUser.name}
                  className="h-7 w-7 rounded-full object-cover border border-gray-200"
                />
                <div className="text-left hidden lg:block">
                  <div className="font-bold text-[#111827] text-xs leading-tight">{safeUser.name}</div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {safeUser.role?.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1.5 w-76 rounded-xl border border-[#E5E7EB] bg-white p-2.5 shadow-xl z-50">
                  {/* Current Active Session Header */}
                  <div className="p-2 mb-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2.5">
                    <img
                      src={safeUser.avatar}
                      alt={safeUser.name}
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-gray-900 truncate">{safeUser.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{safeUser.email}</div>
                      <div className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {safeUser.role?.replace('_', ' ')} • {safeUser.departmentName}
                      </div>
                    </div>
                  </div>

                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Switch Executive Persona / Sign In
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {demoUsers.slice(0, 6).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          if (onSelectUser) onSelectUser(u);
                          setShowRoleMenu(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                          u.id === safeUser.id
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-6 w-6 rounded-full object-cover border border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-xs">{u.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {u.departmentName}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            u.id === safeUser.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        if (onOpenAuthModal) onOpenAuthModal();
                      }}
                      className="w-full py-1.5 px-2 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Enterprise Sign In & Register Modal</span>
                    </button>

                    {onSignOut && (
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onSignOut();
                        }}
                        className="w-full py-1.5 px-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Enterprise Session</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
