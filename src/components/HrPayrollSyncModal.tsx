import React, { useState } from 'react';
import {
  Users,
  Building2,
  CheckCircle2,
  Zap,
  Upload,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Check,
  Copy,
  Info,
  DollarSign,
  UserCheck,
  Network,
  X,
} from 'lucide-react';
import { Department, CurrencyCode } from '../types';
import {
  HR_PROVIDERS,
  HrProviderInfo,
  generateHrRosterForDepartment,
  syncAllDepartmentsWithHr,
  syncSingleDepartmentWithHr,
  parseHrMasterSpreadsheet,
} from '../data/hrPayrollSyncEngine';

interface HrPayrollSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  targetDepartment?: Department | null;
  currency: CurrencyCode;
  onCommitSync: (updatedDepartments: Department[], providerName: string, syncedCount: number) => void;
}

export const HrPayrollSyncModal: React.FC<HrPayrollSyncModalProps> = ({
  isOpen,
  onClose,
  departments,
  targetDepartment,
  currency,
  onCommitSync,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<HrProviderInfo>(HR_PROVIDERS[0]);
  const [syncScope, setSyncScope] = useState<'ALL' | 'SINGLE'>(targetDepartment ? 'SINGLE' : 'ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // CSV Text Input for Spreadsheet Upload Mode
  const [csvText, setCsvText] = useState<string>(
    `Employee Code,Employee Name,Department,Designation,Reporting Manager,Email,Salary,Spending Limit\n` +
    `EMP-ACC-001,Ramesh Sundaram,ACCOUNTS,Chief Financial Controller & VP,Board of Directors,ramesh.s@enterprise.io,3600000,2500000\n` +
    `EMP-ACC-002,Pooja Deshmukh,ACCOUNTS,Senior Manager - Statutory Audit,Ramesh Sundaram,pooja.d@enterprise.io,1800000,500000\n` +
    `EMP-ACC-003,Vikram Joshi,ACCOUNTS,Manager - Accounts Payable,Pooja Deshmukh,vikram.j@enterprise.io,1400000,250000\n` +
    `EMP-ACC-004,Deepa Narayanan,ACCOUNTS,Senior GST Specialist,Vikram Joshi,deepa.n@enterprise.io,950000,75000\n` +
    `EMP-CON-001,Suresh Varma,CONSTRUCTION,Chief Project Officer & VP,Board of Directors,suresh.v@enterprise.io,4200000,5000000\n` +
    `EMP-CON-002,Anand Kulkarni,CONSTRUCTION,Senior Project Manager,Suresh Varma,anand.k@enterprise.io,2200000,1000000\n` +
    `EMP-CON-003,Rahul Nair,CONSTRUCTION,Project Lead - Structural Pour,Anand Kulkarni,rahul.n@enterprise.io,1600000,500000\n` +
    `EMP-CON-004,Manish Verma,CONSTRUCTION,Senior Site Civil Engineer,Rahul Nair,manish.v@enterprise.io,1050000,100000`
  );
  const [csvParseError, setCsvParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetDept = targetDepartment || departments[0] || null;

  // Sample preview calculation
  const samplePreviewUsers = targetDept
    ? generateHrRosterForDepartment(targetDept, selectedProvider.name)
    : [];

  const estimatedTotalEmployees =
    syncScope === 'ALL'
      ? departments.length * 5
      : samplePreviewUsers.length;

  const formatCurrency = (amount: number) => {
    if (currency === 'INR') {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount.toLocaleString()}`;
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(csvText);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleExecuteSync = () => {
    setIsSyncing(true);
    setCsvParseError(null);

    setTimeout(() => {
      if (selectedProvider.id === 'csv_upload') {
        const result = parseHrMasterSpreadsheet(csvText, departments, selectedProvider.name);
        if (!result.success) {
          setCsvParseError(result.error || 'Failed to parse spreadsheet format.');
          setIsSyncing(false);
          return;
        }
        onCommitSync(result.updatedDepartments, selectedProvider.name, result.totalParsed);
      } else {
        if (syncScope === 'ALL') {
          const updated = syncAllDepartmentsWithHr(departments, selectedProvider.name);
          onCommitSync(updated, selectedProvider.name, updated.length * 5);
        } else if (targetDept) {
          const updated = syncSingleDepartmentWithHr(departments, targetDept.id, selectedProvider.name);
          onCommitSync(updated, selectedProvider.name, samplePreviewUsers.length);
        }
      }
      setIsSyncing(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300">
              <Network className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Automated HR / Payroll Organization & Roster Sync
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero Manual Entry
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Directly map organizational hierarchy, reporting chains, employee job roles, and delegated spending limits from your HRMS or payroll master dump.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Select HR / Payroll Provider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>1. Select HRMS / Payroll Source</span>
              </label>
              <span className="text-xs text-slate-400">
                {HR_PROVIDERS.length} Supported Integrations & File Engines
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {HR_PROVIDERS.map((provider) => {
                const isSelected = selectedProvider.id === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider)}
                    className={`text-left p-3 rounded-xl border transition-all relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    {provider.popular && (
                      <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                        Popular
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg font-bold text-xs ${provider.badgeBg} ${provider.badgeText}`}>
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{provider.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                      {provider.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Sync Scope */}
          {selectedProvider.id !== 'csv_upload' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Synchronization Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSyncScope('ALL')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    syncScope === 'ALL'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">
                        All Enterprise Departments ({departments.length})
                      </span>
                    </div>
                    {syncScope === 'ALL' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Auto-populates full teams, department leads, and approval matrices across all {departments.length} company departments simultaneously.
                  </p>
                </button>

                {targetDept && (
                  <button
                    type="button"
                    onClick={() => setSyncScope('SINGLE')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      syncScope === 'SINGLE'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">
                          {targetDept.name} ({targetDept.code}) Only
                        </span>
                      </div>
                      {syncScope === 'SINGLE' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Target sync strictly for this active department roster without altering other business units.
                    </p>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Spreadsheet Upload View (if CSV Mode) */}
          {selectedProvider.id === 'csv_upload' ? (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                  <span>2. Paste or Edit HR Master CSV Data</span>
                </label>
                <button
                  onClick={handleCopyTemplate}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? 'Copied Template!' : 'Copy Sample Template'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste CSV rows with headers: Employee Code, Employee Name, Department, Designation, Reporting Manager, Email, Salary, Spending Limit"
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />

              {csvParseError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {csvParseError}
                </div>
              )}
            </div>
          ) : (
            /* Step 3: Live Hierarchy & Auto-Mapped Preview */
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-indigo-600" />
                  <span>3. Auto-Derived Hierarchy & Role Matrix Preview</span>
                </label>
                <span className="text-xs font-semibold text-indigo-700">
                  Target: {syncScope === 'ALL' ? `All ${departments.length} Depts` : targetDept?.name}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-3 border-b border-slate-200 text-center">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Ingested Staff</span>
                    <p className="text-base font-bold text-slate-900">{estimatedTotalEmployees} Staff Members</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Hierarchy Levels</span>
                    <p className="text-base font-bold text-indigo-700">4 Tier Reporting Chain</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Spending Caps</span>
                    <p className="text-base font-bold text-emerald-700">Auto-Derived by Band</p>
                  </div>
                </div>

                {/* Sample Tree Rows */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Sample Department Reporting Structure ({targetDept?.name || 'ACCOUNTS'}):
                  </p>

                  <div className="space-y-1.5">
                    {samplePreviewUsers.map((u) => {
                      const isHead = u.hierarchyLevel === 1;
                      const isMgr = u.hierarchyLevel === 2;

                      return (
                        <div
                          key={u.id}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            isHead
                              ? 'bg-purple-50/80 border-purple-200 font-medium'
                              : isMgr
                              ? 'bg-blue-50/60 border-blue-200 ml-4'
                              : 'bg-white border-slate-200 ml-8'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              L{u.hierarchyLevel}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900">{u.name}</span>
                              <span className="text-slate-500 text-[11px] ml-1.5">({u.designation})</span>
                              {u.reportingToName && (
                                <span className="text-[10px] text-slate-400 ml-2 block sm:inline">
                                  ↳ Reports to: {u.reportingToName}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {u.role}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-indigo-700">
                              {formatCurrency(u.spendingLimit)} Cap
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Value Callout */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Automated Governance Mapping:</span> Syncing automatically creates
              delegated approval authorities, attaches 3-way matching rules, assigns single-purchase ceilings, and links
              department leads for cost-reduction workflows without any manual data entry.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Ingesting Roster & Hierarchy from {selectedProvider.name}...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>
                  Execute Auto-Sync ({syncScope === 'ALL' ? `All ${departments.length} Departments` : targetDept?.name})
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
