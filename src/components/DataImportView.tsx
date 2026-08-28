import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { Expense, CurrencyCode, ExpenseCategory } from '../types';

interface DataImportViewProps {
  onBatchImportExpenses: (items: Partial<Expense>[]) => void;
  currency: CurrencyCode;
}

const TEMPLATE_HEADERS = ['Date', 'Description', 'Vendor', 'Department', 'Category', 'Amount', 'Recurring'];

/** Minimal CSV line parser — handles the common case (no embedded commas
 * inside quoted fields is not supported, matching the simple template this
 * view provides via "Download CSV Template"). */
function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(',').map((cell) => cell.trim()));
}

function rowsToExpenses(rows: string[][]): { items: Partial<Expense>[]; skipped: number } {
  if (rows.length < 2) return { items: [], skipped: 0 };
  const headers = rows[0].map((h) => h.toLowerCase());
  const idx = (name: string) => headers.indexOf(name.toLowerCase());
  const dateIdx = idx('date');
  const descIdx = idx('description');
  const vendorIdx = idx('vendor');
  const deptIdx = idx('department');
  const categoryIdx = idx('category');
  const amountIdx = idx('amount');
  const recurringIdx = idx('recurring');

  const items: Partial<Expense>[] = [];
  let skipped = 0;

  for (const row of rows.slice(1)) {
    const description = descIdx >= 0 ? row[descIdx] : '';
    const amount = amountIdx >= 0 ? Number(row[amountIdx]) : NaN;
    if (!description || !amount || Number.isNaN(amount)) {
      skipped += 1;
      continue;
    }
    items.push({
      description,
      amount,
      date: dateIdx >= 0 ? row[dateIdx] : undefined,
      vendorName: vendorIdx >= 0 ? row[vendorIdx] : undefined,
      departmentName: deptIdx >= 0 ? row[deptIdx] : undefined,
      category: (categoryIdx >= 0 ? (row[categoryIdx] as ExpenseCategory) : undefined) || 'Office Supplies & Misc',
      recurring: (recurringIdx >= 0 ? (row[recurringIdx] as Expense['recurring']) : undefined) || 'One-Time',
    });
  }

  return { items, skipped };
}

export const DataImportView: React.FC<DataImportViewProps> = ({ onBatchImportExpenses, currency }) => {
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError('');
    setResult(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are supported right now. Download the template below for the expected format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const rows = parseCsv(text);
      const { items, skipped } = rowsToExpenses(rows);

      if (items.length === 0) {
        setError(
          'No valid rows found. Make sure the first row has headers matching the template (Description and Amount are required) and that at least one row has both filled in.'
        );
        return;
      }

      onBatchImportExpenses(items);
      setResult({ imported: items.length, skipped });
    };
    reader.onerror = () => setError('Could not read that file — please try again.');
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      TEMPLATE_HEADERS.join(',') +
      '\n2026-08-01,AWS Cloud Hosting,Amazon Web Services,Engineering,Cloud Infrastructure,450000,Monthly\n2026-08-02,Google Workspace Seats,Google Cloud,IT,Software & SaaS,180000,Annual\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'costpulse_expenses_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Import Expenses from CSV</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload a CSV of your real expense data — column headers matching the template below map automatically.
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

      <p className="text-[11px] text-slate-500">
        Expected columns: <span className="font-mono">{TEMPLATE_HEADERS.join(', ')}</span>. Only Description and
        Amount are required — everything else is optional.
      </p>

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
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
          dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-4">
          <UploadCloud className="h-7 w-7 text-slate-800" />
        </div>

        <h2 className="text-sm font-bold text-slate-900">Drag and drop your expenses CSV here, or click to browse</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          We read the file directly in your browser — nothing is uploaded until you confirm.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>
              Imported <strong>{result.imported}</strong> expense{result.imported === 1 ? '' : 's'} from your file
              {result.skipped > 0 ? ` (${result.skipped} row${result.skipped === 1 ? '' : 's'} skipped — missing description or amount)` : ''}.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
