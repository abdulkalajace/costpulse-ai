import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Layers,
  Receipt,
  Laptop,
  Store,
  TrendingDown,
  Building,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  Expense,
  Subscription,
  Asset,
  Vendor,
  SavingsOpportunity,
  PropertyLocation,
  CurrencyCode,
} from '../types';
import { formatCurrency } from '../utils/formatters';
import { NavTab } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  subscriptions: Subscription[];
  assets: Asset[];
  vendors: Vendor[];
  savings: SavingsOpportunity[];
  properties: PropertyLocation[];
  currency: CurrencyCode;
  onNavigateTab: (tab: NavTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  expenses,
  subscriptions,
  assets,
  vendors,
  savings,
  properties,
  currency,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  // Shortcut suggestions
  const suggestions = [
    'Unused software seats',
    'AWS cloud compute expenses',
    'Real estate underutilization',
    'Idle MacBook Pro laptops',
    'High spend vendors',
    'Contract renewals next 60 days',
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matched: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      type: 'SAVINGS' | 'SUBSCRIPTION' | 'EXPENSE' | 'ASSET' | 'VENDOR' | 'PROPERTY';
      tab: NavTab;
      amount?: number;
      badge?: string;
    }> = [];

    // Search Savings
    savings.forEach((s) => {
      if (
        s.title.toLowerCase().includes(q) ||
        s.problem.toLowerCase().includes(q) ||
        s.targetEntityName.toLowerCase().includes(q) ||
        (q.includes('saving') && s.estimatedSavingAnnual > 0)
      ) {
        matched.push({
          id: s.id,
          title: s.title,
          subtitle: `${s.actionType} • ${s.category} • Save ${formatCurrency(s.estimatedSavingAnnual, currency, true)}/yr`,
          category: 'Savings Opportunities',
          type: 'SAVINGS',
          tab: 'SAVINGS_CENTER',
          amount: s.estimatedSavingAnnual,
          badge: `${s.confidence} Confidence`,
        });
      }
    });

    // Search Subscriptions
    subscriptions.forEach((sub) => {
      if (
        sub.softwareName.toLowerCase().includes(q) ||
        sub.vendorName.toLowerCase().includes(q) ||
        sub.category.toLowerCase().includes(q) ||
        (q.includes('unused') && sub.seatsUnused > 0) ||
        (q.includes('redundant') && sub.status === 'REDUNDANT')
      ) {
        matched.push({
          id: sub.id,
          title: sub.softwareName,
          subtitle: `${sub.seatsUsed}/${sub.seatsTotal} seats active • ${sub.departmentName}`,
          category: 'Software & SaaS',
          type: 'SUBSCRIPTION',
          tab: 'SUBSCRIPTIONS',
          amount: sub.annualCost,
          badge: sub.status,
        });
      }
    });

    // Search Expenses
    expenses.forEach((exp) => {
      if (
        exp.description.toLowerCase().includes(q) ||
        exp.vendorName.toLowerCase().includes(q) ||
        exp.category.toLowerCase().includes(q) ||
        exp.employeeName.toLowerCase().includes(q) ||
        (q.includes('anomaly') && exp.aiAnomaly)
      ) {
        matched.push({
          id: exp.id,
          title: exp.description,
          subtitle: `${exp.date} • ${exp.departmentName} • ${exp.vendorName}`,
          category: 'Expenses & Transactions',
          type: 'EXPENSE',
          tab: 'EXPENSES',
          amount: exp.amount,
          badge: exp.aiAnomaly ? 'AI Flagged' : undefined,
        });
      }
    });

    // Search Assets
    assets.forEach((ast) => {
      if (
        ast.name.toLowerCase().includes(q) ||
        ast.serialNumber.toLowerCase().includes(q) ||
        ast.location.toLowerCase().includes(q) ||
        (q.includes('idle') && (ast.status === 'IDLE' || ast.utilizationScore < 30))
      ) {
        matched.push({
          id: ast.id,
          title: ast.name,
          subtitle: `Location: ${ast.location} • Utilization: ${ast.utilizationScore}%`,
          category: 'Physical & Digital Assets',
          type: 'ASSET',
          tab: 'ASSETS',
          amount: ast.purchasePrice,
          badge: ast.status,
        });
      }
    });

    // Search Vendors
    vendors.forEach((v) => {
      if (
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.departmentName.toLowerCase().includes(q)
      ) {
        matched.push({
          id: v.id,
          title: v.name,
          subtitle: `${v.category} • Renewal: ${v.contractRenewalDate}`,
          category: 'Vendors & Contracts',
          type: 'VENDOR',
          tab: 'VENDORS',
          amount: v.totalSpendAnnual,
          badge: `${v.priceChangePercent12m > 0 ? '+' : ''}${v.priceChangePercent12m}% YoY`,
        });
      }
    });

    // Search Properties
    properties.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)) {
        matched.push({
          id: p.id,
          title: p.name,
          subtitle: `${p.city} • ${p.areaSqFt.toLocaleString()} sqft • ${p.occupancySeats}/${p.capacitySeats} seats occupied (${p.utilizationRate}%)`,
          category: 'Real Estate & Facilities',
          type: 'PROPERTY',
          tab: 'PROPERTY',
          amount: p.rentAnnual,
          badge: p.utilizationRate < 50 ? 'Underutilized' : 'Active',
        });
      }
    });

    return matched.slice(0, 10);
  }, [query, savings, subscriptions, expenses, assets, vendors, properties, currency]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-16 backdrop-blur-xs">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search costs, unused licenses, assets, vendors, sublease opportunities..."
            className="w-full bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="rounded p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
              ESC
            </kbd>
          )}
        </div>

        {/* Search Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {query.trim() === '' ? (
            <div className="space-y-3 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Suggested Cost Intelligence Queries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(sug)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching financial records found for &quot;{query}&quot;. Try searching for vendor names, categories, or &quot;unused&quot;.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Search Results ({results.length})
              </div>
              {results.map((item) => {
                const getIcon = () => {
                  switch (item.type) {
                    case 'SAVINGS':
                      return <TrendingDown className="h-4 w-4 text-emerald-600" />;
                    case 'SUBSCRIPTION':
                      return <Layers className="h-4 w-4 text-indigo-600" />;
                    case 'EXPENSE':
                      return <Receipt className="h-4 w-4 text-amber-600" />;
                    case 'ASSET':
                      return <Laptop className="h-4 w-4 text-cyan-600" />;
                    case 'VENDOR':
                      return <Store className="h-4 w-4 text-purple-600" />;
                    case 'PROPERTY':
                      return <Building className="h-4 w-4 text-rose-600" />;
                  }
                };

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigateTab(item.tab);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left hover:bg-slate-100/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200/80">
                        {getIcon()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-xs text-slate-900 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{item.subtitle}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                      {item.amount !== undefined && (
                        <span className="text-xs font-semibold text-slate-800">
                          {formatCurrency(item.amount, currency, true)}
                        </span>
                      )}
                      {item.badge && (
                        <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-400">
          <span>Search naturally across expenses, contracts, assets, and properties</span>
          <button
            onClick={onClose}
            className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
