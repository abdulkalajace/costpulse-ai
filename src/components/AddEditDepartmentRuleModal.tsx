import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, Shield, DollarSign, Percent, Info } from 'lucide-react';
import { DepartmentRule, RuleCategory, RuleSeverity, UserRole, CurrencyCode, Department } from '../types';

interface AddEditDepartmentRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  existingRule?: DepartmentRule | null;
  onSaveRule: (rule: DepartmentRule) => void;
  currency: CurrencyCode;
}

export const AddEditDepartmentRuleModal: React.FC<AddEditDepartmentRuleModalProps> = ({
  isOpen,
  onClose,
  department,
  existingRule,
  onSaveRule,
  currency,
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RuleCategory>('APPROVAL_MATRIX');
  const [severity, setSeverity] = useState<RuleSeverity>('STRICT_BLOCK');
  const [enabled, setEnabled] = useState(true);
  const [thresholdAmount, setThresholdAmount] = useState<number | ''>(50000);
  const [thresholdPercentage, setThresholdPercentage] = useState<number | ''>('');
  const [conditionDescription, setConditionDescription] = useState('');
  const [enforcementAction, setEnforcementAction] = useState('');
  const [assignedApproverRole, setAssignedApproverRole] = useState<UserRole>('DEPT_HEAD');

  useEffect(() => {
    if (existingRule) {
      setCode(existingRule.code);
      setTitle(existingRule.title);
      setDescription(existingRule.description);
      setCategory(existingRule.category);
      setSeverity(existingRule.severity);
      setEnabled(existingRule.enabled);
      setThresholdAmount(existingRule.thresholdAmount ?? '');
      setThresholdPercentage(existingRule.thresholdPercentage ?? '');
      setConditionDescription(existingRule.conditionDescription);
      setEnforcementAction(existingRule.enforcementAction);
      setAssignedApproverRole(existingRule.assignedApproverRole || 'DEPT_HEAD');
    } else {
      setCode(`RUL-${department.code}-${Math.floor(10 + Math.random() * 90)}`);
      setTitle('');
      setDescription('');
      setCategory('APPROVAL_MATRIX');
      setSeverity('STRICT_BLOCK');
      setEnabled(true);
      setThresholdAmount(50000);
      setThresholdPercentage('');
      setConditionDescription('');
      setEnforcementAction('');
      setAssignedApproverRole('DEPT_HEAD');
    }
  }, [existingRule, department, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !conditionDescription.trim() || !enforcementAction.trim()) return;

    const rule: DepartmentRule = {
      id: existingRule?.id || `rul-${department.id}-${Date.now()}`,
      departmentId: department.id,
      departmentName: department.name,
      code: code.trim() || `RUL-${department.code}-01`,
      title: title.trim(),
      description: description.trim() || title.trim(),
      category,
      severity,
      enabled,
      thresholdAmount: thresholdAmount !== '' ? Number(thresholdAmount) : undefined,
      thresholdPercentage: thresholdPercentage !== '' ? Number(thresholdPercentage) : undefined,
      currency,
      conditionDescription: conditionDescription.trim(),
      enforcementAction: enforcementAction.trim(),
      assignedApproverRole,
      evaluationCount: existingRule?.evaluationCount || 0,
      violationsCount: existingRule?.violationsCount || 0,
      lastTriggeredAt: existingRule?.lastTriggeredAt,
      createdBy: existingRule?.createdBy || 'Department Admin',
      createdAt: existingRule?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSaveRule(rule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {existingRule ? 'Edit Department Governance Rule' : 'Create Department Policy & Guardrail Rule'}
              </h3>
              <p className="text-xs text-slate-500">
                Automate spending controls, bidding mandates, and approvals for {department.name} ({department.code})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top Identifier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rule Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`e.g. RUL-${department.code}-01`}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rule Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mandatory 3-Vendor Quotations for Single Purchases > ₹50,000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Rule Scope & Purpose
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the background why this rule is enforced in this department..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Classification & Severity */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Classification & Enforcement Severity</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rule Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RuleCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-medium"
                >
                  <option value="APPROVAL_MATRIX">Approval Matrix & Limits</option>
                  <option value="SPEND_CEILING">Spend Ceiling & Budget Burn</option>
                  <option value="VENDOR_BIDDING">Vendor Bidding & Quotes</option>
                  <option value="RECEIPT_AUDIT">Receipt & Tax Invoice Audit</option>
                  <option value="MATERIAL_CONSUMPTION">Material & BOQ Consumption</option>
                  <option value="STATUTORY_GST_COMPLIANCE">GST / TDS Statutory</option>
                  <option value="DISCOUNT_EARLY_PAY">Early Payment Discount</option>
                  <option value="HIRING_HEADCOUNT">Hiring & Headcount Cap</option>
                  <option value="TRAVEL_ALLOWANCE">Travel Per-Diem Grid</option>
                  <option value="ASSET_CUSTODY">Asset & License Custody</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enforcement Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as RuleSeverity)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-bold"
                >
                  <option value="STRICT_BLOCK">🔴 STRICT BLOCK (Hard Halt)</option>
                  <option value="FLAG_FOR_AUDIT">🟡 FLAG FOR AUDIT (Review Queue)</option>
                  <option value="WARNING_NOTIFY">🔵 WARNING NOTIFY (Alert Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Escalation Authority Role
                </label>
                <select
                  value={assignedApproverRole}
                  onChange={(e) => setAssignedApproverRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-bold"
                >
                  <option value="DEPT_HEAD">DEPT_HEAD (Head of Dept)</option>
                  <option value="MANAGER">MANAGER (Ops Approver)</option>
                  <option value="CFO">CFO (Executive Treasury)</option>
                  <option value="MD_CEO">MD_CEO (Board / Executive)</option>
                  <option value="HR">HR (People Admin)</option>
                </select>
              </div>
            </div>

            {/* Threshold Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trigger Amount Threshold ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={thresholdAmount}
                    onChange={(e) => setThresholdAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 50000"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trigger Percentage Threshold (%)
                </label>
                <div className="relative">
                  <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={thresholdPercentage}
                    onChange={(e) => setThresholdPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 85 (% of burn or BOQ)"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Condition & Enforcement Action */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trigger Condition Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={conditionDescription}
                onChange={(e) => setConditionDescription(e.target.value)}
                placeholder="e.g. Requisition amount > ₹50,000 without 3 comparative vendor bids attached"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enforcement Action Executed <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={enforcementAction}
                onChange={(e) => setEnforcementAction(e.target.value)}
                placeholder="e.g. Blocks ERP PO release and routes escalation notification to Dept Head"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">Rule Active & Enforcing</p>
                <p className="text-[11px] text-slate-500">Live evaluation against all incoming department expense and PO vouchers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors"
            >
              {existingRule ? 'Update Rule' : 'Enforce Department Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
