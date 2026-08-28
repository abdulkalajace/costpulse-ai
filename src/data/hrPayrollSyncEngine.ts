import {
  Department,
  DepartmentUser,
  UserRole,
  ApprovalTier,
  DepartmentUserPermissions,
} from '../types';

export interface HrProviderInfo {
  id: string;
  name: string;
  vendor: string;
  logoColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const HR_PROVIDERS: HrProviderInfo[] = [
  {
    id: 'keka',
    name: 'Keka HR & Payroll',
    vendor: 'Keka Technologies',
    logoColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-700',
    description: 'Syncs full organizational hierarchy, employee bands, salary payroll runs, and reporting lines in real time.',
    features: ['Real-time Webhook', 'Org Hierarchy Trees', 'Payroll Run Allocations', 'Indian Statutory Compliant'],
    popular: true,
  },
  {
    id: 'darwinbox',
    name: 'Darwinbox HRMS',
    vendor: 'Darwinbox Enterprise',
    logoColor: 'text-purple-600',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-700',
    description: 'Enterprise HRMS sync with multi-tier management reporting chains, site transfer logs, and expense allowance bands.',
    features: ['Enterprise Band Mapping', 'Multi-level Reporting', 'Allowance Limits', 'Biometrics & Attendance'],
    popular: true,
  },
  {
    id: 'zoho_people',
    name: 'Zoho People & Payroll',
    vendor: 'Zoho Corporation',
    logoColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-700',
    description: 'Seamlessly fetches employee master directories, job roles, reporting managers, and department designations.',
    features: ['Direct REST API', 'Role-Based Access Mapping', 'Salary Components', 'One-Click Auto Pull'],
    popular: true,
  },
  {
    id: 'greythr',
    name: 'GreytHR Payroll',
    vendor: 'Greytip Software',
    logoColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
    description: 'Specialized for Indian construction, manufacturing & tech enterprise payroll, ESIC/PF brackets, and site rosters.',
    features: ['Contractor & Permanent Roster', 'Discretionary Limit Sync', 'TDS & Form 16 Mappings'],
    popular: true,
  },
  {
    id: 'adp',
    name: 'ADP Workforce Now',
    vendor: 'ADP Inc.',
    logoColor: 'text-rose-600',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-700',
    description: 'Global workforce hierarchy synchronization with executive governance approval limits and compensation bands.',
    features: ['Global Compensation Bands', 'C-Suite Approval Rules', 'Compliance Audits', 'OAuth2 Sync'],
  },
  {
    id: 'razorpayx',
    name: 'RazorpayX Payroll',
    vendor: 'Razorpay Software',
    logoColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-700',
    description: 'Automated salary disbursements, contractor invoicing rosters, and direct reimbursement ceilings.',
    features: ['Instant Direct Payouts', 'Contractor Invoicing Roster', 'Expense Auto-Reimburse'],
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    vendor: 'BambooHR LLC',
    logoColor: 'text-green-600',
    badgeBg: 'bg-green-50 border-green-200',
    badgeText: 'text-green-700',
    description: 'Cloud HR directory sync with automated org chart builder and department hierarchy levels.',
    features: ['Org Chart Visualizer', 'Custom Fields Sync', 'Time-off Tracking'],
  },
  {
    id: 'workday',
    name: 'Workday HCM',
    vendor: 'Workday, Inc.',
    logoColor: 'text-sky-600',
    badgeBg: 'bg-sky-50 border-sky-200',
    badgeText: 'text-sky-700',
    description: 'Comprehensive enterprise workforce analytics with multi-company legal entity hierarchies and cost centers.',
    features: ['Cost Center Sync', 'Job Architecture Matrix', 'Enterprise Approval Tiers'],
  },
  {
    id: 'csv_upload',
    name: 'HR Master Sheet (CSV / Excel)',
    vendor: 'Spreadsheet Ingestion Engine',
    logoColor: 'text-teal-600',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-700',
    description: 'Upload your existing employee master dump with columns: Name, Department, Designation, Reporting Manager, Email, Salary.',
    features: ['CSV/Excel Auto-Detect', 'Fuzzy Department Match', 'Smart Hierarchy Builder', 'Bulk Import'],
    popular: true,
  },
];

// Profile Avatars Pool
const AVATARS = [
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
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Preset employee roster templates for rich hierarchy generation
interface RawEmployeeTemplate {
  name: string;
  designation: string;
  role: UserRole;
  level: number; // 1 = Head, 2 = Manager, 3 = Lead/Specialist, 4 = Officer/Associate
  band: string;
  spendingLimit: number;
  approvalTier: ApprovalTier;
  salaryAnnual: number;
  permissions: DepartmentUserPermissions;
}

/**
 * Returns tailored hierarchy templates for various department archetypes
 */
function getDepartmentHierarchyArchetype(deptName: string, deptCode: string): RawEmployeeTemplate[] {
  const upper = deptName.toUpperCase();

  // 1. Accounts & Finance
  if (upper.includes('ACCOUNT') || upper.includes('FINANCE') || upper.includes('AUDIT') || upper.includes('TAX')) {
    return [
      {
        name: 'Ramesh Sundaram',
        designation: 'Chief Financial Controller & VP Finance',
        role: 'DEPT_HEAD',
        level: 1,
        band: 'L1 - Director / VP',
        spendingLimit: 2500000,
        approvalTier: 'TIER_3_HEAD_SIGN',
        salaryAnnual: 3600000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: true, canManageTeam: true },
      },
      {
        name: 'Pooja Deshmukh',
        designation: 'Senior Manager - Statutory Audit & Treasury',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Senior Manager',
        spendingLimit: 500000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 1800000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: false, canManageTeam: true },
      },
      {
        name: 'Vikram Joshi',
        designation: 'Manager - Accounts Payable & Vendor Ledgers',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Manager',
        spendingLimit: 250000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 1400000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Deepa Narayanan',
        designation: 'Senior GST & Direct Tax Specialist',
        role: 'EMPLOYEE',
        level: 3,
        band: 'L3 - Senior Specialist',
        spendingLimit: 75000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 950000,
        permissions: { canApproveExpenses: false, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Ankit Tiwari',
        designation: 'Accounts Officer - Bank Reconciliation & Voucher Audit',
        role: 'EMPLOYEE',
        level: 4,
        band: 'L4 - Executive',
        spendingLimit: 25000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 600000,
        permissions: { canApproveExpenses: false, canInitiatePO: false, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
    ];
  }

  // 2. Construction Execution & Site Works
  if (upper.includes('CONSTRUCT') || upper.includes('EXECUTION') || upper.includes('CIVIL') || upper.includes('STRUCT')) {
    return [
      {
        name: 'Suresh Varma',
        designation: 'Chief Project Officer & Execution VP',
        role: 'DEPT_HEAD',
        level: 1,
        band: 'L1 - Director / VP',
        spendingLimit: 5000000,
        approvalTier: 'TIER_3_HEAD_SIGN',
        salaryAnnual: 4200000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: true, canManageTeam: true },
      },
      {
        name: 'Anand Kulkarni',
        designation: 'Senior Project Manager - High-Rise Structures',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Senior Manager',
        spendingLimit: 1000000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 2200000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: false, canManageTeam: true },
      },
      {
        name: 'Rahul Nair',
        designation: 'Project Lead - Concrete Pours & Steel Quality',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Project Lead',
        spendingLimit: 500000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 1600000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Manish Verma',
        designation: 'Senior Site Civil Engineer',
        role: 'EMPLOYEE',
        level: 3,
        band: 'L3 - Senior Engineer',
        spendingLimit: 100000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 1050000,
        permissions: { canApproveExpenses: false, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Rohit Patil',
        designation: 'Site Field Supervisor & Labor Attendance Lead',
        role: 'EMPLOYEE',
        level: 4,
        band: 'L4 - Field Executive',
        spendingLimit: 35000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 550000,
        permissions: { canApproveExpenses: false, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
    ];
  }

  // 3. Procurement, Supply Chain & Stores
  if (upper.includes('PROCURE') || upper.includes('STORE') || upper.includes('PURCHASE') || upper.includes('SUPPLY') || upper.includes('VENDOR')) {
    return [
      {
        name: 'Venkat Raman',
        designation: 'Head of Global Procurement & SCM',
        role: 'DEPT_HEAD',
        level: 1,
        band: 'L1 - Director / VP',
        spendingLimit: 4000000,
        approvalTier: 'TIER_3_HEAD_SIGN',
        salaryAnnual: 3800000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: true, canManageTeam: true },
      },
      {
        name: 'Sunil Rao',
        designation: 'Senior Sourcing Manager - Bulk Raw Materials',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Senior Manager',
        spendingLimit: 1500000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 2000000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: false, canManageTeam: true },
      },
      {
        name: 'Sneha Kapur',
        designation: 'Contract & Rate Card Negotiation Manager',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Manager',
        spendingLimit: 500000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 1500000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Arjun Mehta',
        designation: 'Purchase Officer - MEP & Electrical Consumables',
        role: 'EMPLOYEE',
        level: 3,
        band: 'L3 - Senior Buyer',
        spendingLimit: 150000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 850000,
        permissions: { canApproveExpenses: false, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Pradeep Yadav',
        designation: 'Central Yard & Store Inventory Controller',
        role: 'EMPLOYEE',
        level: 4,
        band: 'L4 - Store Officer',
        spendingLimit: 50000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 520000,
        permissions: { canApproveExpenses: false, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
    ];
  }

  // 4. IT, Digital & Technology
  if (upper.includes('IT') || upper.includes('TECH') || upper.includes('SOFTWARE') || upper.includes('DIGITAL') || upper.includes('SECURITY')) {
    return [
      {
        name: 'Vikramaditya Roy',
        designation: 'Chief Technology Officer & Head of IT',
        role: 'DEPT_HEAD',
        level: 1,
        band: 'L1 - VP / CTO',
        spendingLimit: 3000000,
        approvalTier: 'TIER_3_HEAD_SIGN',
        salaryAnnual: 4500000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: true, canManageTeam: true },
      },
      {
        name: 'Neha Chawla',
        designation: 'Director of Cloud Infrastructure & DevOps',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Senior Manager',
        spendingLimit: 800000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 2600000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: false, canManageTeam: true },
      },
      {
        name: 'Sameer Sen',
        designation: 'Lead Architect - ERP & Enterprise Integrations',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Tech Lead',
        spendingLimit: 400000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 2200000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Gaurav Ghosh',
        designation: 'Senior Cyber Security & Compliance Specialist',
        role: 'EMPLOYEE',
        level: 3,
        band: 'L3 - Senior Engineer',
        spendingLimit: 100000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 1400000,
        permissions: { canApproveExpenses: false, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Kavita Menon',
        designation: 'IT Helpdesk & Asset Provisioning Administrator',
        role: 'EMPLOYEE',
        level: 4,
        band: 'L4 - System Admin',
        spendingLimit: 40000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 650000,
        permissions: { canApproveExpenses: false, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
    ];
  }

  // 5. Sales, Marketing & Business Development
  if (upper.includes('SALE') || upper.includes('MARKET') || upper.includes('REVENUE') || upper.includes('GROWTH') || upper.includes('CRM')) {
    return [
      {
        name: 'Rajesh Singhania',
        designation: 'Chief Revenue Officer & VP Sales',
        role: 'DEPT_HEAD',
        level: 1,
        band: 'L1 - Director / VP',
        spendingLimit: 2500000,
        approvalTier: 'TIER_3_HEAD_SIGN',
        salaryAnnual: 4000000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: true, canManageTeam: true },
      },
      {
        name: 'Monika Sharma',
        designation: 'Senior Regional Sales Director - High-Value Properties',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Senior Manager',
        spendingLimit: 600000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 2400000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: false, canManageTeam: true },
      },
      {
        name: 'Kunal Kapoor',
        designation: 'Head of Channel Partner Relations & Brokerage',
        role: 'MANAGER',
        level: 2,
        band: 'L2 - Manager',
        spendingLimit: 300000,
        approvalTier: 'TIER_2_DEPT_APPROVER',
        salaryAnnual: 1700000,
        permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Priyanka Das',
        designation: 'Senior Lead Conversion & Tele-Sales Specialist',
        role: 'EMPLOYEE',
        level: 3,
        band: 'L3 - Senior Specialist',
        spendingLimit: 60000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 900000,
        permissions: { canApproveExpenses: false, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
      {
        name: 'Aditya Gupta',
        designation: 'Site Tour Guide & Relationship Executive',
        role: 'EMPLOYEE',
        level: 4,
        band: 'L4 - Sales Executive',
        spendingLimit: 25000,
        approvalTier: 'TIER_1_AUTO',
        salaryAnnual: 550000,
        permissions: { canApproveExpenses: false, canInitiatePO: false, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
      },
    ];
  }

  // 6. Generic / Default 39-Department Hierarchy Fallback
  const deptSanitized = deptName.replace(/[^a-zA-Z ]/g, '').trim();
  return [
    {
      name: `${deptSanitized} Director`,
      designation: `Head & Principal Director of ${deptName}`,
      role: 'DEPT_HEAD',
      level: 1,
      band: 'L1 - Department Head',
      spendingLimit: 1500000,
      approvalTier: 'TIER_3_HEAD_SIGN',
      salaryAnnual: 3200000,
      permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: true, canManageTeam: true },
    },
    {
      name: `${deptSanitized} Operations Manager`,
      designation: `Senior Operations Manager - ${deptName}`,
      role: 'MANAGER',
      level: 2,
      band: 'L2 - Senior Manager',
      spendingLimit: 400000,
      approvalTier: 'TIER_2_DEPT_APPROVER',
      salaryAnnual: 1800000,
      permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: true, canOverrideRules: false, canManageTeam: true },
    },
    {
      name: `${deptSanitized} Team Lead`,
      designation: `Technical Lead - ${deptName}`,
      role: 'MANAGER',
      level: 2,
      band: 'L2 - Team Lead',
      spendingLimit: 200000,
      approvalTier: 'TIER_2_DEPT_APPROVER',
      salaryAnnual: 1300000,
      permissions: { canApproveExpenses: true, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
    },
    {
      name: `${deptSanitized} Senior Specialist`,
      designation: `Senior Specialist - ${deptName}`,
      role: 'EMPLOYEE',
      level: 3,
      band: 'L3 - Senior Specialist',
      spendingLimit: 50000,
      approvalTier: 'TIER_1_AUTO',
      salaryAnnual: 850000,
      permissions: { canApproveExpenses: false, canInitiatePO: true, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
    },
    {
      name: `${deptSanitized} Associate Officer`,
      designation: `Executive Officer - ${deptName}`,
      role: 'EMPLOYEE',
      level: 4,
      band: 'L4 - Executive',
      spendingLimit: 20000,
      approvalTier: 'TIER_1_AUTO',
      salaryAnnual: 500000,
      permissions: { canApproveExpenses: false, canInitiatePO: false, canUploadDocs: true, canEditWorkflows: false, canOverrideRules: false, canManageTeam: false },
    },
  ];
}

/**
 * Builds full hierarchical users for a department synced from HR Payroll
 */
export function generateHrRosterForDepartment(
  dept: Department,
  providerName: string = 'Keka HR & Payroll',
  customCount?: number
): DepartmentUser[] {
  const templates = getDepartmentHierarchyArchetype(dept.name, dept.code);
  const selectedTemplates = customCount ? templates.slice(0, customCount) : templates;

  const users: DepartmentUser[] = [];
  const deptCodeClean = dept.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const baseEmailDomain = 'enterprise.io';
  const nowIso = new Date().toISOString();

  let headUserId = '';
  let headUserName = '';
  let mgrUserId = '';
  let mgrUserName = '';

  selectedTemplates.forEach((t, idx) => {
    const userId = `usr-hr-${dept.id}-${idx + 1}-${deptCodeClean.toLowerCase()}`;
    const codeNum = String(idx + 1).padStart(3, '0');
    const employeeCode = `EMP-${deptCodeClean}-${codeNum}`;
    const cleanNameEmail = t.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const email = `${cleanNameEmail}@${baseEmailDomain}`;
    const phone = `+91 98${(Math.abs(hashString(userId)) % 89999999 + 10000000)}`;
    const avatar = AVATARS[Math.abs(hashString(userId)) % AVATARS.length];

    // Determine reporting hierarchy
    let reportingToId: string | undefined = undefined;
    let reportingToName: string | undefined = undefined;
    let reportingRole: string | undefined = undefined;

    if (t.level === 1) {
      headUserId = userId;
      headUserName = t.name;
      reportingToName = 'Board of Directors / MD & CEO';
      reportingRole = 'MD_CEO';
    } else if (t.level === 2) {
      mgrUserId = userId;
      mgrUserName = t.name;
      reportingToId = headUserId;
      reportingToName = headUserName || `${dept.name} Head`;
      reportingRole = 'DEPT_HEAD';
    } else {
      reportingToId = mgrUserId || headUserId;
      reportingToName = mgrUserName || headUserName || `${dept.name} Lead`;
      reportingRole = 'MANAGER';
    }

    users.push({
      id: userId,
      departmentId: dept.id,
      departmentName: dept.name,
      name: t.name,
      email,
      role: t.role,
      designation: t.designation,
      employeeCode,
      phone,
      avatar,
      spendingLimit: t.spendingLimit,
      approvalTier: t.approvalTier,
      status: 'ACTIVE',
      joinedDate: '2024-04-01',
      assignedRulesCount: t.level === 1 ? 5 : t.level === 2 ? 3 : 1,
      permissions: t.permissions,
      // Hierarchy
      reportingToId,
      reportingToName,
      reportingRole,
      hierarchyLevel: t.level,
      bandGrade: t.band,
      annualSalary: t.salaryAnnual,
      syncedFromHr: providerName,
      syncedAt: nowIso,
    });
  });

  return users;
}

/**
 * Synchronizes ALL departments with HR/Payroll data in one batch
 */
export function syncAllDepartmentsWithHr(
  departments: Department[],
  providerName: string = 'Keka HR & Payroll'
): Department[] {
  return departments.map((dept) => {
    const syncedUsers = generateHrRosterForDepartment(dept, providerName);
    const headUser = syncedUsers.find((u) => u.hierarchyLevel === 1) || syncedUsers[0];

    const currentSources = dept.syncSources || [];
    const updatedSources = currentSources.includes(providerName)
      ? currentSources
      : [...currentSources, providerName];

    return {
      ...dept,
      headOfDepartment: headUser ? headUser.name : dept.headOfDepartment,
      headEmail: headUser ? headUser.email : dept.headEmail,
      headcount: Math.max(dept.headcount || 0, syncedUsers.length),
      users: syncedUsers,
      syncSources: updatedSources,
    };
  });
}

/**
 * Synchronizes a SINGLE target department with HR/Payroll data
 */
export function syncSingleDepartmentWithHr(
  departments: Department[],
  targetDeptId: string,
  providerName: string = 'Keka HR & Payroll'
): Department[] {
  return departments.map((dept) => {
    if (dept.id !== targetDeptId) return dept;
    const syncedUsers = generateHrRosterForDepartment(dept, providerName);
    const headUser = syncedUsers.find((u) => u.hierarchyLevel === 1) || syncedUsers[0];

    const currentSources = dept.syncSources || [];
    const updatedSources = currentSources.includes(providerName)
      ? currentSources
      : [...currentSources, providerName];

    return {
      ...dept,
      headOfDepartment: headUser ? headUser.name : dept.headOfDepartment,
      headEmail: headUser ? headUser.email : dept.headEmail,
      headcount: Math.max(dept.headcount || 0, syncedUsers.length),
      users: syncedUsers,
      syncSources: updatedSources,
    };
  });
}

/**
 * Node for visual Org Hierarchy tree
 */
export interface OrgTreeNode {
  user: DepartmentUser;
  directReports: OrgTreeNode[];
}

/**
 * Converts a flat DepartmentUser[] array into a nested hierarchy tree
 */
export function buildDepartmentOrgTree(users: DepartmentUser[]): OrgTreeNode[] {
  if (!users || users.length === 0) return [];

  // Group by level or find roots (level 1 or unassigned reportingToId)
  const rootUsers = users.filter((u) => u.hierarchyLevel === 1 || !u.reportingToId || u.role === 'DEPT_HEAD');
  
  if (rootUsers.length === 0) {
    // If no explicit level 1 found, pick the first user as root
    const first = users[0];
    return [
      {
        user: first,
        directReports: users.slice(1).map((u) => ({ user: u, directReports: [] })),
      },
    ];
  }

  const buildTree = (parent: DepartmentUser): OrgTreeNode => {
    const children = users.filter((u) => u.reportingToId === parent.id && u.id !== parent.id);
    return {
      user: parent,
      directReports: children.map((c) => buildTree(c)),
    };
  };

  return rootUsers.map((r) => buildTree(r));
}

/**
 * Parses user-uploaded HR Master Spreadsheet (CSV / TSV text)
 */
export function parseHrMasterSpreadsheet(
  text: string,
  departments: Department[],
  providerName: string = 'Uploaded HR Master Sheet'
): { success: boolean; updatedDepartments: Department[]; totalParsed: number; error?: string } {
  try {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { success: false, updatedDepartments: departments, totalParsed: 0, error: 'File must contain a header and at least one employee row.' };
    }

    const header = lines[0].toLowerCase().split(/[,\t]/).map((h) => h.trim().replace(/['"]/g, ''));
    
    // Find column indexes
    const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('employee'));
    const deptIdx = header.findIndex((h) => h.includes('department') || h.includes('dept') || h.includes('unit'));
    const desigIdx = header.findIndex((h) => h.includes('designation') || h.includes('role') || h.includes('title'));
    const emailIdx = header.findIndex((h) => h.includes('email') || h.includes('mail'));
    const managerIdx = header.findIndex((h) => h.includes('manager') || h.includes('reporting') || h.includes('supervisor'));
    const limitIdx = header.findIndex((h) => h.includes('limit') || h.includes('spending') || h.includes('approval'));
    const salaryIdx = header.findIndex((h) => h.includes('salary') || h.includes('ctc') || h.includes('pay'));

    if (nameIdx === -1) {
      return { success: false, updatedDepartments: departments, totalParsed: 0, error: 'Could not find "Employee Name" column in header.' };
    }

    // Group parsed rows by department
    const deptEmployeeMap: Record<string, any[]> = {};

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/[,\t]/).map((p) => p.trim().replace(/['"]/g, ''));
      if (parts.length <= nameIdx) continue;

      const empName = parts[nameIdx] || `Employee ${i}`;
      const rawDept = deptIdx !== -1 && parts[deptIdx] ? parts[deptIdx] : 'ACCOUNTS';
      const desig = desigIdx !== -1 && parts[desigIdx] ? parts[desigIdx] : 'Senior Specialist';
      const email = emailIdx !== -1 && parts[emailIdx] ? parts[emailIdx] : `${empName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@enterprise.io`;
      const manager = managerIdx !== -1 && parts[managerIdx] ? parts[managerIdx] : undefined;
      const limit = limitIdx !== -1 && !isNaN(Number(parts[limitIdx])) ? Number(parts[limitIdx]) : undefined;
      const salary = salaryIdx !== -1 && !isNaN(Number(parts[salaryIdx])) ? Number(parts[salaryIdx]) : 1200000;

      // Find matching department
      const matchedDept = departments.find(
        (d) =>
          d.name.toLowerCase().includes(rawDept.toLowerCase()) ||
          d.code.toLowerCase().includes(rawDept.toLowerCase()) ||
          rawDept.toLowerCase().includes(d.name.toLowerCase())
      ) || departments[0];

      if (!deptEmployeeMap[matchedDept.id]) {
        deptEmployeeMap[matchedDept.id] = [];
      }

      deptEmployeeMap[matchedDept.id].push({
        name: empName,
        designation: desig,
        email,
        manager,
        limit,
        salary,
      });
    }

    let totalParsed = 0;
    const updated = departments.map((d) => {
      const rows = deptEmployeeMap[d.id];
      if (!rows || rows.length === 0) return d;

      totalParsed += rows.length;

      // Map rows to DepartmentUser with hierarchy
      const users: DepartmentUser[] = rows.map((r, idx) => {
        const isLead = idx === 0 || r.designation.toLowerCase().includes('head') || r.designation.toLowerCase().includes('vp') || r.designation.toLowerCase().includes('director');
        const isMgr = !isLead && (r.designation.toLowerCase().includes('manager') || r.designation.toLowerCase().includes('lead'));
        
        const role: UserRole = isLead ? 'DEPT_HEAD' : isMgr ? 'MANAGER' : 'EMPLOYEE';
        const level = isLead ? 1 : isMgr ? 2 : 3;
        const tier: ApprovalTier = isLead ? 'TIER_3_HEAD_SIGN' : isMgr ? 'TIER_2_DEPT_APPROVER' : 'TIER_1_AUTO';
        const spendingLimit = r.limit || (isLead ? 1500000 : isMgr ? 400000 : 50000);

        return {
          id: `usr-import-${d.id}-${idx + 1}`,
          departmentId: d.id,
          departmentName: d.name,
          name: r.name,
          email: r.email,
          role,
          designation: r.designation,
          employeeCode: `EMP-${d.code.replace(/[^A-Z0-9]/g, '')}-${String(idx + 1).padStart(3, '0')}`,
          spendingLimit,
          approvalTier: tier,
          status: 'ACTIVE',
          joinedDate: '2024-01-01',
          permissions: {
            canApproveExpenses: isLead || isMgr,
            canInitiatePO: true,
            canUploadDocs: true,
            canEditWorkflows: isLead,
            canOverrideRules: isLead,
            canManageTeam: isLead,
          },
          reportingToName: r.manager || (isLead ? 'Executive Board' : rows[0].name),
          hierarchyLevel: level,
          bandGrade: isLead ? 'L1 - Department Head' : isMgr ? 'L2 - Manager' : 'L3 - Specialist',
          annualSalary: r.salary,
          syncedFromHr: providerName,
          syncedAt: new Date().toISOString(),
        };
      });

      return {
        ...d,
        headOfDepartment: users[0]?.name || d.headOfDepartment,
        headEmail: users[0]?.email || d.headEmail,
        headcount: Math.max(d.headcount || 0, users.length),
        users,
        syncSources: d.syncSources?.includes(providerName) ? d.syncSources : [...(d.syncSources || []), providerName],
      };
    });

    return {
      success: true,
      updatedDepartments: updated,
      totalParsed,
    };
  } catch (err: any) {
    return {
      success: false,
      updatedDepartments: departments,
      totalParsed: 0,
      error: `Failed to parse HR master sheet: ${err.message}`,
    };
  }
}
