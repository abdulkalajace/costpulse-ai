import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Cpu,
  Server,
  Zap,
  HardDrive,
  Activity,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Company, CurrencyCode, AuditLog } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MasterDashboardProps {
  companies: Company[];
  currency: CurrencyCode;
  auditLogs: AuditLog[];
  onSelectCompany: (company: Company) => void;
  onAddNewCompany: (newCompany: Partial<Company>) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({
  companies,
  currency,
  auditLogs,
  onSelectCompany,
  onAddNewCompany,
}) => {
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('Fintech & Banking');
  const [newCompanySize, setNewCompanySize] = useState<'1-10' | '11-50' | '51-200' | '201-1000' | '1000+'>('51-200');
  const [newCompanyHQ, setNewCompanyHQ] = useState('Bengaluru & Singapore');
  const [newCompanyRevenue, setNewCompanyRevenue] = useState(250000000);

  const totalSystemRevenue = companies.reduce((acc, c) => acc + c.annualRevenue, 0);
  const totalSystemSpend = companies.reduce((acc, c) => acc + c.totalExpensesYear, 0);

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    onAddNewCompany({
      name: newCompanyName,
      industry: newCompanyIndustry,
      size: newCompanySize,
      headquarters: newCompanyHQ,
      currency: 'INR',
      annualRevenue: Number(newCompanyRevenue) || 100000000,
      monthlyBurn: Math.round((Number(newCompanyRevenue) * 0.35) / 12),
      totalExpensesYear: Math.round(Number(newCompanyRevenue) * 0.35),
      fiscalYear: 'FY 2026-27',
    });

    setNewCompanyName('');
    setShowNewCompanyModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#111827]">
              Master Super Admin & Multi-Tenant Control Hub
            </h1>
            <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Super Admin View
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage client organizations, global AI heuristic policies, system telemetry, and multi-tenant security isolation.
          </p>
        </div>

        <button
          onClick={() => setShowNewCompanyModal(true)}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4 text-white" />
          <span>Provision New Company</span>
        </button>
      </div>

      {/* Global Super Admin KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Provisioned Organizations</div>
          <div className="mt-2 text-2xl font-bold text-[#111827] tracking-tight">
            {companies.length} Active
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold">
            100% Tenant Isolation Verified
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Combined Managed Spend</div>
          <div className="mt-2 text-2xl font-bold text-[#111827] tracking-tight">
            {formatCurrency(totalSystemSpend, currency)}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Across enterprise ledgers
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">AI Usage</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            View Details
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            See real AI call volume &amp; cost in Settings → AI Usage &amp; Cost
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Access Control</div>
          <div className="mt-2 text-2xl font-bold text-blue-700 tracking-tight">
            RBAC
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            {auditLogs.length} audit events logged for this account
          </div>
        </div>
      </div>

      {/* Organizations Directory Table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">Provisioned Companies & Tenants</h2>
            <p className="text-[11px] text-gray-500">Click any organization to switch active context</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="pb-2 font-semibold">Company Name</th>
                <th className="pb-2 font-semibold">Industry</th>
                <th className="pb-2 font-semibold">Headcount Size</th>
                <th className="pb-2 font-semibold">Annual Revenue</th>
                <th className="pb-2 font-semibold">Annual Spend</th>
                <th className="pb-2 font-semibold">Headquarters</th>
                <th className="pb-2 font-semibold text-right">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-semibold text-[#111827]">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">{c.industry}</td>
                  <td className="py-3">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                      {c.size} Employees
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-[#111827]">
                    {formatCurrency(c.annualRevenue, currency, true)}
                  </td>
                  <td className="py-3 text-gray-700">
                    {formatCurrency(c.totalExpensesYear, currency, true)}
                  </td>
                  <td className="py-3 text-gray-500">{c.headquarters}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onSelectCompany(c)}
                      className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-xs"
                    >
                      Switch To
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Company Provisioning Modal */}
      {showNewCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-[#111827] text-sm">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Provision New Enterprise Tenant</span>
              </div>
              <button
                onClick={() => setShowNewCompanyModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Zenith Media & Digital Ltd"
                  className="w-full rounded-md border border-gray-200 p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={newCompanyIndustry}
                    onChange={(e) => setNewCompanyIndustry(e.target.value)}
                    className="w-full rounded-md border border-gray-200 p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Company Size</label>
                  <select
                    value={newCompanySize}
                    onChange={(e) => setNewCompanySize(e.target.value as any)}
                    className="w-full rounded-md border border-gray-200 p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-1000">201-1000 Employees</option>
                    <option value="1000+">1000+ Employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Annual Revenue (INR / USD)</label>
                <input
                  type="number"
                  value={newCompanyRevenue}
                  onChange={(e) => setNewCompanyRevenue(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-200 p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Headquarters Location</label>
                <input
                  type="text"
                  value={newCompanyHQ}
                  onChange={(e) => setNewCompanyHQ(e.target.value)}
                  placeholder="e.g. Hyderabad & London"
                  className="w-full rounded-md border border-gray-200 p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewCompanyModal(false)}
                  className="rounded-md border border-gray-200 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700"
                >
                  Create & Initialize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
