import React from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  PieChart,
} from 'lucide-react';
import { CurrencyCode, SavingsOpportunity } from '../types';
import { formatCurrency } from '../utils/formatters';
import { NavTab } from './Sidebar';

interface HrDashboardProps {
  currency: CurrencyCode;
  savings: SavingsOpportunity[];
  onNavigateTab: (tab: NavTab) => void;
}

export const HrDashboard: React.FC<HrDashboardProps> = ({
  currency,
  savings,
  onNavigateTab,
}) => {
  const headcountTotal = 620;
  const contractorCount = 42;
  const annualWorkforceSpend = 145000000; // ₹14.5 Cr
  const contractorAnnualSpend = 15000000; // ₹1.5 Cr

  const departmentHeadcount = [
    { name: 'Core Platform Engineering', count: 245, pct: '40%', contractors: 18, avgCost: '₹22.5L' },
    { name: 'Global Sales & Revenue', count: 140, pct: '23%', contractors: 4, avgCost: '₹18.0L' },
    { name: 'Growth & Marketing', count: 65, pct: '10%', contractors: 8, avgCost: '₹14.2L' },
    { name: 'Product Design & Research', count: 55, pct: '9%', contractors: 3, avgCost: '₹19.5L' },
    { name: 'Operations & Real Estate', count: 45, pct: '7%', contractors: 6, avgCost: '₹11.0L' },
    { name: 'People, Talent & Legal', count: 35, pct: '6%', contractors: 2, avgCost: '₹13.5L' },
    { name: 'Executive & Finance', count: 35, pct: '6%', contractors: 1, avgCost: '₹28.0L' },
  ];

  const hrOpportunities = savings.filter(
    (s) => s.category === 'Workforce & Contractors' || s.actionType === 'AUTOMATE'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Workforce, Talent & Capacity Cost Intelligence
            </h1>
            <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              HR Role
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Workforce capacity management, contractor run-rate benchmarks, and process automation opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('DEPARTMENT_WORKFLOWS')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Sync HRMS Org Roster & Roles</span>
          </button>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ethical AI Governance Active</span>
          </div>
        </div>
      </div>

      {/* Ethical Guardrail Banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1.5">
        <div className="font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Responsible Workforce Analytics Policy</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          CostPulse AI does not recommend employment termination. Our engine surfaces{' '}
          <strong>workload redistribution opportunities</strong>, <strong>capacity balance insights</strong>,{' '}
          <strong>external agency/contractor rate renegotiations</strong>, and <strong>manual process automation</strong>.
        </p>
      </div>

      {/* Headcount & Workforce KPIs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Full-Time Headcount</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {headcountTotal} Employees
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across 6 operational divisions
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>External Staff Augmentation</span>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              {contractorCount} CONTRACTORS
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
            {formatCurrency(contractorAnnualSpend, currency)}/yr
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Avg run-rate: 2.1x internal employee cost
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Capacity Optimization Potential</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            ₹62.0L /yr
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Contractor transition & automation
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Open Hiring Pipeline</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            18 Positions
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            3 positions identified as candidate for internal reallocation
          </div>
        </div>
      </div>

      {/* Headcount Breakdown Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Department Headcount & Workforce Cost Distribution</h2>
            <p className="text-[11px] text-slate-500">Full-time employees vs. external agency contractor ratios</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-2 font-semibold">Department</th>
                <th className="pb-2 font-semibold">Headcount</th>
                <th className="pb-2 font-semibold">Share</th>
                <th className="pb-2 font-semibold">Active Contractors</th>
                <th className="pb-2 font-semibold">Avg Cost / FTE</th>
                <th className="pb-2 font-semibold">AI Capacity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentHeadcount.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-semibold text-slate-900">{dept.name}</td>
                  <td className="py-3 text-slate-700">{dept.count} members</td>
                  <td className="py-3 text-slate-500">{dept.pct}</td>
                  <td className="py-3">
                    <span className={`font-semibold ${dept.contractors > 5 ? 'text-amber-700' : 'text-slate-700'}`}>
                      {dept.contractors} contractors
                    </span>
                  </td>
                  <td className="py-3 text-slate-700">{dept.avgCost}</td>
                  <td className="py-3">
                    {dept.contractors > 10 ? (
                      <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        Contractor Transition Opportunity
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Balanced Capacity
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Workforce Opportunities */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Workforce & Process Optimization Targets</h2>
          </div>
          <button
            onClick={() => onNavigateTab('SAVINGS_CENTER')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Review in Savings Center →
          </button>
        </div>

        <div className="space-y-3">
          {hrOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{opp.title}</span>
                <span className="font-bold text-emerald-700">
                  Est. Annual Saving: {formatCurrency(opp.estimatedSavingAnnual, currency)}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{opp.problem}</p>
              <div className="text-[11px] text-slate-500">
                <strong>Evidence:</strong> {opp.evidence}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
