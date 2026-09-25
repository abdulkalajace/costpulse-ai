// Run: npx tsx src/components/HomeView.check.ts
import assert from 'node:assert/strict';
import { buildTasks } from './HomeView';

const inDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const sub = (o: Record<string, unknown>) =>
  ({ softwareName: 'X', annualCost: 12000, monthlyCost: 1000, seatsTotal: 0, seatsUsed: 0, seatsUnused: 0, ownerName: 'A', ...o }) as any;

const base = { userRole: 'CFO' as const, currency: 'INR' as const, expenses: [], procurements: [], savings: [], budgets: [] };

const tasks = buildTasks({
  ...base,
  subscriptions: [
    sub({ id: 'late', softwareName: 'Late', renewalDate: inDays(20), noticePeriodDays: 30 }), // notice missed
    sub({ id: 'calm', softwareName: 'Calm', renewalDate: inDays(50), noticePeriodDays: 10 }), // notice in 40d
    sub({ id: 'done', softwareName: 'Done', renewalDate: inDays(5), decision: 'RENEW' }), // decided: no task
    sub({ id: 'far', softwareName: 'Far', renewalDate: inDays(200), ownerName: '', seatsTotal: 10, seatsUsed: 4, seatsUnused: 6 }),
  ],
  expenses: [{ id: 'e1', amount: 500, approvalStatus: 'PENDING' }] as any,
  budgets: [{ id: 'b1', departmentName: 'Sales', fiscalQuarter: 'Q3', allocatedAmount: 100, spentAmount: 150 }] as any,
});

const ids = tasks.map((t) => t.id);
assert.ok(!ids.includes('renew-done'), 'decided renewals are not tasks');
assert.ok(!ids.includes('renew-far'), 'renewals beyond 60 days are not tasks');
assert.deepEqual(ids.slice(0, 2).sort(), ['budget-b1', 'renew-late'], 'urgent items come first');
assert.match(tasks.find((t) => t.id === 'renew-late')!.detail, /passed/);
assert.equal(tasks.find((t) => t.id === 'renew-calm')!.urgent, false);
assert.ok(ids.includes('approve-expenses') && ids.includes('unused-seats') && ids.includes('no-owner'));
assert.match(tasks.find((t) => t.id === 'unused-seats')!.detail, /7,200/); // 12000/10 * 6

const employee = buildTasks({ ...base, userRole: 'EMPLOYEE', subscriptions: [], expenses: [{ id: 'e1', amount: 1, approvalStatus: 'PENDING' }] as any });
assert.ok(!employee.some((t) => t.id === 'approve-expenses'), 'employees are not asked to approve');
console.log('HomeView.buildTasks ok');
