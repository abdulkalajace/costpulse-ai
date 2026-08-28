import React, { useState } from 'react';
import { Building2, Lock, Mail, User, ArrowRight, LogIn, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import * as api from '../utils/api';
import { UserProfile, INDUSTRIES } from '../types';
import { WorkspaceData } from '../utils/api';
import { Button } from './ui/Button';
import { FormField, Input, Select } from './ui/FormField';

interface AuthGateProps {
  onAuthenticated: (user: UserProfile, workspace: WorkspaceData) => void;
  onUseDemoInstead: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated, onUseDemoInstead }) => {
  const [tab, setTab] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sign in fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign up fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
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
    if (!industry) {
      setError('Please select your industry');
      return;
    }
    if (industry === 'Other' && !customIndustry.trim()) {
      setError('Please tell us your industry');
      return;
    }
    setLoading(true);
    try {
      const res = await api.signup({
        companyName,
        industry: industry === 'Other' ? customIndustry.trim() : industry,
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
    <div className="flex min-h-screen w-full items-center justify-center bg-surface-muted px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-ink-900">CostPulse AI</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div className="flex border-b border-border">
            <button
              onClick={() => {
                setTab('SIGN_IN');
                setError('');
              }}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                tab === 'SIGN_IN' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('SIGN_UP');
                setError('');
              }}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                tab === 'SIGN_UP' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Create Company Account
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {tab === 'SIGN_IN' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <FormField label="Work Email" htmlFor="signin-email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
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
                </FormField>
                <FormField label="Password" htmlFor="signin-password">
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
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
                </FormField>
                <Button type="submit" disabled={loading} className="w-full">
                  <LogIn className="h-4 w-4" />
                  <span>{loading ? 'Signing in…' : 'Sign In'}</span>
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <FormField label="Company Name" htmlFor="su-company">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
                    <Input
                      id="su-company"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-9"
                      placeholder="e.g. Acme Technologies"
                    />
                  </div>
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Industry" htmlFor="su-industry">
                    <Select
                      id="su-industry"
                      required
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      <option value="" disabled>
                        Select industry…
                      </option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label="Currency" htmlFor="su-currency">
                    <Select id="su-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </Select>
                  </FormField>
                </div>

                {industry === 'Other' && (
                  <FormField label="Tell us your industry" htmlFor="su-custom-industry">
                    <Input
                      id="su-custom-industry"
                      type="text"
                      required
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      placeholder="e.g. Renewable Energy"
                    />
                  </FormField>
                )}

                <FormField label="Your Full Name" htmlFor="su-admin-name">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
                    <Input
                      id="su-admin-name"
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="pl-9"
                      placeholder="e.g. Ada Lovelace"
                    />
                  </div>
                </FormField>
                <FormField label="Work Email" htmlFor="su-email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
                    <Input
                      id="su-email"
                      type="email"
                      required
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      className="pl-9"
                      placeholder="you@company.com"
                    />
                  </div>
                </FormField>
                <FormField label="Password" htmlFor="su-password">
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
                    <Input
                      id="su-password"
                      type="password"
                      required
                      minLength={8}
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      className="pl-9"
                      placeholder="At least 8 characters"
                    />
                  </div>
                </FormField>
                <Button type="submit" disabled={loading} className="w-full">
                  <span>{loading ? 'Creating account…' : 'Create Account & Start Tracking'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>

          <div className="border-t border-border bg-surface-muted px-6 py-3 text-center">
            <button
              onClick={onUseDemoInstead}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-500 hover:text-brand-600"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Just exploring? Try the interactive demo sandbox instead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
