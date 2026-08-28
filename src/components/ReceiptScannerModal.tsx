import React, { useRef, useState } from 'react';
import { UploadCloud, Sparkles, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Expense, CurrencyCode, ExpenseCategory } from '../types';
import { Input, Select, FormField } from './ui/FormField';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onExtractedExpense: (expense: Partial<Expense>) => void;
}

interface ExtractedDraft {
  vendorName: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  description: string;
}

const CATEGORIES: ExpenseCategory[] = [
  'Software & SaaS',
  'AI Tools & Copilots',
  'Cloud Infrastructure',
  'Hardware & Devices',
  'Property & Facilities',
  'Workforce & Contractors',
  'Travel & Entertainment',
  'Marketing & Ads',
  'Utilities & Services',
  'Legal & Insurance',
  'Office Supplies & Misc',
];

const EMPTY_DRAFT: ExtractedDraft = {
  vendorName: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  category: 'Office Supplies & Misc',
  description: '',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:<mime>;base64," prefix — the API wants raw base64.
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  currency,
  onExtractedExpense,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [draft, setDraft] = useState<ExtractedDraft | null>(null);
  const [aiPowered, setAiPowered] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    setIsScanning(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/ai/categorize-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, imageMimeType: file.type || 'image/jpeg' }),
      });

      if (!res.ok) throw new Error('Receipt parsing failed');
      const data = await res.json();
      setAiPowered(Boolean(data.aiPowered));
      setDraft({
        vendorName: data.extracted?.vendorName || '',
        amount: data.extracted?.amount || 0,
        date: data.extracted?.date || EMPTY_DRAFT.date,
        category: (data.extracted?.category as ExpenseCategory) || EMPTY_DRAFT.category,
        description: data.extracted?.description || '',
      });
    } catch (e) {
      setAiPowered(false);
      setError('Could not reach the AI extraction service. You can still enter the details manually below.');
      setDraft({ ...EMPTY_DRAFT });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    if (!draft || !draft.vendorName.trim() || !draft.amount) return;

    onExtractedExpense({
      description: draft.description || draft.vendorName,
      amount: Number(draft.amount),
      vendorName: draft.vendorName.trim(),
      category: draft.category,
      date: draft.date,
    });

    reset();
    onClose();
  };

  const reset = () => {
    setDraft(null);
    setError('');
    setAiPowered(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Receipt & Invoice Extraction</h2>
              <p className="text-[11px] text-slate-500">Upload a receipt or invoice image to auto-fill an expense</p>
            </div>
          </div>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!draft ? (
          <div className="space-y-4 text-center">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-8 hover:border-emerald-500 transition-colors bg-slate-50/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-800">
                {isScanning ? 'Analyzing receipt…' : 'Click or drop a receipt/invoice image here'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                We'll extract the vendor, amount, date, and category — you'll review before it's saved.
              </p>
            </div>

            {isScanning && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Reading document…</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {aiPowered ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2 font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Extracted by AI — review before saving</span>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {error || 'AI extraction is not available right now — enter the details manually below.'}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <FormField label="Vendor Name">
                <Input
                  value={draft.vendorName}
                  onChange={(e) => setDraft({ ...draft, vendorName: e.target.value })}
                  placeholder="e.g. Amazon Web Services"
                  autoFocus
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label={`Amount (${currency})`}>
                  <Input
                    type="number"
                    min={0}
                    value={draft.amount || ''}
                    onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
                  />
                </FormField>
                <FormField label="Date">
                  <Input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="Category">
                <Select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as ExpenseCategory })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Description (optional)">
                <Input
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="e.g. Q3 cloud hosting invoice"
                />
              </FormField>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={reset}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
              >
                Scan Another
              </button>
              <button
                onClick={handleConfirm}
                disabled={!draft.vendorName.trim() || !draft.amount}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 font-semibold text-white hover:bg-emerald-700 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Add to Ledger
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
