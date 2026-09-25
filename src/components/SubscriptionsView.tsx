import React, { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ArrowLeftRight } from 'lucide-react';
import { Subscription, CurrencyCode, UserRole } from '../types';
import { formatCurrency, daysUntil } from '../utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  currency: CurrencyCode;
  userRole: UserRole;
  departments?: { name: string }[];
  onAddSubscription: (sub: Partial<Subscription>) => void;
  onUpdateSubscription?: (id: string, updates: Partial<Subscription>) => void;
  onDeleteSubscription?: (id: string) => void;
  onOpenAlternativeEngine: (item: { itemName: string; itemType: string; currentCost: number; currentVendor: string }) => void;
}

type View = 'ALL' | 'DECIDE' | 'NO_OWNER' | 'UNUSED';
type Decision = NonNullable<Subscription['decision']>;

const CATEGORIES = ['AI Tools & Copilots', 'Productivity & Collaboration', 'CRM & Sales', 'Analytics & Data', 'Customer Support', 'Design & UI/UX', 'Finance & Accounting', 'Engineering & DevOps', 'Other'];
const DECISIONS: { value: Decision; label: string }[] = [
  { value: 'RENEW', label: 'Renew' },
  { value: 'RENEGOTIATE', label: 'Renegotiate' },
  { value: 'CANCEL', label: 'Cancel' },
];
const DECIDE_WINDOW_DAYS = 60;
const selectClass = 'h-7 w-full border border-input bg-input/20 px-2 text-xs outline-none focus-visible:border-ring';

/** Last day you can still tell the vendor you're cancelling/changing. */
export function noticeBy(sub: Subscription): string {
  if (!sub.renewalDate || !sub.noticePeriodDays) return sub.renewalDate;
  const d = new Date(sub.renewalDate);
  if (Number.isNaN(d.getTime())) return sub.renewalDate;
  d.setDate(d.getDate() - sub.noticePeriodDays);
  return d.toISOString().slice(0, 10);
}

/** Renewal is coming up and nobody has decided what to do about it. */
export const needsDecision = (s: Subscription) => {
  const d = daysUntil(s.renewalDate);
  return !s.decision && d >= 0 && d <= DECIDE_WINDOW_DAYS;
};

/** Undecided and the notice deadline is within a week, or already missed. */
const isUrgent = (s: Subscription) => needsDecision(s) && !!s.noticePeriodDays && daysUntil(noticeBy(s)) <= 7;

const formatDate = (iso: string) =>
  iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function relative(iso: string) {
  const d = daysUntil(iso);
  if (Number.isNaN(d)) return '';
  if (d === 0) return 'today';
  return d > 0 ? `in ${d}d` : `${-d}d ago`;
}

// Form values are strings so empty fields stay empty instead of becoming 0.
const emptyForm = {
  softwareName: '', vendorName: '', planName: '', ownerName: '', departmentName: '',
  category: CATEGORIES[1], billingCycle: 'Annual' as Subscription['billingCycle'], amount: '', customCycleMonths: '1',
  renewalDate: '', noticePeriodDays: '30', seatsTotal: '', seatsUsed: '',
};
type Form = typeof emptyForm;

function toForm(s: Subscription): Form {
  const amount = s.billingCycle === 'Monthly' ? s.monthlyCost : s.billingCycle === 'Custom' ? s.monthlyCost * (s.customCycleMonths || 1) : s.annualCost;
  return {
    softwareName: s.softwareName, vendorName: s.vendorName, planName: s.planName, ownerName: s.ownerName,
    departmentName: s.departmentName, category: s.category, billingCycle: s.billingCycle, amount: String(amount),
    customCycleMonths: String(s.customCycleMonths || 1), renewalDate: s.renewalDate,
    noticePeriodDays: s.noticePeriodDays == null ? '' : String(s.noticePeriodDays),
    seatsTotal: String(s.seatsTotal || ''), seatsUsed: String(s.seatsUsed || ''),
  };
}

function fromForm(f: Form): Partial<Subscription> {
  const months = f.billingCycle === 'Monthly' ? 1 : f.billingCycle === 'Annual' ? 12 : Math.max(1, Number(f.customCycleMonths) || 1);
  const monthly = Number(f.amount) / months;
  const seatsTotal = Number(f.seatsTotal) || 0;
  const seatsUsed = Number(f.seatsUsed) || 0;
  return {
    softwareName: f.softwareName.trim(),
    vendorName: f.vendorName.trim() || f.softwareName.trim(),
    planName: f.planName.trim(),
    ownerName: f.ownerName.trim(),
    departmentName: f.departmentName || 'Unassigned',
    category: f.category,
    billingCycle: f.billingCycle,
    customCycleMonths: f.billingCycle === 'Custom' ? months : undefined,
    monthlyCost: Math.round(monthly),
    annualCost: Math.round(monthly * 12),
    renewalDate: f.renewalDate,
    noticePeriodDays: f.noticePeriodDays === '' ? undefined : Number(f.noticePeriodDays),
    seatsTotal,
    seatsUsed,
    seatsUnused: Math.max(0, seatsTotal - seatsUsed),
    status: seatsTotal > 0 && seatsUsed < seatsTotal * 0.5 ? 'UNDERUTILIZED' : 'ACTIVE',
  };
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  currency,
  userRole,
  departments = [],
  onAddSubscription,
  onUpdateSubscription,
  onDeleteSubscription,
  onOpenAlternativeEngine,
}) => {
  const [view, setView] = useState<View>('ALL');
  const [query, setQuery] = useState('');
  // Drawer shows a subscription id to view/edit, or 'NEW'. The id outlives
  // `drawerOpen` so the content doesn't blank out during the close animation.
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canManage = ['MASTER', 'MD_CEO', 'CFO', 'CTO', 'DEPT_HEAD', 'MANAGER'].includes(userRole);
  const open = openId && openId !== 'NEW' ? subscriptions.find((s) => s.id === openId) : undefined;
  const ownerSuggestions = useMemo(() => [...new Set(subscriptions.map((s) => s.ownerName).filter(Boolean))], [subscriptions]);

  const counts = {
    ALL: subscriptions.length,
    DECIDE: subscriptions.filter(needsDecision).length,
    NO_OWNER: subscriptions.filter((s) => !s.ownerName).length,
    UNUSED: subscriptions.filter((s) => s.seatsUnused > 0).length,
  };

  const rows = subscriptions
    .filter((s) =>
      view === 'DECIDE' ? needsDecision(s) : view === 'NO_OWNER' ? !s.ownerName : view === 'UNUSED' ? s.seatsUnused > 0 : true
    )
    .filter((s) => {
      const q = query.trim().toLowerCase();
      return !q || [s.softwareName, s.vendorName, s.ownerName, s.departmentName, s.category].some((v) => v?.toLowerCase().includes(q));
    })
    .sort((a, b) => (a.renewalDate || '9999').localeCompare(b.renewalDate || '9999'));

  const annualSpend = subscriptions.reduce((sum, s) => sum + s.annualCost, 0);
  const renewingSoon = subscriptions.filter((s) => {
    const d = daysUntil(s.renewalDate);
    return d >= 0 && d <= DECIDE_WINDOW_DAYS;
  });
  const unusedSeatCost = subscriptions.reduce((sum, s) => sum + (s.seatsTotal > 0 ? (s.annualCost / s.seatsTotal) * s.seatsUnused : 0), 0);

  const closeDrawer = () => setDrawerOpen(false);
  const openDrawer = (id: string) => {
    setOpenId(id);
    setEditing(id === 'NEW');
    setConfirmDelete(false);
    setDrawerOpen(true);
  };
  const openAdd = () => {
    setForm(emptyForm);
    openDrawer('NEW');
  };
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const data = fromForm(form);
    if (openId === 'NEW') onAddSubscription(data);
    else if (open) onUpdateSubscription?.(open.id, data);
    closeDrawer();
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Every recurring tool, who owns it, and what happens at renewal.</p>
        </div>
        {canManage && (
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add subscription
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 border bg-card sm:grid-cols-3 sm:divide-x">
        <Stat label="Annual spend" value={formatCurrency(annualSpend, currency)} note={`${subscriptions.length} tools`} />
        <Stat
          label={`Renewing in ${DECIDE_WINDOW_DAYS} days`}
          value={formatCurrency(renewingSoon.reduce((sum, s) => sum + s.annualCost, 0), currency)}
          note={`${renewingSoon.length} tools`}
        />
        <Stat
          label="Paid for, unused seats"
          value={`${formatCurrency(Math.round(unusedSeatCost), currency)}/yr`}
          note={`${subscriptions.reduce((sum, s) => sum + s.seatsUnused, 0)} seats`}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList>
            <TabsTrigger value="ALL">All {counts.ALL}</TabsTrigger>
            <TabsTrigger value="DECIDE">Needs decision {counts.DECIDE}</TabsTrigger>
            <TabsTrigger value="NO_OWNER">No owner {counts.NO_OWNER}</TabsTrigger>
            <TabsTrigger value="UNUSED">Unused seats {counts.UNUSED}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools, owners, teams" className="pl-7" />
        </div>
      </div>

      <div className="overflow-x-auto border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Tool</th>
              <th className="px-4 py-2.5 font-medium">Owner</th>
              <th className="px-4 py-2.5 text-right font-medium">Per month</th>
              <th className="px-4 py-2.5 font-medium">Renews</th>
              <th className="px-4 py-2.5 font-medium">Notice by</th>
              <th className="px-4 py-2.5 text-right font-medium">Seats used</th>
              <th className="px-4 py-2.5 font-medium">Decision</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {subscriptions.length === 0 ? (
                    <div className="space-y-3">
                      <p>No subscriptions yet. Add the tools you pay for to see renewals, owners and unused seats.</p>
                      {canManage && <Button variant="outline" onClick={openAdd}>Add your first subscription</Button>}
                    </div>
                  ) : view === 'ALL' ? (
                    'Nothing matches your search.'
                  ) : (
                    'Nothing here. You’re all caught up.'
                  )}
                </td>
              </tr>
            )}
            {rows.map((s) => {
              const notice = noticeBy(s);
              const urgent = isUrgent(s);
              return (
                <tr
                  key={s.id}
                  tabIndex={0}
                  onClick={() => openDrawer(s.id)}
                  onKeyDown={(e) => e.key === 'Enter' && openDrawer(s.id)}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{s.softwareName}</div>
                    <div className="text-xs text-muted-foreground">{[s.vendorName !== s.softwareName && s.vendorName, s.planName].filter(Boolean).join(' · ') || s.category}</div>
                  </td>
                  <td className="px-4 py-3">{s.ownerName || <span className="text-muted-foreground">No owner</span>}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(s.monthlyCost, currency)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(s.renewalDate)}
                    <span className="ml-1.5 text-xs text-muted-foreground">{relative(s.renewalDate)}</span>
                  </td>
                  <td className={cn('px-4 py-3 whitespace-nowrap', urgent && 'font-medium text-destructive')}>
                    {s.noticePeriodDays ? formatDate(notice) : <span className="text-muted-foreground">—</span>}
                    {urgent && daysUntil(notice) < 0 && <span className="ml-1.5 text-xs">missed</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {s.seatsTotal > 0 ? `${s.seatsUsed} / ${s.seatsTotal}` : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {s.decision ? (
                      <Badge variant={s.decision === 'CANCEL' ? 'destructive' : 'outline'}>{DECISIONS.find((d) => d.value === s.decision)?.label}</Badge>
                    ) : needsDecision(s) ? (
                      <span className={cn('text-xs', urgent ? 'text-destructive' : 'text-foreground')}>Needs decision</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <datalist id="owner-suggestions">
        {ownerSuggestions.map((n) => <option key={n} value={n} />)}
      </datalist>

      <Sheet open={drawerOpen} onOpenChange={(o) => !o && closeDrawer()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {editing ? (
            <form onSubmit={save} className="flex min-h-full flex-col">
              <SheetHeader>
                <SheetTitle>{openId === 'NEW' ? 'Add subscription' : `Edit ${open?.softwareName}`}</SheetTitle>
                <SheetDescription>Cost is what you pay each billing cycle; we work out the monthly and yearly figures.</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 px-4">
                <Field label="Tool name" className="col-span-2">
                  <Input required value={form.softwareName} onChange={set('softwareName')} placeholder="e.g. Notion" />
                </Field>
                <Field label="Vendor">
                  <Input value={form.vendorName} onChange={set('vendorName')} placeholder="Same as tool" />
                </Field>
                <Field label="Plan">
                  <Input value={form.planName} onChange={set('planName')} placeholder="e.g. Business" />
                </Field>
                <Field label="Owner">
                  <Input value={form.ownerName} onChange={set('ownerName')} list="owner-suggestions" placeholder="Who answers for it" />
                </Field>
                <Field label="Team">
                  {departments.length > 0 ? (
                    <select value={form.departmentName} onChange={set('departmentName')} className={selectClass}>
                      <option value="">Unassigned</option>
                      {departments.map((d) => <option key={d.name}>{d.name}</option>)}
                    </select>
                  ) : (
                    <Input value={form.departmentName} onChange={set('departmentName')} placeholder="e.g. Engineering" />
                  )}
                </Field>
                <Field label="Category" className="col-span-2">
                  <select value={form.category} onChange={set('category')} className={selectClass}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Billing cycle">
                  <select value={form.billingCycle} onChange={set('billingCycle')} className={selectClass}>
                    <option>Monthly</option>
                    <option>Annual</option>
                    <option value="Custom">Other</option>
                  </select>
                </Field>
                <Field label={`Cost per cycle (${currency})`}>
                  <Input required type="number" min={0} value={form.amount} onChange={set('amount')} />
                </Field>
                {form.billingCycle === 'Custom' && (
                  <Field label="Cycle length (months)" className="col-span-2">
                    <Input type="number" min={1} value={form.customCycleMonths} onChange={set('customCycleMonths')} />
                  </Field>
                )}
                <Field label="Next renewal">
                  <Input required type="date" value={form.renewalDate} onChange={set('renewalDate')} />
                </Field>
                <Field label="Notice period (days)">
                  <Input type="number" min={0} value={form.noticePeriodDays} onChange={set('noticePeriodDays')} placeholder="From the contract" />
                </Field>
                <Field label="Seats paid for">
                  <Input type="number" min={0} value={form.seatsTotal} onChange={set('seatsTotal')} />
                </Field>
                <Field label="Seats in use">
                  <Input type="number" min={0} value={form.seatsUsed} onChange={set('seatsUsed')} />
                </Field>
              </div>
              <SheetFooter className="mt-auto flex-row justify-end">
                <Button type="button" variant="outline" onClick={() => (openId === 'NEW' ? closeDrawer() : setEditing(false))}>
                  Cancel
                </Button>
                <Button type="submit">{openId === 'NEW' ? 'Add subscription' : 'Save changes'}</Button>
              </SheetFooter>
            </form>
          ) : (
            open && (
              <div className="flex min-h-full flex-col">
                <SheetHeader>
                  <SheetTitle className="text-base">{open.softwareName}</SheetTitle>
                  <SheetDescription>{[open.vendorName, open.planName, open.category].filter(Boolean).join(' · ')}</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 px-4">
                  <section className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground">Decision for next renewal</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {DECISIONS.map((d) => (
                        <Button
                          key={d.value}
                          variant={open.decision === d.value ? 'default' : 'outline'}
                          disabled={!canManage}
                          onClick={() => onUpdateSubscription?.(open.id, { decision: open.decision === d.value ? undefined : d.value })}
                        >
                          {d.label}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {open.noticePeriodDays && daysUntil(noticeBy(open)) < 0
                        ? `The notice deadline (${formatDate(noticeBy(open))}) has passed. Check the contract; you may be locked in for another term.`
                        : open.noticePeriodDays
                        ? `Tell the vendor by ${formatDate(noticeBy(open))} (${relative(noticeBy(open))}) if you're not renewing as-is.`
                        : 'Add the notice period from the contract so we can warn you before the deadline.'}
                    </p>
                  </section>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <Fact label="Per month" value={formatCurrency(open.monthlyCost, currency)} />
                    <Fact label="Per year" value={formatCurrency(open.annualCost, currency)} />
                    <Fact label="Renews" value={`${formatDate(open.renewalDate)} (${relative(open.renewalDate)})`} />
                    <Fact label="Billing" value={open.billingCycle === 'Custom' ? `Every ${open.customCycleMonths} months` : open.billingCycle} />
                    <Fact label="Seats" value={open.seatsTotal > 0 ? `${open.seatsUsed} used of ${open.seatsTotal}` : 'Not tracked'} />
                    <Fact label="Team" value={open.departmentName || 'Unassigned'} />
                  </dl>

                  <section className="space-y-2">
                    <Label htmlFor="owner-inline" className="text-xs font-medium text-muted-foreground">Owner</Label>
                    <Input
                      id="owner-inline"
                      key={open.id}
                      defaultValue={open.ownerName}
                      list="owner-suggestions"
                      placeholder="Assign someone who answers for this tool"
                      disabled={!canManage}
                      onBlur={(e) => e.target.value.trim() !== open.ownerName && onUpdateSubscription?.(open.id, { ownerName: e.target.value.trim() })}
                    />
                  </section>

                  {open.aiAlert && (
                    <section className="space-y-1 border p-3">
                      <h3 className="text-xs font-medium text-muted-foreground">
                        Possible saving: {formatCurrency(open.aiAlert.potentialSavingAnnual, currency)}/yr
                      </h3>
                      <p className="text-sm">{open.aiAlert.explanation}</p>
                      {open.aiAlert.alternativeSuggestion && <p className="text-xs text-muted-foreground">Try: {open.aiAlert.alternativeSuggestion}</p>}
                    </section>
                  )}
                </div>

                <SheetFooter className="mt-auto flex-row flex-wrap">
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={() =>
                      onOpenAlternativeEngine({ itemName: open.softwareName, itemType: 'Software & SaaS', currentCost: open.annualCost, currentVendor: open.vendorName })
                    }
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    Compare alternatives
                  </Button>
                  {canManage && (
                    <>
                      <Button variant="outline" className="gap-1.5" onClick={() => { setForm(toForm(open)); setEditing(true); }}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant={confirmDelete ? 'destructive' : 'ghost'}
                        className="ml-auto gap-1.5"
                        onClick={() => {
                          if (!confirmDelete) return setConfirmDelete(true);
                          onDeleteSubscription?.(open.id);
                          closeDrawer();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        {confirmDelete ? 'Click again to delete' : 'Delete'}
                      </Button>
                    </>
                  )}
                </SheetFooter>
              </div>
            )
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const Stat = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className="px-4 py-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{note}</div>
  </div>
);

const Field = ({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) => (
  <label className={cn('space-y-1', className)}>
    <span className="block text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </label>
);

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="text-foreground tabular-nums">{value}</dd>
  </div>
);
