import React, { useState } from 'react';
import { PieChart, Sliders, Plus, Pencil, Trash2 } from 'lucide-react';
import { Budget, CurrencyCode, ExpenseCategory, UserRole } from '../types';
import { formatCurrency } from '../utils/formatters';
import { EmptyState } from './ui/EmptyState';

interface BudgetsViewProps {
  budgets: Budget[];
  currency: CurrencyCode;
  userRole?: UserRole;
  onAddBudget: (budget: Partial<Budget>) => void;
  onUpdateBudget?: (id: string, updates: Partial<Budget>) => void;
  onDeleteBudget?: (id: string) => void;
  onOpenSimulator?: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ budgets, currency, userRole, onAddBudget, onUpdateBudget, onDeleteBudget, onOpenSimulator }) => {
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'OVER' | 'WARNING' | 'HEALTHY'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canManage =
    Boolean(onUpdateBudget || onDeleteBudget) &&
    (!userRole || ['MASTER', 'MD_CEO', 'CFO', 'DEPT_HEAD', 'MANAGER'].includes(userRole));

  // Add Budget form state
  const [departmentName, setDepartmentName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Software & SaaS');
  const [fiscalQuarter, setFiscalQuarter] = useState('Q1 FY26');
  const [allocatedAmount, setAllocatedAmount] = useState(0);

  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const totalVariance = totalAllocated - totalSpent;
  const overallUsedPct = Math.round((totalSpent / (totalAllocated || 1)) * 100);

  const filteredBudgets = budgets.filter((b) => {
    const usedPct = Math.round((b.spentAmount / (b.allocatedAmount || 1)) * 100);
    if (filterRisk === 'OVER') return b.status === 'OVER_BUDGET' || usedPct >= 100;
    if (filterRisk === 'WARNING') return usedPct >= 80 && usedPct < 100;
    if (filterRisk === 'HEALTHY') return usedPct < 80;
    return true;
  });

  const overCount = budgets.filter((b) => b.status === 'OVER_BUDGET' || (b.spentAmount / b.allocatedAmount) >= 1).length;
  const warningCount = budgets.filter((b) => {
    const p = b.spentAmount / b.allocatedAmount;
    return p >= 0.8 && p < 1;
  }).length;

  const resetForm = () => {
    setDepartmentName('');
    setCategory('Software & SaaS');
    setFiscalQuarter('Q1 FY26');
    setAllocatedAmount(0);
    setEditingId(null);
  };

  const openEdit = (b: Budget) => {
    setDepartmentName(b.departmentName);
    setCategory(b.category as ExpenseCategory);
    setFiscalQuarter(b.fiscalQuarter);
    setAllocatedAmount(b.allocatedAmount);
    setEditingId(b.id);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName.trim() || !allocatedAmount) return;

    if (editingId && onUpdateBudget) {
      const existing = budgets.find((b) => b.id === editingId);
      const newAllocated = Number(allocatedAmount);
      const spent = existing?.spentAmount || 0;
      onUpdateBudget(editingId, {
        departmentName: departmentName.trim(),
        category,
        fiscalQuarter,
        allocatedAmount: newAllocated,
        varianceAmount: newAllocated - spent,
        variancePercent: newAllocated > 0 ? Math.round(((newAllocated - spent) / newAllocated) * 100) : 0,
        status: spent >= newAllocated ? 'OVER_BUDGET' : 'ON_TRACK',
      });
    } else {
      onAddBudget({
        departmentName: departmentName.trim(),
        category,
        fiscalQuarter,
        allocatedAmount: Number(allocatedAmount),
        spentAmount: 0,
        forecastAmount: Number(allocatedAmount),
        varianceAmount: Number(allocatedAmount),
        variancePercent: 0,
        status: 'ON_TRACK',
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
              Department Budgets & Variance Analysis
            </h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              FY 2026-27
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare allocated fiscal budgets vs actuals, detect cost burden trajectories early, and prevent overspending before approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Budget</span>
          </button>
          {onOpenSimulator && budgets.length > 0 && (
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-xs"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Launch Runway Simulator</span>
            </button>
          )}
        </div>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No budgets set up yet"
          description="Allocate a fiscal budget per department to track spend against a cap and catch overspending early."
          action={
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add your first budget</span>
            </button>
          }
        />
      ) : (
      <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Fiscal Budget Allocated</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalAllocated, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {budgets.length} operational cost centers
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Spent To Date</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalSpent, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {overallUsedPct}% of annual allocation utilized
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Unspent Budget Buffer</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            {formatCurrency(totalVariance, currency)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Positive capital headroom
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Budget Risk Alerts</span>
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
              {overCount + warningCount} ATTN
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 tracking-tight">
            {overCount} Over / {warningCount} Warn
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-medium">
            Active pre-approval spending caps active
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setFilterRisk('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterRisk === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Cost Centers ({budgets.length})
        </button>
        <button
          onClick={() => setFilterRisk('OVER')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterRisk === 'OVER'
              ? 'bg-rose-600 text-white'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          Over Budget ({overCount})
        </button>
        <button
          onClick={() => setFilterRisk('WARNING')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterRisk === 'WARNING'
              ? 'bg-amber-600 text-white'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          Near Cap &gt;80% ({warningCount})
        </button>
        <button
          onClick={() => setFilterRisk('HEALTHY')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterRisk === 'HEALTHY'
              ? 'bg-emerald-600 text-white'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          Healthy Headroom ({budgets.length - overCount - warningCount})
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBudgets.map((b) => {
          const usedPct = Math.round((b.spentAmount / (b.allocatedAmount || 1)) * 100);
          const isOver = b.status === 'OVER_BUDGET' || usedPct >= 100;
          const isWarn = usedPct >= 80 && !isOver;

          return (
            <div
              key={b.id}
              className={`rounded-xl border bg-white p-5 shadow-2xs space-y-4 transition-all ${
                isOver
                  ? 'border-rose-200 ring-1 ring-rose-200/60'
                  : isWarn
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{b.departmentName}</h2>
                  <div className="text-[11px] text-slate-500">{b.category} • {b.fiscalQuarter}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
                      isOver
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isWarn
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isOver ? 'OVER BUDGET' : isWarn ? 'WARNING (>80%)' : 'ON TRACK'}
                  </span>
                  {canManage && (
                    <>
                      <button
                        onClick={() => openEdit(b)}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                        title="Edit budget"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(b.id)}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete budget"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar with Headroom */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{formatCurrency(b.spentAmount, currency)} spent</span>
                  <span className="text-slate-500">Cap: {formatCurrency(b.allocatedAmount, currency)}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usedPct >= 100 ? 'bg-rose-500' : usedPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(usedPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span className={isOver ? 'text-rose-600 font-bold' : isWarn ? 'text-amber-700 font-semibold' : ''}>
                    {usedPct}% utilized
                  </span>
                  <span>
                    {b.varianceAmount >= 0 ? 'Remaining Buffer: ' : 'Overrun: '}
                    <strong className={b.varianceAmount < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                      {formatCurrency(Math.abs(b.varianceAmount), currency)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="font-bold text-slate-900 text-sm">Remove this budget?</div>
            <p className="text-xs text-slate-500">This can't be undone. Removal is recorded in the audit trail with your name.</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setConfirmDeleteId(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteBudget && confirmDeleteId) onDeleteBudget(confirmDeleteId);
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

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-900 text-sm">{editingId ? 'Edit Budget' : 'Add Budget'}</div>
              <button onClick={() => { resetForm(); setShowAddModal(false); }} className="text-xs text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Software & SaaS">Software & SaaS</option>
                    <option value="AI Tools & Copilots">AI Tools & Copilots</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Hardware & Devices">Hardware & Devices</option>
                    <option value="Property & Facilities">Property & Facilities</option>
                    <option value="Workforce & Contractors">Workforce & Contractors</option>
                    <option value="Travel & Entertainment">Travel & Entertainment</option>
                    <option value="Marketing & Ads">Marketing & Ads</option>
                    <option value="Utilities & Services">Utilities & Services</option>
                    <option value="Legal & Insurance">Legal & Insurance</option>
                    <option value="Office Supplies & Misc">Office Supplies & Misc</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fiscal Quarter</label>
                  <input
                    type="text"
                    value={fiscalQuarter}
                    onChange={(e) => setFiscalQuarter(e.target.value)}
                    placeholder="e.g. Q1 FY26"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Allocated Amount ({currency})</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={allocatedAmount}
                  onChange={(e) => setAllocatedAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
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
                  {editingId ? 'Save Changes' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
