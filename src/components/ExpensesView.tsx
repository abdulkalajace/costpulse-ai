import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  TrendingUp,
  Calculator,
  ShieldCheck,
  Zap,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Expense, CurrencyCode, UserRole, Budget, Subscription, Company } from '../types';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';

interface ExpensesViewProps {
  expenses: Expense[];
  currency: CurrencyCode;
  userRole: UserRole;
  currentUserName?: string;
  currentUserDepartment?: string;
  departments?: { name: string }[];
  budgets?: Budget[];
  subscriptions?: Subscription[];
  company?: Company;
  onAddExpense: (expense: Partial<Expense>) => void;
  onUpdateExpense?: (id: string, updates: Partial<Expense>) => void;
  onDeleteExpense?: (id: string) => void;
  onOpenReceiptScan: () => void;
  onApproveExpense: (id: string) => void;
  onRejectExpense: (id: string, reason?: string) => void;
  onInspectCostBurden?: (expense: Expense) => void;
  onOpenNegotiation?: (vendorName: string, annualSpend: number, category?: string) => void;
}

const emptyForm = (currentUserDepartment?: string, currentUserName?: string) => ({
  desc: '',
  amount: '',
  category: 'Software & SaaS',
  vendor: '',
  dept: currentUserDepartment || '',
  employee: currentUserName || '',
  recurring: 'Monthly' as 'One-Time' | 'Monthly' | 'Quarterly' | 'Annual',
});

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  currency,
  userRole,
  currentUserName,
  currentUserDepartment,
  departments = [],
  budgets = [],
  subscriptions = [],
  company,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onOpenReceiptScan,
  onApproveExpense,
  onRejectExpense,
  onInspectCostBurden,
  onOpenNegotiation,
}) => {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterAnomaly, setFilterAnomaly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Editing/deleting an existing record is limited to roles that can
  // already approve spend — an ordinary employee can still log their own
  // expense, but can't quietly rewrite or erase one after the fact.
  const canManage = Boolean(onUpdateExpense || onDeleteExpense) && ['MASTER', 'MD_CEO', 'CFO', 'DEPT_HEAD', 'MANAGER'].includes(userRole);

  // Form states
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Software & SaaS');
  const [vendor, setVendor] = useState('');
  const [dept, setDept] = useState(currentUserDepartment || '');
  const [employee, setEmployee] = useState(currentUserName || '');
  const [recurring, setRecurring] = useState<'One-Time' | 'Monthly' | 'Quarterly' | 'Annual'>('Monthly');

  const categories = [
    'ALL',
    'Software & SaaS',
    'AI Tools & Copilots',
    'Cloud Infrastructure',
    'Property & Facilities',
    'Hardware & Devices',
    'Workforce & Contractors',
    'Travel & Commute',
    'Office Supplies & Misc',
  ];

  const filteredExpenses = expenses.filter((e) => {
    if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;
    if (filterAnomaly && !e.aiAnomaly) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        e.description.toLowerCase().includes(q) ||
        e.vendorName.toLowerCase().includes(q) ||
        e.departmentName.toLowerCase().includes(q) ||
        e.employeeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSpent = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.approvalStatus === 'PENDING').length;

  const resetForm = () => {
    const f = emptyForm(currentUserDepartment, currentUserName);
    setDesc(f.desc);
    setAmount(f.amount);
    setCategory(f.category);
    setVendor(f.vendor);
    setDept(f.dept);
    setEmployee(f.employee);
    setRecurring(f.recurring);
    setEditingId(null);
  };

  const openEdit = (exp: Expense) => {
    setDesc(exp.description);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setVendor(exp.vendorName);
    setDept(exp.departmentName);
    setEmployee(exp.employeeName);
    setRecurring(exp.recurring);
    setEditingId(exp.id);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    if (editingId && onUpdateExpense) {
      onUpdateExpense(editingId, {
        description: desc,
        amount: Number(amount),
        category: category as any,
        vendorName: vendor || 'Corporate Vendor',
        departmentName: dept,
        employeeName: employee,
        recurring: recurring,
      });
    } else {
      onAddExpense({
        description: desc,
        amount: Number(amount),
        category: category as any,
        vendorName: vendor || 'Corporate Vendor',
        date: new Date().toISOString().split('T')[0],
        departmentName: dept,
        employeeName: employee,
        employeeId: 'usr-manual',
        recurring: recurring,
        approvalStatus: 'APPROVED',
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
              Expenses & Transaction Ledger
            </h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              {expenses.length} Records
            </span>
            {pendingCount > 0 && (
              <span className="rounded bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 animate-pulse">
                {pendingCount} Awaiting Decision
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial transactions, multi-department cost center tracking, and automated pre-approval burden analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReceiptScan}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI Receipt Scan</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterAnomaly(!filterAnomaly)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              filterAnomaly
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Anomaly Alerts Only</span>
          </button>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses, vendors..."
              className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredExpenses.length} transaction entries</span>
          <span className="font-semibold text-slate-900">
            Total Displayed: {formatCurrency(totalSpent, currency)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Expense / Description</th>
                <th className="py-3 px-4 font-semibold">Vendor</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Cadence</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">AI Insights & Burden</th>
                {['MASTER', 'MD_CEO', 'CFO', 'DEPT_HEAD', 'MANAGER'].includes(userRole) && (
                  <th className="py-3 px-4 font-semibold text-right">Approval Decision</th>
                )}
                {canManage && <th className="py-3 px-4 font-semibold text-right">Manage</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-xs text-slate-500">
                    {expenses.length === 0 ? (
                      <>
                        No expenses yet.{' '}
                        <button onClick={() => setShowAddModal(true)} className="font-semibold text-blue-600 hover:text-blue-700">
                          Add your first expense
                        </button>{' '}
                        or scan a receipt.
                      </>
                    ) : (
                      'No expenses match the current filters.'
                    )}
                  </td>
                </tr>
              )}
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div>{exp.description}</div>
                    <div className="text-[10px] text-slate-400 font-normal">By: {exp.employeeName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>{exp.vendorName}</span>
                      {onOpenNegotiation && exp.amount > 50000 && (
                        <button
                          onClick={() => onOpenNegotiation(exp.vendorName, exp.amount * (exp.recurring === 'Monthly' ? 12 : 1), exp.category)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 underline font-normal"
                          title="Generate negotiation script"
                        >
                          Negotiate
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{exp.departmentName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{exp.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {exp.recurring}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(exp.amount, currency)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(exp.approvalStatus)}`}>
                      {exp.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    {exp.aiAnomaly ? (
                      <div className="rounded bg-rose-50 border border-rose-200 p-1.5 text-[10px] text-rose-900">
                        <span className="font-bold">⚠️ Anomaly: </span>
                        {exp.aiAnomaly.description}
                      </div>
                    ) : exp.amount > 100000 ? (
                      <div className="rounded bg-blue-50/70 border border-blue-200 p-1.5 text-[10px] text-blue-900 flex items-center justify-between">
                        <span>High-value outlay</span>
                        <span className="font-semibold text-blue-700">
                          {formatCurrency(exp.amount * (exp.recurring === 'Monthly' ? 12 : 1), currency, true)}/yr run-rate
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Normal range</span>
                    )}
                  </td>
                  {['MASTER', 'MD_CEO', 'CFO', 'DEPT_HEAD', 'MANAGER'].includes(userRole) && (
                    <td className="py-3.5 px-4 text-right">
                      {exp.approvalStatus === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {onInspectCostBurden && (
                            <button
                              onClick={() => onInspectCostBurden(exp)}
                              className="rounded-lg bg-blue-50 border border-blue-300 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                              title="Inspect Total Cost Burden & Budget Impact"
                            >
                              <Calculator className="w-3 h-3 text-blue-600" />
                              <span>Inspect Burden</span>
                            </button>
                          )}
                          <button
                            onClick={() => onApproveExpense(exp.id)}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700 font-semibold text-[11px] flex items-center gap-1"
                            title="Quick Approve"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => onRejectExpense(exp.id)}
                            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Reject"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[10px] text-slate-400">Processed</span>
                          {onInspectCostBurden && (
                            <button
                              onClick={() => onInspectCostBurden(exp)}
                              className="text-[10px] text-slate-400 hover:text-blue-600 underline"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                  {canManage && (
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(exp)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit expense"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(exp.id)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete expense"
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

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="font-bold text-slate-900 text-sm">Delete this expense?</div>
            <p className="text-xs text-slate-500">
              This can't be undone. The deletion will be recorded in the audit trail with your name and the exact record removed.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteExpense && confirmDeleteId) onDeleteExpense(confirmDeleteId);
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

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-900 text-sm">{editingId ? 'Edit Expense' : 'Log New Enterprise Expense'}</div>
              <button onClick={() => { resetForm(); setShowAddModal(false); }} className="text-xs text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. AWS Cloud Compute Q3"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cadence</label>
                  <select
                    value={recurring}
                    onChange={(e) => setRecurring(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="One-Time">One-Time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
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
                    <option value="">Select department…</option>
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
                  {editingId ? 'Save Changes' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
