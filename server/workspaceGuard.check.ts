// Run: npx tsx server/workspaceGuard.check.ts
import assert from "node:assert/strict";
import { applyEmployeeWrite } from "./workspaceGuard";

const stored = {
  budgets: [{ id: "b1", limit: 100 }],
  expenses: [
    { id: "mine-pending", employeeId: "me", amount: 10, approvalStatus: "PENDING" },
    { id: "mine-approved", employeeId: "me", amount: 20, approvalStatus: "APPROVED" },
    { id: "theirs", employeeId: "bob", amount: 30, approvalStatus: "PENDING" },
  ],
  procurements: [{ id: "p-theirs", requestedById: "bob", status: "SUBMITTED" }],
};

const out = applyEmployeeWrite(
  stored,
  {
    budgets: [{ id: "b1", limit: 999999 }], // tamper with budgets
    expenses: [
      { id: "mine-pending", employeeId: "me", amount: 15, approvalStatus: "APPROVED" }, // edit + self-approve
      { id: "mine-approved", employeeId: "me", amount: 9999, approvalStatus: "APPROVED" }, // edit decided row
      { id: "new", employeeId: "me", amount: 5, approvalStatus: "APPROVED" }, // new, self-approved
      { id: "forged", employeeId: "bob", amount: 1, approvalStatus: "PENDING" }, // on someone else's behalf
      // "theirs" omitted = attempted delete
    ],
    procurements: [{ id: "p-new", requestedById: "me", status: "CFO_APPROVED" }],
  },
  "me"
);

const byId = Object.fromEntries(out.expenses.map((e: any) => [e.id, e]));
assert.deepEqual(out.budgets, stored.budgets);
assert.equal(byId["mine-pending"].amount, 15);
assert.equal(byId["mine-pending"].approvalStatus, "PENDING");
assert.equal(byId["mine-approved"].amount, 20);
assert.equal(byId["new"].approvalStatus, "PENDING");
assert.equal(byId["forged"], undefined);
assert.ok(byId["theirs"]);
assert.deepEqual(out.procurements.map((p: any) => [p.id, p.status]), [["p-theirs", "SUBMITTED"], ["p-new", "SUBMITTED"]]);
console.log("workspaceGuard ok");
