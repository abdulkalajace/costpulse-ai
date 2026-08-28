import { CurrencyCode, Subscription } from '../types';

/** Subscriptions renewing within `withinDays` days from now, soonest first.
 * Shared between the sidebar renewal badge and the SaaS view's "Renewing
 * Soon" panel so both agree on exactly the same real data. */
export function getUpcomingRenewals(subscriptions: Subscription[], withinDays: number = 30): Subscription[] {
  const now = Date.now();
  const windowMs = withinDays * 24 * 60 * 60 * 1000;
  return subscriptions
    .filter((s) => {
      const t = Date.parse(s.renewalDate);
      return !Number.isNaN(t) && t >= now && t - now <= windowMs;
    })
    .sort((a, b) => Date.parse(a.renewalDate) - Date.parse(b.renewalDate));
}

export function daysUntil(dateStr: string): number {
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return NaN;
  return Math.ceil((t - Date.now()) / (24 * 60 * 60 * 1000));
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  compact: boolean = false
): string {
  if (currency === 'INR') {
    if (compact) {
      if (Math.abs(amount) >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(amount) >= 100000) {
        return `₹${(amount / 100000).toFixed(1)} L`;
      }
      if (Math.abs(amount) >= 1000) {
        return `₹${(amount / 1000).toFixed(0)}k`;
      }
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // USD / EUR / GBP
  if (compact) {
    if (Math.abs(amount) >= 1000000) {
      return `${getCurrencySymbol(currency)}${(amount / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1000) {
      return `${getCurrencySymbol(currency)}${(amount / 1000).toFixed(0)}k`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return '₹';
  }
}

export function getConfidenceBadgeClass(confidence: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  switch (confidence) {
    case 'HIGH':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'LOW':
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'APPROVED':
    case 'REALIZED':
    case 'IMPLEMENTED':
    case 'ACTIVE':
    case 'ON_TRACK':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING':
    case 'UNDER_REVIEW':
    case 'IN_PROGRESS':
    case 'WARNING':
    case 'UNDERUTILIZED':
    case 'SUBMITTED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'REJECTED':
    case 'OVER_BUDGET':
    case 'DISPUTED':
    case 'REDUNDANT':
    case 'UNUSED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
