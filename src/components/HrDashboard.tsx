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
import { CurrencyCode, SavingsOpportunity, Department } from '../types';
import { formatCurrency } from '../utils/formatters';
import { NavTab } from './Sidebar';

interface HrDashboardProps {
  currency: CurrencyCode;
  savings: SavingsOpportunity[];
  departments: Department[];
  onNavigateTab: (tab: NavTab) => void;
}

export const HrDashboard: React.FC<HrDashboardProps> = ({
  currency,
  savings,
  departments,
  onNavigateTab,
}) => {
  const headcountTotal = departments.reduce((acc, d) => acc + (d.headcount || 0), 0);
  const departmentsAtRisk = departments.filter((d) => d.healthStatus === 'OVER_BUDGET' || d.healthStatus === 'WARNING');

  const departmentHeadcount = [...departments]
    .sort((a, b) => (b.headcount || 0) - (a.headcount || 0))
    .map((d) => ({
      name: d.name,
      count: d.headcount || 0,
      pct: headcountTotal > 0 ? `${Math.round(((d.headcount || 0) / headcountTotal) * 100)}%` : '0%',
      annualBudget: d.annualBudget || 0,
      healthStatus: d.healthStatus,
    }));

  const hrOpportunities = savings.filter(
    (s) => s.category === 'Workforce & Contractors' || s.actionType === 'AUTOMATE'
  );
  const hrOpportunitiesTotal = hrOpportunities.reduce((acc, s) => acc + s.estimatedSavingAnnual, 0);

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
          <div className="text-xs text-slate-500 font-medium">Total Headcount</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {headcountTotal} Employees
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {departments.length} tracked department{departments.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Departments Tracked</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {departments.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {departmentsAtRisk.length > 0
              ? `${departmentsAtRisk.length} over budget or at warning`
              : 'All departments within budget'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Workforce Optimization Potential</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            {formatCurrency(hrOpportunitiesTotal, currency)} /yr
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            {hrOpportunities.length > 0 ? `${hrOpportunities.length} opportunities identified` : 'None identified yet'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Avg Headcount / Department</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {departments.length > 0 ? Math.round(headcountTotal / departments.length) : 0}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Employees per tracked department
          </div>
        </div>
      </div>

      {/* Headcount Breakdown Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Department Headcount & Budget Distribution</h2>
            <p className="text-[11px] text-slate-500">Headcount and annual budget per tracked department</p>
          </div>
        </div>

        {departmentHeadcount.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-slate-500">
            No departments set up yet.{' '}
            <button onClick={() => onNavigateTab('DEPARTMENT_WORKFLOWS')} className="font-semibold text-blue-600 hover:text-blue-700">
              Set up your first department
            </button>
          </p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-2 font-semibold">Department</th>
                <th className="pb-2 font-semibold">Headcount</th>
                <th className="pb-2 font-semibold">Share</th>
                <th className="pb-2 font-semibold">Annual Budget</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentHeadcount.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-semibold text-slate-900">{dept.name}</td>
                  <td className="py-3 text-slate-700">{dept.count} members</td>
                  <td className="py-3 text-slate-500">{dept.pct}</td>
                  <td className="py-3 text-slate-700">{formatCurrency(dept.annualBudget, currency)}</td>
                  <td className="py-3">
                    {dept.healthStatus === 'OVER_BUDGET' || dept.healthStatus === 'WARNING' ? (
                      <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        {dept.healthStatus.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        {dept.healthStatus?.replace('_', ' ') || 'HEALTHY'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
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
          {hrOpportunities.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-slate-500">
              No workforce optimization opportunities identified yet. Run an AI audit once you have expense data.
            </p>
          )}
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
