import React from 'react';
import {
  Search,
  Sparkles,
  Building2,
  ChevronDown,
  Flame,
  Clock,
  Settings,
  LogOut,
  LogIn,
  KeyRound,
} from 'lucide-react';
import { Company, UserProfile, UserRole, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  onOpenAuthModal,
  onOpenSettings,
  appMode = 'PRODUCTION',
  onToggleAppMode,
  demoUsers = [],
}) => {
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

  const groupCompanies = companies.filter((c) => c.isGroup);
  const standaloneCompanies = companies.filter((c) => !c.isGroup && !c.parentGroupId);
  const subsidiaries = companies.filter((c) => !!c.parentGroupId);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card px-5 lg:px-7 transition-colors">
      {/* Left: Organization Selector & Context */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium hidden sm:inline">Entity:</span>

          {/* Company Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="company-selector-btn"
                variant="outline"
                size="sm"
                className="h-auto gap-2 bg-muted/40 px-2.5 py-1.5 text-xs font-bold text-foreground shadow-2xs"
              >
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="max-w-[180px] sm:max-w-[240px] truncate">{activeComp.name}</span>
                {activeComp.isGroup ? (
                  <Badge className="text-[9px]">GROUP ROLLUP</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[9px]">
                    {activeComp.industryVertical || 'SUBSIDIARY'}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 max-h-[85vh] overflow-y-auto">
              {groupCompanies.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-primary bg-primary/5 rounded">
                    Consolidated Group Holdings
                  </DropdownMenuLabel>
                  {groupCompanies.map((comp) => (
                    <DropdownMenuItem
                      key={comp.id}
                      onClick={() => onSelectCompany && onSelectCompany(comp)}
                      className={cn(
                        'flex-col items-start gap-0.5',
                        activeComp.id === comp.id && 'bg-primary/10 text-primary font-bold'
                      )}
                    >
                      <div className="font-bold truncate w-full">{comp.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {comp.subsidiaryCount || 5} Operating Entities • Consolidated Rollup
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {subsidiaries.length > 0 && (
                <>
                  <DropdownMenuLabel>Operating Subsidiaries</DropdownMenuLabel>
                  {subsidiaries.map((comp) => (
                    <DropdownMenuItem
                      key={comp.id}
                      onClick={() => onSelectCompany && onSelectCompany(comp)}
                      className={cn(
                        'flex items-center justify-between',
                        activeComp.id === comp.id && 'bg-primary/10 text-primary font-bold'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{comp.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {comp.industryVertical || comp.industry}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground font-mono">
                        {formatCurrency(comp.monthlyBurn, comp.currency, true)}/mo
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {standaloneCompanies.length > 0 && (
                <>
                  <DropdownMenuLabel>Standalone Companies</DropdownMenuLabel>
                  {standaloneCompanies.map((comp) => (
                    <DropdownMenuItem
                      key={comp.id}
                      onClick={() => onSelectCompany && onSelectCompany(comp)}
                      className={cn(
                        activeComp.id === comp.id && 'bg-primary/10 text-primary font-bold'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{comp.name}</div>
                        <div className="text-[10px] text-muted-foreground">{comp.industry}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Live Burn & Runway Quick Bar */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l">
          <Badge variant="outline" className="gap-1 bg-rose-50 text-rose-700 border-rose-100">
            <Flame className="h-3 w-3 text-rose-600" />
            <span>Burn: {formatCurrency(monthlyBurn, currency, true)}/mo</span>
          </Badge>
          <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-100">
            <Clock className="h-3 w-3 text-emerald-600" />
            <span>Runway: {runwayMonths} Mo</span>
          </Badge>
        </div>
      </div>

      {/* Right: Search, Currency, Persona Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Cmd+K Search trigger */}
        <Button
          id="global-search-btn"
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="hidden sm:flex h-auto gap-2 bg-muted/40 px-2.5 py-1.5 text-xs font-normal text-muted-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden md:inline-block rounded bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border">
            ⌘K
          </kbd>
        </Button>

        {/* Mode Switcher (Live Production vs Demo Sandbox) */}
        <div className="flex items-center rounded-lg border bg-muted p-0.5 text-[11px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAppMode}
            title="Real Live Enterprise Data synced to your account"
            className={cn(
              'h-auto gap-1 rounded px-2 py-1 font-bold',
              appMode === 'PRODUCTION'
                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-600 hover:text-white'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', appMode === 'PRODUCTION' ? 'bg-white' : 'bg-emerald-500')} />
            <span>Live Data</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAppMode}
            title="Demo Sandbox with pre-loaded mock scenarios"
            className={cn(
              'h-auto gap-1 rounded px-2 py-1 font-bold',
              appMode === 'DEMO'
                ? 'bg-amber-600 text-white shadow-xs hover:bg-amber-600 hover:text-white'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', appMode === 'DEMO' ? 'bg-white' : 'bg-amber-500')} />
            <span>Demo Mode</span>
          </Button>
        </div>

        {/* Currency Switcher (INR / USD) */}
        <div className="hidden lg:flex items-center rounded-lg border bg-muted p-0.5 text-[11px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChangeCurrency('INR')}
            title="Indian Rupee (₹ Lakhs & Crores)"
            className={cn(
              'h-auto rounded px-2 py-1 font-bold',
              currency === 'INR' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
            )}
          >
            ₹ INR
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChangeCurrency('USD')}
            title="US Dollar ($)"
            className={cn(
              'h-auto rounded px-2 py-1 font-bold',
              currency === 'USD' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
            )}
          >
            $ USD
          </Button>
        </div>

        {/* Primary CTA: Ask AI */}
        <Button id="nav-ask-ai-btn" size="sm" onClick={onOpenAiChat} className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>

        {/* Settings / Sandbox Trigger */}
        {onOpenSettings && (
          <Button
            id="nav-settings-btn"
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            title="Settings, Data Import/Export & Demo Management"
            className="h-auto gap-1.5 bg-muted/40 px-2.5 py-1.5 text-xs font-semibold"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Settings</span>
          </Button>
        )}

        {/* Authentication & User Session Controls */}
        {!isAuthenticated ? (
          <Button id="nav-signin-btn" size="sm" onClick={onSignIn || onOpenAuthModal} className="gap-1.5">
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Quick Sign Out Action */}
            {onSignOut && (
              <Button
                id="nav-quick-signout-btn"
                variant="outline"
                size="sm"
                onClick={onSignOut}
                title="Sign Out of Enterprise Session"
                className="h-auto gap-1 border-destructive/30 bg-destructive/5 px-2 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Sign Out</span>
              </Button>
            )}

            {/* Role & Account Selector Badge with dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="role-selector-btn"
                  variant="ghost"
                  className="h-auto gap-1.5 rounded-lg p-1"
                >
                  <Avatar className="h-7 w-7 border">
                    <AvatarImage src={safeUser.avatar} alt={safeUser.name} />
                    <AvatarFallback>{safeUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden lg:block">
                    <div className="font-bold text-foreground text-xs leading-tight">{safeUser.name}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {safeUser.role?.replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-76">
                {/* Current Active Session Header */}
                <div className="p-2 mb-1 bg-muted/60 rounded-lg flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={safeUser.avatar} alt={safeUser.name} />
                    <AvatarFallback>{safeUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-foreground truncate">{safeUser.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{safeUser.email}</div>
                    <Badge variant="secondary" className="text-[9px] mt-0.5">
                      {safeUser.role?.replace('_', ' ')} • {safeUser.departmentName}
                    </Badge>
                  </div>
                </div>

                <DropdownMenuLabel>Switch Executive Persona / Sign In</DropdownMenuLabel>
                <div className="max-h-48 overflow-y-auto">
                  {demoUsers.slice(0, 6).map((u) => (
                    <DropdownMenuItem
                      key={u.id}
                      onClick={() => onSelectUser && onSelectUser(u)}
                      className={cn(
                        'gap-2.5',
                        u.id === safeUser.id && 'bg-primary/10 text-primary font-bold'
                      )}
                    >
                      <Avatar className="h-6 w-6 border">
                        <AvatarImage src={u.avatar} alt={u.name} />
                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-xs">{u.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{u.departmentName}</div>
                      </div>
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">
                        {u.role}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onOpenAuthModal && onOpenAuthModal()} className="text-primary">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Enterprise Sign In & Register Modal</span>
                </DropdownMenuItem>
                {onSignOut && (
                  <DropdownMenuItem onClick={onSignOut} variant="destructive">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Enterprise Session</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};
