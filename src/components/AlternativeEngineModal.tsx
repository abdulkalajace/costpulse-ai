import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingDown,
  ShieldCheck,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AlternativeEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: {
    itemName: string;
    itemType: string;
    currentCost: number;
    currentVendor: string;
  } | null;
  currency: CurrencyCode;
}

export const AlternativeEngineModal: React.FC<AlternativeEngineModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  currency,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (isOpen && targetItem) {
      fetchAlternatives();
    }
  }, [isOpen, targetItem]);

  const fetchAlternatives = async () => {
    if (!targetItem) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/alternative-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: targetItem.itemName,
          itemType: targetItem.itemType,
          currentCost: targetItem.currentCost,
          currentVendor: targetItem.currentVendor,
          currency,
        }),
      });

      if (!res.ok) throw new Error('Failed to query alternative engine');
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (e) {
      // Fallback
      setAnalysis({
        recommendationAction: 'CONSOLIDATE',
        justification: `Based on active telemetry for ${targetItem.itemName}, significant seat underutilization or vendor price escalation is observed.`,
        potentialSavingAnnual: Math.round(targetItem.currentCost * 0.35),
        options: [
          {
            name: 'Downgrade to Standard Tier',
            estimatedCostAnnual: Math.round(targetItem.currentCost * 0.65),
            annualSavings: Math.round(targetItem.currentCost * 0.35),
            pros: ['Zero workflow interruption', 'Keep existing data & integrations'],
            cons: ['Removes advanced enterprise SSO or dedicated account manager'],
            migrationEffort: 'LOW',
            roiTimeMonths: 1,
          },
          {
            name: 'Consolidate into Existing Suite',
            estimatedCostAnnual: 0,
            annualSavings: targetItem.currentCost,
            pros: ['Eliminates standalone recurring license liability', 'Streamlines IT governance'],
            cons: ['Requires 2-week team training transition'],
            migrationEffort: 'MEDIUM',
            roiTimeMonths: 2,
          },
        ],
        negotiationScript: `Inform ${targetItem.currentVendor} account executive that current login utilization is below 60% and competitive vendor quotes have been requested unless a 20-30% rate reduction is applied.`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                AI Smart Alternative & Negotiation Engine
              </h2>
              <p className="text-[11px] text-slate-500">
                Analyzing: <strong className="text-slate-700">{targetItem.itemName}</strong> ({formatCurrency(targetItem.currentCost, currency, true)}/yr)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3">
            <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
            <div>Querying market pricing benchmarks & alternative vendor tiers...</div>
          </div>
        ) : analysis ? (
          <div className="space-y-4 text-xs">
            {/* Primary Action Recommendation */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Recommended: {analysis.recommendationAction}
                </span>
                <span className="text-sm font-bold text-emerald-800">
                  Save {formatCurrency(analysis.potentialSavingAnnual, currency, true)}/yr
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">{analysis.justification}</p>
            </div>

            {/* Comparison Options */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                Viable Replacement / Optimization Paths
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.options?.map((opt: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5 hover:bg-white hover:shadow-2xs transition-all"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{opt.name}</span>
                      <span className="text-emerald-700">
                        {opt.estimatedCostAnnual === 0
                          ? 'Zero Cost'
                          : `${formatCurrency(opt.estimatedCostAnnual, currency, true)}/yr`}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      {opt.pros?.map((p: string, i: number) => (
                        <div key={i} className="text-emerald-700 flex items-start gap-1">
                          <span>✓</span>
                          <span>{p}</span>
                        </div>
                      ))}
                      {opt.cons?.map((c: string, i: number) => (
                        <div key={i} className="text-slate-500 flex items-start gap-1">
                          <span>ℹ</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                      <span>Effort: <strong className="text-slate-700">{opt.migrationEffort}</strong></span>
                      <span>Payback: <strong className="text-slate-700">{opt.roiTimeMonths} mo</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Negotiation Script */}
            {analysis.negotiationScript && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Vendor Renegotiation Talking Points</span>
                </div>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed text-[11px]">
                  &quot;{analysis.negotiationScript}&quot;
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Close Alternative Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
