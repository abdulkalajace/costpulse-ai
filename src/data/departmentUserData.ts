import {
  DepartmentUser,
  DepartmentRule,
  Department,
  UserRole,
  ApprovalTier,
  RuleCategory,
  RuleSeverity,
} from '../types';

// Preset avatar pool for avatars
const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
];

/**
 * Returns default staff users for a department based on category and name.
 */
export function generateDefaultDepartmentUsers(dept: {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
  headEmail?: string;
}): DepartmentUser[] {
  const deptId = dept.id;
  const deptName = dept.name;
  const code = dept.code;
  const headName = dept.headOfDepartment || 'Department Lead';
  const headEmail = dept.headEmail || `${dept.code.toLowerCase().replace(/[^a-z0-9]/g, '')}.lead@enterprise.io`;

  // 1. Department Head User
  const headUser: DepartmentUser = {
    id: `usr-${deptId}-head`,
    departmentId: deptId,
    departmentName: deptName,
    name: headName,
    email: headEmail,
    role: 'DEPT_HEAD',
    designation: `Head of Department (${deptName})`,
    employeeCode: `EMP-${code}-001`,
    phone: '+91 98490 12001',
    avatar: AVATAR_POOL[Math.abs(hashString(deptId + 'head')) % AVATAR_POOL.length],
    spendingLimit: 1000000, // ₹10 Lakhs limit
    approvalTier: 'TIER_3_HEAD_SIGN',
    status: 'ACTIVE',
    joinedDate: '2023-04-01',
    assignedRulesCount: 4,
    permissions: {
      canApproveExpenses: true,
      canInitiatePO: true,
      canUploadDocs: true,
      canEditWorkflows: true,
      canOverrideRules: true,
      canManageTeam: true,
    },
  };

  // 2. Senior Manager / Controller User
  const managerName = getManagerNameForDept(deptName);
  const managerUser: DepartmentUser = {
    id: `usr-${deptId}-mgr`,
    departmentId: deptId,
    departmentName: deptName,
    name: managerName,
    email: `${managerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@enterprise.io`,
    role: 'MANAGER',
    designation: getDesignationForDept(deptName, 'MANAGER'),
    employeeCode: `EMP-${code}-002`,
    phone: '+91 98490 23412',
    avatar: AVATAR_POOL[Math.abs(hashString(deptId + 'mgr')) % AVATAR_POOL.length],
    spendingLimit: 250000, // ₹2.5 Lakhs limit
    approvalTier: 'TIER_2_DEPT_APPROVER',
    status: 'ACTIVE',
    joinedDate: '2024-01-15',
    assignedRulesCount: 3,
    permissions: {
      canApproveExpenses: true,
      canInitiatePO: true,
      canUploadDocs: true,
      canEditWorkflows: true,
      canOverrideRules: false,
      canManageTeam: true,
    },
  };

  // 3. Operational Staff / Specialist User
  const officerName = getOfficerNameForDept(deptName);
  const officerUser: DepartmentUser = {
    id: `usr-${deptId}-off`,
    departmentId: deptId,
    departmentName: deptName,
    name: officerName,
    email: `${officerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@enterprise.io`,
    role: 'EMPLOYEE',
    designation: getDesignationForDept(deptName, 'OFFICER'),
    employeeCode: `EMP-${code}-003`,
    phone: '+91 98490 34567',
    avatar: AVATAR_POOL[Math.abs(hashString(deptId + 'off')) % AVATAR_POOL.length],
    spendingLimit: 25000, // ₹25k limit
    approvalTier: 'TIER_1_AUTO',
    status: 'ACTIVE',
    joinedDate: '2025-06-10',
    assignedRulesCount: 2,
    permissions: {
      canApproveExpenses: false,
      canInitiatePO: true,
      canUploadDocs: true,
      canEditWorkflows: false,
      canOverrideRules: false,
      canManageTeam: false,
    },
  };

  return [headUser, managerUser, officerUser];
}

/**
 * Returns default compliance and cost-governance rules for a department.
 */
export function generateDefaultDepartmentRules(dept: {
  id: string;
  name: string;
  code: string;
  annualBudget?: number;
}): DepartmentRule[] {
  const deptId = dept.id;
  const deptName = dept.name;
  const code = dept.code;
  const upper = deptName.toUpperCase();

  const rules: DepartmentRule[] = [];

  // Universal Rule 1: Approval Threshold Matrix
  rules.push({
    id: `rul-${deptId}-01`,
    departmentId: deptId,
    departmentName: deptName,
    code: `RUL-${code}-01`,
    title: 'Multi-Tier Purchase & Expense Approval Matrix',
    description: `Enforces tiered sign-off: Items <= ₹25k auto-approved; ₹25k-₹2.5L requires Manager; ₹2.5L-₹10L requires ${deptName} Head; > ₹10L requires CFO / Board approval.`,
    category: 'APPROVAL_MATRIX',
    severity: 'STRICT_BLOCK',
    enabled: true,
    thresholdAmount: 250000,
    conditionDescription: 'PO / Invoice amount exceeds individual authority threshold limit',
    enforcementAction: 'Blocks ERP payment voucher issuance & routes to next escalation authority',
    assignedApproverRole: 'DEPT_HEAD',
    evaluationCount: 68,
    violationsCount: 2,
    lastTriggeredAt: '2026-08-22T10:15:00Z',
    createdBy: 'System Governance Core',
    createdAt: '2026-04-01',
  });

  // Universal Rule 2: Monthly Burn & Budget Ceiling Guard
  rules.push({
    id: `rul-${deptId}-02`,
    departmentId: deptId,
    departmentName: deptName,
    code: `RUL-${code}-02`,
    title: 'Monthly Budget Burn Cap & 85% Warning Trigger',
    description: `Monitors real-time monthly department spend against allocation. Triggers proactive freeze alert when 85% burn is crossed before 25th of the month.`,
    category: 'SPEND_CEILING',
    severity: 'FLAG_FOR_AUDIT',
    enabled: true,
    thresholdPercentage: 85,
    conditionDescription: 'Cumulative month-to-date spend crosses 85% of monthly budget quota',
    enforcementAction: 'Flags all non-essential discretionary requisitions for review by CFO',
    assignedApproverRole: 'CFO',
    evaluationCount: 142,
    violationsCount: 1,
    lastTriggeredAt: '2026-08-19T16:45:00Z',
    createdBy: 'System Governance Core',
    createdAt: '2026-04-01',
  });

  // Department-Specific Rules
  if (upper.includes('ACCOUNT') || upper.includes('FINANCE') || upper.includes('AUDIT') || upper.includes('TAX')) {
    rules.push({
      id: `rul-${deptId}-03`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-03`,
      title: 'Mandatory GSTIN 2B Match & Duplicate Invoice Scrubbing',
      description: 'Requires automatic verification of supplier GSTIN against GSTR-2B portal and scrubs for duplicate invoice numbers within 90 days before clearance.',
      category: 'STATUTORY_GST_COMPLIANCE',
      severity: 'STRICT_BLOCK',
      enabled: true,
      conditionDescription: 'Invoice GSTIN not reflected in GSTR-2B or duplicate invoice number detected in ERP ledger',
      enforcementAction: 'Withholds TDS payment and flags vendor account with pending tax reconciliation',
      assignedApproverRole: 'DEPT_HEAD',
      evaluationCount: 210,
      violationsCount: 5,
      lastTriggeredAt: '2026-08-25T11:20:00Z',
      createdBy: 'Finance Audit Board',
      createdAt: '2026-04-01',
    });
    rules.push({
      id: `rul-${deptId}-04`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-04`,
      title: 'Early Settlement 2/10 Net-30 Cash Discount Optimization',
      description: 'Automatically flags all incoming vendor invoices offering 1.5% to 3% early cash discounts for fast-tracked 7-day payment batch processing.',
      category: 'DISCOUNT_EARLY_PAY',
      severity: 'WARNING_NOTIFY',
      enabled: true,
      conditionDescription: 'Vendor contract terms contain early payment discount clause',
      enforcementAction: 'Prioritizes disbursement queue and alerts treasury to capture early discount',
      assignedApproverRole: 'MANAGER',
      evaluationCount: 88,
      violationsCount: 0,
      lastTriggeredAt: '2026-08-24T09:00:00Z',
      createdBy: 'Treasury Desk',
      createdAt: '2026-04-01',
    });
  } else if (
    upper.includes('CIVIL') ||
    upper.includes('CONSTRUCTION') ||
    upper.includes('MEP') ||
    upper.includes('STRUCTURAL') ||
    upper.includes('INTERIOR') ||
    upper.includes('SAFETY')
  ) {
    rules.push({
      id: `rul-${deptId}-03`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-03`,
      title: 'Material Consumption & BOQ Deviation Limit (Max 3%)',
      description: 'Restricts site material issues (cement, rebar steel, timber, copper conduits) from exceeding BOQ structural drawings by more than 3% without variance sign-off.',
      category: 'MATERIAL_CONSUMPTION',
      severity: 'STRICT_BLOCK',
      enabled: true,
      thresholdPercentage: 3,
      conditionDescription: 'Requisition quantity exceeds BOQ estimation allowance by > 3%',
      enforcementAction: 'Locks store issue voucher and alerts Project Director & QS Lead',
      assignedApproverRole: 'DEPT_HEAD',
      evaluationCount: 175,
      violationsCount: 4,
      lastTriggeredAt: '2026-08-23T14:10:00Z',
      createdBy: 'Technical Audit Cell',
      createdAt: '2026-04-01',
    });
    rules.push({
      id: `rul-${deptId}-04`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-04`,
      title: 'Mandatory 3-Vendor Reverse Bidding for Heavy Plant & Rentals',
      description: 'Requires minimum 3 competitive bids and rate benchmarking for crane, excavator, transit mixer, and scaffolding rental contracts exceeding ₹50,000/mo.',
      category: 'VENDOR_BIDDING',
      severity: 'STRICT_BLOCK',
      enabled: true,
      thresholdAmount: 50000,
      conditionDescription: 'Equipment hire order placed without 3 competitive bids attached',
      enforcementAction: 'Blocks PO release until comparative quotation sheet is uploaded and verified',
      assignedApproverRole: 'MANAGER',
      evaluationCount: 94,
      violationsCount: 2,
      lastTriggeredAt: '2026-08-21T17:30:00Z',
      createdBy: 'Procurement Cell',
      createdAt: '2026-04-01',
    });
  } else if (upper.includes('PURCHASE') || upper.includes('PROCUREMENT') || upper.includes('STORE')) {
    rules.push({
      id: `rul-${deptId}-03`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-03`,
      title: 'Competitive Bidding & Master Rate Contract Enforcement',
      description: 'Mandates procurement through approved annual rate contracts or minimum 3 technical/commercial quotes for non-catalog items exceeding ₹1,00,000.',
      category: 'VENDOR_BIDDING',
      severity: 'STRICT_BLOCK',
      enabled: true,
      thresholdAmount: 100000,
      conditionDescription: 'PO generated without linking to valid master rate contract or 3 quotes',
      enforcementAction: 'Halts PO dispatch and notifies Commercial Head for tender review',
      assignedApproverRole: 'DEPT_HEAD',
      evaluationCount: 160,
      violationsCount: 3,
      lastTriggeredAt: '2026-08-24T15:00:00Z',
      createdBy: 'CFO Office',
      createdAt: '2026-04-01',
    });
    rules.push({
      id: `rul-${deptId}-04`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-04`,
      title: 'Dead Stock & Re-order Buffer Cap (Max 45 Days Consumption)',
      description: 'Prevents placing inventory replenishment purchase orders if existing warehouse on-hand stock exceeds 45 days of average site burn.',
      category: 'SPEND_CEILING',
      severity: 'FLAG_FOR_AUDIT',
      enabled: true,
      conditionDescription: 'Warehouse inventory level > 45 days consumption at time of PR generation',
      enforcementAction: 'Downscales requisition order quantity to optimal reorder point',
      assignedApproverRole: 'MANAGER',
      evaluationCount: 112,
      violationsCount: 1,
      lastTriggeredAt: '2026-08-20T11:45:00Z',
      createdBy: 'Inventory Control',
      createdAt: '2026-04-01',
    });
  } else if (upper.includes('HR') || upper.includes('RECRUIT') || upper.includes('ADMIN') || upper.includes('LEGAL')) {
    rules.push({
      id: `rul-${deptId}-03`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-03`,
      title: 'Headcount Budget Freeze & Salary Band Enforcement',
      description: 'Blocks new hiring offers or salary increases if the department has reached 100% of approved headcount cap or exceeds role CTC salary band.',
      category: 'HIRING_HEADCOUNT',
      severity: 'STRICT_BLOCK',
      enabled: true,
      conditionDescription: 'Job offer generated exceeding department approved headcount or CTC ceiling',
      enforcementAction: 'Withholds appointment letter generation until MD/Board sign-off',
      assignedApproverRole: 'DEPT_HEAD',
      evaluationCount: 52,
      violationsCount: 1,
      lastTriggeredAt: '2026-08-18T13:20:00Z',
      createdBy: 'HR Governance',
      createdAt: '2026-04-01',
    });
    rules.push({
      id: `rul-${deptId}-04`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-04`,
      title: 'Corporate Travel & Expense Allowance Tier Grid (Tier A/B/C)',
      description: 'Enforces per-diem hotel and transport allowance limits based on city classification. Claims exceeding grid rates require pre-travel authorization.',
      category: 'TRAVEL_ALLOWANCE',
      severity: 'FLAG_FOR_AUDIT',
      enabled: true,
      conditionDescription: 'Expense reimbursement claim exceeds per-diem city entitlement cap',
      enforcementAction: 'Deducts excess delta from claim unless pre-approved by Department Head',
      assignedApproverRole: 'MANAGER',
      evaluationCount: 95,
      violationsCount: 6,
      lastTriggeredAt: '2026-08-24T18:00:00Z',
      createdBy: 'Corporate Admin',
      createdAt: '2026-04-01',
    });
  } else if (upper.includes('IT') || upper.includes('SOFTWARE') || upper.includes('TECH') || upper.includes('SYSTEM')) {
    rules.push({
      id: `rul-${deptId}-03`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-03`,
      title: 'SaaS License Auto-Deprovisioning for Inactive Users (> 30 Days)',
      description: 'Monitors SSO and application logins; automatically reclaims or downgrades licenses for users with zero activity in 30 consecutive days.',
      category: 'ASSET_CUSTODY',
      severity: 'WARNING_NOTIFY',
      enabled: true,
      conditionDescription: 'Assigned SaaS seat inactive for >= 30 days',
      enforcementAction: 'Notifies user and deallocates license to unassigned pool for reuse',
      assignedApproverRole: 'MANAGER',
      evaluationCount: 180,
      violationsCount: 8,
      lastTriggeredAt: '2026-08-25T08:30:00Z',
      createdBy: 'FinOps Cloud Core',
      createdAt: '2026-04-01',
    });
    rules.push({
      id: `rul-${deptId}-04`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-04`,
      title: 'Cloud Compute Auto-Shutdown & Spot Instance Mandate for Staging',
      description: 'Requires all non-production development, test, and staging clusters to auto-stop during off-hours (8 PM to 8 AM) and weekends.',
      category: 'SPEND_CEILING',
      severity: 'STRICT_BLOCK',
      enabled: true,
      conditionDescription: 'Test cluster running without auto-shutdown schedule tag',
      enforcementAction: 'Auto-applies AWS/GCP instance stopping lambda and alerts DevOps lead',
      assignedApproverRole: 'DEPT_HEAD',
      evaluationCount: 320,
      violationsCount: 2,
      lastTriggeredAt: '2026-08-24T20:00:00Z',
      createdBy: 'FinOps Cloud Core',
      createdAt: '2026-04-01',
    });
  } else {
    // General Operational Rules
    rules.push({
      id: `rul-${deptId}-03`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-03`,
      title: 'Mandatory GST Tax Invoice & Proof-of-Delivery Attachment',
      description: 'Requires full GST tax invoice and digital Delivery Challan/GRN upload for all purchase orders before payment processing.',
      category: 'RECEIPT_AUDIT',
      severity: 'STRICT_BLOCK',
      enabled: true,
      conditionDescription: 'Payment requested without original tax invoice and signed delivery proof',
      enforcementAction: 'Rejects payment voucher and notifies department coordinator',
      assignedApproverRole: 'MANAGER',
      evaluationCount: 74,
      violationsCount: 2,
      lastTriggeredAt: '2026-08-21T12:00:00Z',
      createdBy: 'Internal Audit',
      createdAt: '2026-04-01',
    });
    rules.push({
      id: `rul-${deptId}-04`,
      departmentId: deptId,
      departmentName: deptName,
      code: `RUL-${code}-04`,
      title: 'Contract Renewal 45-Day Advance Notice & Rate Review',
      description: 'Triggers automatic contract renegotiation alerts 45 days prior to expiry to prevent silent auto-renewals at escalated rates.',
      category: 'VENDOR_BIDDING',
      severity: 'WARNING_NOTIFY',
      enabled: true,
      conditionDescription: 'Service contract expiry date is within 45 days',
      enforcementAction: 'Opens vendor re-tender workflow in procurement pipeline',
      assignedApproverRole: 'DEPT_HEAD',
      evaluationCount: 45,
      violationsCount: 0,
      lastTriggeredAt: '2026-08-15T09:30:00Z',
      createdBy: 'Legal & Procurement',
      createdAt: '2026-04-01',
    });
  }

  return rules;
}

/**
 * Enriches an existing department list so every department has users and rules.
 */
export function ensureDepartmentsHaveUsersAndRules(departments: Department[]): Department[] {
  return departments.map((dept) => {
    const users = dept.users && dept.users.length > 0
      ? dept.users
      : generateDefaultDepartmentUsers(dept);

    const rules = dept.rules && dept.rules.length > 0
      ? dept.rules
      : generateDefaultDepartmentRules(dept);

    return {
      ...dept,
      users,
      rules,
    };
  });
}

// Helpers for names
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function getManagerNameForDept(deptName: string): string {
  const upper = deptName.toUpperCase();
  if (upper.includes('ACCOUNT') || upper.includes('FINANCE')) return 'S. K. Somayaji';
  if (upper.includes('ADMIN')) return 'M. Ramesh Babu';
  if (upper.includes('CIVIL') || upper.includes('CONSTRUCTION')) return 'V. Satyanarayana';
  if (upper.includes('INTERIOR')) return 'Sonalika Mehra';
  if (upper.includes('PURCHASE') || upper.includes('PROCUREMENT')) return 'Harish Chandra';
  if (upper.includes('HR')) return 'Pooja Deshmukh';
  if (upper.includes('IT') || upper.includes('SOFTWARE')) return 'Naveen Balakrishnan';
  if (upper.includes('LEGAL')) return 'Adv. Madhav Rao';
  if (upper.includes('MEP')) return 'G. Venkatesh';
  if (upper.includes('SAFETY')) return 'C. Ramakrishna';
  return 'Vikramaditya Rao';
}

function getOfficerNameForDept(deptName: string): string {
  const upper = deptName.toUpperCase();
  if (upper.includes('ACCOUNT') || upper.includes('FINANCE')) return 'Deepika Patel';
  if (upper.includes('ADMIN')) return 'Kiran Kumar';
  if (upper.includes('CIVIL') || upper.includes('CONSTRUCTION')) return 'Arun Prasath';
  if (upper.includes('INTERIOR')) return 'Tarun Varma';
  if (upper.includes('PURCHASE') || upper.includes('PROCUREMENT')) return 'Rohan Gupta';
  if (upper.includes('HR')) return 'Sneha Reddy';
  if (upper.includes('IT') || upper.includes('SOFTWARE')) return 'Aditya Joshi';
  if (upper.includes('LEGAL')) return 'Ananya Trivedi';
  if (upper.includes('MEP')) return 'Murali Krishna';
  if (upper.includes('SAFETY')) return 'Devendra Naik';
  return 'Prashant Sen';
}

function getDesignationForDept(deptName: string, role: 'MANAGER' | 'OFFICER'): string {
  const upper = deptName.toUpperCase();
  if (role === 'MANAGER') {
    if (upper.includes('ACCOUNT') || upper.includes('FINANCE')) return 'Senior Finance Controller & Billing Lead';
    if (upper.includes('ADMIN')) return 'Senior Corporate Admin Manager';
    if (upper.includes('CIVIL') || upper.includes('CONSTRUCTION')) return 'Senior Project Execution Manager';
    if (upper.includes('INTERIOR')) return 'Principal Interior Project Lead';
    if (upper.includes('PURCHASE') || upper.includes('PROCUREMENT')) return 'Senior Category Procurement Manager';
    if (upper.includes('HR')) return 'Senior HR Operations Manager';
    if (upper.includes('IT') || upper.includes('SOFTWARE')) return 'Lead Cloud FinOps & Systems Engineer';
    if (upper.includes('LEGAL')) return 'Senior Legal Compliance Counsel';
    if (upper.includes('MEP')) return 'Senior MEP Engineering Lead';
    if (upper.includes('SAFETY')) return 'Chief Safety & Environmental Officer';
    return `Senior Manager (${deptName})`;
  } else {
    if (upper.includes('ACCOUNT') || upper.includes('FINANCE')) return 'Accounts Executive & GST Specialist';
    if (upper.includes('ADMIN')) return 'Facilities & Logistics Officer';
    if (upper.includes('CIVIL') || upper.includes('CONSTRUCTION')) return 'Site QS & Billing Engineer';
    if (upper.includes('INTERIOR')) return 'Interior Modular Estimator';
    if (upper.includes('PURCHASE') || upper.includes('PROCUREMENT')) return 'Procurement Executive & Buyer';
    if (upper.includes('HR')) return 'Talent Acquisition & Payroll Officer';
    if (upper.includes('IT') || upper.includes('SOFTWARE')) return 'Systems & Network Administrator';
    if (upper.includes('LEGAL')) return 'Legal Documentation Associate';
    if (upper.includes('MEP')) return 'Site MEP Quality Inspector';
    if (upper.includes('SAFETY')) return 'Site Safety Compliance Inspector';
    return `Operations Officer (${deptName})`;
  }
}
