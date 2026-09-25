import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Budget, CurrencyCode, Expense, ProcurementRequest, SavingsOpportunity, Subscription, UserRole } from '../types';
import { formatCurrency, daysUntil } from '../utils/formatters';
import { needsDecision, noticeBy } from './SubscriptionsView';
import type { NavTab } from './Sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HomeViewProps {
  userName: string;
  userRole: UserRole;
  currency: CurrencyCode;
  expenses: Expense[];
  procurements: ProcurementRequest[];
  subscriptions: Subscription[];
  savings: SavingsOpportunity[];
  budgets: Budget[];
  onNavigate: (tab: NavTab) => void;
}

interface Task {
  id: string;
  urgent?: boolean;
  title: string;
  detail: string;
  action: string;
  tab: NavTab;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** Everything that needs a person to act, most urgent first. Pure so it's easy to reason about. */
export function buildTasks(p: Omit<HomeViewProps, 'userName' | 'onNavigate'>): Task[] {
  const { currency, expenses, procurements, subscriptions, savings, budgets, userRole } = p;
  const money = (n: number) => formatCurrency(Math.round(n), currency);
  const tasks: Task[] = [];

  // 1. Renewals without a decision. Missed or near notice deadlines first.
  subscriptions
    .filter(needsDecision)
    .sort((a, b) => noticeBy(a).localeCompare(noticeBy(b)))
    .forEach((s) => {
      const noticeDays = s.noticePeriodDays ? daysUntil(noticeBy(s)) : NaN;
      const renews = daysUntil(s.renewalDate);
      const urgent = noticeDays <= 7;
      tasks.push({
        id: `renew-${s.id}`,
        urgent,
        title: `${s.softwareName} renews ${renews === 0 ? 'today' : `in ${plural(renews, 'day')}`}`,
        detail:
          noticeDays < 0
            ? `Notice deadline passed on ${shortDate(noticeBy(s))}. ${money(s.annualCost)}/yr may auto-renew.`
            : noticeDays >= 0
            ? `Tell the vendor by ${shortDate(noticeBy(s))} if you're changing plans. ${money(s.annualCost)}/yr.`
            : `No decision yet. ${money(s.annualCost)}/yr.`,
        action: 'Decide',
        tab: 'SUBSCRIPTIONS',
      });
    });

  // 2. Approvals waiting on someone who can approve.
  if (userRole !== 'EMPLOYEE') {
    const pendingExp = expenses.filter((e) => e.approvalStatus === 'PENDING');
    if (pendingExp.length)
      tasks.push({
        id: 'approve-expenses',
        title: `${plural(pendingExp.length, 'expense claim')} to approve`,
        detail: `${money(pendingExp.reduce((sum, e) => sum + e.amount, 0))} waiting for a decision.`,
        action: 'Review',
        tab: 'EXPENSES',
      });
    const pendingReq = procurements.filter((r) => r.status === 'SUBMITTED' || r.status === 'MANAGER_APPROVED');
    if (pendingReq.length)
      tasks.push({
        id: 'approve-requests',
        title: `${plural(pendingReq.length, 'purchase request')} to approve`,
        detail: `${money(pendingReq.reduce((sum, r) => sum + r.estimatedCost, 0))} requested.`,
        action: 'Review',
        tab: 'APPROVALS',
      });
  }

  // 3. Budgets already over.
  budgets
    .filter((b) => b.spentAmount > b.allocatedAmount)
    .forEach((b) =>
      tasks.push({
        id: `budget-${b.id}`,
        urgent: true,
        title: `${b.departmentName} is over budget`,
        detail: `${money(b.spentAmount - b.allocatedAmount)} over for ${b.fiscalQuarter}.`,
        action: 'View',
        tab: 'BUDGETS',
      })
    );

  // 4. Money leaking quietly.
  const idle = subscriptions.filter((s) => s.seatsUnused > 0 && s.seatsTotal > 0);
  if (idle.length) {
    const cost = idle.reduce((sum, s) => sum + (s.annualCost / s.seatsTotal) * s.seatsUnused, 0);
    tasks.push({
      id: 'unused-seats',
      title: `${plural(idle.reduce((sum, s) => sum + s.seatsUnused, 0), 'unused seat')} across ${plural(idle.length, 'tool')}`,
      detail: `About ${money(cost)}/yr paid for seats nobody uses.`,
      action: 'Reclaim',
      tab: 'SUBSCRIPTIONS',
    });
  }
  const noOwner = subscriptions.filter((s) => !s.ownerName);
  if (noOwner.length)
    tasks.push({
      id: 'no-owner',
      title: `${plural(noOwner.length, 'subscription')} without an owner`,
      detail: `${noOwner.slice(0, 3).map((s) => s.softwareName).join(', ')}${noOwner.length > 3 ? '…' : ''}. Someone should answer for each.`,
      action: 'Assign',
      tab: 'SUBSCRIPTIONS',
    });
  const flagged = expenses.filter((e) => e.aiAnomaly?.severity === 'HIGH');
  if (flagged.length)
    tasks.push({
      id: 'anomalies',
      title: `${plural(flagged.length, 'unusual charge')} flagged`,
      detail: flagged[0].aiAnomaly!.description,
      action: 'Check',
      tab: 'EXPENSES',
    });
  const detected = savings.filter((s) => s.status === 'DETECTED');
  if (detected.length)
    tasks.push({
      id: 'savings',
      title: `${plural(detected.length, 'saving')} to review`,
      detail: `Up to ${money(detected.reduce((sum, s) => sum + s.estimatedSavingAnnual, 0))}/yr if acted on.`,
      action: 'Review',
      tab: 'SAVINGS_CENTER',
    });

  return tasks.sort((a, b) => Number(!!b.urgent) - Number(!!a.urgent));
}

export const HomeView: React.FC<HomeViewProps> = (props) => {
  const { userName, currency, expenses, subscriptions, savings, onNavigate } = props;
  const tasks = buildTasks(props);

  const month = new Date().toISOString().slice(0, 7);
  const spendThisMonth = expenses.filter((e) => e.date?.startsWith(month)).reduce((sum, e) => sum + e.amount, 0);
  const recurring = subscriptions.reduce((sum, s) => sum + s.monthlyCost, 0);
  const saved = savings.reduce((sum, s) => sum + (s.actualSavingConfirmed || 0), 0);
  const upcoming = subscriptions
    .filter((s) => {
      const d = daysUntil(s.renewalDate);
      return d >= 0 && d <= 30;
    })
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const isEmpty = expenses.length === 0 && subscriptions.length === 0;

  const setup = [
    { done: subscriptions.length > 0, label: 'Add the tools you pay for', hint: 'Renewals, owners and unused seats start from here.', tab: 'SUBSCRIPTIONS' as NavTab },
    { done: expenses.length > 0, label: 'Import a bank or card statement', hint: 'A CSV export from your bank is enough.', tab: 'IMPORT' as NavTab },
    { done: subscriptions.length > 0 && subscriptions.every((s) => s.ownerName), label: 'Give every tool an owner', hint: 'One person who answers for each cost.', tab: 'SUBSCRIPTIONS' as NavTab },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <h1 className="text-lg font-semibold text-foreground">
        {greeting}, {userName.split(' ')[0]}
      </h1>

      <div className="grid grid-cols-1 border bg-card sm:grid-cols-3 sm:divide-x">
        <Stat label="Spent this month" value={formatCurrency(spendThisMonth, currency)} />
        <Stat label="Recurring per month" value={formatCurrency(recurring, currency)} />
        <Stat label="Savings confirmed" value={formatCurrency(saved, currency)} />
      </div>

      {!setup.every((step) => step.done) && (
        <section className="border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-medium">Get set up</h2>
            <p className="text-xs text-muted-foreground">{setup.filter((step) => step.done).length} of {setup.length} done. After this, CostPulse tells you what needs attention.</p>
          </div>
          {setup.map((step) => (
            <Row key={step.label} onClick={() => onNavigate(step.tab)} action={step.done ? 'Done' : 'Start'} muted={step.done}>
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center border', step.done && 'border-primary bg-primary text-primary-foreground')}>
                {step.done && <Check className="h-3 w-3" />}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-xs text-muted-foreground">{step.hint}</div>
              </div>
            </Row>
          ))}
        </section>
      )}

      {!isEmpty && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="border bg-card">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-medium">
                Needs you {tasks.length > 0 && <span className="text-muted-foreground">({tasks.length})</span>}
              </h2>
            </div>
            {tasks.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">You're all caught up.</p>
            ) : (
              tasks.map((t) => (
                <Row key={t.id} onClick={() => onNavigate(t.tab)} action={t.action}>
                  <span className={cn('h-2 w-2 shrink-0', t.urgent ? 'bg-destructive' : 'bg-muted-foreground/40')} aria-hidden />
                  <div className="min-w-0">
                    <div className={cn('text-sm font-medium', t.urgent && 'text-destructive')}>{t.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{t.detail}</div>
                  </div>
                </Row>
              ))
            )}
          </section>

          <section className="h-fit border bg-card">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-medium">Renewing in 30 days</h2>
            </div>
            {upcoming.length === 0 ? (
              <p className="px-4 py-6 text-xs text-muted-foreground">Nothing renews in the next 30 days.</p>
            ) : (
              <ul>
                {upcoming.map((s) => (
                  <li key={s.id} className="flex items-baseline justify-between gap-2 border-b px-4 py-2.5 text-sm last:border-0">
                    <span className="truncate">{s.softwareName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {shortDate(s.renewalDate)} · {formatCurrency(s.annualCost, currency, true)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="px-4 py-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</div>
  </div>
);

const Row: React.FC<{ children: React.ReactNode; action: string; onClick: () => void; muted?: boolean }> = ({ children, action, onClick, muted }) => (
  <div className={cn('flex items-center justify-between gap-4 border-b px-4 py-3 last:border-0', muted && 'opacity-60')}>
    <div className="flex min-w-0 items-center gap-3">{children}</div>
    <Button variant="outline" size="sm" onClick={onClick} className="shrink-0 gap-1">
      {action}
      <ArrowRight className="h-3.5 w-3.5" />
    </Button>
  </div>
);
