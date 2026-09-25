import React from 'react';
import { Search, Sparkles, ChevronDown, LogOut, LogIn, Settings } from 'lucide-react';
import { Company, UserProfile } from '../types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  companies?: Company[];
  selectedCompany?: Company;
  onSelectCompany?: (company: Company) => void;
  currentUser?: UserProfile | null;
  isAuthenticated?: boolean;
  onSelectUser?: (user: UserProfile) => void;
  onSignOut?: () => void;
  onSignIn?: () => void;
  onOpenSearch: () => void;
  onOpenAiChat?: () => void;
  onOpenSettings?: () => void;
  appMode?: 'PRODUCTION' | 'DEMO';
  demoUsers?: UserProfile[];
}

// Top bar: where you are, search, Ask AI, your account. Mode, currency and
// sign-out live in Settings / the account menu, not as always-on toggles.
export const Navbar: React.FC<NavbarProps> = ({
  companies = [],
  selectedCompany,
  onSelectCompany,
  currentUser,
  isAuthenticated = true,
  onSelectUser,
  onSignOut,
  onSignIn,
  onOpenSearch,
  onOpenAiChat,
  onOpenSettings,
  appMode = 'PRODUCTION',
  demoUsers = [],
}) => {
  const activeComp = selectedCompany || companies[0];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b bg-card px-5 lg:px-7">
      <div className="min-w-0">
        {companies.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium">
                <span className="max-w-[240px] truncate">{activeComp?.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-[70vh] overflow-y-auto">
              {companies.map((comp) => (
                <DropdownMenuItem
                  key={comp.id}
                  onClick={() => onSelectCompany?.(comp)}
                  className={comp.parentGroupId ? 'pl-5' : 'font-medium'}
                >
                  <span className="truncate">{comp.name}</span>
                  {comp.id === activeComp?.id && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="truncate text-sm font-medium text-foreground">{activeComp?.name}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="hidden sm:flex w-56 justify-start gap-2 font-normal text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
          <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-xs">⌘K</kbd>
        </Button>

        <Button size="sm" onClick={onOpenAiChat} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>

        {!isAuthenticated || !currentUser ? (
          <Button size="sm" variant="outline" onClick={onSignIn} className="gap-1.5">
            <LogIn className="h-4 w-4" />
            <span>Sign in</span>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium text-foreground truncate">{currentUser.name}</div>
                <div className="text-xs text-muted-foreground truncate">{currentUser.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {appMode === 'DEMO' && demoUsers.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">View sample data as</DropdownMenuLabel>
                  {demoUsers.slice(0, 6).map((u) => (
                    <DropdownMenuItem key={u.id} onClick={() => onSelectUser?.(u)}>
                      <span className="truncate">{u.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{u.role.replace('_', ' ')}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              {onOpenSettings && (
                <DropdownMenuItem onClick={onOpenSettings}>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              )}
              {onSignOut && (
                <DropdownMenuItem onClick={onSignOut} variant="destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
