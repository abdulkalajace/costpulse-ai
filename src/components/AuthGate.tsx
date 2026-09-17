import React, { useState } from 'react';
import { Building2, Lock, Mail, User, ArrowRight, LogIn, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import * as api from '../utils/api';
import { UserProfile } from '../types';
import { WorkspaceData } from '../utils/api';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuthGateProps {
  onAuthenticated: (user: UserProfile, workspace: WorkspaceData) => void;
  onUseDemoInstead: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated, onUseDemoInstead }) => {
  const [tab, setTab] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology & Business Services');
  const [currency, setCurrency] = useState('INR');
  const [adminName, setAdminName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      onAuthenticated(res.user, res.workspace);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.signup({
        companyName,
        industry,
        currency,
        adminName,
        email: suEmail,
        password: suPassword,
      });
      onAuthenticated(res.user, res.workspace);
    } catch (err: any) {
      setError(err?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground">CostPulse AI</span>
        </div>

        <Card className="overflow-hidden py-0 shadow-xl">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as 'SIGN_IN' | 'SIGN_UP');
              setError('');
            }}
          >
            <TabsList className="h-auto w-full rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="SIGN_IN"
                className="flex-1 rounded-none border-b-2 border-transparent py-3 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="SIGN_UP"
                className="flex-1 rounded-none border-b-2 border-transparent py-3 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Create Company Account
              </TabsTrigger>
            </TabsList>

            <CardContent className="p-6">
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <TabsContent value="SIGN_IN" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-xs font-semibold">
                      Work Email
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password" className="text-xs font-semibold">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    <LogIn className="h-4 w-4" />
                    <span>{loading ? 'Signing in…' : 'Sign In'}</span>
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="SIGN_UP" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="company-name" className="text-xs font-semibold">
                      Company Name
                    </Label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company-name"
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-9"
                        placeholder="e.g. Acme Technologies"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="industry" className="text-xs font-semibold">
                        Industry
                      </Label>
                      <Input id="industry" type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-name" className="text-xs font-semibold">
                      Your Full Name
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-name"
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="pl-9"
                        placeholder="e.g. Ada Lovelace"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs font-semibold">
                      Work Email
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        value={suEmail}
                        onChange={(e) => setSuEmail(e.target.value)}
                        className="pl-9"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs font-semibold">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        minLength={8}
                        value={suPassword}
                        onChange={(e) => setSuPassword(e.target.value)}
                        className="pl-9"
                        placeholder="At least 8 characters"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    <span>{loading ? 'Creating account…' : 'Create Account & Start Tracking'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>

          <CardFooter className="justify-center border-t bg-muted/40 py-3">
            <button
              onClick={onUseDemoInstead}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-primary"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Just exploring? Try the interactive demo sandbox instead</span>
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
