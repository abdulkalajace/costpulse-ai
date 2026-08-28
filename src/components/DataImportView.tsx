import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import { Expense, Subscription, Asset, Vendor, CurrencyCode } from '../types';

interface DataImportViewProps {
  onBatchImportExpenses: (items: Partial<Expense>[]) => void;
  currency: CurrencyCode;
}

export const DataImportView: React.FC<DataImportViewProps> = ({
  onBatchImportExpenses,
  currency,
}) => {
  const [importType, setImportType] = useState<'EXPENSES' | 'SUBSCRIPTIONS' | 'ASSETS' | 'VENDORS'>('EXPENSES');
  const [dragActive, setDragActive] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleSimulatedImport = () => {
    // Generate simulated imported transactions
    const sampleBatch: Partial<Expense>[] = [
      {
        description: 'Datadog APM & Log Monitoring Pro',
        amount: 850000,
        category: 'Cloud Infrastructure',
        vendorName: 'Datadog Inc',
        date: '2026-08-24',
        departmentName: 'Core Platform Engineering',
        employeeName: 'Rohan Deshmukh',
        recurring: 'Annual',
        approvalStatus: 'APPROVED',
        aiAnomaly: {
          type: 'ANOMALY_SPIKE',
          severity: 'MEDIUM',
          description: 'Log ingestion increased 45% following microservice refactor',
          suggestedAction: 'Enable log sampling filter on debug logs',
        },
      },
      {
        description: 'WeWork Hotdesk Passes Q3',
        amount: 320000,
        category: 'Property & Facilities',
        vendorName: 'WeWork India',
        date: '2026-08-25',
        departmentName: 'Global Sales & Revenue',
        employeeName: 'Pooja Nair',
        recurring: 'Quarterly',
        approvalStatus: 'APPROVED',
      },
    ];

    onBatchImportExpenses(sampleBatch);
    setImportedCount(sampleBatch.length);
  };

  const handleDownloadSample = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Date,Description,Vendor,Department,Category,Amount,Recurring\n2026-08-01,AWS Cloud Hosting,Amazon Web Services,Engineering,Cloud Infrastructure,450000,Monthly\n2026-08-02,Google Workspace Seats,Google Cloud,IT,Software & SaaS,180000,Annual\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `costpulse_${importType.toLowerCase()}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Data Ingestion & CSV / ERP Connector
            </h1>
            <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Instant AI Parsing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Import ledger CSVs, bank statements, Okta/Google Workspace SSO export sheets, or QuickBooks / NetSuite dumps.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'EXPENSES', label: '1. General Ledger & Invoices' },
          { id: 'SUBSCRIPTIONS', label: '2. SaaS & Software Licenses' },
          { id: 'ASSETS', label: '3. Hardware & Asset Inventory' },
          { id: 'VENDORS', label: '4. Vendor Master Contracts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setImportType(tab.id as any);
              setImportedCount(null);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              importType === tab.id
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drag & Drop Upload Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleSimulatedImport();
        }}
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-4">
          <UploadCloud className="h-7 w-7 text-slate-800" />
        </div>

        <h2 className="text-sm font-bold text-slate-900">
          Drag and drop your {importType} CSV or Excel spreadsheet here
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
          Supports QuickBooks, NetSuite, SAP, Zoho Books, Stripe, Okta, and generic multi-column CSV formats.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleSimulatedImport}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Upload CSV File
          </button>
          <button
            onClick={handleSimulatedImport}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Load Demo Financial Batch</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {importedCount !== null && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center justify-between animate-in fade-in-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>
              Successfully ingested <strong>{importedCount} new line-items</strong> into active corporate ledger. AI anomaly scan completed.
            </span>
          </div>
          <span className="font-bold text-emerald-800">Ready</span>
        </div>
      )}
    </div>
  );
};
