import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Building,
  ArrowRight,
  TrendingDown,
  Layers,
  Cloud,
  X,
} from 'lucide-react';
import { Company, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onComplete: (data: any) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currency,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('Nexus Cloud Solutions');
  const [industry, setIndustry] = useState('B2B SaaS & Enterprise Software');
  const [headcount, setHeadcount] = useState(250);
  const [approxSpend, setApproxSpend] = useState(65000000); // 6.5 Cr

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">5-Minute Company Cost Snapshot</h2>
              <p className="text-[11px] text-slate-500">Step {step} of 4: Setup & Baseline Telemetry</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Company Profile */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Total Full-Time Staff</label>
                <input
                  type="number"
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Approximate Spend Breakdown */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Estimated Annual Operating Expenditure ({currency})
              </label>
              <input
                type="number"
                value={approxSpend}
                onChange={(e) => setApproxSpend(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {formatCurrency(approxSpend, currency)} annual baseline
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
              <div className="font-semibold text-slate-900">Select Primary Cost Centers to Audit:</div>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-slate-900" />
                  <span>SaaS & Software Seats</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-slate-900" />
                  <span>AWS / Cloud Compute</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-slate-900" />
                  <span>Office Rent & Facilities</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-slate-900" />
                  <span>Contractors & Agencies</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <span>Run Heuristic Scan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Instant AI Scan Simulation */}
        {step === 3 && (
          <div className="space-y-5 text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 animate-pulse">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Analyzing spend structure against industry benchmarks...
              </h3>
              <p className="text-xs text-slate-500">
                Checking seat login telemetry, cloud reserved instances, and facility square footage.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-1.5 text-left text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Found 45 unassigned SaaS licenses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Detected 12 idle GPU instances in cloud region</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Identified 38% physical office seat vacancy</span>
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              View Generated Cost Snapshot
            </button>
          </div>
        )}

        {/* Step 4: Final Snapshot Results */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-sm">Potential Annual Recovery</span>
                <span className="text-xl font-bold text-emerald-700">
                  {formatCurrency(Math.round(approxSpend * 0.18), currency)}/yr
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                CostPulse AI surfaced ~18% in direct cost optimization without impacting headcount or operations.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  onComplete({
                    name: companyName,
                    industry,
                    size: '51-200',
                  });
                  onClose();
                }}
                className="rounded-lg bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                Launch Dashboard & Savings Center
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
