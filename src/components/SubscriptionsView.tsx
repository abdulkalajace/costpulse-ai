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
  Pencil,
  Trash2,
} from 'lucide-react';
import { Subscription, CurrencyCode, UserRole } from '../types';
import { formatCurrency, getStatusBadgeClass, getUpcomingRenewals, daysUntil } from '../utils/formatters';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  currency: CurrencyCode;
  userRole: UserRole;
  departments?: { name: string }[];
  onAddSubscription: (sub: Partial<Subscription>) => void;
  onUpdateSubscription?: (id: string, updates: Partial<Subscription>) => void;
  onDeleteSubscription?: (id: string) => void;
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
  onUpdateSubscription,
  onDeleteSubscription,
  onOpenAlternativeEngine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canManage = Boolean(onUpdateSubscription || onDeleteSubscription) && ['MASTER', 'MD_CEO', 'CFO', 'DEPT_HEAD', 'MANAGER'].includes(userRole);

  // Form state
  const [toolName, setToolName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [planName, setPlanName] = useState('Enterprise');
  const [seatsTotal, setSeatsTotal] = useState(50);
  const [seatsUsed, setSeatsUsed] = useState(40);
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Annual' | 'Custom'>('Annual');
  const [amountPaid, setAmountPaid] = useState(250000);
  const [customCycleMonths, setCustomCycleMonths] = useState(1);
  const [category, setCategory] = useState('Productivity & Collaboration');
  const [dept, setDept] = useState('');
  const [renewal, setRenewal] = useState('2026-12-31');

  const categories = ['ALL', 'AI Tools & Copilots', 'Productivity & Collaboration', 'CRM & Sales', 'Analytics & Data', 'Customer Support', 'Design & UI/UX', 'Finance & Accounting'];

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
  const renewalsWithin60Days = getUpcomingRenewals(subscriptions, 60);
  const upcomingRenewals = renewalsWithin60Days.length;
  const renewingSoon = getUpcomingRenewals(subscriptions, 30);
  const aiToolSubs = subscriptions.filter((s) => s.category === 'AI Tools & Copilots');
  const aiToolAnnualSpend = aiToolSubs.reduce((acc, s) => acc + s.annualCost, 0);

  // Whatever cycle the user actually pays on, normalize to a monthly and
  // annual figure so the rest of the app (which reasons in annual terms)
  // doesn't need to know about billing cycles at all.
  const cycleMonths = billingCycle === 'Monthly' ? 1 : billingCycle === 'Annual' ? 12 : Math.max(1, Number(customCycleMonths) || 1);
  const derivedMonthlyCost = Number(amountPaid) / cycleMonths;
  const derivedAnnualCost = derivedMonthlyCost * 12;

  const resetForm = () => {
    setToolName('');
    setVendorName('');
    setPlanName('Enterprise');
    setSeatsTotal(50);
    setSeatsUsed(40);
    setBillingCycle('Annual');
    setAmountPaid(250000);
    setCustomCycleMonths(1);
    setCategory('Productivity & Collaboration');
    setDept('');
    setRenewal('2026-12-31');
    setEditingId(null);
  };

  const openEdit = (sub: Subscription) => {
    setToolName(sub.softwareName);
    setVendorName(sub.vendorName);
    setPlanName(sub.planName);
    setSeatsTotal(sub.seatsTotal);
    setSeatsUsed(sub.seatsUsed);
    setBillingCycle(sub.billingCycle === 'Custom' ? 'Custom' : sub.billingCycle);
    setAmountPaid(sub.billingCycle === 'Monthly' ? sub.monthlyCost : sub.billingCycle === 'Custom' ? sub.monthlyCost * (sub.customCycleMonths || 1) : sub.annualCost);
    setCustomCycleMonths(sub.customCycleMonths || 1);
    setCategory(sub.category);
    setDept(sub.departmentName);
    setRenewal(sub.renewalDate);
    setEditingId(sub.id);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName) return;

    if (editingId && onUpdateSubscription) {
      onUpdateSubscription(editingId, {
        softwareName: toolName,
        vendorName: vendorName || toolName,
        planName: planName,
        seatsTotal: Number(seatsTotal),
        seatsUsed: Number(seatsUsed),
        seatsUnused: Number(seatsTotal) - Number(seatsUsed),
        annualCost: Math.round(derivedAnnualCost),
        monthlyCost: Math.round(derivedMonthlyCost),
        billingCycle,
        customCycleMonths: billingCycle === 'Custom' ? Number(customCycleMonths) : undefined,
        renewalDate: renewal,
        departmentName: dept || 'Unassigned',
        category: category,
        status: Number(seatsUsed) < Number(seatsTotal) * 0.5 ? 'UNDERUTILIZED' : 'ACTIVE',
      });
    } else {
      onAddSubscription({
        softwareName: toolName,
        vendorName: vendorName || toolName,
        planName: planName,
        seatsTotal: Number(seatsTotal),
        seatsUsed: Number(seatsUsed),
        seatsUnused: Number(seatsTotal) - Number(seatsUsed),
        annualCost: Math.round(derivedAnnualCost),
        monthlyCost: Math.round(derivedMonthlyCost),
        billingCycle,
        customCycleMonths: billingCycle === 'Custom' ? Number(customCycleMonths) : undefined,
        renewalDate: renewal,
        departmentName: dept || 'Unassigned',
        category: category,
        status: Number(seatsUsed) < Number(seatsTotal) * 0.5 ? 'UNDERUTILIZED' : 'ACTIVE',
        currency: 'INR',
      });
    }

    resetForm();
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
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add SaaS Subscription</span>
        </button>
      </div>

      {/* Top SaaS KPIs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Annual SaaS Spend</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalSaaSAnnual, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {subscriptions.length} enterprise applications
          </div>
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-violet-800 font-medium">
            <span>AI Tool Spend</span>
            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-800">
              {aiToolSubs.length} TOOL{aiToolSubs.length === 1 ? '' : 'S'}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-violet-900 tracking-tight">
            {formatCurrency(aiToolAnnualSpend, currency)}
          </div>
          <div className="mt-2 text-[11px] text-violet-700">
            {aiToolSubs.length > 0
              ? `${Math.round((aiToolAnnualSpend / (totalSaaSAnnual || 1)) * 100)}% of total SaaS spend`
              : 'Tag a subscription as "AI Tools & Copilots" to track it'}
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

      {/* Renewing Soon — actionable alert, not just a stat */}
      {renewingSoon.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            <span>Renewing in the next 30 days</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {renewingSoon.map((sub) => {
              const d = daysUntil(sub.renewalDate);
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{sub.softwareName}</div>
                    <div className="text-[10px] text-slate-500">{formatCurrency(sub.annualCost, currency, true)}/yr</div>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      d <= 7 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {d === 0 ? 'Today' : d === 1 ? '1 day' : `${d} days`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                {canManage && <th className="py-3 px-4 font-semibold text-right">Manage</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-500">
                    {subscriptions.length === 0 ? (
                      <>
                        No subscriptions tracked yet.{' '}
                        <button onClick={() => { resetForm(); setShowAddModal(true); }} className="font-semibold text-blue-600 hover:text-blue-700">
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
                    {canManage && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(sub)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                            title="Edit subscription"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(sub.id)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete subscription"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="font-bold text-slate-900 text-sm">Remove this subscription?</div>
            <p className="text-xs text-slate-500">This can't be undone. Removal is recorded in the audit trail with your name.</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setConfirmDeleteId(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteSubscription && confirmDeleteId) onDeleteSubscription(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-900 text-sm">{editingId ? 'Edit SaaS Subscription' : 'Add New SaaS Subscription'}</div>
              <button onClick={() => { resetForm(); setShowAddModal(false); }} className="text-xs text-slate-400">✕</button>
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

              <div>
                <label className="block font-medium text-slate-700 mb-1">Billing Cycle</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Monthly', 'Annual', 'Custom'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setBillingCycle(cycle)}
                      className={`rounded-lg border p-2 text-center font-semibold transition-colors ${
                        billingCycle === cycle
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {billingCycle === 'Monthly' ? `Cost per month (${currency})` : billingCycle === 'Annual' ? `Cost per year (${currency})` : `Amount paid (${currency})`}
                  </label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                {billingCycle === 'Custom' ? (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Covers how many months?</label>
                    <input
                      type="number"
                      min={1}
                      value={customCycleMonths}
                      onChange={(e) => setCustomCycleMonths(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Renewal Date</label>
                    <input
                      type="date"
                      value={renewal}
                      onChange={(e) => setRenewal(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {billingCycle === 'Custom' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Renewal Date</label>
                  <input
                    type="date"
                    value={renewal}
                    onChange={(e) => setRenewal(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              )}

              {amountPaid > 0 && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-600">
                  ≈ <span className="font-semibold text-slate-900">{formatCurrency(Math.round(derivedMonthlyCost), currency)}/mo</span>{' '}
                  · <span className="font-semibold text-slate-900">{formatCurrency(Math.round(derivedAnnualCost), currency)}/yr</span> once annualized
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                >
                  {categories
                    .filter((c) => c !== 'ALL')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
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
                  onClick={() => { resetForm(); setShowAddModal(false); }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-1.5 font-semibold text-white"
                >
                  {editingId ? 'Save Changes' : 'Save Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
