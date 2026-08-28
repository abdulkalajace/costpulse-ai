import React, { useState, useRef } from 'react';
import {
  Sliders,
  Database,
  Building2,
  ShieldCheck,
  Zap,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  DollarSign,
  Sparkles,
  Lock,
  Layers,
  ArrowRight,
  Eye,
  Check,
  Server,
  FolderSync,
  KeyRound,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import {
  Company,
  UserProfile,
  CurrencyCode,
  Department,
  Expense,
  Subscription,
  Budget,
  Asset,
} from '../types';
import {
  AppEnvironmentMode,
  DemoScenarioPreset,
  EnterpriseAppData,
  exportRealDataJson,
  importRealDataJson,
} from '../utils/storage';
import { formatCurrency } from '../utils/formatters';

interface SettingsViewProps {
  appMode: AppEnvironmentMode;
  onSwitchMode: (mode: AppEnvironmentMode) => void;
  onLoadDemoScenario: (preset: DemoScenarioPreset) => void;
  onResetRealData: () => void;
  onImportRealData: (data: EnterpriseAppData) => void;
  currentData: EnterpriseAppData;
  onUpdateCompany: (company: Company) => void;
  onChangeCurrency: (currency: CurrencyCode) => void;
  onOpenHrSync?: () => void;
  onNavigateTab?: (tab: string) => void;
  currentUser?: UserProfile | null;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
  onOpenAuthModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appMode,
  onSwitchMode,
  onLoadDemoScenario,
  onResetRealData,
  onImportRealData,
  currentData,
  onUpdateCompany,
  onChangeCurrency,
  onOpenHrSync,
  onNavigateTab,
  currentUser,
  isAuthenticated = true,
  onSignOut,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'ENVIRONMENT_DEMO' | 'COMPANY_PROFILE' | 'POLICIES' | 'INTEGRATIONS' | 'ACCOUNT_SECURITY'>('ENVIRONMENT_DEMO');
  const [selectedDemoPreset, setSelectedDemoPreset] = useState<DemoScenarioPreset>('INFRA_CONGLOMERATE');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable Company Form State
  const activeComp = currentData.companies.find((c) => c.id === currentData.selectedCompanyId) || currentData.companies[0];
  const [companyForm, setCompanyForm] = useState<Company>({ ...activeComp });

  const triggerToast = (title: string, desc: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany(companyForm);
    triggerToast('Company Profile Updated', 'Real enterprise parameters saved successfully.');
  };

  const handleExportJson = () => {
    const jsonStr = exportRealDataJson(currentData);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `costpulse-${appMode.toLowerCase()}-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Database Exported', 'Full JSON configuration downloaded to your device.');
  };

  const handleExportCsv = () => {
    if (currentData.expenses.length === 0) {
      triggerToast('No Expenses to Export', 'Your real expense ledger is currently empty.', 'info');
      return;
    }
    const headers = ['ID', 'Date', 'Description', 'Category', 'Department', 'Vendor', 'Amount', 'Currency', 'Status', 'Payment Method'];
    const rows = currentData.expenses.map((e) => [
      e.id,
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.departmentName}"`,
      `"${e.vendorName}"`,
      e.amount,
      e.currency,
      e.approvalStatus,
      e.paymentMethod,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `costpulse-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('CSV Exported', `${currentData.expenses.length} expense rows exported.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = importRealDataJson(content);
      if (parsed) {
        onImportRealData(parsed);
        triggerToast('Database Restored', 'Imported enterprise configuration successfully.');
      } else {
        triggerToast('Import Failed', 'Invalid JSON backup format.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const demoScenarios = [
    {
      id: 'INFRA_CONGLOMERATE' as DemoScenarioPreset,
      name: 'Skandhanshi Group Holdings (39-Dept Infra & Construction)',
      badge: 'Default Showcase',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      description: 'Diversified conglomerate with 5 operating subsidiaries, ₹14.55 Cr monthly burn, 39 specialized departments, heavy equipment telemetry, subcontracting P&L ceilings, and ₹18.4 Cr detected savings.',
      stats: '39 Departments • 5 Subsidiaries • 120+ Expenses • ₹461 Cr Annual Revenue',
      icon: Building2,
    },
    {
      id: 'TECH_SAAS' as DemoScenarioPreset,
      name: 'Apex Cloud Technologies (SaaS & FinOps Enterprise)',
      badge: 'Cloud FinOps',
      badgeColor: 'bg-purple-100 text-purple-800',
      description: 'High-growth technology company focusing on AWS/GCP cloud spend anomalies, Snowflake warehouse idling, SSO unassigned seats (Slack, Figma, Datadog), and developer hardware fleets.',
      stats: '16 Departments • ₹4.2 Cr/mo Burn • 45 SaaS Apps • Cloud Anomaly Radar',
      icon: Server,
    },
    {
      id: 'HEALTHCARE_HOSPITAL' as DemoScenarioPreset,
      name: 'MedApex Multispeciality Hospital Network',
      badge: 'Healthcare & Pharma',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      description: 'Super-specialty hospital network with biomedical device AMC rationalization, near-expiry surgical pharma batch alerts, locum doctor shift optimization, and surgical theatre CapEx.',
      stats: '22 Departments • 4 Hospital Campuses • Biomedical AMC • NABH Compliant',
      icon: ShieldCheck,
    },
    {
      id: 'HOSPITALITY_HOTEL' as DemoScenarioPreset,
      name: 'Aura Luxury Resorts & Palace Hotels',
      badge: 'Hospitality CPOR',
      badgeColor: 'bg-amber-100 text-amber-800',
      description: 'Luxury hotel chain managing Cost Per Occupied Room (CPOR), F&B kitchen food waste audits, bulk linen laundry contracts, and HVAC energy peak-load scheduling.',
      stats: '15 Departments • 6 Luxury Resorts • CPOR Benchmarks • F&B Waste Audits',
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl p-4 shadow-2xl text-white flex items-center gap-3 transition-all transform duration-300 ${
            toastMessage.type === 'error'
              ? 'bg-rose-600'
              : toastMessage.type === 'info'
              ? 'bg-blue-600'
              : 'bg-emerald-600'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">{toastMessage.title}</p>
            <p className="text-xs text-white/90">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4" />
              <span>System Settings & Environment Center</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Data Management & Mode Switcher
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Seamlessly switch between <strong>Live Real Production Mode</strong> (to test with your real corporate data, custom departments, real receipts, and live sync) and <strong>Demo Sandbox Mode</strong> (to explore preloaded mock showcase datasets).
            </p>
          </div>

          {/* Current Mode Badge with Quick Switch */}
          <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Mode</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    appMode === 'PRODUCTION' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="font-bold text-sm">
                  {appMode === 'PRODUCTION' ? '🟢 Live Real Data Mode' : '🧪 Demo Sandbox Mode'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const nextMode = appMode === 'PRODUCTION' ? 'DEMO' : 'PRODUCTION';
                onSwitchMode(nextMode);
                triggerToast(
                  `Switched to ${nextMode === 'PRODUCTION' ? 'Live Real Data Mode' : 'Demo Sandbox Mode'}`,
                  nextMode === 'PRODUCTION'
                    ? 'Now working with your real persisted database.'
                    : 'Now viewing pre-populated demo showcase datasets.'
                );
              }}
              className="px-3.5 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Switch to {appMode === 'PRODUCTION' ? 'Demo Sandbox' : 'Real Data'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-white/10 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ENVIRONMENT_DEMO')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'ENVIRONMENT_DEMO'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Environment & Demo Showcase</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPANY_PROFILE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'COMPANY_PROFILE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company & Fiscal Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('POLICIES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'POLICIES'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Approval Ceilings & Policies</span>
          </button>

          <button
            onClick={() => setActiveTab('INTEGRATIONS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'INTEGRATIONS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Live Data Connectors & APIs</span>
          </button>

          <button
            id="settings-auth-tab-btn"
            onClick={() => setActiveTab('ACCOUNT_SECURITY')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'ACCOUNT_SECURITY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Account & Authentication</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ENVIRONMENT & DEMO SHOWCASE */}
      {/* ========================================================================= */}
      {activeTab === 'ENVIRONMENT_DEMO' && (
        <div className="space-y-6">
          {/* Section 1: Active Mode Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Real Production Card */}
            <div
              className={`rounded-2xl p-5 border-2 transition-all ${
                appMode === 'PRODUCTION'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-4 ring-emerald-500/10 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">Live Real Production Mode</h3>
                      {appMode === 'PRODUCTION' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Your real corporate data & live operations</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real departments, custom budgets, and real employee hierarchies.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Scan real paper receipts/invoices with the OCR Extraction engine.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ingest real staff from Keka, Darwinbox, Zoho, or CSV spreadsheets.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Persisted in local durable storage across browser reloads.</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-mono">
                  {currentData.expenses.length} Expenses • {currentData.departments.length} Depts • {currentData.budgets.length} Budgets
                </div>
                {appMode !== 'PRODUCTION' ? (
                  <button
                    onClick={() => {
                      onSwitchMode('PRODUCTION');
                      triggerToast('Switched to Live Real Mode', 'Working with real enterprise state.');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    Activate Real Mode
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Active Ledger
                  </span>
                )}
              </div>
            </div>

            {/* Demo Sandbox Card */}
            <div
              className={`rounded-2xl p-5 border-2 transition-all ${
                appMode === 'DEMO'
                  ? 'border-indigo-500 bg-indigo-50/40 ring-4 ring-indigo-500/10 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">Demo Showcase Sandbox</h3>
                      {appMode === 'DEMO' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Explore rich sample datasets & industry benchmarks</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>39 pre-populated infra departments with P&L ceilings & org trees.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Simulated duplicate charges, cloud spikes, and rate leakage anomalies.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>₹18.4 Cr detected savings with CFO What-If simulation engine.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Perfect for testing, board presentations, or employee onboarding.</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-mono">
                  All Mock Data Contained Here
                </div>
                {appMode !== 'DEMO' ? (
                  <button
                    onClick={() => {
                      onSwitchMode('DEMO');
                      triggerToast('Switched to Demo Sandbox', 'Viewing pre-populated showcase datasets.');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
                  >
                    Activate Demo Sandbox
                  </button>
                ) : (
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Active Sandbox
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Real Data Management Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Real Enterprise Data Controls</h3>
                <p className="text-xs text-slate-500">Backup, restore, or reset your live production database</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Import JSON Backup</span>
                </button>
                <button
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export JSON Backup</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Quick Action Buttons for Real Testing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>⚡ Ingest Real HRMS Roster</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Auto-populate real staff, reporting chains, and delegated spending limits via Keka, Darwinbox, or CSV.
                </p>
                <button
                  onClick={() => {
                    if (onOpenHrSync) onOpenHrSync();
                    else if (onNavigateTab) onNavigateTab('DEPARTMENT_WORKFLOWS');
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
                >
                  Launch HR Sync
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>📄 Batch Import CSV Ledger</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Bulk import expense rows from your company bank statement, Tally ledger, or SAP accounting export.
                </p>
                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('IMPORT');
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  Go to CSV Importer
                </button>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>🧹 Reset to Blank Slate</span>
                </div>
                <p className="text-[11px] text-rose-600/90">
                  Wipes out all entered data and starts with a pristine 0-spend real enterprise canvas.
                </p>
                {showResetConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onResetRealData();
                        setShowResetConfirm(false);
                        triggerToast('Reset Completed', 'Real database wiped to clean blank canvas.');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                    >
                      Confirm Wipe
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-1.5 px-3 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition-colors"
                  >
                    Reset Real Database
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Demo Scenarios Showcase Gallery */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Pre-Populated Demo Scenarios Gallery</h3>
                <p className="text-xs text-slate-500">
                  Select any pre-configured industry scenario to test or demonstrate specific FinOps workflows.
                </p>
              </div>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
                Available in Demo Sandbox
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoScenarios.map((sc) => {
                const Icon = sc.icon;
                const isSelected = selectedDemoPreset === sc.id;

                return (
                  <div
                    key={sc.id}
                    className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.badgeColor}`}>
                            {sc.badge}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">{sc.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{sc.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{sc.stats}</span>
                      <button
                        onClick={() => {
                          setSelectedDemoPreset(sc.id);
                          onLoadDemoScenario(sc.id);
                          if (appMode !== 'DEMO') {
                            onSwitchMode('DEMO');
                          }
                          triggerToast(
                            `Loaded "${sc.name}"`,
                            'Demo sandbox active with this scenario dataset.'
                          );
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-colors"
                      >
                        <span>Load Scenario</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPANY & FISCAL PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'COMPANY_PROFILE' && (
        <form onSubmit={handleSaveCompany} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900">Real Enterprise Entity Profile</h3>
            <p className="text-xs text-slate-500">Configure your real organization name, base currency, tax IDs, and financial targets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name *</label>
              <input
                type="text"
                required
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Acme Technologies India Pvt Ltd"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry Vertical</label>
              <select
                value={companyForm.industryVertical || 'SOFTWARE_TECH'}
                onChange={(e) => setCompanyForm({ ...companyForm, industryVertical: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="SOFTWARE_TECH">Technology, SaaS & Software</option>
                <option value="CONSTRUCTION">Real Estate, Infrastructure & Construction</option>
                <option value="HEALTHCARE">Healthcare & Multispeciality Hospitals</option>
                <option value="HOTEL_HOSPITALITY">Hotels, Resorts & Hospitality</option>
                <option value="BEAUTY_WELLNESS">Wellness, Salons & FMCG</option>
                <option value="HIGHER_EDUCATION">Higher Education & Universities</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base Currency</label>
              <select
                value={companyForm.currency}
                onChange={(e) => {
                  const newCurr = e.target.value as CurrencyCode;
                  setCompanyForm({ ...companyForm, currency: newCurr });
                  onChangeCurrency(newCurr);
                }}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
              >
                <option value="INR">₹ INR (Indian Rupee - Lakhs & Crores)</option>
                <option value="USD">$ USD (US Dollar - Millions)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fiscal Year</label>
              <input
                type="text"
                value={companyForm.fiscalYear}
                onChange={(e) => setCompanyForm({ ...companyForm, fiscalYear: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="FY 2026-27"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Target Burn Limit ({companyForm.currency})</label>
              <input
                type="number"
                value={companyForm.monthlyBurn}
                onChange={(e) => setCompanyForm({ ...companyForm, monthlyBurn: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Annual Revenue Budget ({companyForm.currency})</label>
              <input
                type="number"
                value={companyForm.annualRevenue}
                onChange={(e) => setCompanyForm({ ...companyForm, annualRevenue: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Headquarters</label>
              <input
                type="text"
                value={companyForm.headquarters}
                onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Bengaluru, Karnataka"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN / Corporate Tax ID</label>
              <input
                type="text"
                value={companyForm.gstin || ''}
                onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                placeholder="29AAAAA0000A1Z5"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: POLICIES & APPROVAL CEILINGS */}
      {/* ========================================================================= */}
      {activeTab === 'POLICIES' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900">Enterprise Spending Guardrails & Approval Policy</h3>
            <p className="text-xs text-slate-500">Configure global delegation of authority, automated flags, and audit requirements</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between">
              <div>
                <div className="font-bold text-xs text-slate-800">Tier 1: Auto-Approval Threshold</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Routine expenses below this amount are approved automatically if within departmental budget headroom.
                </p>
              </div>
              <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800">
                ₹25,000 / $500
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between">
              <div>
                <div className="font-bold text-xs text-slate-800">Tier 2: Department Head Sign-Off</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Requires direct HOD digital signature before funds or Purchase Order commitment.
                </p>
              </div>
              <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800">
                ₹5,00,000 / $10,000
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between">
              <div>
                <div className="font-bold text-xs text-slate-800">Tier 3: CFO / MD Executive Ratification</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High-value requisitions and multi-year SaaS contracts requiring dual C-suite sign-off.
                </p>
              </div>
              <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800">
                ₹25,00,000 / $50,000
              </div>
            </div>

            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex items-start justify-between">
              <div>
                <div className="font-bold text-xs text-indigo-900">AI Continuous Audit & Anomaly Detection</div>
                <p className="text-[11px] text-indigo-700/80 mt-0.5">
                  Gemini 3.7 actively monitors every new invoice and PO against Indian benchmark rates and duplicate hashes.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-600 text-white">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTEGRATIONS & CONNECTORS */}
      {/* ========================================================================= */}
      {activeTab === 'INTEGRATIONS' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Enterprise Live Connectors & APIs</h3>
              <p className="text-xs text-slate-500">Connect your real payroll, accounting, cloud, and communication tools</p>
            </div>
            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('APP_SYNC');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Open App Sync Hub
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Keka / Darwinbox / Zoho HRMS</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  READY
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Synchronizes employee rosters, reporting managers, and delegated approval limits automatically.
              </p>
              <button
                onClick={() => {
                  if (onOpenHrSync) onOpenHrSync();
                  else if (onNavigateTab) onNavigateTab('DEPARTMENT_WORKFLOWS');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Launch Sync Modal →
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Tally Prime / QuickBooks / Zoho Books</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  CSV / API
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Inward sync for daily ledger line items, TDS deductions, and vendor disbursement vouchers.
              </p>
              <button
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('IMPORT');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Upload Ledger Export →
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">AWS / Google Cloud / Azure FinOps</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Daily CloudWatch / CUR billing telemetry ingestion with anomaly burst detection.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Slack / Microsoft Teams Webhooks</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  CONFIGURED
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Instant interactive approval cards sent to managers for pending purchase requisitions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACCOUNT & AUTHENTICATION */}
      {/* ========================================================================= */}
      {activeTab === 'ACCOUNT_SECURITY' && (
        <div className="space-y-6">
          {/* Active Session Status Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      isAuthenticated ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {isAuthenticated ? currentUser?.name || 'Authorized User' : 'Guest Session (Signed Out)'}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isAuthenticated
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isAuthenticated ? 'Active Session' : 'Unauthenticated'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email || 'guest@enterprise.internal'}</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                    {currentUser?.role} • {currentUser?.departmentName || 'Enterprise'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <button
                      id="settings-switch-persona-btn"
                      onClick={onOpenAuthModal}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Switch Persona</span>
                    </button>
                    <button
                      id="settings-signout-btn"
                      onClick={() => {
                        if (onSignOut) {
                          onSignOut();
                          triggerToast('Signed Out', 'You have been signed out of your session.', 'info');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    id="settings-signin-btn"
                    onClick={onOpenAuthModal}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In to Enterprise</span>
                  </button>
                )}
              </div>
            </div>

            {/* Session Security Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Auth Method
                </span>
                <p className="text-xs font-bold text-slate-800">SAML 2.0 / Okta Enterprise SSO</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Enforced with Multi-Factor Auth (MFA)</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Delegated Approval Ceiling
                </span>
                <p className="text-xs font-bold text-indigo-700">
                  {currentUser?.approvalLimit
                    ? formatCurrency(currentUser.approvalLimit, currentData.currency || 'INR')
                    : 'Unlimited (Board Level)'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Per-transaction signing authority</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Audit Logging Status
                </span>
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Immutable Audit Trail Active</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">All actions hashed and logged</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
