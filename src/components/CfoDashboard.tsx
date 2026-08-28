import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Building,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Company, Expense, Budget, Vendor, SavingsOpportunity, CurrencyCode } from '../types';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';
import { NavTab } from './Sidebar';

interface CfoDashboardProps {
  company: Company;
  expenses: Expense[];
  budgets: Budget[];
  vendors: Vendor[];
  savings: SavingsOpportunity[];
  currency: CurrencyCode;
  onNavigateTab: (tab: NavTab) => void;
  onApproveExpense?: (id: string) => void;
}

export const CfoDashboard: React.FC<CfoDashboardProps> = ({
  company,
  expenses,
  budgets,
  vendors,
  savings,
  currency,
  onNavigateTab,
  onApproveExpense,
}) => {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Calculate CFO financial totals
  const totalSpend = expenses.reduce((acc, e) => acc + e.amount, 0);
  const recurringSpend = expenses
    .filter((e) => e.recurring !== 'One-Time')
    .reduce((acc, e) => acc + e.amount, 0);
  const pendingApprovals = expenses.filter((e) => e.approvalStatus === 'PENDING');
  const anomalies = expenses.filter((e) => !!e.aiAnomaly);

  // Department Budget vs Actual comparison chart data
  const budgetVsActualData = budgets.map((b) => ({
    name: b.departmentName.split(' ')[0], // short name
    fullName: b.departmentName,
    allocated: b.allocatedAmount,
    spent: b.spentAmount,
    variance: b.varianceAmount,
    status: b.status,
  }));

  // Top Vendors by spend
  const topVendors = [...vendors].sort((a, b) => b.totalSpendAnnual - a.totalSpendAnnual).slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#111827]">
              CFO Financial Command & Spend Governance
            </h1>
            <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              CFO Role
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Deep financial visibility, multi-tier budget variance, vendor concentration, and real-time expense anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('SAVINGS_CENTER')}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Savings Center</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Spend */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Recorded Expenses (YTD)</div>
          <div className="mt-2 text-2xl font-bold text-[#111827] tracking-tight">
            {formatCurrency(totalSpend, currency)}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Across {expenses.length} tracked ledger line-items
          </div>
        </div>

        {/* Recurring Run-Rate */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Recurring Contract Run-Rate</div>
          <div className="mt-2 text-2xl font-bold text-blue-700 tracking-tight">
            {formatCurrency(recurringSpend, currency)}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            {((recurringSpend / (totalSpend || 1)) * 100).toFixed(0)}% of total monthly outflow
          </div>
        </div>

        {/* Anomalies & Spikes */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>AI Expense Anomalies</span>
            <span className="rounded bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold">
              {anomalies.length} ALERTS
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 tracking-tight">
            {anomalies.length} Detected
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-semibold">
            Includes compute spikes & duplicate software
          </div>
        </div>

        {/* Approvals Pending */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Awaiting CFO Sign-Off</span>
            <span className="rounded bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold">
              PENDING
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
            {pendingApprovals.length} Requests
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Travel & procurement line items
          </div>
        </div>
      </div>

      {/* Budget vs Actual Variance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">Department Budget vs. Actual Spend</h2>
              <p className="text-[11px] text-gray-500">Q2 Fiscal Quarter allocations vs current ledger</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Budget Allocated
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Actual Spent
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => formatCurrency(val, currency, true)}
                />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value), currency)}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="allocated" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Budget" />
                <Bar dataKey="spent" fill="#2563eb" radius={[4, 4, 0, 0]} name="Actual Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Concentration Risk */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">Vendor Concentration</h2>
              <p className="text-[11px] text-gray-500">Top 5 enterprise vendor liabilities</p>
            </div>
            <button
              onClick={() => onNavigateTab('VENDORS')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {topVendors.map((v) => (
              <div key={v.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#111827]">
                  <span className="truncate">{v.name}</span>
                  <span>{formatCurrency(v.totalSpendAnnual, currency, true)}/yr</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>{v.category}</span>
                  <span className={v.priceChangePercent12m > 10 ? 'text-rose-600 font-semibold' : 'text-gray-500'}>
                    {v.priceChangePercent12m > 0 ? '+' : ''}{v.priceChangePercent12m}% YoY
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Anomaly & Spend Risk Table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <h2 className="text-sm font-bold text-[#111827]">Live AI Expense Anomaly Warnings</h2>
          </div>
          <span className="text-xs text-gray-500">Continuous pattern matching against historical baseline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="pb-2 font-semibold">Expense Item</th>
                <th className="pb-2 font-semibold">Department</th>
                <th className="pb-2 font-semibold">Amount</th>
                <th className="pb-2 font-semibold">Severity</th>
                <th className="pb-2 font-semibold">AI Anomaly Analysis</th>
                <th className="pb-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {anomalies.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium text-[#111827] max-w-[220px] truncate">
                    {item.description}
                  </td>
                  <td className="py-3 text-gray-600">{item.departmentName}</td>
                  <td className="py-3 font-semibold text-[#111827]">
                    {formatCurrency(item.amount, currency)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        item.aiAnomaly?.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.aiAnomaly?.severity}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600 max-w-md">
                    <p className="text-[11px] leading-snug">{item.aiAnomaly?.description}</p>
                    <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                      ↳ Suggestion: {item.aiAnomaly?.suggestedAction}
                    </p>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onNavigateTab('SAVINGS_CENTER')}
                      className="rounded-md bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      Resolve in Savings Center
                    </button>
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
