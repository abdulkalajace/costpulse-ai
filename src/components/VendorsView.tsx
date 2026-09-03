import React, { useMemo, useState } from 'react';
import { Store, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Vendor, CurrencyCode, UserRole } from '../types';
import { formatCurrency } from '../utils/formatters';
import { EmptyState } from './ui/EmptyState';

interface VendorsViewProps {
  vendors: Vendor[];
  currency: CurrencyCode;
  userRole: UserRole;
  onAddVendor: (vendor: Partial<Vendor>) => void;
  onUpdateVendor?: (id: string, updates: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;
  onOpenAlternativeEngine: (item: {
    itemName: string;
    itemType: string;
    currentCost: number;
    currentVendor: string;
  }) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  currency,
  userRole,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
  onOpenAlternativeEngine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canManage = Boolean(onUpdateVendor || onDeleteVendor) && ['MASTER', 'MD_CEO', 'CFO', 'DEPT_HEAD', 'MANAGER'].includes(userRole);

  // Add Vendor form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [totalSpendAnnual, setTotalSpendAnnual] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState('NET30');

  const departments = useMemo(() => {
    const unique = Array.from(new Set(vendors.map((v) => v.departmentName).filter(Boolean)));
    return ['ALL', ...unique];
  }, [vendors]);

  const filteredVendors = vendors.filter((v) => {
    if (filterDept !== 'ALL' && v.departmentName !== filterDept) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.departmentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalVendorSpend = vendors.reduce((acc, v) => acc + v.totalSpendAnnual, 0);
  const priceIncreaseVendors = vendors.filter((v) => v.priceChangePercent12m > 10);
  const topIncrease = [...priceIncreaseVendors].sort((a, b) => b.priceChangePercent12m - a.priceChangePercent12m)[0];
  const contractsWithRenewal = vendors.filter((v) => v.contractRenewalDate);

  const resetForm = () => {
    setName('');
    setCategory('');
    setDepartmentName('');
    setTotalSpendAnnual(0);
    setPaymentTerms('NET30');
    setEditingId(null);
  };

  const openEdit = (v: Vendor) => {
    setName(v.name);
    setCategory(v.category);
    setDepartmentName(v.departmentName);
    setTotalSpendAnnual(v.totalSpendAnnual);
    setPaymentTerms(v.paymentTerms);
    setEditingId(v.id);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId && onUpdateVendor) {
      onUpdateVendor(editingId, {
        name: name.trim(),
        category: category.trim() || 'Uncategorized',
        departmentName: departmentName.trim() || 'Unassigned',
        totalSpendAnnual: Number(totalSpendAnnual) || 0,
        monthlySpendAverage: Math.round((Number(totalSpendAnnual) || 0) / 12),
        paymentTerms,
      });
    } else {
      onAddVendor({
        name: name.trim(),
        category: category.trim() || 'Uncategorized',
        departmentName: departmentName.trim() || 'Unassigned',
        totalSpendAnnual: Number(totalSpendAnnual) || 0,
        monthlySpendAverage: Math.round((Number(totalSpendAnnual) || 0) / 12),
        paymentTerms,
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
              Vendor Contracts & Supplier Governance
            </h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              {vendors.length} Commercial Suppliers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyze supplier concentration risk, monitor price hikes, track SLA terms, and prepare negotiation scripts.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Vendor</span>
        </button>
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors added yet"
          description="Add your suppliers to track spend concentration, contract renewals, and price changes over time."
          action={
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add your first vendor</span>
            </button>
          }
        />
      ) : (
        <>
          {/* Top Vendor KPIs */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Total Annual Vendor Liability</div>
              <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(totalVendorSpend, currency)}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Across {vendors.length} primary enterprise contracts
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Price Increases (&gt; 10% YoY)</span>
                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                  {priceIncreaseVendors.length} VENDORS
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-rose-700 tracking-tight">
                {topIncrease ? `+${topIncrease.priceChangePercent12m}% Peak Jump` : 'None'}
              </div>
              <div className="mt-2 text-[11px] text-rose-600 font-medium">
                {priceIncreaseVendors.length > 0
                  ? priceIncreaseVendors
                      .slice(0, 3)
                      .map((v) => `${v.name} (+${v.priceChangePercent12m}%)`)
                      .join(', ')
                  : 'No vendors with material price hikes'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Contracts Tracked</div>
              <div className="mt-2 text-2xl font-bold text-indigo-700 tracking-tight">
                {contractsWithRenewal.length} / {vendors.length}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Vendors with a recorded contract renewal date
              </div>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setFilterDept(dept)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    filterDept === dept
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor name, category..."
                className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Vendors Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Vendor Name</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold">Annual Spend</th>
                    <th className="py-3 px-4 font-semibold">12M Price Delta</th>
                    <th className="py-3 px-4 font-semibold">Contract Renewal</th>
                    <th className="py-3 px-4 font-semibold">Payment Terms</th>
                    <th className="py-3 px-4 font-semibold text-right">Negotiate</th>
                    {canManage && <th className="py-3 px-4 font-semibold text-right">Manage</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-slate-400" />
                          <span>{v.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{v.category}</td>
                      <td className="py-3.5 px-4 text-slate-500">{v.departmentName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(v.totalSpendAnnual, currency)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            v.priceChangePercent12m > 10
                              ? 'text-rose-600'
                              : v.priceChangePercent12m > 0
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {v.priceChangePercent12m > 0 ? '+' : ''}
                          {v.priceChangePercent12m}% YoY
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{v.contractRenewalDate || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{v.paymentTerms}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() =>
                            onOpenAlternativeEngine({
                              itemName: v.name,
                              itemType: v.category,
                              currentCost: v.totalSpendAnnual,
                              currentVendor: v.name,
                            })
                          }
                          className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          Negotiate / Replace
                        </button>
                      </td>
                      {canManage && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(v)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                              title="Edit vendor"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(v.id)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete vendor"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="font-bold text-slate-900 text-sm">Remove this vendor?</div>
            <p className="text-xs text-slate-500">This can't be undone. Removal is recorded in the audit trail with your name.</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setConfirmDeleteId(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteVendor && confirmDeleteId) onDeleteVendor(confirmDeleteId);
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

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-900 text-sm">{editingId ? 'Edit Vendor' : 'Add Vendor'}</div>
              <button onClick={() => { resetForm(); setShowAddModal(false); }} className="text-xs text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Cloud Infrastructure"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Annual Spend ({currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={totalSpendAnnual}
                    onChange={(e) => setTotalSpendAnnual(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="NET15">NET15</option>
                    <option value="NET30">NET30</option>
                    <option value="NET60">NET60</option>
                    <option value="PREPAID">PREPAID</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowAddModal(false); }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-slate-900 px-4 py-1.5 font-semibold text-white">
                  {editingId ? 'Save Changes' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
