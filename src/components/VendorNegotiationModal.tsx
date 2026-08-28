import React, { useState } from 'react';
import {
  Zap,
  Copy,
  Check,
  X,
  Scale,
  ShieldCheck,
  Building,
  DollarSign,
  TrendingDown,
  FileCheck2,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Vendor, CurrencyCode, Company } from '../types';
import { formatCurrency } from '../utils/formatters';

interface VendorNegotiationModalProps {
  vendorName: string;
  annualSpend: number;
  currency: CurrencyCode;
  company: Company;
  category?: string;
  onClose: () => void;
}

export const VendorNegotiationModal: React.FC<VendorNegotiationModalProps> = ({
  vendorName,
  annualSpend,
  currency,
  company,
  category = 'Enterprise Services',
  onClose,
}) => {
  const [discountGoal, setDiscountGoal] = useState<number>(15);
  const [leverageStrategy, setLeverageStrategy] = useState<'VOLUME_DISCOUNT' | 'MULTI_YEAR' | 'BENCHMARK_COMPETITOR' | 'GROUP_CONSOLIDATION'>('GROUP_CONSOLIDATION');
  const [copied, setCopied] = useState<boolean>(false);

  const targetSpend = Math.round(annualSpend * (1 - discountGoal / 100));
  const estimatedSavings = annualSpend - targetSpend;

  // Generate dynamic email text based on selected strategy
  const getEmailContent = () => {
    switch (leverageStrategy) {
      case 'GROUP_CONSOLIDATION':
        return `Subject: Master Service Agreement & Consolidated Group Volume Tier - ${company.name} / ${vendorName}

Dear ${vendorName} Enterprise Accounts Team,

We are conducting an annual vendor portfolio consolidation across Skandhanshi Group's 5 operating entities (Infra Projects, Interius Luxury Interiors, Desi Nutri Agro Foods, Wellness, and Horizon Living).

Our group-wide annual billing with ${vendorName} currently stands at ${formatCurrency(annualSpend, currency)}. Under our central procurement framework, we require a unified Master SLA with a ${discountGoal}% group tier adjustment (Target: ${formatCurrency(targetSpend, currency)}/annum) or standardized volume rebates.

In return, we are prepared to designate ${vendorName} as the exclusive Tier-1 preferred provider across all our current and upcoming subsidiaries in Andhra Pradesh, Telangana, and Karnataka.

Could we schedule a 15-minute executive sync this Thursday to formalize this agreement?

Sincerely,
Central Procurement & Finance Directorate
${company.name} Holdings
Direct: treasury@skandhanshigroup.com`;

      case 'BENCHMARK_COMPETITOR':
        return `Subject: Commercial Contract Review & Market Benchmark Alignment - ${vendorName}

Dear ${vendorName} Account Management,

As part of our Q3 SaaS and vendor optimization audit at ${company.name}, our financial analytics team reviewed current contract pricing for ${category}.

Our market intelligence benchmarks indicate that equivalent enterprise tiers are currently trading at ${formatCurrency(targetSpend, currency)} (${discountGoal}% below our current billing of ${formatCurrency(annualSpend, currency)}).

We strongly value our working relationship with ${vendorName}, but to maintain our current deployment without initiating a formal RFP for alternative market solutions, we request an alignment to ${formatCurrency(targetSpend, currency)} effective next renewal.

Please let us know if your executive commercial team can approve this revised schedule.

Best regards,
Procurement & Treasury Team
${company.name}`;

      case 'MULTI_YEAR':
        return `Subject: Proposal for 3-Year Upfront Commitment in Exchange for Strategic Discount - ${vendorName}

Dear ${vendorName} Commercial Director,

We are currently budgeting our multi-year operational plan at ${company.name}. Rather than renewing on a standard annual basis (${formatCurrency(annualSpend, currency)}/yr), our leadership is authorized to enter a 3-Year Fixed Enterprise Commitment.

In exchange for this long-term revenue lock-in, we require a ${discountGoal}% annual rate concession, fixing our annual billing at ${formatCurrency(targetSpend, currency)}/yr with zero indexation cap for the 36-month term.

Please advise if we can execute this 3-year agreement prior to end of month.

Warm regards,
Office of the CFO
${company.name}`;

      case 'VOLUME_DISCOUNT':
      default:
        return `Subject: Seat Tier Rationalization & Volume Tier Discount Request - ${vendorName}

Dear ${vendorName} Customer Success Team,

We are reviewing our active user footprint for ${vendorName} across ${company.name}. We are currently billing ${formatCurrency(annualSpend, currency)} per year.

We plan to expand our deployment, but need to restructure our rate card to an adjusted volume tier reflecting a ${discountGoal}% discount (${formatCurrency(targetSpend, currency)}/yr target).

Please provide an updated order form reflecting these revised volume brackets.

Best regards,
IT & Procurement Directorate
${company.name}`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmailContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-800">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                AI Negotiation Dossier & Script Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{vendorName}</h2>
            <p className="text-xs text-slate-500">
              Current Annual Spend: <strong className="text-slate-900">{formatCurrency(annualSpend, currency)}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strategy Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 block">Select Negotiation Leverage Angle:</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setLeverageStrategy('GROUP_CONSOLIDATION')}
              className={`p-3 rounded-xl border text-left transition-all ${
                leverageStrategy === 'GROUP_CONSOLIDATION'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold block">🏢 Group-Wide Master SLA</span>
              <span className="text-[11px] text-slate-500">Leverage 5 subsidiaries for bulk volume power</span>
            </button>

            <button
              onClick={() => setLeverageStrategy('BENCHMARK_COMPETITOR')}
              className={`p-3 rounded-xl border text-left transition-all ${
                leverageStrategy === 'BENCHMARK_COMPETITOR'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold block">⚖️ Peer Market Benchmark</span>
              <span className="text-[11px] text-slate-500">Cite industry pricing data and competitor RFP threat</span>
            </button>

            <button
              onClick={() => setLeverageStrategy('MULTI_YEAR')}
              className={`p-3 rounded-xl border text-left transition-all ${
                leverageStrategy === 'MULTI_YEAR'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold block">🔒 3-Year Upfront Commitment</span>
              <span className="text-[11px] text-slate-500">Trade long-term contract lock for 15-25% discount</span>
            </button>

            <button
              onClick={() => setLeverageStrategy('VOLUME_DISCOUNT')}
              className={`p-3 rounded-xl border text-left transition-all ${
                leverageStrategy === 'VOLUME_DISCOUNT'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold block">📊 Tier Rationalization</span>
              <span className="text-[11px] text-slate-500">Trim inactive seats and restructure bracket</span>
            </button>
          </div>
        </div>

        {/* Target Savings Metric Bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">Target Concession:</span>
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
              {[10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscountGoal(pct)}
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    discountGoal === pct ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Projected Annual Savings</span>
            <span className="font-bold text-emerald-700 text-sm">
              {formatCurrency(estimatedSavings, currency)}/yr
            </span>
          </div>
        </div>

        {/* Script Output Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Customized Executive Negotiation Script</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Ready-to-Send Email</span>
                </>
              )}
            </button>
          </div>
          <textarea
            readOnly
            rows={9}
            value={getEmailContent()}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-800 leading-relaxed focus:outline-none select-all"
          />
        </div>
      </div>
    </div>
  );
};
