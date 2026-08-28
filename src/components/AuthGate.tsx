import React, { useState } from 'react';
import { Building2, Lock, Mail, User, ArrowRight, LogIn, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import * as api from '../utils/api';
import { UserProfile } from '../types';
import { WorkspaceData } from '../utils/api';

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
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F9FAFB] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-gray-900">CostPulse AI</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setTab('SIGN_IN');
                setError('');
              }}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                tab === 'SIGN_IN' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'
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
                tab === 'SIGN_UP' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Create Company Account
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {tab === 'SIGN_IN' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{loading ? 'Signing in…' : 'Sign In'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g. Acme Technologies"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Industry</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g. Ada Lovelace"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="At least 8 characters"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  <span>{loading ? 'Creating account…' : 'Create Account & Start Tracking'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-center">
            <button
              onClick={onUseDemoInstead}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 hover:text-blue-600"
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
