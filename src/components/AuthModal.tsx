import React from 'react';
import { X, Building2, Sparkles, KeyRound } from 'lucide-react';
import { Company, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onSelectUser: (user: UserProfile) => void;
  companies: Company[];
  selectedCompany: Company;
  onSelectCompany: (company: Company) => void;
  demoUsers: UserProfile[];
}

/**
 * Demo Sandbox persona switcher — lets a Demo Sandbox visitor try different
 * executive roles against the sample dataset. This is NOT a real sign-in
 * flow: it never touches the backend, so it's only ever rendered while
 * appMode === 'DEMO' (see App.tsx). Real sign in/up happens in AuthGate.
 */
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  companies,
  selectedCompany,
  onSelectCompany,
  demoUsers,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Switch Demo Persona</h2>
              <p className="text-xs text-gray-500">Explore the sample workspace as a different executive role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-semibold">Demo Sandbox Personas</p>
              <p className="text-blue-700 mt-0.5">
                Select an executive to see how the sample workspace looks from their role, access rights, and
                approval limits. This is sample data only — it never affects a real account.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoUsers.map((user) => {
              const isSelected = currentUser?.id === user.id;
              const targetCompany = companies.find((c) => c.id === selectedCompany.id) || companies[0];

              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    if (targetCompany) onSelectCompany(targetCompany);
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
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Demo Sandbox — sample data only</span>
          </div>
          <span>Active Organization: <strong className="text-gray-800">{selectedCompany.name}</strong></span>
        </div>
      </div>
    </div>
  );
};
