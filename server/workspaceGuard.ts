// Limits what an EMPLOYEE-role save can change in the workspace document.
// Employees may only add/edit/delete their OWN expenses and procurement
// requests while those are still pending; everything else is taken from the
// stored copy, so a crafted PUT can't approve its own claim, touch someone
// else's rows, or rewrite budgets/vendors/etc.
// ponytail: whole-document merge; goes away once entities get their own endpoints.

type Row = Record<string, any>;

function mergeOwnRows(
  stored: Row[] = [],
  incoming: Row[] = [],
  isMine: (r: Row) => boolean,
  statusKey: string,
  pendingStatus: string
): Row[] {
  const storedById = new Map(stored.map((r) => [r.id, r]));
  // Rows the employee may not change: other people's, and their own once decided.
  const locked = (r: Row) => !isMine(r) || r[statusKey] !== pendingStatus;
  const kept = stored.filter(locked);
  const editable = (Array.isArray(incoming) ? incoming : []).filter((r) => {
    if (!r || typeof r !== "object" || !isMine(r)) return false;
    const prev = storedById.get(r.id);
    return !prev || !locked(prev);
  });
  // New or still-pending rows can never self-approve.
  return [...kept, ...editable.map((r) => ({ ...r, [statusKey]: pendingStatus }))];
}

export function applyEmployeeWrite(stored: Row, incoming: Row, userId: string): Row {
  return {
    ...stored,
    expenses: mergeOwnRows(stored.expenses, incoming.expenses, (r) => r.employeeId === userId, "approvalStatus", "PENDING"),
    procurements: mergeOwnRows(stored.procurements, incoming.procurements, (r) => r.requestedById === userId, "status", "SUBMITTED"),
  };
}
