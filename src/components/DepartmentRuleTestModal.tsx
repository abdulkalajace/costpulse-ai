import React, { useState } from 'react';
import { X, Play, CheckCircle2, AlertTriangle, ShieldAlert, Shield, ArrowRight, DollarSign, FileText } from 'lucide-react';
import { Department, DepartmentRule, CurrencyCode } from '../types';

interface DepartmentRuleTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  targetRule?: DepartmentRule | null;
  currency: CurrencyCode;
}

export const DepartmentRuleTestModal: React.FC<DepartmentRuleTestModalProps> = ({
  isOpen,
  onClose,
  department,
  targetRule,
  currency,
}) => {
  const [testAmount, setTestAmount] = useState<number>(75000);
  const [testTitle, setTestTitle] = useState('Urgent Structural Rebar Batch Requisition');
  const [hasTaxInvoice, setHasTaxInvoice] = useState(true);
  const [hasCompetitiveBids, setHasCompetitiveBids] = useState(false);
  const [isWithinBOQ, setIsWithinBOQ] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    overallStatus: 'PASS' | 'FLAGGED' | 'BLOCKED';
    evaluatedRules: {
      rule: DepartmentRule;
      status: 'PASS' | 'VIOLATION';
      message: string;
    }[];
  } | null>(null);

  if (!isOpen) return null;

  const rulesToEvaluate = targetRule ? [targetRule] : department.rules || [];

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      let isBlocked = false;
      let isFlagged = false;

      const evaluated = rulesToEvaluate.map((r) => {
        let isViolation = false;
        let msg = 'Complies with policy conditions.';

        // Evaluate by category & threshold
        if (r.category === 'APPROVAL_MATRIX' || r.category === 'SPEND_CEILING') {
          if (r.thresholdAmount && testAmount > r.thresholdAmount) {
            isViolation = true;
            msg = `Amount (${testAmount.toLocaleString()}) exceeds approval limit (${r.thresholdAmount.toLocaleString()}). Requires ${r.assignedApproverRole || 'Head'} sign-off.`;
          }
        } else if (r.category === 'VENDOR_BIDDING') {
          if (!hasCompetitiveBids && testAmount > (r.thresholdAmount || 50000)) {
            isViolation = true;
            msg = 'Missing required 3 comparative vendor bids for order exceeding threshold.';
          }
        } else if (r.category === 'RECEIPT_AUDIT' || r.category === 'STATUTORY_GST_COMPLIANCE') {
          if (!hasTaxInvoice) {
            isViolation = true;
            msg = 'Tax invoice not attached or GST verification pending.';
          }
        } else if (r.category === 'MATERIAL_CONSUMPTION') {
          if (!isWithinBOQ) {
            isViolation = true;
            msg = 'Requisition exceeds approved BOQ structural drawing variance by > 3%.';
          }
        }

        if (isViolation && r.enabled) {
          if (r.severity === 'STRICT_BLOCK') isBlocked = true;
          if (r.severity === 'FLAG_FOR_AUDIT') isFlagged = true;
        }

        return {
          rule: r,
          status: (isViolation && r.enabled ? 'VIOLATION' : 'PASS') as 'PASS' | 'VIOLATION',
          message: isViolation && r.enabled ? msg : 'Passed policy checks.',
        };
      });

      setEvalResult({
        overallStatus: isBlocked ? 'BLOCKED' : isFlagged ? 'FLAGGED' : 'PASS',
        evaluatedRules: evaluated,
      });
      setIsEvaluating(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
              <Play className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Department Rule Engine Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Testing {rulesToEvaluate.length} policy rules against simulated voucher in {department.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Test Parameters */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulated Purchase / Expense Voucher</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Voucher Title / Item Description
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Voucher Amount ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    step="5000"
                    value={testAmount}
                    onChange={(e) => setTestAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Condition Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTaxInvoice}
                  onChange={(e) => setHasTaxInvoice(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-700">Tax Invoice Attached</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCompetitiveBids}
                  onChange={(e) => setHasCompetitiveBids(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-700">3 Quotes Uploaded</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWithinBOQ}
                  onChange={(e) => setIsWithinBOQ(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-700">Within BOQ Specs</span>
              </label>
            </div>

            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEvaluating ? 'Evaluating Rule Gates...' : 'Execute Policy Evaluation'}</span>
            </button>
          </div>

          {/* Results Display */}
          {evalResult && (
            <div className="space-y-3 pt-1 animate-in fade-in">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  evalResult.overallStatus === 'BLOCKED'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : evalResult.overallStatus === 'FLAGGED'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {evalResult.overallStatus === 'BLOCKED' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  ) : evalResult.overallStatus === 'FLAGGED' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider">
                      Overall Result: {evalResult.overallStatus}
                    </h5>
                    <p className="text-xs opacity-90 mt-0.5">
                      {evalResult.overallStatus === 'BLOCKED'
                        ? 'Transaction strictly halted by department governance rules. Requisition cannot proceed without escalation.'
                        : evalResult.overallStatus === 'FLAGGED'
                        ? 'Transaction flagged for audit and review queue.'
                        : 'All department rules satisfied. Transaction approved for processing.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Rules Evaluation */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Rule Evaluation Breakdown ({evalResult.evaluatedRules.length} rules):
                </span>
                <div className="space-y-1.5">
                  {evalResult.evaluatedRules.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="space-y-0.5 max-w-[80%]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[11px] text-slate-700">
                            {res.rule.code}
                          </span>
                          <span className="font-semibold text-slate-900">{res.rule.title}</span>
                          {!res.rule.enabled && (
                            <span className="text-[9px] px-1 rounded bg-slate-200 text-slate-600">
                              DISABLED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{res.message}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                          res.status === 'VIOLATION'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
