import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Zap,
  Calendar,
  AlertCircle,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { Subscription, CurrencyCode, UserRole } from '../types';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  currency: CurrencyCode;
  userRole: UserRole;
  departments?: { name: string }[];
  onAddSubscription: (sub: Partial<Subscription>) => void;
  onOpenAlternativeEngine: (item: {
    itemName: string;
    itemType: string;
    currentCost: number;
    currentVendor: string;
  }) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  currency,
  userRole,
  departments = [],
  onAddSubscription,
  onOpenAlternativeEngine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [toolName, setToolName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [planName, setPlanName] = useState('Enterprise');
  const [seatsTotal, setSeatsTotal] = useState(50);
  const [seatsUsed, setSeatsUsed] = useState(40);
  const [annualCost, setAnnualCost] = useState(250000);
  const [category, setCategory] = useState('Productivity & Collaboration');
  const [dept, setDept] = useState('');
  const [renewal, setRenewal] = useState('2026-12-31');

  const categories = ['ALL', 'Productivity & Collaboration', 'CRM & Sales', 'Analytics & Data', 'Customer Support', 'Design & UI/UX', 'Finance & Accounting'];

  const filteredSubs = subscriptions.filter((s) => {
    if (filterCategory !== 'ALL' && s.category !== filterCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.softwareName.toLowerCase().includes(q) ||
        s.vendorName.toLowerCase().includes(q) ||
        s.departmentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSaaSAnnual = subscriptions.reduce((acc, s) => acc + s.annualCost, 0);
  const totalUnusedSeats = subscriptions.reduce((acc, s) => acc + s.seatsUnused, 0);
  const projectedIdleWaste = subscriptions.reduce((acc, s) => {
    const perSeatAnnual = s.seatsTotal > 0 ? s.annualCost / s.seatsTotal : 0;
    return acc + perSeatAnnual * (s.seatsUnused || 0);
  }, 0);
  const now = Date.now();
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const upcomingRenewals = subscriptions.filter((s) => {
    const t = Date.parse(s.renewalDate);
    return !Number.isNaN(t) && t >= now && t - now <= sixtyDaysMs;
  }).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName) return;

    onAddSubscription({
      softwareName: toolName,
      vendorName: vendorName || toolName,
      planName: planName,
      seatsTotal: Number(seatsTotal),
      seatsUsed: Number(seatsUsed),
      seatsUnused: Number(seatsTotal) - Number(seatsUsed),
      annualCost: Number(annualCost),
      monthlyCost: Math.round(Number(annualCost) / 12),
      renewalDate: renewal,
      departmentName: dept || 'Unassigned',
      category: category,
      status: Number(seatsUsed) < Number(seatsTotal) * 0.5 ? 'UNDERUTILIZED' : 'ACTIVE',
      currency: 'INR',
    });

    setToolName('');
    setVendorName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              SaaS & Software Subscriptions Intelligence
            </h1>
            <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              {subscriptions.length} Tracked Tools
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detect redundant tools, right-size idle software seats, track renewal deadlines, and explore alternatives.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add SaaS Subscription</span>
        </button>
      </div>

      {/* Top SaaS KPIs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Annual SaaS Spend</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalSaaSAnnual, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {subscriptions.length} enterprise applications
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Unassigned & Idle Licenses</span>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              {totalUnusedSeats} SEATS
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
            {totalUnusedSeats} Idle Seats
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-medium">
            {totalUnusedSeats > 0
              ? `Projected waste: ~${formatCurrency(projectedIdleWaste, currency, true)}/yr in unused seats`
              : 'No idle seats detected'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Upcoming Renewals (&lt; 60 Days)</div>
          <div className="mt-2 text-2xl font-bold text-indigo-700 tracking-tight">
            {upcomingRenewals} Contract{upcomingRenewals === 1 ? '' : 's'}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Optimal window to renegotiate or downgrade
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search software, vendor, plan..."
            className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* SaaS Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Software / Application</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Seat Utilization</th>
                <th className="py-3 px-4 font-semibold">Annual Cost</th>
                <th className="py-3 px-4 font-semibold">Renewal Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">AI Intelligence Alert</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-500">
                    {subscriptions.length === 0 ? (
                      <>
                        No subscriptions tracked yet.{' '}
                        <button onClick={() => setShowAddModal(true)} className="font-semibold text-blue-600 hover:text-blue-700">
                          Add your first subscription
                        </button>
                      </>
                    ) : (
                      'No subscriptions match the current filters.'
                    )}
                  </td>
                </tr>
              )}
              {filteredSubs.map((sub) => {
                const usedPct = Math.round((sub.seatsUsed / (sub.seatsTotal || 1)) * 100);
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{sub.softwareName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{sub.vendorName} • {sub.planName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{sub.departmentName}</td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="flex justify-between text-[10px] text-slate-600">
                          <span>{sub.seatsUsed} / {sub.seatsTotal} ({usedPct}%)</span>
                          <span className="font-semibold text-amber-700">{sub.seatsUnused} idle</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              usedPct > 80 ? 'bg-emerald-500' : usedPct > 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(sub.annualCost, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{sub.renewalDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {sub.aiAlert ? (
                        <div className="rounded bg-amber-50 border border-amber-200/80 p-1.5 text-[10px] text-amber-900">
                          <div className="font-bold">
                            Save {formatCurrency(sub.aiAlert.potentialSavingAnnual, currency, true)}/yr:
                          </div>
                          <div>{sub.aiAlert.explanation}</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Normal utilization</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          onOpenAlternativeEngine({
                            itemName: sub.softwareName,
                            itemType: 'Software & SaaS',
                            currentCost: sub.annualCost,
                            currentVendor: sub.vendorName,
                          })
                        }
                        className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                      >
                        Compare
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-900 text-sm">Add New SaaS Subscription</div>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Software Name</label>
                <input
                  type="text"
                  required
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="e.g. Asana / HubSpot"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total Paid Seats</label>
                  <input
                    type="number"
                    value={seatsTotal}
                    onChange={(e) => setSeatsTotal(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Actively Used Seats</label>
                  <input
                    type="number"
                    value={seatsUsed}
                    onChange={(e) => setSeatsUsed(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Annual Cost ({currency})</label>
                  <input
                    type="number"
                    value={annualCost}
                    onChange={(e) => setAnnualCost(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Renewal Date</label>
                  <input
                    type="date"
                    value={renewal}
                    onChange={(e) => setRenewal(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                {departments.length > 0 ? (
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="">Select…</option>
                    {departments.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-1.5 font-semibold text-white"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
