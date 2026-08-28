import React, { useState } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingDown,
  Building,
  RefreshCw,
} from 'lucide-react';
import { Company, CurrencyCode, SavingsOpportunity } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AiExecutiveReportsProps {
  company: Company;
  savings: SavingsOpportunity[];
  currency: CurrencyCode;
}

export const AiExecutiveReports: React.FC<AiExecutiveReportsProps> = ({
  company,
  savings,
  currency,
}) => {
  const [reportType, setReportType] = useState<'MONTHLY_SUMMARY' | 'BOARD_MEMO' | 'TECH_AUDIT' | 'VENDOR_NEGOTIATION'>('MONTHLY_SUMMARY');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState<string>('');

  const potentialSavings = savings.reduce((acc, s) => acc + s.estimatedSavingAnnual, 0);

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/executive-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: type,
          companyId: company.id,
          currency,
        }),
      });

      if (!res.ok) throw new Error('Report generation failed');
      const data = await res.json();
      setReportContent(data.markdown || '');
    } catch (e) {
      // Honest fallback: only figures already known to be real (from props),
      // never fabricated line items or a fake governance sign-off.
      const topOpportunities = [...savings]
        .sort((a, b) => b.estimatedSavingAnnual - a.estimatedSavingAnnual)
        .slice(0, 5);

      setReportContent(`
# EXECUTIVE COST INTELLIGENCE MEMORANDUM (${company.fiscalYear})
**Organization:** ${company.name}
**Status:** AI report generation unavailable — showing figures computed directly from your data
**Scope:** Confidential Executive Review

---

### 1. Executive Summary & Financial Trajectory
Total annualized operating spend is running at **${formatCurrency(company.totalExpensesYear, currency)}** against annual revenue of **${formatCurrency(company.annualRevenue, currency)}**.
${potentialSavings > 0
  ? `**${formatCurrency(potentialSavings, currency)}** in identified cost-cutting opportunities is currently on file.`
  : 'No cost-cutting opportunities are on file yet — run an AI audit once you have expense and subscription data.'}

### 2. Top Identified Opportunities
${topOpportunities.length > 0
  ? topOpportunities.map((s) => `* **${s.title}:** ${formatCurrency(s.estimatedSavingAnnual, currency)}/yr — ${s.problem}`).join('\n')
  : '* None on file yet.'}

### 3. Note
This is a deterministic fallback (no GEMINI_API_KEY configured, or the AI service is temporarily unavailable) — it reflects only your real recorded data, not an AI-narrated analysis or an approved board memo.
      `);
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    generateReport(reportType);
  }, [reportType, company.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Executive AI Reports & Board Briefings
            </h1>
            <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              C-Suite Export
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate audit-ready monthly summaries, investor cost memos, and supplier negotiation briefing packets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={() => generateReport(reportType)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'MONTHLY_SUMMARY', label: 'Monthly Financial Audit' },
          { id: 'BOARD_MEMO', label: 'Board of Directors Memo' },
          { id: 'TECH_AUDIT', label: 'SaaS & Cloud Waste Audit' },
          { id: 'VENDOR_NEGOTIATION', label: 'Vendor Renegotiation Playbook' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              reportType === tab.id
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Canvas */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-10 shadow-2xs max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none">
        {isGenerating ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-3">
            <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
            <div>Synthesizing data points and composing executive report...</div>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans">
            {reportContent}
          </div>
        )}
      </div>
    </div>
  );
};
