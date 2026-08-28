import React, { useState } from 'react';
import {
  Sliders,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  DollarSign,
} from 'lucide-react';
import { Company, CurrencyCode, SavingsOpportunity } from '../types';
import { formatCurrency } from '../utils/formatters';

interface WhatIfSavingsSimulatorProps {
  company: Company;
  currency: CurrencyCode;
  savings: SavingsOpportunity[];
  onApplyScenarioPlan?: (scenarioName: string, estimatedAnnualSavings: number) => void;
}

export const WhatIfSavingsSimulator: React.FC<WhatIfSavingsSimulatorProps> = ({
  company,
  currency,
  savings,
  onApplyScenarioPlan,
}) => {
  // Simulator Sliders (0% to 50%)
  const [saasCutPct, setSaasCutPct] = useState<number>(20);
  const [cloudOptPct, setCloudOptPct] = useState<number>(15);
  const [groupProcurementPct, setGroupProcurementPct] = useState<number>(10);
  const [facilitiesCutPct, setFacilitiesCutPct] = useState<number>(12);

  const [appliedToast, setAppliedToast] = useState<boolean>(false);

  // Baseline Financials
  const baselineAnnualSpend = company.totalExpensesYear || 1746000000; // ~₹174.6 Cr
  const baselineMonthlyBurn = company.monthlyBurn || Math.round(baselineAnnualSpend / 12);
  const estimatedCashReserves = baselineMonthlyBurn * 14; // simulated 14 months baseline runway

  // Component spend estimates (derived proportionately)
  const softwareSpendAnnual = baselineAnnualSpend * 0.18; // ~18%
  const cloudSpendAnnual = baselineAnnualSpend * 0.14;    // ~14%
  const procurementSpendAnnual = baselineAnnualSpend * 0.38; // ~38% (cement, steel, materials, fleet)
  const facilitiesSpendAnnual = baselineAnnualSpend * 0.12; // ~12% (CAM, leases, utilities)

  // Calculated Savings
  const saasSavings = Math.round(softwareSpendAnnual * (saasCutPct / 100));
  const cloudSavings = Math.round(cloudSpendAnnual * (cloudOptPct / 100));
  const procurementSavings = Math.round(procurementSpendAnnual * (groupProcurementPct / 100));
  const facilitiesSavings = Math.round(facilitiesSpendAnnual * (facilitiesCutPct / 100));

  const totalSimulatedAnnualSavings = saasSavings + cloudSavings + procurementSavings + facilitiesSavings;
  const simulatedMonthlyBurnReduction = Math.round(totalSimulatedAnnualSavings / 12);
  const newMonthlyBurn = Math.max(1, baselineMonthlyBurn - simulatedMonthlyBurnReduction);
  const newRunwayMonths = (estimatedCashReserves / newMonthlyBurn).toFixed(1);
  const baselineRunwayMonths = (estimatedCashReserves / baselineMonthlyBurn).toFixed(1);
  const runwayExtensionMonths = (Number(newRunwayMonths) - Number(baselineRunwayMonths)).toFixed(1);

  const handleApply = () => {
    if (onApplyScenarioPlan) {
      onApplyScenarioPlan(
        `Optimized Scenario (${saasCutPct}% SaaS, ${cloudOptPct}% Cloud, ${groupProcurementPct}% Group Bulk)`,
        totalSimulatedAnnualSavings
      );
    }
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 3000);
  };

  const handlePreset = (type: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE') => {
    if (type === 'CONSERVATIVE') {
      setSaasCutPct(10);
      setCloudOptPct(8);
      setGroupProcurementPct(5);
      setFacilitiesCutPct(5);
    } else if (type === 'BALANCED') {
      setSaasCutPct(20);
      setCloudOptPct(15);
      setGroupProcurementPct(10);
      setFacilitiesCutPct(12);
    } else {
      setSaasCutPct(35);
      setCloudOptPct(25);
      setGroupProcurementPct(15);
      setFacilitiesCutPct(20);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Interactive "What-If" Financial Runway & Cost Reduction Simulator
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Mathematical Model
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Adjust strategic cost levers across software, cloud, group master procurement, and real estate to model instant runway extension.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => handlePreset('CONSERVATIVE')}
            className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white transition-colors"
          >
            Conservative (5-10%)
          </button>
          <button
            onClick={() => handlePreset('BALANCED')}
            className="px-2.5 py-1 rounded-lg bg-white text-blue-700 shadow-2xs font-bold"
          >
            Balanced (10-20%)
          </button>
          <button
            onClick={() => handlePreset('AGGRESSIVE')}
            className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white transition-colors"
          >
            Aggressive (20-35%)
          </button>
        </div>
      </div>

      {/* Reactive Waterfall Outcome Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> Total Annual Savings Unlocked
          </span>
          <span className="text-2xl font-black text-emerald-950 block">
            {formatCurrency(totalSimulatedAnnualSavings, currency, true)}
          </span>
          <span className="text-xs text-emerald-800 font-medium">
            +{formatCurrency(simulatedMonthlyBurnReduction, currency, true)}/mo recurring cash boost
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-blue-800 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Operational Runway Impact
          </span>
          <span className="text-2xl font-black text-blue-950 block">
            {newRunwayMonths} Months
          </span>
          <span className="text-xs text-blue-800 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> +{runwayExtensionMonths} Months of capital buffer
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Recalibrated Monthly Burn</span>
          <span className="text-2xl font-black text-slate-900 block">
            {formatCurrency(newMonthlyBurn, currency, true)}/mo
          </span>
          <span className="text-xs text-slate-500">
            Down from {formatCurrency(baselineMonthlyBurn, currency, true)}/mo
          </span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Slider 1: Software & SaaS Optimization */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 block">SaaS & Software License De-duplication</span>
              <span className="text-[11px] text-slate-500">Harvest unused licenses, downgrade tier creep</span>
            </div>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {saasCutPct}% Cut ({formatCurrency(saasSavings, currency, true)}/yr)
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={saasCutPct}
            onChange={(e) => setSaasCutPct(Number(e.target.value))}
            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% (Status Quo)</span>
            <span>25% (Industry Median)</span>
            <span>50% (Strict Audit)</span>
          </div>
        </div>

        {/* Slider 2: Cloud Infrastructure & Compute */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Cloud Infrastructure & EDP Reserved Capacity</span>
              <span className="text-[11px] text-slate-500">Auto-scale staging, reserved instances, storage lifecycle</span>
            </div>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {cloudOptPct}% Cut ({formatCurrency(cloudSavings, currency, true)}/yr)
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={5}
            value={cloudOptPct}
            onChange={(e) => setCloudOptPct(Number(e.target.value))}
            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>20% (Reserved Commitments)</span>
            <span>40% (Spot/Auto-Off)</span>
          </div>
        </div>

        {/* Slider 3: Group Master Procurement SLA */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Group Bulk Procurement & Master Vendor SLAs</span>
              <span className="text-[11px] text-slate-500">Cross-subsidiary steel, cement, diesel, packaging volume</span>
            </div>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {groupProcurementPct}% Bulk Discount ({formatCurrency(procurementSavings, currency, true)}/yr)
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={2}
            value={groupProcurementPct}
            onChange={(e) => setGroupProcurementPct(Number(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>10% (Unified Master PO)</span>
            <span>20% (Volume Tier Max)</span>
          </div>
        </div>

        {/* Slider 4: Facilities, Leases & Utilities */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Facilities, Commercial Leases & CAM Caps</span>
              <span className="text-[11px] text-slate-500">HVAC thermal scheduling, lease indexation renegotiation</span>
            </div>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {facilitiesCutPct}% Cut ({formatCurrency(facilitiesSavings, currency, true)}/yr)
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={2}
            value={facilitiesCutPct}
            onChange={(e) => setFacilitiesCutPct(Number(e.target.value))}
            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>15% (Energy & Lease Cap)</span>
            <span>30% (Footprint Rationalization)</span>
          </div>
        </div>
      </div>

      {/* Execution Call to Action */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm">Convert Simulation into Active Strategic Target</span>
          </div>
          <p className="text-xs text-slate-300">
            Push this {formatCurrency(totalSimulatedAnnualSavings, currency, true)} cost optimization target into the Savings Center and assign department milestones.
          </p>
        </div>

        <button
          onClick={handleApply}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-xs flex items-center gap-2 shrink-0 transition-colors"
        >
          {appliedToast ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Target Plan Active!</span>
            </>
          ) : (
            <>
              <span>Adopt Strategic Savings Plan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
