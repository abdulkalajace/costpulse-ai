import React, { useState } from 'react';
import {
  Receipt,
  UploadCloud,
  CheckCircle2,
  Clock,
  Laptop,
  Plus,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, Expense, Asset, CurrencyCode, ProcurementRequest } from '../types';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';

interface EmployeePortalProps {
  currentUser: UserProfile;
  expenses: Expense[];
  assets: Asset[];
  currency: CurrencyCode;
  onSubmitExpense: (newExpense: Partial<Expense>) => void;
  onSubmitProcurement: (req: Partial<ProcurementRequest>) => void;
  onOpenReceiptScan: () => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  currentUser,
  expenses,
  assets,
  currency,
  onSubmitExpense,
  onSubmitProcurement,
  onOpenReceiptScan,
}) => {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Form states
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel & Commute');
  const [vendor, setVendor] = useState('');

  const [purchaseItem, setPurchaseItem] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [purchaseJustification, setPurchaseJustification] = useState('');

  // Filter items specifically for this employee
  const myExpenses = expenses.filter(
    (e) => e.employeeId === currentUser.id || e.employeeName === currentUser.name
  );
  const myAssets = assets.filter(
    (a) => a.assignedToEmployeeId === currentUser.id || a.assignedToEmployeeName === currentUser.name
  );

  const totalClaimed = myExpenses.reduce((acc, e) => acc + e.amount, 0);
  const pendingAmount = myExpenses
    .filter((e) => e.approvalStatus === 'PENDING')
    .reduce((acc, e) => acc + e.amount, 0);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    onSubmitExpense({
      description: desc,
      amount: Number(amount),
      category: category as any,
      vendorName: vendor || 'Direct Merchant',
      date: new Date().toISOString().split('T')[0],
      departmentName: currentUser.departmentName,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      approvalStatus: 'PENDING',
      recurring: 'One-Time',
    });

    setDesc('');
    setAmount('');
    setVendor('');
    setShowExpenseModal(false);
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseItem || !purchaseCost) return;

    onSubmitProcurement({
      itemName: purchaseItem,
      category: 'Software & SaaS',
      departmentName: currentUser.departmentName,
      requesterName: currentUser.name,
      requesterId: currentUser.id,
      estimatedCost: Number(purchaseCost),
      businessJustification: purchaseJustification,
      status: 'SUBMITTED',
      urgency: 'MEDIUM',
    });

    setPurchaseItem('');
    setPurchaseCost('');
    setPurchaseJustification('');
    setShowPurchaseModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Employee Self-Service & Expense Hub
            </h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              {currentUser.departmentName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit expense reimbursements with instant AI receipt scanning, track approval states, and view company assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReceiptScan}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI Scan Receipt</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Claim Expense</span>
          </button>
        </div>
      </div>

      {/* Employee Quick Summary KPIs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">My Total Expenses Claimed</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalClaimed, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {myExpenses.length} items submitted
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Pending Manager Reimbursement</div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
            {formatCurrency(pendingAmount, currency)}
          </div>
          <div className="mt-2 text-[11px] text-amber-600">
            Under review by department leadership
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Assigned Hardware & Assets</div>
          <div className="mt-2 text-2xl font-bold text-indigo-700 tracking-tight">
            {myAssets.length} Devices
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Assigned for official company use
          </div>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">My Expense Reimbursement Submissions</h2>
            <p className="text-[11px] text-slate-500">Track real-time status of your claimed expenses</p>
          </div>

          <button
            onClick={() => setShowPurchaseModal(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            + Request Software / Hardware Purchase
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-2 font-semibold">Expense Description</th>
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Date</th>
                <th className="pb-2 font-semibold">Amount</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No submitted personal expenses yet. Click &quot;Claim Expense&quot; or &quot;AI Scan Receipt&quot; to begin.
                  </td>
                </tr>
              ) : (
                myExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">
                      <div>{exp.description}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{exp.vendorName}</div>
                    </td>
                    <td className="py-3 text-slate-600">{exp.category}</td>
                    <td className="py-3 text-slate-500">{exp.date}</td>
                    <td className="py-3 font-semibold text-slate-900">
                      {formatCurrency(exp.amount, currency)}
                    </td>
                    <td className="py-3">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${getStatusBadgeClass(exp.approvalStatus)}`}>
                        {exp.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Assigned Hardware & Digital Assets */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">My Assigned Hardware & Office Equipment</h2>
          <p className="text-[11px] text-slate-500">Hardware assets registered under your custody</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {myAssets.map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 flex-shrink-0">
                <Laptop className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900 truncate">{asset.name}</div>
                <div className="text-[10px] text-slate-500">
                  Serial: {asset.serialNumber} • Location: {asset.location}
                </div>
              </div>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                {asset.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-900 text-sm">Submit New Expense Claim</div>
              <button onClick={() => setShowExpenseModal(false)} className="text-xs text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Client Dinner with FinTech Group"
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
                    placeholder="e.g. 4500"
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
                    <option value="Travel & Commute">Travel & Commute</option>
                    <option value="Meals & Entertainment">Meals & Entertainment</option>
                    <option value="Office Supplies & Misc">Office Supplies & Misc</option>
                    <option value="Software & SaaS">Software & SaaS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Vendor / Merchant</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Taj Hotel / Uber"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-1.5 font-semibold text-white"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Request Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-900 text-sm">Request Purchase / Subscription</div>
              <button onClick={() => setShowPurchaseModal(false)} className="text-xs text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Item or Tool Name</label>
                <input
                  type="text"
                  required
                  value={purchaseItem}
                  onChange={(e) => setPurchaseItem(e.target.value)}
                  placeholder="e.g. Figma Pro License / External Monitor"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Estimated Cost ({currency})</label>
                <input
                  type="number"
                  required
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Business Justification</label>
                <textarea
                  required
                  rows={3}
                  value={purchaseJustification}
                  onChange={(e) => setPurchaseJustification(e.target.value)}
                  placeholder="Explain why this purchase is needed for your deliverables..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700"
                >
                  Submit Procurement Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
