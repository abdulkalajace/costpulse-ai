import {
  Company,
  UserProfile,
  Expense,
  Subscription,
  Asset,
  Vendor,
  SavingsOpportunity,
  PropertyLocation,
  Budget,
  ProcurementRequest,
  AuditLog,
  Department,
  CurrencyCode,
} from '../types';
import {
  INITIAL_COMPANIES,
  DEMO_USERS,
  INITIAL_EXPENSES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_ASSETS,
  INITIAL_VENDORS,
  INITIAL_SAVINGS_OPPORTUNITIES,
  INITIAL_PROPERTIES,
  INITIAL_BUDGETS,
  INITIAL_PROCUREMENTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { INFRA_39_DEPARTMENTS_TEMPLATE } from '../data/departmentData';
import { ensureDepartmentsHaveUsersAndRules } from '../data/departmentUserData';

export type AppEnvironmentMode = 'PRODUCTION' | 'DEMO';

export type DemoScenarioPreset =
  | 'INFRA_CONGLOMERATE'
  | 'TECH_SAAS'
  | 'HEALTHCARE_HOSPITAL'
  | 'HOSPITALITY_HOTEL';

export interface EnterpriseAppData {
  companies: Company[];
  selectedCompanyId: string;
  currentUser: UserProfile;
  currency: CurrencyCode;
  expenses: Expense[];
  subscriptions: Subscription[];
  assets: Asset[];
  vendors: Vendor[];
  savings: SavingsOpportunity[];
  properties: PropertyLocation[];
  budgets: Budget[];
  procurements: ProcurementRequest[];
  auditLogs: AuditLog[];
  departments: Department[];
}

const STORAGE_KEY_MODE = 'costpulse_app_mode';
const STORAGE_KEY_DEMO_PRESET = 'costpulse_demo_active_preset';

/**
 * Standard default clean baseline for Real Production Mode.
 * Contains a clean single company, primary admin user, core corporate departments with 0 dummy spend.
 */
export function getInitialRealProductionData(): EnterpriseAppData {
  const defaultRealCompany: Company = {
    id: 'comp-real-primary',
    name: 'My Enterprise Organization',
    industry: 'Technology & Business Services',
    industryVertical: 'SOFTWARE_TECH',
    isGroup: false,
    size: '51-200',
    headquarters: 'Bengaluru, India',
    currency: 'INR',
    annualRevenue: 50000000,
    monthlyBurn: 2500000,
    totalExpensesYear: 30000000,
    fiscalYear: 'FY 2026-27',
    statutoryStatus: 'ACTIVE_COMPLIANT',
    directors: ['Primary Administrator'],
    brands: ['Primary Brand'],
  };

  const defaultAdminUser: UserProfile = {
    id: 'usr-real-admin',
    name: 'Primary Administrator',
    email: 'admin@enterprise.internal',
    role: 'MD_CEO',
    departmentName: 'Executive Office',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  // Clean Core Departments for Real Production with populated users and rules
  const baseDeptTemplates = INFRA_39_DEPARTMENTS_TEMPLATE.map((dept) => ({
    ...dept,
    companyId: defaultRealCompany.id,
    spentYearToDate: 0,
    achievedSavingsAnnual: 0,
    monthlyBurn: Math.round(dept.annualBudget / 12),
  }));
  const defaultRealDepartments = ensureDepartmentsHaveUsersAndRules(baseDeptTemplates as Department[]);

  const defaultRealBudgets: Budget[] = [
    {
      id: 'bgt-real-1',
      companyId: defaultRealCompany.id,
      departmentName: 'ACCOUNTS',
      category: 'Software & SaaS',
      fiscalQuarter: 'Q1 FY26',
      allocatedAmount: 4800000,
      spentAmount: 0,
      forecastAmount: 4800000,
      currency: 'INR',
      varianceAmount: 0,
      variancePercent: 0,
      status: 'ON_TRACK',
    },
    {
      id: 'bgt-real-2',
      companyId: defaultRealCompany.id,
      departmentName: 'ADMIN',
      category: 'Property & Facilities',
      fiscalQuarter: 'Q1 FY26',
      allocatedAmount: 4200000,
      spentAmount: 0,
      forecastAmount: 4200000,
      currency: 'INR',
      varianceAmount: 0,
      variancePercent: 0,
      status: 'ON_TRACK',
    },
    {
      id: 'bgt-real-3',
      companyId: defaultRealCompany.id,
      departmentName: 'BUSINESS DEVELOPMENT',
      category: 'Travel & Entertainment',
      fiscalQuarter: 'Q1 FY26',
      allocatedAmount: 3000000,
      spentAmount: 0,
      forecastAmount: 3000000,
      currency: 'INR',
      varianceAmount: 0,
      variancePercent: 0,
      status: 'ON_TRACK',
    },
  ];

  return {
    companies: [defaultRealCompany],
    selectedCompanyId: defaultRealCompany.id,
    currentUser: defaultAdminUser,
    currency: 'INR',
    expenses: [],
    subscriptions: [],
    assets: [],
    vendors: [],
    savings: [],
    properties: [],
    budgets: defaultRealBudgets,
    procurements: [],
    auditLogs: [
      {
        id: `log-init-${Date.now()}`,
        companyId: defaultRealCompany.id,
        userName: defaultAdminUser.name,
        userRole: defaultAdminUser.role,
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'SYSTEM',
        details: 'Initialized clean production ledger for real enterprise data testing.',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        ipAddress: '127.0.0.1',
      },
    ],
    departments: defaultRealDepartments,
  };
}

/**
 * Returns the rich Demo Showcase dataset based on selected preset.
 */
export function getDemoShowcaseData(preset: DemoScenarioPreset = 'INFRA_CONGLOMERATE'): EnterpriseAppData {
  const hydratedDepartments = ensureDepartmentsHaveUsersAndRules(
    INFRA_39_DEPARTMENTS_TEMPLATE as Department[]
  );

  return {
    companies: INITIAL_COMPANIES,
    selectedCompanyId: INITIAL_COMPANIES[0].id,
    currentUser: DEMO_USERS[0],
    currency: 'INR',
    expenses: INITIAL_EXPENSES,
    subscriptions: INITIAL_SUBSCRIPTIONS,
    assets: INITIAL_ASSETS,
    vendors: INITIAL_VENDORS,
    savings: INITIAL_SAVINGS_OPPORTUNITIES,
    properties: INITIAL_PROPERTIES,
    budgets: INITIAL_BUDGETS,
    procurements: INITIAL_PROCUREMENTS,
    auditLogs: INITIAL_AUDIT_LOGS,
    departments: hydratedDepartments,
  };
}

/**
 * Real production data now lives in Postgres behind the authenticated
 * /api/workspace endpoint (see src/utils/api.ts) instead of localStorage —
 * this is what makes data persist across devices/browsers and keeps each
 * signed-up company's data isolated from every other tenant.
 *
 * `loadStoredAppMode` / `saveStoredAppMode` remain in localStorage because
 * "which mode is this browser tab in" is a harmless, non-sensitive UI
 * preference, not application data.
 */
export function loadStoredAppMode(): AppEnvironmentMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MODE);
    if (stored === 'PRODUCTION' || stored === 'DEMO') {
      return stored;
    }
  } catch (e) {
    console.warn('Unable to access localStorage for app mode', e);
  }
  // Default to PRODUCTION so user starts with clean real testing mode as requested
  return 'PRODUCTION';
}

export function saveStoredAppMode(mode: AppEnvironmentMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  } catch (e) {
    console.warn('Unable to save app mode to localStorage', e);
  }
}

export function exportRealDataJson(data: EnterpriseAppData): string {
  return JSON.stringify(
    {
      _exportedAt: new Date().toISOString(),
      _version: '2.0.0',
      _system: 'CostPulse AI Real Enterprise Ledger',
      ...data,
    },
    null,
    2
  );
}

export function importRealDataJson(jsonString: string): EnterpriseAppData | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.companies) || !Array.isArray(parsed.departments)) {
      throw new Error('Invalid CostPulse data structure');
    }
    const cleanData: EnterpriseAppData = {
      companies: parsed.companies,
      selectedCompanyId: parsed.selectedCompanyId || parsed.companies[0]?.id || 'comp-real-primary',
      currentUser: parsed.currentUser || {
        id: 'usr-admin',
        name: 'Administrator',
        email: 'admin@enterprise.internal',
        role: 'MD_CEO',
      },
      currency: parsed.currency || 'INR',
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      vendors: Array.isArray(parsed.vendors) ? parsed.vendors : [],
      savings: Array.isArray(parsed.savings) ? parsed.savings : [],
      properties: Array.isArray(parsed.properties) ? parsed.properties : [],
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      procurements: Array.isArray(parsed.procurements) ? parsed.procurements : [],
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
      departments: Array.isArray(parsed.departments) ? parsed.departments : [],
    };
    return cleanData;
  } catch (e) {
    console.error('Failed to import JSON data', e);
    return null;
  }
}
