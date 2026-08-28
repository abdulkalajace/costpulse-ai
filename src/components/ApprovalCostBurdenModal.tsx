import React, { useState } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  Building,
  DollarSign,
  Copy,
  Check,
  ArrowRight,
  Calculator,
  Scale,
  Zap,
  Info,
  X,
  FileText,
  Percent,
} from 'lucide-react';
import {
  Expense,
  ProcurementRequest,
  Budget,
  Subscription,
  Company,
  CurrencyCode,
  UserRole,
} from '../types';
import { formatCurrency } from '../utils/formatters';

export type ApprovalItem =
  | { type: 'EXPENSE'; data: Expense }
  | { type: 'PROCUREMENT'; data: ProcurementRequest };

interface ApprovalCostBurdenModalProps {
  item: ApprovalItem;
  currency: CurrencyCode;
  budgets: Budget[];
  subscriptions: Subscription[];
  company: Company;
  userRole: UserRole;
  onApproveFull: (id: string) => void;
  onApproveWithCap?: (id: string, cappedAmount: number) => void;
  onNegotiateTarget?: (itemTitle: string, vendorName: string, amount: number) => void;
  onReject: (id: string, reason?: string) => void;
  onClose: () => void;
}

export const ApprovalCostBurdenModal: React.FC<ApprovalCostBurdenModalProps> = ({
  item,
  currency,
  budgets,
  subscriptions,
  company,
  userRole,
  onApproveFull,
  onApproveWithCap,
  onNegotiateTarget,
  onReject,
  onClose,
}) => {
  const isExpense = item.type === 'EXPENSE';
  const exp = isExpense ? item.data : null;
  const proc = !isExpense ? item.data : null;

  const id = isExpense ? exp!.id : proc!.id;
  const title = isExpense ? exp!.description : proc!.title;
  const vendorName = isExpense ? exp!.vendorName : proc!.vendorName;
  const rawCost = isExpense ? exp!.amount : proc!.estimatedCost;
  const deptName = isExpense ? exp!.departmentName : proc!.departmentName;
  const requester = isExpense ? exp!.employeeName : proc!.requestedByName;
  const cadence = isExpense ? exp!.recurring : 'One-Time';
  const category = isExpense ? exp!.category : proc!.category;

  // Tabs inside modal
  const [activeTab, setActiveTab] = useState<'BURDEN' | 'BENCHMARK' | 'NEGOTIATION' | 'ACTION'>('BURDEN');
  const [discountPct, setDiscountPct] = useState<number>(15);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // 1. Department Budget Headroom Calculation — only against a real budget
  // for this department. No fabricated fallback: if no budget is on file,
  // headroom is simply not shown rather than showing made-up numbers that
  // could wrongly influence a real approval decision.
  const deptBudget = budgets.find(
    (b) => b.departmentName.toLowerCase() === deptName.toLowerCase() || b.departmentId === (exp?.departmentId || '')
  );
  const hasBudgetData = Boolean(deptBudget);

  const currentSpent = deptBudget?.spentAmount || 0;
  const totalAllocated = deptBudget?.allocatedAmount || 0;
  const postApprovalSpent = currentSpent + rawCost;
  const currentUtilPct = totalAllocated > 0 ? Math.round((currentSpent / totalAllocated) * 100) : 0;
  const postUtilPct = totalAllocated > 0 ? Math.round((postApprovalSpent / totalAllocated) * 100) : 0;
  const headroomRemainingBefore = totalAllocated - currentSpent;
  const headroomRemainingAfter = totalAllocated - postApprovalSpent;
  const isBreaching = hasBudgetData && postUtilPct > 95;

  // 2. Multi-Year Total Cost of Ownership (TCO) & Amortization
  const multiplierAnnual = cadence === 'Monthly' ? 12 : cadence === 'Quarterly' ? 4 : 1;
  const annualBurden = rawCost * multiplierAnnual;
  const threeYearTco = annualBurden * 3 * 1.05; // 5% annual escalation factor
  const dailyAmortized = Math.round(annualBurden / 365);
  const monthlyRunRateImpact = Math.round(annualBurden / 12);

  // 3. Redundancy / Duplicate Check against Active Subscriptions
  const potentialDuplicates = subscriptions.filter(
    (s) =>
      s.softwareName.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(s.softwareName.toLowerCase()) ||
      s.vendorName.toLowerCase().includes(vendorName.toLowerCase()) ||
      (category === 'Software & SaaS' && s.category === category && s.status === 'UNDERUTILIZED')
  );

  // 4. User-adjustable negotiation target (no fabricated "market benchmark")
  const recommendedFairValue = Math.round(rawCost * (1 - discountPct / 100));
  const potentialSavingsIfNegotiated = rawCost - recommendedFairValue;

  // 5. Negotiation Email Template
  const negotiationScript = `Subject: Inquiry on Contract Terms & Enterprise Volume Tier - ${vendorName} [${company.name}]

Dear ${vendorName} Account Team,

We are currently reviewing the fiscal purchase requisition for ${title} submitted by our ${deptName} team (Total Value: ${formatCurrency(rawCost, currency)}).

As part of ${company.name}'s vendor governance${company.isGroup ? ' across our operating subsidiaries' : ''}, our treasury requires market benchmark alignment. Our current internal procurement cap for this tier is ${formatCurrency(recommendedFairValue, currency)} (a ${discountPct}% volume adjustment)${company.isGroup ? ' or bundled multi-entity terms' : ''}.

Could we schedule a brief 10-minute sync this week to adjust this tier, or explore an annual upfront master service agreement?

Best regards,
${requester}
CC: Procurement & Treasury Head, ${company.name}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(negotiationScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                Pre-Approval Cost Burden Cockpit
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {id}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs text-slate-300 font-normal">({vendorName})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('BURDEN')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'BURDEN'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Total Cost Burden & Budget Impact</span>
          </button>
          <button
            onClick={() => setActiveTab('BENCHMARK')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'BENCHMARK'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Market Benchmark & Overlap</span>
          </button>
          <button
            onClick={() => setActiveTab('NEGOTIATION')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'NEGOTIATION'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Counter-Offer Script</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* TAB 1: Total Cost Burden & Budget Shift */}
          {activeTab === 'BURDEN' && (
            <div className="space-y-5">
              {/* Financial Magnitude Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested Amount</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                    {formatCurrency(rawCost, currency)}
                  </span>
                  <span className="text-[10px] text-slate-500">{cadence} Cadence</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Annualized Run-Rate</span>
                  <span className="text-lg font-bold text-blue-900 mt-0.5 block">
                    {formatCurrency(annualBurden, currency)}
                  </span>
                  <span className="text-[10px] text-blue-700/80">+{formatCurrency(monthlyRunRateImpact, currency)}/mo burn</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">3-Year TCO Lifecycle</span>
                  <span className="text-lg font-bold text-amber-900 mt-0.5 block">
                    {formatCurrency(threeYearTco, currency)}
                  </span>
                  <span className="text-[10px] text-amber-700/80">Incl. 5% inflation/seats</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Amortized Cost</span>
                  <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                    {formatCurrency(dailyAmortized, currency)}/day
                  </span>
                  <span className="text-[10px] text-slate-500">Across 365 operating days</span>
                </div>
              </div>

              {/* Real-time Department Budget Shift Inspector */}
              <div className={`p-4 rounded-xl border ${isBreaching ? 'bg-rose-50/70 border-rose-300' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      {deptName} Budget Headroom Shift
                    </span>
                  </div>
                  {!hasBudgetData ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                      No Budget On File
                    </span>
                  ) : isBreaching ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Critical Budget Risk (&gt;95%)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Within Approved Cap
                    </span>
                  )}
                </div>

                {!hasBudgetData ? (
                  <p className="text-xs text-slate-500 pt-1">
                    No budget has been set up for "{deptName}" yet, so headroom can't be checked against a cap. Set up a
                    department budget to enable this check.
                  </p>
                ) : (
                <>
                {/* Progress Visualizer: Before vs After */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">
                      Current Utilization: <strong>{currentUtilPct}%</strong> ({formatCurrency(currentSpent, currency)} / {formatCurrency(totalAllocated, currency)})
                    </span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      <span>Post-Approval: <strong>{postUtilPct}%</strong></span>
                      <ArrowRight className="w-3 h-3 text-blue-500" />
                      <span className={isBreaching ? 'text-rose-600 font-bold' : 'text-blue-600'}>
                        {formatCurrency(postApprovalSpent, currency)}
                      </span>
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className="bg-blue-600 h-full transition-all"
                      style={{ width: `${Math.min(currentUtilPct, 100)}%` }}
                    />
                    <div
                      className={`${isBreaching ? 'bg-rose-500' : 'bg-amber-400'} h-full transition-all animate-pulse`}
                      style={{ width: `${Math.min(postUtilPct - currentUtilPct, 100 - currentUtilPct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Headroom Before: {formatCurrency(headroomRemainingBefore, currency)}</span>
                    <span className={`font-semibold ${headroomRemainingAfter < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      Remaining Buffer: {formatCurrency(headroomRemainingAfter, currency)}
                    </span>
                  </div>
                </div>
                </>
                )}
              </div>

              {/* Justification & Context */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Requester Justification & Scope
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {isExpense
                    ? exp?.notes || `Direct operational expenditure logged for ${exp?.vendorName}. Payment method: ${exp?.paymentMethod}.`
                    : proc?.justification || `Procurement requisition submitted with ${proc?.urgency} urgency level.`}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Market Benchmark & Overlap Detection */}
          {activeTab === 'BENCHMARK' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>Negotiation Target Calculator</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  CostPulse doesn't have external market benchmark data for this vendor — use the slider below to set a
                  target discount for negotiation based on your own judgment (e.g. seat utilization, contract tenure,
                  or peer quotes you've gathered).
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-blue-200/60 text-xs">
                  <span className="text-blue-900 font-semibold">Target Rate ({discountPct}% off):</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(recommendedFairValue, currency)} (Save {formatCurrency(potentialSavingsIfNegotiated, currency)})
                  </span>
                </div>
              </div>

              {/* Redundancy Warnings */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                  Existing Catalog & License Overlap Audit
                </span>
                {potentialDuplicates.length > 0 ? (
                  <div className="space-y-2">
                    {potentialDuplicates.map((dup) => (
                      <div
                        key={dup.id}
                        className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span className="font-bold text-amber-900">{dup.softwareName}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-200/60 text-amber-900 font-semibold">
                              {dup.seatsUnused} unused seats available
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Your organization currently pays {formatCurrency(dup.annualCost, currency)}/yr for {dup.softwareName} in {dup.departmentName} with only {dup.usageRate}% active utilization.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No duplicate software subscriptions or direct capability collisions detected.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Counter-Offer Script & Negotiation */}
          {activeTab === 'NEGOTIATION' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Ready-to-Send Vendor Counter-Offer Email</h3>
                  <p className="text-[11px] text-slate-500">
                    Pre-formatted negotiation leverage citing benchmark discounts and multi-subsidiary master SLA terms.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-medium">Target Discount:</span>
                  <select
                    value={discountPct}
                    onChange={(e) => setDiscountPct(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-slate-300 text-xs bg-white font-semibold text-slate-900"
                  >
                    <option value={10}>10% (Save {formatCurrency(rawCost * 0.1, currency)})</option>
                    <option value={15}>15% (Save {formatCurrency(rawCost * 0.15, currency)})</option>
                    <option value={20}>20% (Save {formatCurrency(rawCost * 0.2, currency)})</option>
                    <option value={25}>25% (Save {formatCurrency(rawCost * 0.25, currency)})</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={8}
                  value={negotiationScript}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-800 leading-relaxed focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyScript}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Rejection reason box (expandable) */}
          {showRejectInput && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 animate-in fade-in">
              <span className="font-bold text-rose-900 text-xs block">Provide Rejection Rationale for Requester</span>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Budget ceiling reached; utilize existing unused licenses or request counter-offer first."
                rows={2}
                className="w-full rounded-lg border border-rose-300 p-2 text-xs bg-white text-slate-900 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1 text-slate-600 font-medium hover:bg-rose-100/50 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onReject(id, rejectionReason);
                    onClose();
                  }}
                  className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg text-xs hover:bg-rose-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions Bar (Apple-Grade Decision Architecture) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-slate-500 text-[11px]">
            Approval will commit <strong className="text-slate-900">{formatCurrency(rawCost, currency)}</strong> to {deptName} ledger.
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {!showRejectInput && (
              <button
                onClick={() => setShowRejectInput(true)}
                className="px-3 py-2 border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                Reject Request
              </button>
            )}

            {onApproveWithCap && (
              <button
                onClick={() => {
                  onApproveWithCap(id, recommendedFairValue);
                  onClose();
                }}
                className="px-3 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                title={`Approve capped at fair value ${formatCurrency(recommendedFairValue, currency)}`}
              >
                <Percent className="w-3.5 h-3.5 text-amber-700" />
                <span>Approve at Fair Cap ({formatCurrency(recommendedFairValue, currency)})</span>
              </button>
            )}

            <button
              onClick={() => {
                onApproveFull(id);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Full Amount ({formatCurrency(rawCost, currency)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
