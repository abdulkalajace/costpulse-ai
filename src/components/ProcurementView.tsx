import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Building,
  Calculator,
  Scale,
  Zap,
} from 'lucide-react';
import { ProcurementRequest, CurrencyCode, UserRole, ExpenseCategory, Budget, Subscription, Company } from '../types';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';

interface ProcurementViewProps {
  procurements: ProcurementRequest[];
  currency: CurrencyCode;
  userRole: UserRole;
  budgets?: Budget[];
  subscriptions?: Subscription[];
  company?: Company;
  onApproveProcurement: (id: string) => void;
  onRejectProcurement: (id: string, reason?: string) => void;
  onNewRequest: (req: Partial<ProcurementRequest>) => void;
  onInspectCostBurden?: (proc: ProcurementRequest) => void;
  onOpenNegotiation?: (vendorName: string, annualSpend: number, category?: string) => void;
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({
  procurements,
  currency,
  userRole,
  budgets = [],
  subscriptions = [],
  company,
  onApproveProcurement,
  onRejectProcurement,
  onNewRequest,
  onInspectCostBurden,
  onOpenNegotiation,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [title, setTitle] = useState('');
  const [vendorName, setVendorName] = useState('Vendor Inc');
  const [category, setCategory] = useState<ExpenseCategory>('Software & SaaS');
  const [cost, setCost] = useState('');
  const [justification, setJustification] = useState('');
  const [urgency, setUrgency] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');

  const pendingRequests = procurements.filter(
    (p) => p.status === 'SUBMITTED' || p.status === 'MANAGER_APPROVED' || p.status === 'DEPT_APPROVED'
  );
  const totalPendingValue = pendingRequests.reduce((acc, p) => acc + p.estimatedCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !cost) return;

    onNewRequest({
      title,
      vendorName,
      category,
      estimatedCost: Number(cost),
      justification,
      urgency,
      requestedByName: 'Current User',
      departmentName: 'Core Platform Engineering',
      status: 'SUBMITTED',
      requestDate: new Date().toISOString().split('T')[0],
      approvalChain: [
        {
          step: 'Manager Approval',
          approverRole: 'MANAGER',
          status: 'PENDING',
        },
      ],
    });

    setTitle('');
    setCost('');
    setJustification('');
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Procurement & Purchase Request Pipeline
            </h1>
            <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              {pendingRequests.length} Pending Approvals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-purchase governance: prevent duplicate software purchases, inspect budget burden before signing, and generate vendor counter-offers.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Purchase Request</span>
        </button>
      </div>

      {/* Procurement KPIs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Pending Purchase Value</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalPendingValue, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {pendingRequests.length} unapproved requisitions
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Catalog Overlap Scanner</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            Continuous Active
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Scans active subscriptions before authorizing new licenses
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Pre-Approval Burden Check</div>
          <div className="mt-2 text-2xl font-bold text-blue-700 tracking-tight">
            Enabled
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Calculates multi-year TCO & headroom shift
          </div>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Item / Requisition</th>
                <th className="py-3 px-4 font-semibold">Requester</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Est. Cost</th>
                <th className="py-3 px-4 font-semibold">Urgency</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">AI Intelligence</th>
                {['MASTER', 'MD_CEO', 'CFO', 'CTO', 'DEPT_HEAD', 'MANAGER'].includes(userRole) && (
                  <th className="py-3 px-4 font-semibold text-right">Approval Decision</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {procurements.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-500">
                    No purchase requests yet. Click "New Purchase Request" to submit one.
                  </td>
                </tr>
              )}
              {procurements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{req.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({req.vendorName})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                      {req.justification}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{req.requestedByName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{req.departmentName}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(req.estimatedCost, currency)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        req.urgency === 'HIGH' || req.urgency === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {req.urgency}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    {req.aiAnalysis?.duplicateVendorsFound ? (
                      <div className="rounded bg-amber-50 border border-amber-200 p-1.5 text-[10px] text-amber-900">
                        <span className="font-bold">⚠️ Overlap: </span>
                        {req.aiAnalysis.bulkDiscountOpportunity || 'Duplicate capability found in active catalog'}
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Unique requirement
                      </span>
                    )}
                  </td>
                  {['MASTER', 'MD_CEO', 'CFO', 'CTO', 'DEPT_HEAD', 'MANAGER'].includes(userRole) && (
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'SUBMITTED' || req.status === 'MANAGER_APPROVED' || req.status === 'DEPT_APPROVED' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {onInspectCostBurden && (
                            <button
                              onClick={() => onInspectCostBurden(req)}
                              className="rounded-lg bg-blue-50 border border-blue-300 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 flex items-center gap-1 transition-colors"
                              title="Inspect Pre-Approval Cost Burden, Headroom & TCO"
                            >
                              <Calculator className="w-3 h-3 text-blue-600" />
                              <span>Inspect Burden</span>
                            </button>
                          )}
                          <button
                            onClick={() => onApproveProcurement(req.id)}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onRejectProcurement(req.id)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[10px] text-slate-400">Processed</span>
                          {onInspectCostBurden && (
                            <button
                              onClick={() => onInspectCostBurden(req)}
                              className="text-[10px] text-slate-400 hover:text-blue-600 underline"
                            >
                              Audit Record
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-900 text-sm">Submit New Procurement Request</div>
              <button onClick={() => setShowNewModal(false)} className="text-xs text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Requisition Title / Software</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Miro Enterprise Team License"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Miro Inc"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Estimated Cost ({currency})</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. 80000"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Business Justification</label>
                <textarea
                  required
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why existing tools do not suffice..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-1.5 font-semibold text-white"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
