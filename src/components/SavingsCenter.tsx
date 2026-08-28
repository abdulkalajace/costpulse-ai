import React, { useState } from 'react';
import {
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  ShieldCheck,
  Zap,
  ChevronRight,
  AlertTriangle,
  Layers,
  Building,
  RefreshCw,
  Search,
  ExternalLink,
  Plus,
  Sliders,
  Mail,
} from 'lucide-react';
import { SavingsOpportunity, CurrencyCode, UserRole, OpportunityStatus, OpportunityAction, Company } from '../types';
import { formatCurrency, getConfidenceBadgeClass, getStatusBadgeClass } from '../utils/formatters';
import { WhatIfSavingsSimulator } from './WhatIfSavingsSimulator';

interface SavingsCenterProps {
  savings: SavingsOpportunity[];
  currency: CurrencyCode;
  userRole: UserRole;
  company?: Company;
  onUpdateStatus: (id: string, newStatus: OpportunityStatus) => void;
  onOpenAlternativeEngine: (item: {
    itemName: string;
    itemType: string;
    currentCost: number;
    currentVendor: string;
  }) => void;
  onTriggerAudit: () => void;
  isAuditing: boolean;
  onOpenNegotiation?: (vendorName: string, annualSpend: number, category?: string) => void;
  onApplyScenarioPlan?: (scenarioName: string, estimatedAnnualSavings: number) => void;
}

export const SavingsCenter: React.FC<SavingsCenterProps> = ({
  savings,
  currency,
  userRole,
  company = {
    id: 'comp-main',
    name: 'Skandhanshi Group Holdings',
    industry: 'Conglomerate',
    size: '1000+',
    headquarters: 'Hyderabad, Telangana',
    currency: 'INR',
    annualRevenue: 4610000000,
    monthlyBurn: 145500000,
    totalExpensesYear: 1746000000,
    fiscalYear: 'FY 2026-27',
  },
  onUpdateStatus,
  onOpenAlternativeEngine,
  onTriggerAudit,
  isAuditing,
  onOpenNegotiation,
  onApplyScenarioPlan,
}) => {
  const [activeTab, setActiveTab] = useState<'OPPORTUNITIES' | 'SIMULATOR'>('OPPORTUNITIES');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Financial aggregates
  const potentialSavingsTotal = savings.reduce((acc, s) => acc + s.estimatedSavingAnnual, 0);
  const confirmedSavingsTotal = savings
    .filter((s) => ['APPROVED', 'IN_PROGRESS', 'IMPLEMENTED', 'REALIZED'].includes(s.status))
    .reduce((acc, s) => acc + (s.actualSavingConfirmed || s.estimatedSavingAnnual), 0);
  const implementedSavingsTotal = savings
    .filter((s) => ['IMPLEMENTED', 'REALIZED'].includes(s.status))
    .reduce((acc, s) => acc + (s.actualSavingConfirmed || s.estimatedSavingAnnual), 0);
  const pendingSavingsTotal = savings
    .filter((s) => ['DETECTED', 'UNDER_REVIEW'].includes(s.status))
    .reduce((acc, s) => acc + s.estimatedSavingAnnual, 0);

  const categories = ['ALL', 'Property & Facilities', 'Software & SaaS', 'Cloud Infrastructure', 'Office Supplies & Misc', 'Hardware & Devices', 'Workforce & Contractors'];

  const filteredSavings = savings.filter((s) => {
    if (filterCategory !== 'ALL' && s.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.problem.toLowerCase().includes(q) ||
        s.targetEntityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#111827]">
              Cost Savings Center & Optimization
            </h1>
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
              Continuous Intelligence
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            See every cost, identify verified redundancies, simulate financial runway extension, and execute negotiation counter-offers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab(activeTab === 'SIMULATOR' ? 'OPPORTUNITIES' : 'SIMULATOR')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors border ${
              activeTab === 'SIMULATOR'
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-current" />
            <span>{activeTab === 'SIMULATOR' ? 'View Target Cards' : 'What-If Runway Simulator'}</span>
          </button>

          <button
            id="run-ai-cost-audit-btn"
            onClick={onTriggerAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-300 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing Costs...' : 'Re-Run AI Cost Audit'}</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total AI-Estimated Potential Savings */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Potential Annual Savings</span>
            <span className="rounded bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 text-[10px] font-bold uppercase">
              ESTIMATED
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#111827] tracking-tight">
            {formatCurrency(potentialSavingsTotal, currency)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{savings.length} actionable targets detected</span>
          </div>
        </div>

        {/* Card 2: Confirmed Savings */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Confirmed Annual Savings</span>
            <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold uppercase">
              CONFIRMED
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            {formatCurrency(confirmedSavingsTotal, currency)}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Approved by leadership for execution
          </div>
        </div>

        {/* Card 3: Implemented & Realized */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Realized Savings To Date</span>
            <span className="rounded bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 text-[10px] font-bold uppercase">
              REALIZED
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700 tracking-tight">
            {formatCurrency(implementedSavingsTotal, currency)}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Direct recurring cuts already executed
          </div>
        </div>

        {/* Card 4: Under Review */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Pending Review</span>
            <span className="rounded bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase">
              PENDING
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800 tracking-tight">
            {formatCurrency(pendingSavingsTotal, currency)}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Awaiting executive signoff
          </div>
        </div>
      </div>

      {/* Render Simulator or Opportunity Cards */}
      {activeTab === 'SIMULATOR' ? (
        <WhatIfSavingsSimulator
          company={company}
          currency={currency}
          savings={savings}
          onApplyScenarioPlan={onApplyScenarioPlan}
        />
      ) : (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    filterCategory === cat
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="DETECTED">Detected</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IMPLEMENTED">Implemented</option>
                <option value="REALIZED">Realized</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter opportunities..."
                  className="rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Opportunities List / Cards */}
          <div className="space-y-3.5">
            {filteredSavings.length === 0 ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center text-xs text-gray-500">
                No savings opportunities found for current filters.
              </div>
            ) : (
              filteredSavings.map((item) => {
                const isExpanded = expandedId === item.id;

                return (
                  <div
                    key={item.id}
                    id={`savings-card-${item.id}`}
                    className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xs transition-all hover:border-gray-300"
                  >
                    {/* Main Card Header Bar */}
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                              {item.actionType}
                            </span>
                            <span className="rounded bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-200">
                              {item.category}
                            </span>
                            <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(item.status)}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                            <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getConfidenceBadgeClass(item.confidence)}`}>
                              {item.confidence} Confidence
                            </span>
                          </div>

                          <h2 className="text-sm font-bold text-[#111827] sm:text-base">
                            {item.title}
                          </h2>

                          <p className="text-xs text-gray-600 leading-relaxed">
                            <strong className="text-gray-900">Problem Detected: </strong>
                            {item.problem}
                          </p>
                        </div>

                        {/* Financial Values & Action */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                          <div className="text-left lg:text-right">
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                              Est. Annual Saving
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-emerald-700">
                              {formatCurrency(item.estimatedSavingAnnual, currency)}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              Current Cost: {formatCurrency(item.currentCostAnnual, currency, true)}/yr
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {onOpenNegotiation && (
                              <button
                                onClick={() =>
                                  onOpenNegotiation(
                                    item.targetEntityName,
                                    item.currentCostAnnual,
                                    item.category
                                  )
                                }
                                className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                                title="Generate Vendor Counter-Offer Email Script"
                              >
                                <Mail className="h-3 w-3 text-amber-700" />
                                <span>Negotiate</span>
                              </button>
                            )}

                            <button
                              onClick={() =>
                                onOpenAlternativeEngine({
                                  itemName: item.targetEntityName,
                                  itemType: item.category,
                                  currentCost: item.currentCostAnnual,
                                  currentVendor: item.targetEntityName,
                                })
                              }
                              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                              title="Evaluate market alternatives"
                            >
                              <Zap className="h-3 w-3 text-blue-500" />
                              <span>AI Alternatives</span>
                            </button>

                            <button
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {isExpanded ? 'Hide Details' : 'View Evidence'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5 space-y-4">
                        {/* Evidence & Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-1 md:col-span-2">
                            <div className="text-[11px] font-semibold text-[#111827] flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Telemetry & Data Evidence</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{item.evidence}</p>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Implementation Effort:</span>
                              <span className="font-semibold text-[#111827]">{item.effort}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Business Risk:</span>
                              <span className="font-semibold text-[#111827]">{item.risk}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Expected ROI:</span>
                              <span className="font-semibold text-emerald-700">{item.roi}</span>
                            </div>
                          </div>
                        </div>

                        {/* Strategy & Recommended Action */}
                        <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 space-y-1 text-xs">
                          <div className="font-semibold text-blue-900 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                            <span>Recommended Execution Strategy</span>
                          </div>
                          <p className="text-blue-800">{item.recommendedAction}</p>
                        </div>

                        {/* Status Change Buttons for Leaders */}
                        {['MASTER', 'MD_CEO', 'CFO', 'CTO', 'DEPT_HEAD', 'MANAGER'].includes(userRole) && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/60">
                            <span className="text-[11px] text-gray-500">Update Opportunity Status:</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {item.status !== 'APPROVED' && (
                                <button
                                  onClick={() => onUpdateStatus(item.id, 'APPROVED')}
                                  className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                                >
                                  Approve Target
                                </button>
                              )}
                              {item.status !== 'IN_PROGRESS' && (
                                <button
                                  onClick={() => onUpdateStatus(item.id, 'IN_PROGRESS')}
                                  className="rounded border border-blue-300 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800 hover:bg-blue-100"
                                >
                                  Mark In Progress
                                </button>
                              )}
                              {item.status !== 'REALIZED' && (
                                <button
                                  onClick={() => onUpdateStatus(item.id, 'REALIZED')}
                                  className="rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
                                >
                                  Mark Realized (Save Real ₹)
                                </button>
                              )}
                              {item.status !== 'REJECTED' && (
                                <button
                                  onClick={() => onUpdateStatus(item.id, 'REJECTED')}
                                  className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100"
                                >
                                  Dismiss
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
