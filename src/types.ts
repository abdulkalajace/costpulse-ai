export type UserRole =
  | 'MASTER'
  | 'MD_CEO'
  | 'CFO'
  | 'CTO'
  | 'HR'
  | 'DEPT_HEAD'
  | 'MANAGER'
  | 'EMPLOYEE';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  avatar?: string;
}

export type IndustryVertical =
  | 'CONSTRUCTION'
  | 'HEALTHCARE'
  | 'BEAUTY_WELLNESS'
  | 'SOFTWARE_TECH'
  | 'HIGHER_EDUCATION'
  | 'HOTEL_HOSPITALITY';

/** Canonical industry categories offered at signup, used for the company
 * profile and later for AI recommendations, analytics, and benchmarking. */
export const INDUSTRIES = [
  'Real Estate & Construction',
  'Manufacturing',
  'IT & Software',
  'Retail',
  'E-commerce',
  'Healthcare',
  'Education',
  'Finance & Banking',
  'Logistics & Transportation',
  'Hospitality',
  'Professional Services',
  'Media & Entertainment',
  'Agriculture',
  'Automotive',
  'Other',
] as const;

export type IndustryCategory = (typeof INDUSTRIES)[number];

export interface Company {
  id: string;
  name: string;
  industry: string;
  industryVertical?: IndustryVertical;
  isGroup?: boolean;
  parentGroupId?: string;
  subsidiaryIds?: string[];
  subsidiaryCount?: number;
  verticals?: IndustryVertical[];
  tagline?: string;
  size: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  headquarters: string;
  currency: CurrencyCode;
  annualRevenue: number;
  monthlyBurn: number;
  totalExpensesYear: number;
  fiscalYear: string;
  // Official Corporate & Registration Details
  cin?: string;
  roc?: string;
  gstin?: string;
  pan?: string;
  registeredOffice?: string;
  foundedYear?: number;
  directors?: string[];
  brands?: string[];
  awards?: string[];
  projectsList?: string[];
  website?: string;
  statutoryStatus?: 'ACTIVE_COMPLIANT' | 'ROC_FILED_ANNUAL' | 'RERA_REGISTERED' | 'FSSAI_AYUSH_CERTIFIED';
  authorizedCapital?: string;
  paidUpCapital?: string;
}

export type ExpenseCategory =
  | 'Software & SaaS'
  | 'AI Tools & Copilots'
  | 'Cloud Infrastructure'
  | 'Hardware & Devices'
  | 'Property & Facilities'
  | 'Workforce & Contractors'
  | 'Travel & Entertainment'
  | 'Marketing & Ads'
  | 'Utilities & Services'
  | 'Legal & Insurance'
  | 'Office Supplies & Misc';

export type ApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT';

export type AiAnomalyType =
  | 'ANOMALY_SPIKE'
  | 'DUPLICATE_CHARGE'
  | 'UNASSIGNED_LICENSE'
  | 'OVER_BUDGET_RISK'
  | 'CONTRACT_EXPIRATION'
  | 'UNDERUTILIZED_ASSET';

export interface Expense {
  id: string;
  companyId: string;
  description: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  category: ExpenseCategory;
  subcategory: string;
  departmentId: string;
  departmentName: string;
  costCenter: string;
  employeeId: string;
  employeeName: string;
  vendorId: string;
  vendorName: string;
  paymentMethod: 'Corporate Card' | 'Wire Transfer' | 'Invoice NET30' | 'Auto-Debit' | 'Reimbursement';
  recurring: 'Monthly' | 'Quarterly' | 'Annual' | 'One-Time';
  approvalStatus: ApprovalStatus;
  invoiceNumber?: string;
  receiptUrl?: string;
  tags: string[];
  notes?: string;
  aiAnomaly?: {
    type: AiAnomalyType;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    suggestedAction: string;
  };
}

export interface Subscription {
  id: string;
  companyId: string;
  softwareName: string;
  vendorName: string;
  category: string;
  seatsTotal: number;
  seatsUsed: number;
  seatsUnused: number;
  monthlyCost: number;
  annualCost: number;
  currency: CurrencyCode;
  billingCycle: 'Monthly' | 'Annual' | 'Custom';
  /** Only set when billingCycle is 'Custom' — how many months the amount paid actually covers (e.g. 1 for a single-month plan). */
  customCycleMonths?: number;
  renewalDate: string;
  contractEnd: string;
  ownerName: string;
  departmentName: string;
  planName: string;
  usageRate: number; // percentage 0 - 100
  status: 'ACTIVE' | 'UNDERUTILIZED' | 'UNUSED' | 'REDUNDANT' | 'PENDING_REVIEW';
  aiAlert?: {
    type: 'UNUSED_SEATS' | 'DUPLICATE_FUNCTION' | 'OVERPRICED_PLAN' | 'UPCOMING_RENEWAL' | 'CHEAPER_ALTERNATIVE';
    potentialSavingAnnual: number;
    explanation: string;
    alternativeSuggestion?: string;
  };
}

export type AssetType =
  | 'LAPTOP'
  | 'DESKTOP'
  | 'SERVER'
  | 'VEHICLE'
  | 'OFFICE_EQUIPMENT'
  | 'MACHINERY'
  | 'PROPERTY'
  | 'MONITOR'
  | 'PHONE';

export type AssetStatus =
  | 'ACTIVE'
  | 'IDLE'
  | 'UNDERUTILIZED'
  | 'DAMAGED'
  | 'UNDER_MAINTENANCE'
  | 'SURPLUS'
  | 'DISPOSED';

export interface Asset {
  id: string;
  companyId: string;
  name: string;
  type: AssetType;
  serialNumber: string;
  purchasePrice: number;
  currentValue: number;
  currency: CurrencyCode;
  purchaseDate: string;
  depreciationRateYearly: number; // percentage
  location: string;
  assignedToName?: string;
  departmentName: string;
  utilizationScore: number; // 0 - 100
  maintenanceCostYearly: number;
  insuranceCostYearly: number;
  status: AssetStatus;
  aiNote?: string;
  recommendation?: 'KEEP' | 'REASSIGN' | 'SELL' | 'LEASE' | 'DISPOSE';
}

export interface PropertyLocation {
  id: string;
  companyId: string;
  name: string;
  type: 'HEADQUARTERS' | 'REGIONAL_OFFICE' | 'WAREHOUSE' | 'R&D_FACILITY';
  city: string;
  address: string;
  areaSqFt: number;
  capacitySeats: number;
  occupancySeats: number;
  rentAnnual: number;
  currency: CurrencyCode;
  leaseEndDate: string;
  utilitiesCostAnnual: number;
  maintenanceCostAnnual: number;
  propertyTaxesAnnual: number;
  costPerSqFt: number;
  costPerSeat: number;
  costPerOccupiedSeat: number;
  utilizationRate: number;
  aiRecommendation?: string;
}

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  category: string;
  departmentName: string;
  totalSpendAnnual: number;
  currency: CurrencyCode;
  monthlySpendAverage: number;
  activeContractsCount: number;
  contractRenewalDate: string;
  paymentTerms: string;
  priceChangePercent12m: number;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'REVIEW_REQUESTED' | 'DISPUTED' | 'TERMINATED';
  aiNotes?: string;
  alternativeOptionsCount?: number;
}

export type ProcurementStatus =
  | 'SUBMITTED'
  | 'MANAGER_APPROVED'
  | 'DEPT_APPROVED'
  | 'FINANCE_APPROVED'
  | 'ORDERED'
  | 'FULFILLED'
  | 'REJECTED';

export interface ProcurementRequest {
  id: string;
  companyId: string;
  title: string;
  requestedByName: string;
  departmentName: string;
  estimatedCost: number;
  currency: CurrencyCode;
  vendorName: string;
  category: ExpenseCategory;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: ProcurementStatus;
  requestDate: string;
  justification: string;
  aiAnalysis?: {
    duplicateVendorsFound: number;
    recommendedVendor?: string;
    potentialSavingsPct?: number;
    bulkDiscountOpportunity?: string;
  };
  approvalChain: {
    step: string;
    approverRole: UserRole;
    approverName?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    timestamp?: string;
    comment?: string;
  }[];
}

export interface Budget {
  id: string;
  companyId: string;
  departmentName: string;
  category: ExpenseCategory;
  fiscalQuarter: string;
  allocatedAmount: number;
  spentAmount: number;
  forecastAmount: number;
  currency: CurrencyCode;
  varianceAmount: number; // spent - allocated
  variancePercent: number;
  status: 'ON_TRACK' | 'WARNING' | 'OVER_BUDGET';
}

export type OpportunityStatus =
  | 'DETECTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'IMPLEMENTED'
  | 'REJECTED'
  | 'REALIZED';

export type OpportunityAction =
  | 'DOWNGRADE'
  | 'CONSOLIDATE'
  | 'REPLACE'
  | 'RENEGOTIATE'
  | 'REMOVE'
  | 'SUBLEASE'
  | 'AUTOMATE'
  | 'REALLOCATE';

export interface SavingsOpportunity {
  id: string;
  companyId: string;
  title: string;
  category: ExpenseCategory;
  problem: string;
  evidence: string;
  currentCostAnnual: number;
  estimatedSavingAnnual: number;
  actualSavingConfirmed: number;
  currency: CurrencyCode;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  roi: string;
  status: OpportunityStatus;
  actionType: OpportunityAction;
  targetEntityName: string;
  alternatives: {
    name: string;
    estimatedCostAnnual: number;
    pros: string[];
    cons: string[];
    switchingDifficulty: 'EASY' | 'MODERATE' | 'COMPLEX';
    securityCompliant: boolean;
  }[];
  identifiedDate?: string;
  reviewedBy?: string;
  implementedDate?: string;
  recommendedAction?: string;
  notes?: string;
}

export interface AuditLogChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface AuditLog {
  id: string;
  createdAt: string;
  userId?: string;
  userName: string;
  userRole: UserRole | string;
  action: string;
  entityType: 'EXPENSE' | 'SUBSCRIPTION' | 'ASSET' | 'SAVINGS' | 'BUDGET' | 'PROCUREMENT' | 'VENDOR' | 'PROPERTY' | 'DEPARTMENT' | 'SYSTEM' | 'SECURITY';
  entityId?: string;
  entityName?: string;
  changes?: AuditLogChange[];
  details: string;
}

export interface AIExecutiveReport {
  id: string;
  companyId: string;
  generatedDate: string;
  period: string;
  targetRole: UserRole;
  executiveHeadline: string;
  netSpendTrend: string;
  topSpendIncreases: { category: string; pct: number; reason: string }[];
  topSpendDecreases: { category: string; pct: number; reason: string }[];
  topRisks: string[];
  topSavingsOpportunities: { title: string; potentialSaving: number; recommendation: string }[];
  confirmedSavingsThisPeriod: number;
  potentialSavingsTotal: number;
  markdownContent: string;
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'EXPENSE' | 'SUBSCRIPTION' | 'ASSET' | 'VENDOR' | 'SAVINGS' | 'PROPERTY' | 'EMPLOYEE';
  linkTab: string;
  badge?: string;
  amount?: number;
  currency?: CurrencyCode;
}

// ----------------------------------------------------
// INDUSTRY-SPECIFIC VERTICAL DOMAIN TYPES
// ----------------------------------------------------

// 1. Construction & Civil Infrastructure
export interface ConstructionJobCostRecord {
  id: string;
  projectCode: string;
  projectName: string;
  costCode: string; // e.g. "03-3000 Cast-in-Place Concrete"
  phase: string;
  estimatedBudget: number;
  committedPO: number;
  actualProgressBilled: number;
  variance: number;
  retainageWithheld: number;
  subcontractorName: string;
  siteLocation: string;
  status: 'ON_BUDGET' | 'AT_RISK' | 'OVER_RUN';
}

export interface HeavyEquipmentTelemetry {
  id: string;
  assetName: string;
  machineType: 'Excavator' | 'Tower Crane' | 'Concrete Pump' | 'Dozer' | 'Dump Truck';
  runtimeHoursMonth: number;
  idleHoursMonth: number;
  fuelBurnLiters: number;
  fuelWasteEstimate: number;
  costPerHour: number;
  nextServiceDue: string;
  telemetryHealth: 'OPTIMAL' | 'HIGH_IDLE' | 'MAINTENANCE_DUE';
}

// 2. Hospitals & Healthcare Systems
export interface MedicalSupplyExpiryRecord {
  id: string;
  itemName: string;
  lotNumber: string;
  category: 'Pharmaceuticals' | 'Sterile Surgical Kits' | 'Implants' | 'PPE & Consumables' | 'Diagnostics Reagents';
  wardLocation: string;
  quantityUnits: number;
  unitCost: number;
  totalBatchValue: number;
  expiryDate: string;
  daysToExpiry: number;
  riskStatus: 'CRITICAL_30D' | 'WARNING_60D' | 'WATCH_90D' | 'SAFE';
  actionRecommendation: string;
}

export interface LocumShiftComparison {
  id: string;
  department: string;
  roleSpecialty: string;
  locumAgencyHourlyRate: number;
  fteOvertimeHourlyRate: number;
  agencyShiftHoursMonth: number;
  totalAgencySpend: number;
  potentialFteSavings: number;
  recommendation: string;
}

export interface BiomedicalDeviceAMC {
  id: string;
  deviceName: string;
  oemVendor: string;
  annualAmcCost: number;
  guaranteedUptimePct: number;
  actualUptimePct: number;
  unplannedDowntimeHours: number;
  slaPenaltyRebateEligible: number;
}

// 3. Beauty, Salons & Aesthetics Spas
export interface BackbarColorUsageRecord {
  id: string;
  branchName: string;
  serviceType: string;
  targetFormulaGrams: number;
  actualDispensedGrams: number;
  overmixingPct: number;
  gramCost: number;
  annualOvermixLoss: number;
  technicianName: string;
}

export interface StylistCompensationBreakEven {
  id: string;
  stylistName: string;
  branchName: string;
  monthlyServiceRevenue: number;
  commissionRatePct: number; // e.g. 50%
  commissionPayout: number;
  boothRentRate: number; // e.g. 35,000 / mo
  salonNetMargin: number;
  optimalModelRecommendation: 'COMMISSION' | 'BOOTH_RENT' | 'HYBRID';
}

// 4. Software & Technology Companies (FinOps & SaaS Sprawl)
export interface CloudFinOpsAnomaly {
  id: string;
  serviceType: 'AWS_GPU' | 'K8S_CLUSTER' | 'ORPHANED_EBS' | 'UNATTACHED_IP' | 'AI_API_TOKENS';
  resourceId: string;
  monthlyCost: number;
  utilizationRatePct: number;
  suggestedAction: string;
  potentialAnnualSaving: number;
}

export interface SsoInactivitySeat {
  id: string;
  softwareName: string;
  employeeEmail: string;
  seatCostAnnual: number;
  lastLoginDaysAgo: number;
  action: 'DE_PROVISION' | 'DOWNGRADE_TIER' | 'REALLOCATE';
}

// 5. Educational Institutions & Universities
export interface GrantComplianceRecord {
  id: string;
  grantCode: string;
  sponsorName: string; // e.g. "National Science Foundation (NSF)", "NIH", "EU Horizon"
  totalGrantAllocation: number;
  spentAllowable: number;
  pendingUnapprovedEncumbrances: number;
  overheadIndirectRatePct: number;
  complianceStatus: 'COMPLIANT' | 'OVER_CAP_RISK' | 'DISALLOWED_ITEM_DETECTED';
  restrictedCategoryLimitNotes: string;
}

export interface CampusLabEquipmentShare {
  id: string;
  instrumentName: string;
  departmentHost: string;
  replacementCost: number;
  crossDeptUsageHoursPerWeek: number;
  idleCapacityPct: number;
  preventDuplicatePurchaseSavings: number;
}

// 6. Hotels & Luxury Hospitality Industry
export interface HotelCostPerOccupiedRoom {
  id: string;
  propertyCode: string;
  propertyName: string;
  availableRooms: number;
  occupancyRatePct: number;
  cporActual: number; // Cost per occupied room in INR / USD
  cporBudget: number;
  fAndBCogsPerCover: number;
  linenLaundryCostPerRoom: number;
  guestAmenitiesCostPerRoom: number;
  energyHvacCostPerRoom: number;
  otaCommissionPct: number; // e.g. 18%
  directBookingLoyaltyPct: number;
  monthlyOtaCommissionBleed: number;
  varianceStatus: 'OPTIMAL' | 'ELEVATED_LAUNDRY' | 'HIGH_OTA_COMMISSION' | 'ENERGY_LEAK';
}

export interface KitchenFbWasteAudit {
  id: string;
  outletName: string; // e.g. "Grand All-Day Dining Buffet", "Rooftop Grill & Lounge"
  dailyBuffetCovers: number;
  prepCostDaily: number;
  spoilageAndPlateWasteCost: number;
  spoilagePct: number;
  portionControlAdherencePct: number;
  annualizedWasteLoss: number;
  aiSuggestedReduction: string;
}

// ----------------------------------------------------
// DYNAMIC UNIVERSAL DEPARTMENTS & COST WORKFLOWS
// ----------------------------------------------------

export type DepartmentCategory =
  | 'OPERATIONS'
  | 'ENGINEERING_EXECUTION'
  | 'FINANCE_GOVERNANCE'
  | 'SALES_MARKETING'
  | 'PEOPLE_ADMIN'
  | 'SUPPORT_FACILITIES';

export interface WorkflowChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  assignedTo?: string;
}

export interface DepartmentSavingWorkflow {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  description: string;
  category: ExpenseCategory | 'Process Optimization' | 'Procurement' | 'Staffing' | 'Automation' | 'Fleet & Fuel';
  targetSavingAnnual: number;
  realizedSavingAnnual: number;
  currency: CurrencyCode;
  stage: 'IDENTIFIED' | 'UNDER_REVIEW' | 'IN_EXECUTION' | 'VERIFIED_REALIZED' | 'ON_HOLD';
  actionOwner: string;
  dueDate: string;
  roiTimelineWeeks: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  checklists: WorkflowChecklistItem[];
  impactNotes?: string;
  identifiedDate?: string;
}

// ----------------------------------------------------
// DEPARTMENT USERS & GOVERNANCE POLICIES / RULES
// ----------------------------------------------------

export type ApprovalTier =
  | 'TIER_1_AUTO'
  | 'TIER_2_DEPT_APPROVER'
  | 'TIER_3_HEAD_SIGN'
  | 'TIER_4_BOARD_CFO';

export interface DepartmentUserPermissions {
  canApproveExpenses: boolean;
  canInitiatePO: boolean;
  canUploadDocs: boolean;
  canEditWorkflows: boolean;
  canOverrideRules: boolean;
  canManageTeam: boolean;
}

export interface DepartmentUser {
  id: string;
  departmentId: string;
  departmentName: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string; // e.g. "Senior Cost Controller", "Accounts Officer", "Site Safety Manager", "Lead Architect"
  employeeCode?: string;
  phone?: string;
  avatar?: string;
  spendingLimit: number; // max purchase approval / expense allowance limit
  approvalTier: ApprovalTier;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  joinedDate: string;
  assignedRulesCount?: number;
  permissions: DepartmentUserPermissions;
  // Hierarchy & HRMS Synchronization
  reportingToId?: string;
  reportingToName?: string;
  reportingRole?: string;
  hierarchyLevel?: number; // 1 = Dept Head / VP, 2 = Manager / Lead, 3 = Specialist / Engineer, 4 = Executive / Field
  bandGrade?: string; // e.g. "L1 - Director / VP", "L2 - Senior Manager", "L3 - Senior Specialist", "L4 - Executive"
  annualSalary?: number;
  syncedFromHr?: string; // e.g. "Keka HR & Payroll", "Darwinbox HRMS", "ADP Workforce Now", "Zoho People", "GreytHR", "Uploaded HR Master Sheet"
  syncedAt?: string;
}

export type RuleCategory =
  | 'APPROVAL_MATRIX'
  | 'SPEND_CEILING'
  | 'VENDOR_BIDDING'
  | 'RECEIPT_AUDIT'
  | 'HIRING_HEADCOUNT'
  | 'DISCOUNT_EARLY_PAY'
  | 'STATUTORY_GST_COMPLIANCE'
  | 'TRAVEL_ALLOWANCE'
  | 'ASSET_CUSTODY'
  | 'MATERIAL_CONSUMPTION';

export type RuleSeverity = 'STRICT_BLOCK' | 'FLAG_FOR_AUDIT' | 'WARNING_NOTIFY';

export interface DepartmentRule {
  id: string;
  departmentId: string; // 'GLOBAL' or specific department ID
  departmentName: string;
  code: string; // e.g. "RUL-ACC-01", "RUL-MEP-02"
  title: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;
  enabled: boolean;
  thresholdAmount?: number; // e.g. 50000 INR
  thresholdPercentage?: number; // e.g. 85% of monthly budget
  currency?: CurrencyCode;
  conditionDescription: string; // e.g. "Single PO > ₹50,000 requires minimum 3 quotation bids"
  enforcementAction: string; // e.g. "Rejection of unapproved line item & instant alert to Dept Head"
  assignedApproverRole?: UserRole;
  evaluationCount: number; // e.g. 42 evaluations this month
  violationsCount: number; // e.g. 3 violations flagged
  lastTriggeredAt?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  companyId: string;
  code: string; // e.g. "DEP-01", "DEP-ACC"
  name: string; // e.g. "ACCOUNTS", "CONSTRUCTION (EXECUTION)", "IT", "HR", "MEP", "SAFETY", etc.
  category: DepartmentCategory;
  headOfDepartment: string;
  headEmail?: string;
  headcount: number;
  annualBudget: number;
  monthlyBurn: number;
  spentYearToDate: number;
  targetSavingsPct: number; // e.g. 10%
  targetSavingsAnnual: number;
  achievedSavingsAnnual: number;
  currency: CurrencyCode;
  healthStatus: 'HEALTHY' | 'WARNING' | 'OVER_BUDGET' | 'SAVINGS_ACHIEVED';
  workflowsCount?: number;
  activeInitiatives?: number;
  costSavingPlaybooks: DepartmentSavingWorkflow[];
  users?: DepartmentUser[];
  rules?: DepartmentRule[];
  syncSources?: string[]; // e.g. ['ADP Payroll', 'QuickBooks ERP', 'Salesforce']
}

// ----------------------------------------------------
// UNIVERSAL APP & SOFTWARE DATA SYNC HUB
// ----------------------------------------------------

export type SyncCategory =
  | 'PAYROLL_HR'
  | 'SALES_CRM'
  | 'ACCOUNTING_ERP'
  | 'PROCUREMENT_INVENTORY'
  | 'CLOUD_INFRA'
  | 'PROJECT_OPS'
  | 'CUSTOM_API';

export type SyncAuthType = 'OAUTH2' | 'API_KEY' | 'WEBHOOK' | 'FILE_IMPORT' | 'DATABASE_DIRECT';

export interface SyncDataStream {
  id: string;
  streamName: string; // e.g. "Monthly Payroll Ledger", "Sales Pipeline & Commissions", "Vendor Invoices"
  mappedDepartmentId?: string;
  mappedDepartmentName?: string;
  fieldsMapped: number;
  recordsCount: number;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
}

export interface SyncIngestedRecord {
  id: string;
  connectorId: string;
  connectorName: string;
  category: SyncCategory;
  entityType: 'PAYROLL_RUN' | 'SALES_COMMISSION' | 'ERP_INVOICE' | 'CLOUD_BILL' | 'INVENTORY_PO' | 'SITE_JOB_LOG';
  externalId: string;
  amount: number;
  currency: CurrencyCode;
  timestamp: string;
  departmentTarget: string;
  description: string;
  status: 'AUTO_ALLOCATED' | 'REQUIRES_MAPPING' | 'ANOMALY_FLAGGED';
  metadata?: Record<string, any>;
}

export interface AppSyncConnector {
  id: string;
  name: string; // e.g. "ADP Workforce Now", "Salesforce CRM", "TallyPrime ERP", "QuickBooks Online", "AWS Cost Explorer"
  vendor: string;
  category: SyncCategory;
  description: string;
  authType: SyncAuthType;
  status: 'CONNECTED' | 'SYNCING' | 'DISCONNECTED' | 'ERROR' | 'CONFIGURING';
  lastSyncedAt?: string;
  syncFrequency: 'REAL_TIME_WEBHOOK' | 'HOURLY' | 'DAILY' | 'MANUAL';
  recordsIngestedTotal: number;
  monthlyDataFlowVolume: string; // e.g. "4.2 MB / 1,480 events"
  dataStreams: SyncDataStream[];
  configFields?: { key: string; label: string; placeholder: string; isSecret?: boolean; value?: string }[];
  healthScorePct: number;
  sampleIngestedLogs: SyncIngestedRecord[];
  popular?: boolean;
}

// ----------------------------------------------------
// DEPARTMENT DOCUMENT INGESTION & OVERWRITE APPROVAL
// ----------------------------------------------------

export type DocumentFileType = 'PDF' | 'IMAGE' | 'DOC' | 'SHEET' | 'CSV' | 'OTHER';

export type ParsedItemType =
  | 'EXPENSE_INVOICE'
  | 'BUDGET_REVISION'
  | 'HEADCOUNT_UPDATE'
  | 'SAVINGS_WORKFLOW'
  | 'VENDOR_CONTRACT'
  | 'ASSET_ACQUISITION';

export interface DiffField {
  field: string;
  currentValue: string | number;
  incomingValue: string | number;
}

export interface ParsedSyncItem {
  id: string;
  itemType: ParsedItemType;
  title: string;
  category: string;
  targetDepartmentId: string;
  targetDepartmentName: string;
  amount?: number;
  currency: CurrencyCode;
  date?: string;
  vendorName?: string;
  invoiceNumber?: string;
  description?: string;
  headcountChange?: number;
  budgetCapChange?: number;
  annualSavingsTarget?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number; // 0 to 100%
  // Conflict / Overwrite Detection
  isOverwriteWarning: boolean;
  overwriteReason?: string;
  existingRecordId?: string;
  diffFields?: DiffField[];
  resolution: 'OVERWRITE' | 'CREATE_NEW' | 'SKIP';
  isApproved: boolean;
  metadata?: Record<string, any>;
}

export interface DepartmentUploadedDocument {
  id: string;
  departmentId: string;
  departmentName: string;
  fileName: string;
  fileSize: number;
  fileType: DocumentFileType;
  fileDataUrl?: string;
  uploadedAt: string;
  uploadedByName: string;
  status: 'EXTRACTING' | 'READY_FOR_APPROVAL' | 'SYNCED' | 'REJECTED';
  extractedItems: ParsedSyncItem[];
  rawTextPreview?: string;
  aiExecutiveSummary?: string;
  confidenceOverall: number;
  hasOverwriteWarnings: boolean;
}



