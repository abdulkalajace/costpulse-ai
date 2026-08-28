import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Flame,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Activity,
  Layers,
  Clock,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Company, SavingsOpportunity, CurrencyCode, Expense, OpportunityStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getCompanyIntelligence, QuickCostCut } from '../data/companyIntelligence';
import { NavTab } from './Sidebar';

interface ExecutiveDashboardProps {
  company: Company;
  savings: SavingsOpportunity[];
  expenses: Expense[];
  currency: CurrencyCode;
  onNavigateTab: (tab: NavTab) => void;
  onUpdateOpportunityStatus?: (id: string, newStatus: OpportunityStatus) => void;
  onTriggerAudit?: () => void;
  isAuditing?: boolean;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  company,
  savings,
  expenses,
  currency,
  onNavigateTab,
  onUpdateOpportunityStatus,
  onTriggerAudit,
  isAuditing = false,
}) => {
  const intel = getCompanyIntelligence(company, savings);

  // Local state for interactive What-If Levers
  const [saasCutPct, setSaasCutPct] = useState(15);
  const [vendorCutPct, setVendorCutPct] = useState(10);
  const [plantEnergyCutPct, setPlantEnergyCutPct] = useState(8);

  // Track local executed cuts for immediate UI feedback
  const [executedCutIds, setExecutedCutIds] = useState<string[]>([]);

  // Calculate What-If Simulation Real-Time
  const simulatedSaasSaving = (intel.annualSpend * 0.12 * saasCutPct) / 100;
  const simulatedVendorSaving = (intel.annualSpend * 0.45 * vendorCutPct) / 100;
  const simulatedEnergySaving = (intel.annualSpend * 0.18 * plantEnergyCutPct) / 100;
  const totalSimulatedAnnualSavings = Math.round(
    simulatedSaasSaving + simulatedVendorSaving + simulatedEnergySaving
  );
  const simulatedMonthlyBurnDrop = Math.round(totalSimulatedAnnualSavings / 12);
  const newProjectedBurn = Math.max(100000, intel.monthlyBurn - simulatedMonthlyBurnDrop);
  const simulatedRunwayExtension = Number(
    ((intel.annualSpend * 2.5) / newProjectedBurn - intel.cashRunwayMonths).toFixed(1)
  );
  const ebitdaMarginBoost = Number(
    ((totalSimulatedAnnualSavings / intel.annualRevenue) * 100).toFixed(1)
  );

  const handleExecuteQuickCut = (cut: QuickCostCut) => {
    setExecutedCutIds((prev) => [...prev, cut.id]);
    // Find matching opportunity in savings and mark as REALIZED
    const matchedOpp = savings.find((s) => s.title === cut.title || s.id.includes(cut.id.replace('qc-', '')));
    if (matchedOpp && onUpdateOpportunityStatus) {
      onUpdateOpportunityStatus(matchedOpp.id, 'REALIZED');
    }
  };

  return (
    <div className="space-y-6 pb-14 text-[#111827]">
      {/* ---------------------------------------------------------------- */}
      {/* 1. EXECUTIVE COMMAND HEADER & COMPANY CONTEXT */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-[#111827]">
              {company.name}
            </h1>
            {company.isGroup ? (
              <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                Consolidated Group Rollup
              </span>
            ) : (
              <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                {company.industryVertical || 'Operating Entity'}
              </span>
            )}
            <span className="rounded bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              {company.fiscalYear}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Executive Financial & Cost Governance • Real-time monthly burn tracking, verified waste elimination & EBITDA optimization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onTriggerAudit && (
            <button
              onClick={onTriggerAudit}
              disabled={isAuditing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditing Ledgers...' : 'Run AI FinOps Audit'}</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('SAVINGS_CENTER')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <TrendingDown className="h-3.5 w-3.5 text-white" />
            <span>Open Savings Engine</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 2. THE 4 PRIMARY EXECUTIVE FINANCIAL PILLARS */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: Monthly Cash Burn */}
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/30 p-5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-rose-800">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
              <Flame className="h-3.5 w-3.5 text-rose-600" />
              Monthly Cash Burn
            </span>
            <span className="rounded bg-rose-100 text-rose-800 px-1.5 py-0.5 text-[9px] font-bold">
              LIVE RUN-RATE
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(intel.monthlyBurn, currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600 border-t border-rose-100 pt-2">
            <span>Daily Velocity:</span>
            <strong className="text-rose-700 font-bold">
              {formatCurrency(intel.dailyBurnVelocity, currency)}/day
            </strong>
          </div>
        </div>

        {/* CARD 2: Cash Runway */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              Cash Runway
            </span>
            <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[9px] font-bold">
              STABLE
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-900 tracking-tight">
            {intel.cashRunwayMonths} Months
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600 border-t border-emerald-100 pt-2">
            <span>Reserves Multiple:</span>
            <strong className="text-emerald-700 font-bold">2.5x Annual Spend</strong>
          </div>
        </div>

        {/* CARD 3: Identified Waste / Leaks */}
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-blue-800">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
              <TrendingDown className="h-3.5 w-3.5 text-blue-600" />
              Identified Cost Leaks
            </span>
            <span className="rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[9px] font-bold">
              RECOVERABLE
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-900 tracking-tight">
            {formatCurrency(intel.totalIdentifiedWaste, currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600 border-t border-blue-100 pt-2">
            <span>Realized to Date:</span>
            <strong className="text-emerald-700 font-bold">
              {formatCurrency(intel.realizedSavingsAnnual, currency)}
            </strong>
          </div>
        </div>

        {/* CARD 4: Cost / Revenue Ratio */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
              <Activity className="h-3.5 w-3.5 text-slate-600" />
              Operating Efficiency
            </span>
            <span className="rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[9px] font-bold">
              OPEX RATIO
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {intel.costRevenueRatio}%
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600 border-t border-slate-100 pt-2">
            <span>Annual Revenue:</span>
            <strong className="text-slate-900 font-semibold">
              {formatCurrency(intel.annualRevenue, currency)}
            </strong>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 3. COST-CUTTING REALIZATION PROGRESS BAR & AI BRIEFING */}
      {/* ---------------------------------------------------------------- */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-[#111827]">
              Continuous Cost Reduction Execution Rate
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-gray-500">
              Target: <strong className="text-slate-900">{formatCurrency(intel.targetSavingsAnnual, currency)}</strong>
            </span>
            <span className="text-emerald-700">
              Realized: <strong>{formatCurrency(intel.realizedSavingsAnnual, currency)}</strong>
            </span>
            <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
              {intel.executionRatePct}% Executed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, intel.executionRatePct)}%` }}
              title={`Realized: ${formatCurrency(intel.realizedSavingsAnnual, currency)}`}
            />
            <div
              className="h-full bg-blue-400 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100 - intel.executionRatePct,
                  Math.round(
                    ((intel.confirmedSavingsAnnual - intel.realizedSavingsAnnual) /
                      intel.targetSavingsAnnual) *
                      100
                  ) || 0
                )}%`,
              }}
              title={`In Progress / Approved`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Verified Realized ({intel.executionRatePct}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-400" /> Approved in Pipeline
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-200" /> Unreviewed Leaks
              </span>
            </div>
            <span>Remaining Potential: {formatCurrency(intel.targetSavingsAnnual - intel.realizedSavingsAnnual, currency)}</span>
          </div>
        </div>

        {/* AI Briefing Text */}
        <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3 text-xs text-slate-700 leading-relaxed">
          <strong className="text-blue-900 font-semibold">Executive AI Brief: </strong>
          {intel.aiBriefing}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 4. 🚨 1-CLICK QUICK-WIN COST CUTS (ACTIONABLE EXECUTIVE LEVERS) */}
      {/* ---------------------------------------------------------------- */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-[#111827]">
                Actionable 1-Click Executive Cost Reductions
              </h2>
              <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                Immediate EBITDA Impact
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Verified low-risk cost-cutting actions tailored specifically to {company.name}.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('SAVINGS_CENTER')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All ({intel.quickCuts.length}) Targets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {intel.quickCuts.slice(0, 3).map((cut) => {
            const isCutDone = cut.isExecuted || executedCutIds.includes(cut.id);

            return (
              <div
                key={cut.id}
                className={`rounded-xl border p-4 transition-all space-y-3 flex flex-col justify-between ${
                  isCutDone
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-[#E5E7EB] bg-white hover:border-blue-200 hover:shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-700 uppercase tracking-wider">
                      {cut.actionType}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      Save {formatCurrency(cut.annualSavings, currency)}/yr
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {cut.title}
                  </h3>

                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {cut.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[10px] text-gray-500">
                    Monthly Burn: <strong className="text-emerald-700">-{formatCurrency(cut.monthlyImpact, currency)}/mo</strong>
                  </div>

                  {isCutDone ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Cut Executed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExecuteQuickCut(cut)}
                      className="flex items-center gap-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-md transition-colors shadow-xs"
                    >
                      <span>1-Click Cut</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 5. INTERACTIVE WHAT-IF RUNWAY & EBITDA SIMULATOR (EMBEDDED) */}
      {/* ---------------------------------------------------------------- */}
      <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/20 p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-indigo-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-[#111827]">
                Interactive What-If Runway & EBITDA Extension Levers
              </h2>
              <span className="rounded bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold">
                Live Scenario Dial
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Drag cost-cutting levers to immediately model projected burn reduction and cash runway gains.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-lg bg-white border border-indigo-200 px-3 py-1.5 shadow-xs">
              <span className="text-gray-500 text-[10px] block">Projected Annual Savings:</span>
              <strong className="text-emerald-700 font-bold text-sm">
                +{formatCurrency(totalSimulatedAnnualSavings, currency)}
              </strong>
            </div>
            <div className="rounded-lg bg-white border border-indigo-200 px-3 py-1.5 shadow-xs">
              <span className="text-gray-500 text-[10px] block">Runway Extension:</span>
              <strong className="text-indigo-700 font-bold text-sm">
                +{simulatedRunwayExtension} Months
              </strong>
            </div>
          </div>
        </div>

        {/* 3 Slider Levers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Lever 1: Software & SaaS */}
          <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-700">Trim SaaS & IT Licenses</span>
              <span className="text-indigo-600 font-bold">{saasCutPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={saasCutPct}
              onChange={(e) => setSaasCutPct(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>0%</span>
              <span className="text-emerald-700 font-bold">
                Save {formatCurrency(simulatedSaasSaving, currency)}/yr
              </span>
              <span>35%</span>
            </div>
          </div>

          {/* Lever 2: Vendor & Materials Procurement */}
          <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-700">Vendor Master Rate Cuts</span>
              <span className="text-indigo-600 font-bold">{vendorCutPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={vendorCutPct}
              onChange={(e) => setVendorCutPct(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>0%</span>
              <span className="text-emerald-700 font-bold">
                Save {formatCurrency(simulatedVendorSaving, currency)}/yr
              </span>
              <span>25%</span>
            </div>
          </div>

          {/* Lever 3: Plant, Power & Idle Cut */}
          <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-700">Energy & Plant Efficiency</span>
              <span className="text-indigo-600 font-bold">{plantEnergyCutPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={plantEnergyCutPct}
              onChange={(e) => setPlantEnergyCutPct(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>0%</span>
              <span className="text-emerald-700 font-bold">
                Save {formatCurrency(simulatedEnergySaving, currency)}/yr
              </span>
              <span>25%</span>
            </div>
          </div>
        </div>

        {/* Projected Financial Dividend Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-indigo-900 text-white p-3.5 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-300" />
            <span>
              Applying this scenario reduces monthly burn from{' '}
              <strong className="underline text-indigo-200">{formatCurrency(intel.monthlyBurn, currency)}</strong> to{' '}
              <strong className="text-emerald-300 font-bold">{formatCurrency(newProjectedBurn, currency)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-800 px-2.5 py-1 text-[11px] font-semibold text-indigo-200">
              EBITDA Margin Boost: +{ebitdaMarginBoost}%
            </span>
            <button
              onClick={() => onNavigateTab('SAVINGS_CENTER')}
              className="rounded bg-white text-indigo-900 font-bold px-3 py-1 text-xs hover:bg-indigo-50 transition-colors"
            >
              Commit Scenario
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 6. MONTHLY BURN TRAJECTORY & SPEND CATEGORY SPLIT */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trajectory Chart */}
        <div className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                12-Month Spending vs. AI Target Burn Trajectory
              </h2>
              <p className="text-[11px] text-gray-500">
                Tracking actual monthly disbursements against optimized cost-reduction targets
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-900" /> Actual Spend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> AI Target
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intel.monthlyTrajectory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => formatCurrency(val, currency, true)}
                />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value), currency)}
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#1f2937',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#111827" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" name="Actual Spend" />
                <Area type="monotone" dataKey="projected" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" fill="none" name="AI Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend Category Split */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">Major Spend Distribution</h2>
            <p className="text-[11px] text-gray-500">Corporate cost categories by volume</p>
          </div>

          <div className="space-y-3 pt-1">
            {intel.spendingBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-gray-700 truncate max-w-[180px]">{cat.name}</span>
                  <span className="text-[#111827] font-semibold">{formatCurrency(cat.spend, currency, true)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: cat.pct, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => onNavigateTab('EXPENSES')}
              className="flex w-full items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span>Explore all transaction invoices</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 7. DEPARTMENTAL BURN & OVER-SPEND MONITORING TABLE */}
      {/* ---------------------------------------------------------------- */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Departmental Burn & Budget Variance Table
            </h2>
            <p className="text-[11px] text-gray-500">
              Real-time monitoring of monthly department spend against allocated budget ceilings
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('DEPARTMENT_WORKFLOWS')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Manage All 39 Departments</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/70 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-4 py-2.5">Department</th>
                <th className="px-4 py-2.5">Headcount</th>
                <th className="px-4 py-2.5">Monthly Budget Cap</th>
                <th className="px-4 py-2.5">Actual Monthly Burn</th>
                <th className="px-4 py-2.5">Variance</th>
                <th className="px-4 py-2.5">Health</th>
                <th className="px-4 py-2.5">Top Identified Cost Leak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {intel.departmentBurnTable.map((dept, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#111827]">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-gray-600">
                        {dept.deptCode}
                      </span>
                      <span>{dept.deptName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-medium">{dept.headcount} staff</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">
                    {formatCurrency(dept.monthlyBudgetCap, currency)}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {formatCurrency(dept.monthlyBurnActual, currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-bold ${
                        dept.variancePct > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {dept.variancePct > 0 ? `+${dept.variancePct}%` : `${dept.variancePct}%`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        dept.status === 'HEALTHY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : dept.status === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {dept.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-[11px] max-w-xs truncate">
                    {dept.topLeak}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
