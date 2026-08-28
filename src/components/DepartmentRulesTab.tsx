import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Edit2,
  Trash2,
  Sparkles,
  Play,
  RotateCcw,
  Info,
  Check,
  X,
  Lock,
  ArrowRight,
  TrendingDown,
  FileCheck,
} from 'lucide-react';
import { Department, DepartmentRule, CurrencyCode, RuleCategory, RuleSeverity, UserRole } from '../types';

interface DepartmentRulesTabProps {
  department: Department;
  rules: DepartmentRule[];
  currency: CurrencyCode;
  onAddRule: () => void;
  onEditRule: (rule: DepartmentRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onGenerateAiRules: () => void;
  onTestRuleModal: (rule?: DepartmentRule) => void;
  isAiGenerating?: boolean;
}

export const DepartmentRulesTab: React.FC<DepartmentRulesTabProps> = ({
  department,
  rules,
  currency,
  onAddRule,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  onGenerateAiRules,
  onTestRuleModal,
  isAiGenerating = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.conditionDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || r.severity === severityFilter;
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const activeRulesCount = rules.filter((r) => r.enabled).length;
  const totalEvaluations = rules.reduce((acc, r) => acc + (r.evaluationCount || 0), 0);
  const totalViolations = rules.reduce((acc, r) => acc + (r.violationsCount || 0), 0);

  const formatCurrency = (amount: number) => {
    if (currency === 'INR') {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount.toLocaleString()}`;
  };

  const getSeverityBadge = (severity: RuleSeverity) => {
    switch (severity) {
      case 'STRICT_BLOCK':
        return {
          label: 'STRICT BLOCK',
          classes: 'bg-rose-100 text-rose-800 border-rose-200',
          desc: 'Hard-blocks vouchers until authorized',
        };
      case 'FLAG_FOR_AUDIT':
        return {
          label: 'FLAG FOR AUDIT',
          classes: 'bg-amber-100 text-amber-800 border-amber-300',
          desc: 'Routes to review queue with audit flag',
        };
      case 'WARNING_NOTIFY':
        return {
          label: 'WARNING NOTIFY',
          classes: 'bg-blue-100 text-blue-800 border-blue-200',
          desc: 'Alerts department head without blocking',
        };
      default:
        return {
          label: severity,
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
          desc: '',
        };
    }
  };

  const getCategoryLabel = (cat: RuleCategory) => {
    switch (cat) {
      case 'APPROVAL_MATRIX':
        return 'Approval Matrix';
      case 'SPEND_CEILING':
        return 'Spend Ceiling & Burn';
      case 'VENDOR_BIDDING':
        return 'Vendor Bidding Mandate';
      case 'RECEIPT_AUDIT':
        return 'Receipt & Invoice Audit';
      case 'MATERIAL_CONSUMPTION':
        return 'Material & BOQ Variance';
      case 'STATUTORY_GST_COMPLIANCE':
        return 'GST / Tax Compliance';
      case 'DISCOUNT_EARLY_PAY':
        return 'Early Settlement Discount';
      case 'HIRING_HEADCOUNT':
        return 'Headcount & CTC Freeze';
      case 'TRAVEL_ALLOWANCE':
        return 'Travel Per-Diem Grid';
      case 'ASSET_CUSTODY':
        return 'Asset & SaaS Inactivity';
      default:
        return cat;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{department.name} Governance Rules & Policy Engine</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  {activeRulesCount} / {rules.length} Rules Enforcing
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated policy gates, procurement limits, GST match requirements, and budget burn ceilings for {department.code}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onGenerateAiRules}
            disabled={isAiGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{isAiGenerating ? 'Synthesizing Rules...' : 'AI Policy Copilot'}</span>
          </button>

          <button
            onClick={onAddRule}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Rule</span>
          </button>
        </div>
      </div>

      {/* Real-time Health / Evaluation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Policy Rules
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-slate-900">{activeRulesCount}</span>
            <span className="text-xs text-slate-500 font-medium">/ {rules.length} configured</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Real-time Gate Active
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Monthly Transactions Evaluated
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-blue-700">{totalEvaluations}</span>
            <span className="text-xs text-slate-500 font-medium">checks executed</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">PO, Invoices, Requisitions</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Violations Blocked / Flagged
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-rose-700">{totalViolations}</span>
            <span className="text-xs text-slate-500 font-medium">non-compliant caught</span>
          </div>
          <p className="text-[10px] text-rose-600 font-medium mt-1">
            Saved approx {formatCurrency(totalViolations * 125000)} in leakage
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Rule Simulator
          </span>
          <button
            onClick={() => onTestRuleModal()}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors shadow-2xs"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            <span>Test Mock Voucher</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-1">Simulate real-time pass/fail</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules by code, title, or enforcement condition..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Severities</option>
            <option value="STRICT_BLOCK">Strict Block (Hard Halt)</option>
            <option value="FLAG_FOR_AUDIT">Flag for Audit</option>
            <option value="WARNING_NOTIFY">Warning Notify</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Categories</option>
            <option value="APPROVAL_MATRIX">Approval Matrix</option>
            <option value="SPEND_CEILING">Spend Ceiling</option>
            <option value="VENDOR_BIDDING">Vendor Bidding</option>
            <option value="RECEIPT_AUDIT">Receipt Audit</option>
            <option value="STATUTORY_GST_COMPLIANCE">GST Compliance</option>
            <option value="MATERIAL_CONSUMPTION">Material Consumption</option>
          </select>
        </div>
      </div>

      {/* Rules List Cards */}
      {filteredRules.length > 0 ? (
        <div className="space-y-3.5 pt-1">
          {filteredRules.map((rule) => {
            const severityBadge = getSeverityBadge(rule.severity);

            return (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  rule.enabled
                    ? 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                    : 'border-slate-200/60 bg-slate-50/70 opacity-75'
                }`}
              >
                {/* Header & Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {rule.code}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900">{rule.title}</h5>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityBadge.classes}`}
                      >
                        {severityBadge.label}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {getCategoryLabel(rule.category)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                      {rule.description}
                    </p>
                  </div>

                  {/* Toggle & Action buttons */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold ${
                          rule.enabled ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => onToggleRule(rule.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={() => onTestRuleModal(rule)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Test This Specific Rule"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditRule(rule)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit Rule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Condition and Enforcement Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Trigger Condition:
                    </span>
                    <p className="font-medium text-slate-800 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{rule.conditionDescription}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Automated Enforcement:
                    </span>
                    <p className="font-medium text-slate-800 flex items-start gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{rule.enforcementAction}</span>
                    </p>
                  </div>
                </div>

                {/* Stats Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {rule.thresholdAmount !== undefined && (
                      <span className="font-bold text-slate-800">
                        Threshold: {formatCurrency(rule.thresholdAmount)}
                      </span>
                    )}
                    {rule.thresholdPercentage !== undefined && (
                      <span className="font-bold text-slate-800">
                        Cap: {rule.thresholdPercentage}%
                      </span>
                    )}
                    {rule.assignedApproverRole && (
                      <span className="text-slate-600">
                        Escalation: <strong>{rule.assignedApproverRole.replace('_', ' ')}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span>Evaluations: <strong>{rule.evaluationCount || 0}</strong></span>
                    <span>Violations: <strong className="text-rose-600">{rule.violationsCount || 0}</strong></span>
                    {rule.lastTriggeredAt && (
                      <span>Last Triggered: {new Date(rule.lastTriggeredAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
          <ShieldAlert className="w-6 h-6 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            No rules found matching your filters
          </p>
          <p className="text-[11px] text-slate-400">
            Add a new governance rule or use the AI Policy Copilot to generate recommended guidelines.
          </p>
        </div>
      )}
    </div>
  );
};
