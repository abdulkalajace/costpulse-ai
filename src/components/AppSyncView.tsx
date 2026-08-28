import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
  Radio,
  Sliders,
  ExternalLink,
  Code2,
  Database,
  Layers,
  ArrowRight,
  TrendingDown,
  Building2,
  Copy,
  Check,
  Send,
  Sparkles,
  X,
  FileSpreadsheet,
  Server,
  DollarSign,
  Users,
  Briefcase,
  HardHat,
  Filter,
} from 'lucide-react';
import {
  AppSyncConnector,
  SyncCategory,
  SyncIngestedRecord,
  CurrencyCode,
  Company,
  Department,
} from '../types';
import { INITIAL_APP_SYNC_CONNECTORS } from '../data/appSyncData';
import { HrPayrollSyncModal } from './HrPayrollSyncModal';

interface AppSyncViewProps {
  company: Company;
  departments: Department[];
  currency: CurrencyCode;
  onNavigateTab?: (tab: string) => void;
  onUpdateDepartments?: (departments: Department[]) => void;
}

export const AppSyncView: React.FC<AppSyncViewProps> = ({
  company,
  departments,
  currency,
  onNavigateTab,
  onUpdateDepartments,
}) => {
  const [connectors, setConnectors] = useState<AppSyncConnector[]>(INITIAL_APP_SYNC_CONNECTORS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingConnectorId, setSyncingConnectorId] = useState<string | null>(null);
  const [configuredConnector, setConfiguredConnector] = useState<AppSyncConnector | null>(null);
  const [isAddConnectorModalOpen, setIsAddConnectorModalOpen] = useState(false);
  const [isHrSyncModalOpen, setIsHrSyncModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONNECTORS' | 'AUDIT_LOG' | 'WEBHOOK_CONSOLE'>('CONNECTORS');

  // Custom Ingestion Webhook Test State
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(
      {
        event_type: 'PAYROLL_RUN',
        external_id: 'PR-LIVE-2026-99',
        department_code: 'DEP-CONSTR',
        department_name: 'CONSTRUCTION (EXECUTION)',
        amount: 2850000,
        currency: 'INR',
        description: 'Site Engineers & Contractor Labor Roster Ingestion',
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );
  const [webhookResponse, setWebhookResponse] = useState<{ status: string; message: string } | null>(null);

  // Ingested Logs State
  const [ingestedLogs, setIngestedLogs] = useState<SyncIngestedRecord[]>([
    {
      id: 'log-01',
      connectorId: 'sync-keka',
      connectorName: 'Keka HR & Payroll',
      category: 'PAYROLL_HR',
      entityType: 'PAYROLL_RUN',
      externalId: 'PAY-AUG-2026-001',
      amount: 34500000,
      currency: 'INR',
      timestamp: '2 mins ago',
      departmentTarget: 'CONSTRUCTION (EXECUTION)',
      description: 'August Site Engineers & Field Crew Payroll Roster',
      status: 'AUTO_ALLOCATED',
    },
    {
      id: 'log-02',
      connectorId: 'sync-tally',
      connectorName: 'TallyPrime ERP',
      category: 'ACCOUNTING_ERP',
      entityType: 'ERP_INVOICE',
      externalId: 'VCH-2026-9812',
      amount: 1450000,
      currency: 'INR',
      timestamp: '8 mins ago',
      departmentTarget: 'PROCUREMENT AND STORES',
      description: 'UltraTech Cement 500 MT Bulk Offtake Ex-Plant Invoice',
      status: 'AUTO_ALLOCATED',
    },
    {
      id: 'log-03',
      connectorId: 'sync-aws',
      connectorName: 'AWS Cost Explorer',
      category: 'CLOUD_INFRA',
      entityType: 'CLOUD_BILL',
      externalId: 'AWS-2026-08-BILL',
      amount: 2130000,
      currency: 'INR',
      timestamp: '14 mins ago',
      departmentTarget: 'IT',
      description: 'AWS Enterprise Production Infrastructure Monthly Consumption',
      status: 'AUTO_ALLOCATED',
    },
    {
      id: 'log-04',
      connectorId: 'sync-salesforce',
      connectorName: 'Salesforce CRM',
      category: 'SALES_CRM',
      entityType: 'SALES_COMMISSION',
      externalId: 'OPP-89410-COMM',
      amount: 450000,
      currency: 'INR',
      timestamp: '22 mins ago',
      departmentTarget: 'SALES AND MARKETING',
      description: 'Villa Block C Booking Direct Agent Commission Payout',
      status: 'AUTO_ALLOCATED',
    },
    {
      id: 'log-05',
      connectorId: 'sync-procore',
      connectorName: 'Procore Construction OS',
      category: 'PROJECT_OPS',
      entityType: 'SITE_JOB_LOG',
      externalId: 'WBS-03-CONC-042',
      amount: 8400000,
      currency: 'INR',
      timestamp: '45 mins ago',
      departmentTarget: 'CONSTRUCTION (EXECUTION)',
      description: 'Silicon Valley Tower B Structural Pour Subcontractor Progress Billing #4',
      status: 'AUTO_ALLOCATED',
    },
  ]);

  // Currency Formatter
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

  // Sync All Trigger
  const handleSyncAll = () => {
    setSyncingAll(true);
    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'CONNECTED',
          lastSyncedAt: 'Just now',
          recordsIngestedTotal: c.recordsIngestedTotal + Math.floor(Math.random() * 25) + 5,
        }))
      );
      setSyncingAll(false);
    }, 1200);
  };

  // Individual Sync Trigger
  const handleSyncSingle = (id: string) => {
    setSyncingConnectorId(id);
    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            status: 'CONNECTED',
            lastSyncedAt: 'Just now',
            recordsIngestedTotal: c.recordsIngestedTotal + 12,
          };
        })
      );
      setSyncingConnectorId(null);
    }, 800);
  };

  // Toggle Connector Connection Status
  const handleToggleConnection = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newStatus = c.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
        return {
          ...c,
          status: newStatus,
          lastSyncedAt: newStatus === 'CONNECTED' ? 'Just now' : c.lastSyncedAt,
        };
      })
    );
  };

  // Test Webhook Ingestion
  const handleTriggerWebhookTest = () => {
    try {
      const parsed = JSON.parse(testPayload);
      const newRecord: SyncIngestedRecord = {
        id: `log-live-${Date.now()}`,
        connectorId: 'sync-custom-webhook',
        connectorName: 'Universal Webhook Ingestion API',
        category: 'CUSTOM_API',
        entityType: parsed.event_type || 'ERP_INVOICE',
        externalId: parsed.external_id || `EXT-${Math.floor(Math.random() * 10000)}`,
        amount: Number(parsed.amount) || 100000,
        currency: parsed.currency || 'INR',
        timestamp: 'Just now',
        departmentTarget: parsed.department_name || 'ACCOUNTS',
        description: parsed.description || 'Live streamed payload from external application',
        status: 'AUTO_ALLOCATED',
      };

      setIngestedLogs([newRecord, ...ingestedLogs]);
      setWebhookResponse({
        status: 'SUCCESS 200 OK',
        message: `Event accepted! Automatically routed ₹${(newRecord.amount / 100000).toFixed(1)}L into ${newRecord.departmentTarget} cost ledger.`,
      });

      // Update custom webhook record count
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === 'sync-custom-webhook'
            ? { ...c, recordsIngestedTotal: c.recordsIngestedTotal + 1, lastSyncedAt: 'Just now' }
            : c
        )
      );
    } catch (err: any) {
      setWebhookResponse({
        status: 'ERROR 400',
        message: `Invalid JSON payload format: ${err.message}`,
      });
    }
  };

  // Filter connectors
  const filteredConnectors = connectors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = connectors.filter((c) => c.status === 'CONNECTED').length;
  const totalIngestedRecords = connectors.reduce((sum, c) => sum + c.recordsIngestedTotal, 0);

  const getCategoryBadgeClass = (category: SyncCategory) => {
    switch (category) {
      case 'PAYROLL_HR':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SALES_CRM':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ACCOUNTING_ERP':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOUD_INFRA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROJECT_OPS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PROCUREMENT_INVENTORY':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12" id="app-sync-view">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Universal App Sync & Data Ingestion Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span>{connectedCount} Connected Sources</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              Seamlessly sync financial, payroll, sales, and operational data from any software your organization uses (Tally, Keka, Salesforce, SAP, Procore, AWS) or stream custom JSON events via our universal webhook engine.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setIsHrSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
              title="Automatically sync employees, hierarchy, and roles into departments from HRMS"
            >
              <Users className="w-3.5 h-3.5" />
              <span>⚡ Auto-Sync HR Hierarchy & Roster</span>
            </button>
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
              <span>{syncingAll ? 'Syncing All Data...' : 'Sync All Systems'}</span>
            </button>
          </div>
        </div>

        {/* Global Ingestion Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Connected Platforms
            </span>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {connectedCount} / {connectors.length} Apps
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              Bi-directional automated pipelines
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">
              Total Ingested Events
            </span>
            <div className="text-lg font-bold text-blue-900 mt-1">
              {totalIngestedRecords.toLocaleString()} Records
            </div>
            <span className="text-[10px] text-blue-600 font-medium">
              Across ERP, Payroll, CRM & Cloud
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
              Ingestion Health Score
            </span>
            <div className="text-lg font-bold text-emerald-800 mt-1">99.8% Uptime</div>
            <span className="text-[10px] text-emerald-600 font-medium">
              Zero unallocated drops in last 24h
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
            <span className="text-[11px] font-medium text-purple-700 uppercase tracking-wider">
              Monthly Ingestion Volume
            </span>
            <div className="text-lg font-bold text-purple-900 mt-1">172.5 MB / Mo</div>
            <span className="text-[10px] text-purple-600 font-medium">
              Real-time webhook & batch ETL
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('CONNECTORS')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'CONNECTORS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>App Connectors ({connectors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOG')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDIT_LOG'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Live Ingestion Audit Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('WEBHOOK_CONSOLE')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'WEBHOOK_CONSOLE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Universal Webhook API Console</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: APP CONNECTORS GRID */}
      {/* ========================================================================= */}
      {activeTab === 'CONNECTORS' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search connector (e.g. Keka, Tally, Salesforce, AWS)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: 'ALL', label: 'All Categories' },
                { id: 'PAYROLL_HR', label: 'Payroll & HR' },
                { id: 'SALES_CRM', label: 'Sales & CRM' },
                { id: 'ACCOUNTING_ERP', label: 'Accounting & ERP' },
                { id: 'CLOUD_INFRA', label: 'Cloud FinOps' },
                { id: 'PROJECT_OPS', label: 'Project & Site' },
                { id: 'CUSTOM_API', label: 'Universal / Webhook' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnectors.map((connector) => {
              const isSyncing = syncingConnectorId === connector.id;
              const isConnected = connector.status === 'CONNECTED';

              return (
                <div
                  key={connector.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top: Vendor & Status */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                              connector.category
                            )}`}
                          >
                            {connector.category.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {connector.authType}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                          {connector.name}
                        </h3>
                        <p className="text-[11px] text-slate-400">{connector.vendor}</p>
                      </div>

                      {/* Connection Toggle */}
                      <button
                        onClick={() => handleToggleConnection(connector.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                          isConnected
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {connector.description}
                    </p>
                  </div>

                  {/* Middle: Active Data Streams Mapped into Departments */}
                  {connector.dataStreams && connector.dataStreams.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Mapped Department Streams
                      </span>
                      {connector.dataStreams.map((ds) => (
                        <div
                          key={ds.id}
                          className="flex items-center justify-between text-[11px] text-slate-700"
                        >
                          <span className="truncate pr-1">• {ds.streamName}</span>
                          <span className="font-bold text-blue-700 shrink-0 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                            → {ds.mappedDepartmentName}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Stats & Actions */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Last sync: <strong className="text-slate-700">{connector.lastSyncedAt || 'Never'}</strong></span>
                      <span>Ingested: <strong className="text-slate-800 font-mono">{connector.recordsIngestedTotal.toLocaleString()}</strong></span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {connector.category === 'PAYROLL_HR' && (
                        <button
                          onClick={() => setIsHrSyncModalOpen(true)}
                          className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-indigo-200"
                        >
                          <Zap className="w-3.5 h-3.5 text-indigo-600" />
                          <span>⚡ Sync Department Roster & Org Tree</span>
                        </button>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSyncSingle(connector.id)}
                          disabled={!isConnected || isSyncing}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                        </button>

                        <button
                          onClick={() => setConfiguredConnector(connector)}
                          className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                        >
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: LIVE AUDIT LOG STREAM */}
      {/* ========================================================================= */}
      {activeTab === 'AUDIT_LOG' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Live Data Ingestion Telemetry
              </h3>
              <p className="text-xs text-slate-500">
                Real-time feed of payroll runs, ERP journal vouchers, cloud bills, and site logs synced into department ledgers.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Listening for incoming payloads</span>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Event / Ext ID</th>
                  <th className="py-3 px-4">Connector Source</th>
                  <th className="py-3 px-4">Target Department</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ingestedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.externalId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{log.connectorName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]">
                        {log.departmentTarget}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(log.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {log.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: WEBHOOK CONSOLE & PAYLOAD SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'WEBHOOK_CONSOLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Webhook Credentials & Instructions (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Universal Ingestion Webhook API
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect any proprietary in-house software, HR database, or ERP by streaming HTTP POST JSON payloads directly to your company-specific ingestion gateway.
              </p>

              {/* Endpoint URL Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">
                  HTTPS Ingestion Endpoint
                </label>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono">
                  <span className="truncate flex-1">
                    https://api.costpulse.ai/v1/sync/{company.id}/events
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://api.costpulse.ai/v1/sync/${company.id}/events`
                      );
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Secret Key Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">
                  HMAC Signing Secret
                </label>
                <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono">
                  whsec_994a8f2190cbb710ef3381a99f1c0
                </div>
              </div>

              {/* Documentation Bullet Points */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1.5 text-xs text-blue-900">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Payload Specifications:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-800">
                  <li><strong className="font-semibold">event_type:</strong> PAYROLL_RUN, ERP_INVOICE, CLOUD_BILL, SITE_LOG</li>
                  <li><strong className="font-semibold">amount:</strong> Numeric float or integer</li>
                  <li><strong className="font-semibold">department_name:</strong> Exact or fuzzy matching name</li>
                  <li><strong className="font-semibold">external_id:</strong> Unique invoice or voucher reference</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Live JSON Payload Simulator (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Live Payload Simulation Console
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Post JSON Event Test</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">JSON Request Body</label>
                <textarea
                  rows={9}
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-900 text-emerald-400 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() =>
                    setTestPayload(
                      JSON.stringify(
                        {
                          event_type: 'ERP_INVOICE',
                          external_id: `INV-TALLY-${Math.floor(Math.random() * 90000 + 10000)}`,
                          department_name: 'PROCUREMENT AND STORES',
                          amount: 1750000,
                          currency: 'INR',
                          description: 'Structural Steel Offtake Batch Invoice #99',
                          timestamp: new Date().toISOString(),
                        },
                        null,
                        2
                      )
                    )
                  }
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Load Sample ERP Invoice
                </button>

                <button
                  onClick={handleTriggerWebhookTest}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Webhook Event</span>
                </button>
              </div>

              {/* Response banner */}
              {webhookResponse && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    webhookResponse.status.startsWith('SUCCESS')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{webhookResponse.status}</span>
                  </div>
                  <p className="text-[11px]">{webhookResponse.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURE CONNECTOR MAPPINGS & AUTH */}
      {/* ========================================================================= */}
      {configuredConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Configure {configuredConnector.name}
                </h3>
              </div>
              <button
                onClick={() => setConfiguredConnector(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Connection Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      configuredConnector.status === 'CONNECTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {configuredConnector.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{configuredConnector.description}</p>
              </div>

              {/* Config fields if any */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Authentication & API Credentials</h4>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">API Key / Access Token</label>
                    <input
                      type="password"
                      defaultValue="••••••••••••••••••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Sync Ingestion Cadence</label>
                    <select
                      defaultValue={configuredConnector.syncFrequency}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="REAL_TIME_WEBHOOK">Real-time Webhook Streaming (Instant)</option>
                      <option value="HOURLY">Hourly Batch Reconciliation</option>
                      <option value="DAILY">Daily End-of-Day Ledger Sync</option>
                      <option value="WEEKLY">Weekly Aggregation</option>
                      <option value="MANUAL">Manual Trigger Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Department Stream Routing */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs">Department Data Routing</h4>
                <p className="text-[11px] text-slate-500">
                  Incoming records from this application are routed directly into the designated department budget ledger:
                </p>

                <div className="space-y-2 mt-2">
                  {departments.slice(0, 3).map((dept, i) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-800 text-xs">{dept.name}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {dept.code} · Auto-Allocated
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfiguredConnector(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Updated configuration settings for ${configuredConnector.name}`);
                    setConfiguredConnector(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* HR / Payroll Sync Modal */}
      <HrPayrollSyncModal
        isOpen={isHrSyncModalOpen}
        onClose={() => setIsHrSyncModalOpen(false)}
        departments={departments}
        currency={currency}
        onCommitSync={(updated, providerName, count) => {
          if (onUpdateDepartments) {
            onUpdateDepartments(updated);
          }
        }}
      />
    </div>
  );
};
