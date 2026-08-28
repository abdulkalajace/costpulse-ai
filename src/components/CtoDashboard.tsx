import React from 'react';
import {
  Layers,
  Cloud,
  Cpu,
  Zap,
  TrendingDown,
  AlertTriangle,
  Server,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Users,
} from 'lucide-react';
import { Subscription, Asset, CurrencyCode, SavingsOpportunity } from '../types';
import { formatCurrency } from '../utils/formatters';
import { NavTab } from './Sidebar';

interface CtoDashboardProps {
  subscriptions: Subscription[];
  assets: Asset[];
  savings: SavingsOpportunity[];
  currency: CurrencyCode;
  onNavigateTab: (tab: NavTab) => void;
  onOpenAlternativeEngine: (item: {
    itemName: string;
    itemType: string;
    currentCost: number;
    currentVendor: string;
  }) => void;
}

export const CtoDashboard: React.FC<CtoDashboardProps> = ({
  subscriptions,
  assets,
  savings,
  currency,
  onNavigateTab,
  onOpenAlternativeEngine,
}) => {
  // Aggregate tech figures
  const totalSaaSAnnual = subscriptions.reduce((acc, s) => acc + s.annualCost, 0);
  const totalTechSavings = savings
    .filter((s) => ['Software & SaaS', 'Cloud Infrastructure', 'Hardware & Devices'].includes(s.category))
    .reduce((acc, s) => acc + s.estimatedSavingAnnual, 0);

  const totalLicenses = subscriptions.reduce((acc, s) => acc + s.seatsTotal, 0);
  const unusedLicenses = subscriptions.reduce((acc, s) => acc + s.seatsUnused, 0);
  const redundantSubs = subscriptions.filter((s) => s.status === 'REDUNDANT' || s.status === 'UNDERUTILIZED');
  const serverAssets = assets.filter((a) => a.type === 'SERVER');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#111827]">
              CTO Cloud, SaaS & Engineering Cost Intelligence
            </h1>
            <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              CTO Role
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Technology spend oversight, SaaS license utilization matrix, cloud waste decommissioning, and developer stack optimization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('SUBSCRIPTIONS')}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>Manage All SaaS Subscriptions</span>
          </button>
        </div>
      </div>

      {/* Tech KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total SaaS Annual Run Rate */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Annual SaaS Run-Rate</div>
          <div className="mt-2 text-2xl font-bold text-[#111827] tracking-tight">
            {formatCurrency(totalSaaSAnnual, currency)}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Across {subscriptions.length} active enterprise tools
          </div>
        </div>

        {/* License Waste */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Seat Utilization</span>
            <span className="rounded bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold">
              {unusedLicenses} UNUSED
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
            {totalLicenses - unusedLicenses} / {totalLicenses} Active
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            {((unusedLicenses / (totalLicenses || 1)) * 100).toFixed(1)}% of paid licenses show 0 logins in 60d
          </div>
        </div>

        {/* Potential Tech Savings */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Identified Tech Optimization</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            {formatCurrency(totalTechSavings, currency)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold">
            SaaS seats, redundant tools & cloud compute
          </div>
        </div>

        {/* Cloud Waste Alerts */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Cloud Waste & Overprovisioning</div>
          <div className="mt-2 text-2xl font-bold text-rose-700 tracking-tight">
            ₹36.0L /yr
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            12 idle GPU instances + 4.2TB orphaned EBS
          </div>
        </div>
      </div>

      {/* SaaS Seat Matrix & Redundancy Alert */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-[#111827]">SaaS License Utilization & Overlap Matrix</h2>
            </div>
            <p className="text-[11px] text-gray-500">
              Real-time SSO activity monitoring, unassigned seats, and redundant tool detection
            </p>
          </div>

          <span className="text-xs font-semibold text-gray-700">
            {subscriptions.length} Tracked Applications
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="pb-2 font-semibold">Software Name</th>
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Seat Utilization</th>
                <th className="pb-2 font-semibold">Annual Cost</th>
                <th className="pb-2 font-semibold">Renewal Date</th>
                <th className="pb-2 font-semibold">AI Redundancy / Waste Alert</th>
                <th className="pb-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((sub) => {
                const usedPct = (sub.seatsUsed / (sub.seatsTotal || 1)) * 100;
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-semibold text-[#111827]">
                      <div>{sub.softwareName}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{sub.vendorName} • {sub.planName}</div>
                    </td>
                    <td className="py-3 text-gray-600">{sub.category}</td>
                    <td className="py-3">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="flex justify-between text-[10px] text-gray-600">
                          <span>{sub.seatsUsed} used</span>
                          <span className="font-semibold">{sub.seatsUnused} idle</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              usedPct > 80 ? 'bg-blue-600' : usedPct > 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-[#111827]">
                      {formatCurrency(sub.annualCost, currency)}
                    </td>
                    <td className="py-3 text-gray-600">{sub.renewalDate}</td>
                    <td className="py-3 max-w-xs">
                      {sub.aiAlert ? (
                        <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-900">
                          <div className="font-semibold text-amber-800">
                            Potential Saving: {formatCurrency(sub.aiAlert.potentialSavingAnnual, currency, true)}/yr
                          </div>
                          <div className="text-[10px] text-amber-700 mt-0.5">{sub.aiAlert.explanation}</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400">Optimal utilization (No waste detected)</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() =>
                          onOpenAlternativeEngine({
                            itemName: sub.softwareName,
                            itemType: 'Software & SaaS',
                            currentCost: sub.annualCost,
                            currentVendor: sub.vendorName,
                          })
                        }
                        className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
                      >
                        AI Alternatives
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
