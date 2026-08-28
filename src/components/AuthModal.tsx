import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Lock,
  Mail,
  User,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Hospital,
  Building,
  KeyRound,
  LogOut,
  LogIn,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Company, UserProfile, UserRole, IndustryVertical } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  isAuthenticated?: boolean;
  onSelectUser: (user: UserProfile) => void;
  onSignOut?: () => void;
  companies: Company[];
  selectedCompany: Company;
  onSelectCompany: (company: Company) => void;
  demoUsers: UserProfile[];
  initialTab?: 'SIGN_IN' | 'SIGN_UP' | 'PERSONAS';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isAuthenticated = true,
  onSelectUser,
  onSignOut,
  companies,
  selectedCompany,
  onSelectCompany,
  demoUsers,
  initialTab = 'PERSONAS',
}) => {
  const [activeTab, setActiveTab] = useState<'SIGN_IN' | 'SIGN_UP' | 'PERSONAS'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  
  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [signInSuccessMsg, setSignInSuccessMsg] = useState('');

  // Sign Up Form State
  const [orgType, setOrgType] = useState<'CONGLOMERATE' | 'SINGLE_VERTICAL'>('CONGLOMERATE');
  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<IndustryVertical>('HEALTHCARE');
  const [signUpSuccessMsg, setSignUpSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInSuccessMsg('Authenticating enterprise credentials...');
    setTimeout(() => {
      // Find matching user or default to first
      const matched = demoUsers.find((u) => u.email.toLowerCase() === signInEmail.toLowerCase()) || demoUsers[0];
      onSelectUser(matched);
      setSignInSuccessMsg(`Signed in successfully as ${matched.name} (${matched.role})`);
      setTimeout(() => {
        setSignInSuccessMsg('');
        onClose();
      }, 600);
    }, 450);
  };

  const handleQuickSignIn = (user: UserProfile) => {
    setSignInSuccessMsg(`Authenticating as ${user.name}...`);
    setTimeout(() => {
      onSelectUser(user);
      setSignInSuccessMsg(`Signed in successfully as ${user.name}`);
      setTimeout(() => {
        setSignInSuccessMsg('');
        onClose();
      }, 500);
    }, 300);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpSuccessMsg('Provisioning enterprise tenant...');
    setTimeout(() => {
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: adminName || 'Enterprise Administrator',
        email: adminEmail || 'admin@enterprise.io',
        role: 'MD_CEO',
        departmentName: 'Executive Management',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      onSelectUser(newUser);
      setSignUpSuccessMsg(`Tenant "${orgName || 'New Enterprise'}" provisioned! Welcome ${newUser.name}.`);
      setTimeout(() => {
        setSignUpSuccessMsg('');
        onClose();
      }, 800);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Enterprise Access & Identity</h2>
              <p className="text-xs text-gray-500">Sign In, Sign Out, Switch Personas, or Register Organization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session Status Bar */}
        {isAuthenticated && currentUser ? (
          <div className="px-6 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-blue-300 shrink-0"
              />
              <div className="text-xs truncate">
                <span className="text-blue-900 font-semibold">Active Session: </span>
                <span className="font-bold text-gray-900">{currentUser.name}</span>
                <span className="text-gray-500 font-mono text-[11px] ml-1">({currentUser.email})</span>
                <span className="ml-1.5 bg-blue-200/70 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  {currentUser.role}
                </span>
              </div>
            </div>
            {onSignOut && (
              <button
                onClick={() => {
                  onSignOut();
                  setActiveTab('SIGN_IN');
                  setSignInSuccessMsg('Signed out successfully.');
                  setTimeout(() => setSignInSuccessMsg(''), 2500);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-100/60 px-2 py-1 rounded transition-colors shrink-0"
                title="End current authenticated session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        ) : (
          <div className="px-6 py-2 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>You are currently in <strong>Guest / Unauthenticated Mode</strong>. Please sign in below.</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('SIGN_IN')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'SIGN_IN'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => setActiveTab('PERSONAS')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'PERSONAS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Switch Role / Persona</span>
            <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">Quick Demo</span>
          </button>
          <button
            onClick={() => setActiveTab('SIGN_UP')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'SIGN_UP'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Register Organization</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: QUICK PERSONA SWITCH */}
          {activeTab === 'PERSONAS' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-semibold">Interactive Conglomerate & Subsidiary Personas</p>
                  <p className="text-blue-700 mt-0.5">
                    Select an executive to test access rights, approval limits, and domain-specific isolation across Skandhanshi Group (Holdings & 6 Operating Subsidiaries) or Standalone entities.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoUsers.map((user) => {
                  const isSelected = currentUser?.id === user.id;
                  
                  // Associate persona with specific subsidiary / group company
                  let targetCompany = companies[0];
                  if (user.id === 'usr-sk-cfo') {
                    targetCompany = companies.find((c) => c.id === 'comp-skandhanshi-group') || companies[0];
                  } else if (user.id === 'usr-sk-hospital') {
                    targetCompany = companies.find((c) => c.id === 'comp-sk-medcity') || companies[0];
                  } else if (user.id === 'usr-sk-hotel') {
                    targetCompany = companies.find((c) => c.id === 'comp-sk-hotels') || companies[0];
                  } else if (user.id === 'usr-sk-infra') {
                    targetCompany = companies.find((c) => c.id === 'comp-sk-infra') || companies[0];
                  }

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        if (targetCompany) {
                          onSelectCompany(targetCompany);
                        }
                        onClose();
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-600'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-gray-900 truncate">{user.name}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              user.role === 'MASTER'
                                ? 'bg-purple-100 text-purple-700'
                                : user.role === 'MD_CEO'
                                ? 'bg-indigo-100 text-indigo-700'
                                : user.role === 'CFO'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{user.departmentName}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                        
                        {targetCompany && (
                          <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            <Building2 className="w-3 h-3 text-blue-500" />
                            <span className="truncate">{targetCompany.name}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ENTERPRISE SIGN IN */}
          {activeTab === 'SIGN_IN' && (
            <div className="space-y-5 max-w-md mx-auto">
              {signInSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{signInSuccessMsg}</span>
                </div>
              )}

              {/* Quick 1-Click Demo Logins */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                    Quick 1-Click Executive Login:
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickSignIn(u)}
                      className="flex items-center gap-2 p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-left transition-colors"
                    >
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-gray-800 truncate">{u.name}</p>
                        <p className="text-[9px] text-gray-400 truncate">{u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Corporate Email Address</label>
                    <button
                      type="button"
                      onClick={() => {
                        setSignInEmail('vikram.rao@skandhanshi.com');
                        setSignInPassword('enterprise2026');
                      }}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      Auto-fill CEO email
                    </button>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. vikram.rao@skandhanshi.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">Password</label>
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-blue-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember this device for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Organization</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2 text-gray-400 font-semibold">Or Single Sign-On</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInSuccessMsg('Single Sign-On Authenticated via Microsoft 365 Azure AD');
                      setTimeout(() => {
                        setSignInSuccessMsg('');
                        onClose();
                      }, 700);
                    }}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Microsoft Azure AD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInSuccessMsg('Single Sign-On Authenticated via Google Workspace');
                      setTimeout(() => {
                        setSignInSuccessMsg('');
                        onClose();
                      }, 700);
                    }}
                    className="py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Google Workspace</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: REGISTER NEW ORGANIZATION */}
          {activeTab === 'SIGN_UP' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4 max-w-lg mx-auto">
              {signUpSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{signUpSuccessMsg}</span>
                </div>
              )}

              {/* Organization Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Organization Architecture</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrgType('CONGLOMERATE')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      orgType === 'CONGLOMERATE'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-gray-900">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Group Conglomerate</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Parent Holding company with multiple operating subsidiaries across verticals (like Skandhanshi Group).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrgType('SINGLE_VERTICAL')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      orgType === 'SINGLE_VERTICAL'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-gray-900">
                      <Hospital className="w-4 h-4 text-emerald-600" />
                      <span>Single-Vertical Entity</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Dedicated standalone organization (e.g. Only Hospital, Only Hotel, or Only Construction company).
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Company / Group Name</label>
                <input
                  type="text"
                  required
                  placeholder={orgType === 'CONGLOMERATE' ? 'e.g. Skandhanshi Group Holdings' : 'e.g. Apollo Metropolitan Hospital'}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {orgType === 'SINGLE_VERTICAL' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Industry Vertical</label>
                  <select
                    value={selectedVertical}
                    onChange={(e) => setSelectedVertical(e.target.value as IndustryVertical)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="HEALTHCARE">🏥 Hospitals & Healthcare Systems</option>
                    <option value="HOTEL_HOSPITALITY">🏨 Hotels & Luxury Hospitality</option>
                    <option value="CONSTRUCTION">🏗️ Construction & Heavy Infrastructure</option>
                    <option value="SOFTWARE_TECH">💻 Software & Enterprise Cloud AI</option>
                    <option value="BEAUTY_WELLNESS">💄 Beauty, Aesthetics Spas & Salons</option>
                    <option value="HIGHER_EDUCATION">🎓 Higher Education & Research Grants</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Rao"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@company.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Register & Initialize Organization</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>SOC2 Type II & HIPAA Certified Access Protocol</span>
          </div>
          <span>Active Organization: <strong className="text-gray-800">{selectedCompany.name}</strong></span>
        </div>
      </div>
    </div>
  );
};
