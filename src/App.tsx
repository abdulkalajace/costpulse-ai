import React, { useState, useEffect } from 'react';
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
} from './data/mockData';
import {
  Company,
  UserProfile,
  UserRole,
  CurrencyCode,
  Expense,
  Subscription,
  Asset,
  Vendor,
  SavingsOpportunity,
  PropertyLocation,
  Budget,
  ProcurementRequest,
  AuditLog,
  AuditLogChange,
  OpportunityStatus,
  AssetStatus,
  ExpenseCategory,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { CfoDashboard } from './components/CfoDashboard';
import { CtoDashboard } from './components/CtoDashboard';
import { HrDashboard } from './components/HrDashboard';
import { MasterDashboard } from './components/MasterDashboard';
import { EmployeePortal } from './components/EmployeePortal';
import { SavingsCenter } from './components/SavingsCenter';
import { ExpensesView } from './components/ExpensesView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { AssetsView } from './components/AssetsView';
import { PropertyView } from './components/PropertyView';
import { VendorsView } from './components/VendorsView';
import { ProcurementView } from './components/ProcurementView';
import { BudgetsView } from './components/BudgetsView';
import { AiChatAnalyst } from './components/AiChatAnalyst';
import { AiExecutiveReports } from './components/AiExecutiveReports';
import { DataImportView } from './components/DataImportView';
import { AuditLogsView } from './components/AuditLogsView';
import { IndustryIntelligenceView } from './components/IndustryIntelligenceView';
import { GroupConglomerateView } from './components/GroupConglomerateView';
import { DepartmentWorkflowView } from './components/DepartmentWorkflowView';
import { AppSyncView } from './components/AppSyncView';
import { SettingsView } from './components/SettingsView';
import { INFRA_39_DEPARTMENTS_TEMPLATE } from './data/departmentData';
import { ensureDepartmentsHaveUsersAndRules } from './data/departmentUserData';
import { Department } from './types';
import {
  AppEnvironmentMode,
  DemoScenarioPreset,
  EnterpriseAppData,
  loadStoredAppMode,
  saveStoredAppMode,
  getInitialRealProductionData,
  getDemoShowcaseData,
} from './utils/storage';
import { KeyRound, LogIn, LogOut } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { AuthGate } from './components/AuthGate';
import * as api from './utils/api';
import { WorkspaceData } from './utils/api';
import { getUpcomingRenewals } from './utils/formatters';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AlternativeEngineModal } from './components/AlternativeEngineModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ApprovalCostBurdenModal } from './components/ApprovalCostBurdenModal';
import { VendorNegotiationModal } from './components/VendorNegotiationModal';

export function App() {
  const [appMode, setAppMode] = useState<AppEnvironmentMode>(() => loadStoredAppMode());

  // In PRODUCTION mode the real dataset lives on the server and can only be
  // fetched once we know who's signed in, so we start with a harmless empty
  // skeleton and never render it until authView reaches 'APP'. In DEMO mode
  // there's no login wall, so we can populate it immediately.
  const [initialData] = useState<EnterpriseAppData>(() => {
    const mode = loadStoredAppMode();
    return mode === 'PRODUCTION' ? getInitialRealProductionData() : getDemoShowcaseData();
  });

  // Gates whether we show a loading state, the real sign-in/sign-up screen,
  // or the actual application. In PRODUCTION mode this is only 'APP' once a
  // valid session has been confirmed with the server.
  const [authView, setAuthView] = useState<'LOADING' | 'GATE' | 'APP'>(() =>
    loadStoredAppMode() === 'PRODUCTION' ? 'LOADING' : 'APP'
  );

  // Enterprise App State
  const [companies, setCompanies] = useState<Company[]>(initialData.companies);
  const [selectedCompany, setSelectedCompany] = useState<Company>(
    () => initialData.companies.find((c) => c.id === initialData.selectedCompanyId) || initialData.companies[0]
  );
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialData.currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('DASHBOARD');
  const [currency, setCurrency] = useState<CurrencyCode>(initialData.currency || 'INR');

  // Core Ledgers
  const [expenses, setExpenses] = useState<Expense[]>(initialData.expenses);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialData.subscriptions);
  const [assets, setAssets] = useState<Asset[]>(initialData.assets);
  const [vendors, setVendors] = useState<Vendor[]>(initialData.vendors);
  const [savings, setSavings] = useState<SavingsOpportunity[]>(initialData.savings);
  const [properties, setProperties] = useState<PropertyLocation[]>(initialData.properties);
  const [budgets, setBudgets] = useState<Budget[]>(initialData.budgets);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>(initialData.procurements);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialData.auditLogs);
  const [departments, setDepartments] = useState<Department[]>(initialData.departments);

  // Helper to apply a full dataset into all state hooks
  const applyFullDataset = (data: EnterpriseAppData) => {
    setCompanies(data.companies);
    const selComp = data.companies.find((c) => c.id === data.selectedCompanyId) || data.companies[0];
    setSelectedCompany(selComp);
    setCurrentUser(data.currentUser);
    setCurrency(data.currency || 'INR');
    setExpenses(data.expenses);
    setSubscriptions(data.subscriptions);
    setAssets(data.assets);
    setVendors(data.vendors);
    setSavings(data.savings);
    setProperties(data.properties);
    setBudgets(data.budgets);
    setProcurements(data.procurements);
    setAuditLogs(data.auditLogs);
    setDepartments(data.departments);
  };

  // On mount (and whenever we switch into PRODUCTION mode), check whether the
  // browser already has a valid session cookie so a returning user doesn't
  // have to log in again every visit.
  useEffect(() => {
    if (appMode !== 'PRODUCTION') {
      setAuthView('APP');
      return;
    }
    let cancelled = false;
    setAuthView('LOADING');
    api
      .getSession()
      .then((session) => {
        if (cancelled) return;
        if (session) {
          applyFullDataset({ ...session.workspace, currentUser: session.user } as EnterpriseAppData);
          setAuthView('APP');
        } else {
          setAuthView('GATE');
        }
      })
      .catch(() => {
        if (!cancelled) setAuthView('GATE');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode]);

  // Auto-persist to the server whenever ledger data changes, in PRODUCTION
  // mode, once we're actually signed in (never before — that would race with
  // the session check and could overwrite server data with placeholder data).
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstAuthedRender = React.useRef(true);
  useEffect(() => {
    if (appMode !== 'PRODUCTION' || authView !== 'APP') return;
    // Skip the very first render right after becoming authenticated — that
    // data just came FROM the server, so writing it straight back is wasted
    // work (and could race with the fetch that populated it).
    if (isFirstAuthedRender.current) {
      isFirstAuthedRender.current = false;
      return;
    }
    const workspace: WorkspaceData = {
      companies,
      selectedCompanyId: selectedCompany?.id || companies[0]?.id || '',
      currency,
      expenses,
      subscriptions,
      assets,
      vendors,
      savings,
      properties,
      budgets,
      procurements,
      auditLogs,
      departments,
    };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      api.saveWorkspace(workspace).catch((err) => console.error('Failed to save workspace:', err));
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    appMode,
    authView,
    companies,
    selectedCompany,
    currency,
    expenses,
    subscriptions,
    assets,
    vendors,
    savings,
    properties,
    budgets,
    procurements,
    auditLogs,
    departments,
  ]);

  // Called by AuthGate once signup or login succeeds.
  const handleAuthenticated = (user: UserProfile, workspace: WorkspaceData) => {
    isFirstAuthedRender.current = true;
    applyFullDataset({ ...workspace, currentUser: user } as EnterpriseAppData);
    setIsAuthenticated(true);
    setAuthView('APP');
  };

  // Mode Switch Handlers
  const handleSwitchAppMode = (newMode: AppEnvironmentMode) => {
    setAppMode(newMode);
    saveStoredAppMode(newMode);
    if (newMode === 'DEMO') {
      const demoData = getDemoShowcaseData();
      applyFullDataset(demoData);
      setAuthView('APP');
      logAuditEvent('SWITCHED_MODE', 'SYSTEM', 'Switched environment to Demo Sandbox Mode.');
    }
    // Switching to PRODUCTION triggers the session-check effect above, which
    // will show the real sign-in screen or restore the signed-in session.
  };

  const handleLoadDemoScenario = (preset: DemoScenarioPreset) => {
    const demoData = getDemoShowcaseData(preset);
    applyFullDataset(demoData);
    logAuditEvent('LOADED_DEMO_SCENARIO', 'SYSTEM', `Loaded demo scenario preset: ${preset}`);
  };

  const handleResetRealData = () => {
    const cleanData = getInitialRealProductionData();
    applyFullDataset({ ...cleanData, currentUser });
    logAuditEvent('RESET_DATABASE', 'SYSTEM', 'Reset real database to clean production ledger with 0 dummy spend.');
  };

  const handleImportRealData = (data: EnterpriseAppData) => {
    // Never let an imported file change who is actually logged in — only
    // apply the operational ledger fields, keeping the authenticated user.
    applyFullDataset({ ...data, currentUser });
    logAuditEvent('IMPORTED_DATABASE', 'SYSTEM', 'Imported enterprise database from external JSON.');
  };

  // Modals & UI Triggers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isReceiptScanOpen, setIsReceiptScanOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [alternativeTarget, setAlternativeTarget] = useState<{
    itemName: string;
    itemType: string;
    currentCost: number;
    currentVendor: string;
  } | null>(null);

  // Cost Burden Inspection Modal State
  const [activeApprovalItem, setActiveApprovalItem] = useState<{
    item: Expense | ProcurementRequest;
    type: 'EXPENSE' | 'PROCUREMENT';
  } | null>(null);

  // Vendor Negotiation Modal State
  const [activeNegotiationVendor, setActiveNegotiationVendor] = useState<{
    vendorName: string;
    annualSpend: number;
    category?: string;
  } | null>(null);

  const [isAuditing, setIsAuditing] = useState(false);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handler: Sign Out
  const handleSignOut = () => {
    if (appMode === 'PRODUCTION') {
      api.logout().finally(() => {
        // Full reload guarantees no stale tenant data lingers in memory
        // before the next person signs in on this device.
        window.location.reload();
      });
    } else {
      logAuditEvent('USER_SIGNOUT', 'SECURITY', `User ${currentUser.name} signed out of session.`);
    }
  };

  // Handler: Open Demo Persona Switcher (Demo Sandbox mode only — real
  // sign-in/sign-up always happens through AuthGate).
  const handleOpenPersonaModal = () => {
    setIsAuthModalOpen(true);
  };

  // Handler: Select User Profile & Authenticate
  const handleSelectUser = (u: UserProfile) => {
    setCurrentUser(u);
    setIsAuthenticated(true);
    logAuditEvent('USER_AUTHENTICATED', 'SECURITY', `Session authenticated for ${u.name} (${u.role})`);
  };

  // Handler: Log an audit event. Writes to the real server-side, insert-only
  // audit_log table (so it can't be silently rewritten by a later workspace
  // save) and also keeps a local optimistic copy for immediate display.
  // `meta` carries the structured field-level diff for edits so "what
  // changed" can be reconstructed generically instead of only from a
  // hand-written sentence.
  const logAuditEvent = (
    action: string,
    entityType: AuditLog['entityType'],
    details: string,
    meta?: { entityId?: string; entityName?: string; changes?: AuditLogChange[] }
  ) => {
    const optimisticLog: AuditLog = {
      id: `log-${Date.now()}`,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId: meta?.entityId,
      entityName: meta?.entityName,
      changes: meta?.changes,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [optimisticLog, ...prev]);

    fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        entityType,
        entityId: meta?.entityId,
        entityName: meta?.entityName,
        changes: meta?.changes,
        details,
      }),
    }).catch(() => {
      // Best-effort: the optimistic local entry still shows in-session even
      // if the write fails (e.g. offline) — it just won't be durable.
    });
  };

  /** Builds a field-level diff between the previous and next version of a
   * record, skipping unchanged fields and any keys in `ignore` (ids,
   * derived/computed fields that shouldn't show up as "changes"). */
  const diffFields = <T extends Record<string, any>>(before: T, after: T, ignore: string[] = []): AuditLogChange[] => {
    const changes: AuditLogChange[] = [];
    const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    keys.forEach((key) => {
      if (ignore.includes(key)) return;
      const oldValue = (before as any)?.[key];
      const newValue = (after as any)?.[key];
      if (typeof oldValue === 'object' || typeof newValue === 'object') return;
      if (oldValue !== newValue) changes.push({ field: key, oldValue: oldValue ?? null, newValue: newValue ?? null });
    });
    return changes;
  };

  // Handler: Update Savings Opportunity Status
  const handleUpdateOpportunityStatus = (id: string, newStatus: OpportunityStatus) => {
    setSavings((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          logAuditEvent(
            `UPDATED_SAVINGS_STATUS`,
            'SAVINGS',
            `Changed status of "${s.title}" from ${s.status} to ${newStatus} by ${currentUser.name}`
          );
          return {
            ...s,
            status: newStatus,
            reviewedBy: currentUser.name,
            implementedDate: newStatus === 'REALIZED' ? new Date().toISOString().split('T')[0] : s.implementedDate,
          };
        }
        return s;
      })
    );
  };

  // Handler: Add Expense
  const handleAddExpense = (newExp: Partial<Expense>) => {
    const exp: Expense = {
      id: `exp-${Date.now()}`,
      companyId: selectedCompany.id,
      description: newExp.description || 'New Expense',
      amount: newExp.amount || 0,
      currency: currency,
      category: newExp.category || 'Software & SaaS',
      subcategory: newExp.subcategory || 'General',
      departmentId: 'dept-eng',
      departmentName: newExp.departmentName || currentUser.departmentName || 'Core Platform Engineering',
      costCenter: 'CC-ENG',
      vendorId: 'vnd-gen',
      vendorName: newExp.vendorName || 'General Supplier',
      date: newExp.date || new Date().toISOString().split('T')[0],
      employeeName: newExp.employeeName || currentUser.name,
      employeeId: currentUser.id,
      paymentMethod: 'Corporate Card',
      approvalStatus: newExp.approvalStatus || 'PENDING',
      recurring: newExp.recurring || 'Monthly',
      tags: ['operational'],
    };

    setExpenses((prev) => [exp, ...prev]);
    logAuditEvent('CREATED_EXPENSE', 'EXPENSE', `Expense created: "${exp.description}" (${exp.amount} ${exp.currency})`, {
      entityId: exp.id,
      entityName: exp.description,
    });
  };

  // Handler: Update Expense — computes a real field-level diff so the audit
  // trail shows exactly what changed, not just that "something" did.
  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, ...updates };
        const changes = diffFields(e, updated, ['id', 'companyId', 'employeeId', 'departmentId', 'vendorId', 'costCenter', 'tags']);
        if (changes.length > 0) {
          logAuditEvent('UPDATED_EXPENSE', 'EXPENSE', `Edited expense "${e.description}"`, {
            entityId: e.id,
            entityName: updated.description,
            changes,
          });
        }
        return updated;
      })
    );
  };

  // Handler: Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target) {
        logAuditEvent('DELETED_EXPENSE', 'EXPENSE', `Deleted expense "${target.description}" (${target.amount} ${target.currency})`, {
          entityId: target.id,
          entityName: target.description,
        });
      }
      return prev.filter((e) => e.id !== id);
    });
  };

  // Handler: Batch Import
  const handleBatchImport = (items: Partial<Expense>[]) => {
    const formatted: Expense[] = items.map((item, idx) => ({
      id: `exp-imp-${Date.now()}-${idx}`,
      companyId: selectedCompany.id,
      description: item.description || 'Imported Line Item',
      amount: item.amount || 0,
      currency: currency,
      category: item.category || 'Office Supplies & Misc',
      subcategory: item.subcategory || 'General',
      departmentId: 'dept-imported',
      departmentName: item.departmentName || 'Unassigned',
      costCenter: 'IMPORTED',
      vendorId: 'vnd-imp',
      vendorName: item.vendorName || 'Unknown Vendor',
      date: item.date || new Date().toISOString().split('T')[0],
      employeeName: item.employeeName || currentUser.name,
      employeeId: currentUser.id,
      paymentMethod: 'Invoice NET30',
      approvalStatus: 'APPROVED',
      recurring: item.recurring || 'One-Time',
      tags: ['batch-import'],
      aiAnomaly: item.aiAnomaly,
    }));

    setExpenses((prev) => [...formatted, ...prev]);
    logAuditEvent('BATCH_IMPORTED_EXPENSES', 'EXPENSE', `Ingested ${items.length} ledger records from CSV upload`);
  };

  // Handler: Add Subscription
  const handleAddSubscription = (newSub: Partial<Subscription>) => {
    const sub: Subscription = {
      id: `sub-${Date.now()}`,
      companyId: selectedCompany.id,
      softwareName: newSub.softwareName || 'New Tool',
      vendorName: newSub.vendorName || 'Vendor',
      category: newSub.category || 'Productivity & Collaboration',
      planName: newSub.planName || 'Standard',
      seatsTotal: newSub.seatsTotal || 10,
      seatsUsed: newSub.seatsUsed || 8,
      seatsUnused: newSub.seatsUnused || 2,
      annualCost: newSub.annualCost || 100000,
      monthlyCost: newSub.monthlyCost || Math.round((newSub.annualCost || 100000) / 12),
      currency: currency,
      billingCycle: newSub.billingCycle || 'Annual',
      renewalDate: newSub.renewalDate || '2026-12-31',
      contractEnd: newSub.contractEnd || '2027-12-31',
      ownerName: newSub.ownerName || currentUser.name,
      departmentName: newSub.departmentName || 'Core Platform Engineering',
      usageRate: newSub.usageRate || 80,
      status: newSub.status || 'ACTIVE',
    };

    setSubscriptions((prev) => [sub, ...prev]);
    logAuditEvent('REGISTERED_SUBSCRIPTION', 'SUBSCRIPTION', `Registered SaaS license "${sub.softwareName}" (${sub.annualCost} ${sub.currency}/yr)`, {
      entityId: sub.id,
      entityName: sub.softwareName,
    });
  };

  // Handler: Update Subscription
  const handleUpdateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...updates };
        const changes = diffFields(s, updated, ['id', 'companyId', 'currency', 'contractEnd', 'usageRate']);
        if (changes.length > 0) {
          logAuditEvent('UPDATED_SUBSCRIPTION', 'SUBSCRIPTION', `Edited subscription "${s.softwareName}"`, {
            entityId: s.id,
            entityName: updated.softwareName,
            changes,
          });
        }
        return updated;
      })
    );
  };

  // Handler: Delete Subscription
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) {
        logAuditEvent('DELETED_SUBSCRIPTION', 'SUBSCRIPTION', `Deleted subscription "${target.softwareName}"`, {
          entityId: target.id,
          entityName: target.softwareName,
        });
      }
      return prev.filter((s) => s.id !== id);
    });
  };

  // Handler: Add Asset
  const handleAddAsset = (newAst: Partial<Asset>) => {
    const ast: Asset = {
      id: `ast-${Date.now()}`,
      companyId: selectedCompany.id,
      name: newAst.name || 'Hardware Unit',
      type: newAst.type || 'LAPTOP',
      serialNumber: newAst.serialNumber || `SN-${Date.now()}`,
      purchasePrice: newAst.purchasePrice || 100000,
      currentValue: newAst.currentValue || 80000,
      currency: currency,
      purchaseDate: newAst.purchaseDate || new Date().toISOString().split('T')[0],
      depreciationRateYearly: newAst.depreciationRateYearly || 20,
      location: newAst.location || 'Bengaluru HQ',
      assignedToName: newAst.assignedToName,
      departmentName: newAst.departmentName || 'Core Platform Engineering',
      utilizationScore: newAst.utilizationScore || 80,
      maintenanceCostYearly: newAst.maintenanceCostYearly || 5000,
      insuranceCostYearly: newAst.insuranceCostYearly || 2000,
      status: (newAst.status || 'ACTIVE') as AssetStatus,
    };

    setAssets((prev) => [ast, ...prev]);
    logAuditEvent('REGISTERED_ASSET', 'ASSET', `Registered hardware asset "${ast.name}" (${ast.serialNumber})`, {
      entityId: ast.id,
      entityName: ast.name,
    });
  };

  // Handler: Update Asset
  const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, ...updates };
        const changes = diffFields(a, updated, ['id', 'companyId', 'currentValue', 'utilizationScore', 'maintenanceCostYearly', 'insuranceCostYearly', 'depreciationRateYearly']);
        if (changes.length > 0) {
          logAuditEvent('UPDATED_ASSET', 'ASSET', `Edited asset "${a.name}"`, { entityId: a.id, entityName: updated.name, changes });
        }
        return updated;
      })
    );
  };

  // Handler: Delete Asset
  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) {
        logAuditEvent('DELETED_ASSET', 'ASSET', `Deleted asset "${target.name}" (${target.serialNumber})`, {
          entityId: target.id,
          entityName: target.name,
        });
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  // Handler: Add Vendor
  const handleAddVendor = (newVendor: Partial<Vendor>) => {
    const vendor: Vendor = {
      id: `vnd-${Date.now()}`,
      companyId: selectedCompany.id,
      name: newVendor.name || 'New Vendor',
      category: newVendor.category || 'Uncategorized',
      departmentName: newVendor.departmentName || 'Unassigned',
      totalSpendAnnual: newVendor.totalSpendAnnual || 0,
      currency: currency,
      monthlySpendAverage: newVendor.monthlySpendAverage || Math.round((newVendor.totalSpendAnnual || 0) / 12),
      activeContractsCount: newVendor.activeContractsCount || 1,
      contractRenewalDate: newVendor.contractRenewalDate || '',
      paymentTerms: newVendor.paymentTerms || 'NET30',
      priceChangePercent12m: newVendor.priceChangePercent12m || 0,
      riskScore: newVendor.riskScore || 'LOW',
      status: newVendor.status || 'ACTIVE',
    };

    setVendors((prev) => [vendor, ...prev]);
    logAuditEvent('REGISTERED_VENDOR', 'VENDOR', `Added vendor "${vendor.name}" (${vendor.category})`, {
      entityId: vendor.id,
      entityName: vendor.name,
    });
  };

  // Handler: Update Vendor
  const handleUpdateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v, ...updates };
        const changes = diffFields(v, updated, ['id', 'companyId']);
        if (changes.length > 0) {
          logAuditEvent('UPDATED_VENDOR', 'VENDOR', `Edited vendor "${v.name}"`, { entityId: v.id, entityName: updated.name, changes });
        }
        return updated;
      })
    );
  };

  // Handler: Delete Vendor
  const handleDeleteVendor = (id: string) => {
    setVendors((prev) => {
      const target = prev.find((v) => v.id === id);
      if (target) {
        logAuditEvent('DELETED_VENDOR', 'VENDOR', `Deleted vendor "${target.name}"`, { entityId: target.id, entityName: target.name });
      }
      return prev.filter((v) => v.id !== id);
    });
  };

  // Handler: Add Budget
  const handleAddBudget = (newBudget: Partial<Budget>) => {
    const budget: Budget = {
      id: `bgt-${Date.now()}`,
      companyId: selectedCompany.id,
      departmentName: newBudget.departmentName || 'Unassigned',
      category: newBudget.category || 'Office Supplies & Misc',
      fiscalQuarter: newBudget.fiscalQuarter || 'Q1 FY26',
      allocatedAmount: newBudget.allocatedAmount || 0,
      spentAmount: newBudget.spentAmount || 0,
      forecastAmount: newBudget.forecastAmount || newBudget.allocatedAmount || 0,
      currency: currency,
      varianceAmount: newBudget.varianceAmount ?? (newBudget.allocatedAmount || 0),
      variancePercent: newBudget.variancePercent || 0,
      status: newBudget.status || 'ON_TRACK',
    };

    setBudgets((prev) => [budget, ...prev]);
    logAuditEvent('CREATED_BUDGET', 'BUDGET', `Created budget for "${budget.departmentName}" (${budget.fiscalQuarter})`, {
      entityId: budget.id,
      entityName: `${budget.departmentName} — ${budget.fiscalQuarter}`,
    });
  };

  // Handler: Update Budget
  const handleUpdateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, ...updates };
        const changes = diffFields(b, updated, ['id', 'companyId', 'currency']);
        if (changes.length > 0) {
          logAuditEvent('UPDATED_BUDGET', 'BUDGET', `Edited budget for "${b.departmentName}"`, {
            entityId: b.id,
            entityName: `${updated.departmentName} — ${updated.fiscalQuarter}`,
            changes,
          });
        }
        return updated;
      })
    );
  };

  // Handler: Delete Budget
  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => {
      const target = prev.find((b) => b.id === id);
      if (target) {
        logAuditEvent('DELETED_BUDGET', 'BUDGET', `Deleted budget for "${target.departmentName}" (${target.fiscalQuarter})`, {
          entityId: target.id,
          entityName: `${target.departmentName} — ${target.fiscalQuarter}`,
        });
      }
      return prev.filter((b) => b.id !== id);
    });
  };

  // Handler: Add Procurement Request
  const handleAddProcurement = (newReq: Partial<ProcurementRequest>) => {
    const req: ProcurementRequest = {
      id: `proc-${Date.now()}`,
      companyId: selectedCompany.id,
      title: newReq.title || 'New Purchase Requisition',
      requestedByName: newReq.requestedByName || currentUser.name,
      departmentName: newReq.departmentName || currentUser.departmentName || 'General',
      estimatedCost: newReq.estimatedCost || 50000,
      currency: currency,
      vendorName: newReq.vendorName || 'Supplier Inc',
      category: newReq.category || 'Software & SaaS',
      urgency: newReq.urgency || 'NORMAL',
      status: 'SUBMITTED',
      requestDate: newReq.requestDate || new Date().toISOString().split('T')[0],
      justification: newReq.justification || 'Operational business requirement',
      approvalChain: [
        {
          step: 'Department Head Approval',
          approverRole: 'DEPT_HEAD',
          status: 'PENDING',
        },
      ],
    };

    setProcurements((prev) => [req, ...prev]);
    logAuditEvent('SUBMITTED_PROCUREMENT_REQUEST', 'PROCUREMENT', `Requisition "${req.title}" submitted (${req.estimatedCost} ${req.currency})`);
  };

  // Handler: Direct Approval / Rejection
  const handleApproveExpense = (id: string, notes?: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, approvalStatus: 'APPROVED' } : e))
    );
    logAuditEvent('APPROVED_EXPENSE', 'EXPENSE', `Expense #${id} approved by ${currentUser.name}. ${notes || ''}`);
  };

  const handleRejectExpense = (id: string, reason?: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, approvalStatus: 'REJECTED' } : e))
    );
    logAuditEvent('REJECTED_EXPENSE', 'EXPENSE', `Expense #${id} rejected by ${currentUser.name}. Reason: ${reason || 'Unspecified'}`);
  };

  const handleApproveProcurement = (id: string, notes?: string) => {
    setProcurements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'MANAGER_APPROVED' } : p))
    );
    logAuditEvent('APPROVED_PROCUREMENT', 'PROCUREMENT', `Requisition #${id} approved by ${currentUser.name}. ${notes || ''}`);
  };

  const handleRejectProcurement = (id: string, reason?: string) => {
    setProcurements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED' } : p))
    );
    logAuditEvent('REJECTED_PROCUREMENT', 'PROCUREMENT', `Requisition #${id} rejected by ${currentUser.name}. Reason: ${reason || 'Unspecified'}`);
  };

  // Handler: Apply What-If Scenario Plan directly to live optimization roadmap
  const handleApplyScenarioPlan = (scenarioName: string, estimatedAnnualSavings: number) => {
    const newOpportunity: SavingsOpportunity = {
      id: `sav-sim-${Date.now()}`,
      companyId: selectedCompany.id,
      category: 'Cloud Infrastructure',
      actionType: 'CONSOLIDATE',
      title: `${scenarioName} - Strategic Execution Plan`,
      targetEntityName: scenarioName,
      currentCostAnnual: Math.round(estimatedAnnualSavings * 2.5),
      estimatedSavingAnnual: estimatedAnnualSavings,
      actualSavingConfirmed: estimatedAnnualSavings,
      currency: currency,
      status: 'IN_PROGRESS',
      confidence: 'HIGH',
      effort: 'MEDIUM',
      risk: 'LOW',
      roi: '12x',
      problem: `Multi-lever cost rationalization scenario generated by CFO What-If Engine.`,
      recommendedAction: `Execute phased optimization across SaaS seats, Cloud reservations, and group master SLAs.`,
      evidence: `Financial simulation models runway expansion and direct margin dividend.`,
      identifiedDate: new Date().toISOString().split('T')[0],
      reviewedBy: currentUser.name,
      alternatives: [],
    };

    setSavings((prev) => [newOpportunity, ...prev]);
    logAuditEvent('APPLIED_SIMULATION_SCENARIO', 'SAVINGS', `Active scenario "${scenarioName}" committed with target annual savings of ${estimatedAnnualSavings} ${currency}`);
  };

  // Handler: Trigger AI Audit
  const handleTriggerAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses,
          subscriptions,
          assets,
          company: selectedCompany,
          currency,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.opportunities && Array.isArray(data.opportunities)) {
          setSavings(data.opportunities);
          logAuditEvent('TRIGGERED_AI_AUDIT', 'SAVINGS', `AI Audit discovered ${data.opportunities.length} validated cost reduction vectors.`);
        }
      }
    } catch (e) {
      console.warn('AI Audit local fallback active');
    } finally {
      setIsAuditing(false);
    }
  };

  // Handler: Add Industry Savings
  const handleAddIndustrySavings = (title: string, amount: number, problem: string, action: string, category: ExpenseCategory) => {
    const newOpp: SavingsOpportunity = {
      id: `sav-ind-${Date.now()}`,
      companyId: selectedCompany.id,
      category: category,
      actionType: 'RENEGOTIATE',
      title: title,
      targetEntityName: title,
      currentCostAnnual: amount * 2.2,
      estimatedSavingAnnual: amount,
      actualSavingConfirmed: 0,
      currency: currency,
      status: 'DETECTED',
      confidence: 'HIGH',
      effort: 'MEDIUM',
      risk: 'LOW',
      roi: '8.5x',
      problem: problem,
      recommendedAction: action,
      evidence: `Benchmark cost disparity detected against real-world Indian operational indices.`,
      identifiedDate: new Date().toISOString().split('T')[0],
      alternatives: [],
    };

    setSavings((prev) => [newOpp, ...prev]);
    logAuditEvent('IDENTIFIED_INDUSTRY_SAVINGS', 'SAVINGS', `Industry optimization logged: "${title}" (${amount} ${currency})`);
  };

  // Render role-specific Dashboard or Sub-view
  const renderMainContent = () => {
    if (currentTab === 'DEPARTMENT_WORKFLOWS') {
      return (
        <DepartmentWorkflowView
          company={selectedCompany}
          departments={departments}
          onUpdateDepartments={(updated) => {
            setDepartments(updated);
            logAuditEvent(
              'UPDATED_DEPARTMENTS',
              'SYSTEM',
              `Updated department configuration (${updated.length} active departments) by ${currentUser.name}`
            );
          }}
          currency={currency}
          onNavigateTab={(tab) => setCurrentTab(tab as any)}
        />
      );
    }

    if (currentTab === 'APP_SYNC') {
      return (
        <AppSyncView
          company={selectedCompany}
          departments={departments}
          currency={currency}
          onNavigateTab={(tab) => setCurrentTab(tab as any)}
          onUpdateDepartments={(updated) => {
            setDepartments(updated);
            logAuditEvent(
              'HR_PAYROLL_SYNC',
              'SYSTEM',
              `Auto-synced department rosters and reporting hierarchy via App Sync by ${currentUser.name}`
            );
          }}
        />
      );
    }

    if (currentTab === 'INDUSTRY_VERTICALS') {
      return (
        <IndustryIntelligenceView
          currency={currency}
          activeIndustry={selectedCompany.industryVertical || 'HOTEL_HOSPITALITY'}
          onSelectIndustry={(ind) => {
            const matchingCompany = companies.find((c) => c.industryVertical === ind);
            if (matchingCompany) {
              setSelectedCompany(matchingCompany);
            }
          }}
          onAskAi={() => {
            setCurrentTab('AI_ANALYST');
          }}
          onAddSavingsOpportunity={handleAddIndustrySavings}
        />
      );
    }

    if (currentTab === 'SAVINGS_CENTER') {
      return (
        <SavingsCenter
          savings={savings}
          currency={currency}
          userRole={currentUser.role}
          company={selectedCompany}
          onUpdateStatus={handleUpdateOpportunityStatus}
          onOpenAlternativeEngine={(item) => setAlternativeTarget(item)}
          onTriggerAudit={handleTriggerAudit}
          isAuditing={isAuditing}
          onOpenNegotiation={(vendorName, annualSpend, category) => {
            setActiveNegotiationVendor({ vendorName, annualSpend, category });
          }}
          onApplyScenarioPlan={handleApplyScenarioPlan}
        />
      );
    }

    if (currentTab === 'AI_ANALYST') {
      return (
        <AiChatAnalyst
          currentUser={currentUser}
          company={selectedCompany}
          currency={currency}
        />
      );
    }

    if (currentTab === 'EXPENSES') {
      return (
        <ExpensesView
          expenses={expenses}
          currency={currency}
          userRole={currentUser.role}
          currentUserName={currentUser.name}
          currentUserDepartment={currentUser.departmentName}
          departments={departments}
          budgets={budgets}
          subscriptions={subscriptions}
          company={selectedCompany}
          onAddExpense={handleAddExpense}
          onUpdateExpense={handleUpdateExpense}
          onDeleteExpense={handleDeleteExpense}
          onOpenReceiptScan={() => setIsReceiptScanOpen(true)}
          onApproveExpense={handleApproveExpense}
          onRejectExpense={handleRejectExpense}
          onInspectCostBurden={(exp) => {
            setActiveApprovalItem({ item: exp, type: 'EXPENSE' });
          }}
          onOpenNegotiation={(vendorName, annualSpend, category) => {
            setActiveNegotiationVendor({ vendorName, annualSpend, category });
          }}
        />
      );
    }

    if (currentTab === 'SUBSCRIPTIONS') {
      return (
        <SubscriptionsView
          subscriptions={subscriptions}
          currency={currency}
          userRole={currentUser.role}
          departments={departments}
          onAddSubscription={handleAddSubscription}
          onUpdateSubscription={handleUpdateSubscription}
          onDeleteSubscription={handleDeleteSubscription}
          onOpenAlternativeEngine={(item) => setAlternativeTarget(item)}
        />
      );
    }

    if (currentTab === 'ASSETS') {
      return (
        <AssetsView
          assets={assets}
          currency={currency}
          userRole={currentUser.role}
          departments={departments}
          onAddAsset={handleAddAsset}
          onUpdateAsset={handleUpdateAsset}
          onDeleteAsset={handleDeleteAsset}
        />
      );
    }

    if (currentTab === 'PROPERTY') {
      return (
        <PropertyView
          properties={properties}
          currency={currency}
          onOpenAlternativeEngine={(item) => setAlternativeTarget(item)}
        />
      );
    }

    if (currentTab === 'EMPLOYEES') {
      return (
        <HrDashboard
          currency={currency}
          savings={savings}
          departments={departments}
          onNavigateTab={(tab) => setCurrentTab(tab)}
        />
      );
    }

    if (currentTab === 'VENDORS') {
      return (
        <VendorsView
          vendors={vendors}
          currency={currency}
          userRole={currentUser.role}
          onAddVendor={handleAddVendor}
          onUpdateVendor={handleUpdateVendor}
          onDeleteVendor={handleDeleteVendor}
          onOpenAlternativeEngine={(item) => setAlternativeTarget(item)}
        />
      );
    }

    if (currentTab === 'PROCUREMENT' || currentTab === 'APPROVALS') {
      return (
        <ProcurementView
          procurements={procurements}
          currency={currency}
          userRole={currentUser.role}
          currentUserName={currentUser.name}
          departments={departments}
          budgets={budgets}
          subscriptions={subscriptions}
          company={selectedCompany}
          onApproveProcurement={handleApproveProcurement}
          onRejectProcurement={handleRejectProcurement}
          onNewRequest={handleAddProcurement}
          onInspectCostBurden={(proc) => {
            setActiveApprovalItem({ item: proc, type: 'PROCUREMENT' });
          }}
          onOpenNegotiation={(vendorName, annualSpend, category) => {
            setActiveNegotiationVendor({ vendorName, annualSpend, category });
          }}
        />
      );
    }

    if (currentTab === 'BUDGETS') {
      return (
        <BudgetsView
          budgets={budgets}
          currency={currency}
          userRole={currentUser.role}
          onAddBudget={handleAddBudget}
          onUpdateBudget={handleUpdateBudget}
          onDeleteBudget={handleDeleteBudget}
          onOpenSimulator={() => {
            setCurrentTab('SAVINGS_CENTER');
          }}
        />
      );
    }

    if (currentTab === 'REPORTS') {
      return (
        <AiExecutiveReports
          company={selectedCompany}
          savings={savings}
          currency={currency}
        />
      );
    }

    if (currentTab === 'IMPORT') {
      return (
        <DataImportView
          onBatchImportExpenses={handleBatchImport}
          currency={currency}
        />
      );
    }

    if (currentTab === 'AUDIT_LOGS') {
      return <AuditLogsView localLogs={auditLogs} />;
    }

    if (currentTab === 'SETTINGS') {
      const currentSnapshot: EnterpriseAppData = {
        companies,
        selectedCompanyId: selectedCompany.id,
        currentUser,
        currency,
        expenses,
        subscriptions,
        assets,
        vendors,
        savings,
        properties,
        budgets,
        procurements,
        auditLogs,
        departments,
      };

      return (
        <SettingsView
          appMode={appMode}
          onSwitchMode={handleSwitchAppMode}
          onLoadDemoScenario={handleLoadDemoScenario}
          onResetRealData={handleResetRealData}
          onImportRealData={handleImportRealData}
          currentData={currentSnapshot}
          onUpdateCompany={(updatedComp) => {
            setCompanies((prev) => prev.map((c) => (c.id === updatedComp.id ? updatedComp : c)));
            if (selectedCompany.id === updatedComp.id) {
              setSelectedCompany(updatedComp);
            }
            logAuditEvent('UPDATED_COMPANY_PROFILE', 'SYSTEM', `Updated company profile for ${updatedComp.name}`);
          }}
          onChangeCurrency={(curr) => setCurrency(curr)}
          onOpenHrSync={() => setCurrentTab('APP_SYNC')}
          onNavigateTab={(tab) => setCurrentTab(tab as any)}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          onSignOut={handleSignOut}
          onOpenAuthModal={handleOpenPersonaModal}
          onUpdateUser={setCurrentUser}
        />
      );
    }

    // Default: 'DASHBOARD' -> Check if Group Conglomerate is selected
    const activeComp = selectedCompany || companies[0];
    if (activeComp?.isGroup) {
      const groupSubs = companies.filter((c) => c.parentGroupId === activeComp.id);
      return (
        <GroupConglomerateView
          groupCompany={activeComp}
          subsidiaries={groupSubs}
          currency={currency}
          onSelectSubsidiary={(sub) => {
            setSelectedCompany(sub);
            setCurrentTab('DASHBOARD');
          }}
          onNavigateTab={(tab) => setCurrentTab(tab)}
        />
      );
    }

    // Default: 'DASHBOARD' -> Choose view based on active User Role
    switch (currentUser.role) {
      case 'MASTER':
        return (
          <MasterDashboard
            companies={companies}
            currency={currency}
            auditLogs={auditLogs}
            onSelectCompany={(c) => setSelectedCompany(c)}
            onAddNewCompany={(newComp) => {
              const fullComp: Company = {
                id: `comp-${Date.now()}`,
                name: newComp.name || 'New Enterprise',
                industry: newComp.industry || 'Technology',
                size: newComp.size || '51-200',
                headquarters: newComp.headquarters || 'Bengaluru',
                currency: 'INR',
                annualRevenue: newComp.annualRevenue || 100000000,
                monthlyBurn: newComp.monthlyBurn || 3000000,
                totalExpensesYear: newComp.totalExpensesYear || 36000000,
                fiscalYear: 'FY 2026-27',
              };
              setCompanies((prev) => [...prev, fullComp]);
              setSelectedCompany(fullComp);
            }}
          />
        );

      case 'CFO':
        return (
          <CfoDashboard
            company={selectedCompany}
            expenses={expenses}
            budgets={budgets}
            vendors={vendors}
            savings={savings}
            currency={currency}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onApproveExpense={handleApproveExpense}
          />
        );

      case 'CTO':
        return (
          <CtoDashboard
            subscriptions={subscriptions}
            assets={assets}
            savings={savings}
            currency={currency}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenAlternativeEngine={(item) => setAlternativeTarget(item)}
          />
        );

      case 'HR':
        return (
          <HrDashboard
            currency={currency}
            savings={savings}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        );

      case 'EMPLOYEE':
        return (
          <EmployeePortal
            currentUser={currentUser}
            expenses={expenses}
            assets={assets}
            currency={currency}
            onSubmitExpense={handleAddExpense}
            onSubmitProcurement={handleAddProcurement}
            onOpenReceiptScan={() => setIsReceiptScanOpen(true)}
          />
        );

      case 'MD_CEO':
      case 'DEPT_HEAD':
      case 'MANAGER':
      default:
        return (
          <ExecutiveDashboard
            company={selectedCompany}
            savings={savings}
            expenses={expenses}
            departments={departments}
            currency={currency}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onUpdateOpportunityStatus={handleUpdateOpportunityStatus}
            onTriggerAudit={handleTriggerAudit}
            isAuditing={isAuditing}
          />
        );
    }
  };

  if (authView === 'LOADING') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-gray-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (authView === 'GATE') {
    return (
      <AuthGate
        onAuthenticated={handleAuthenticated}
        onUseDemoInstead={() => handleSwitchAppMode('DEMO')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F9FAFB] font-sans text-[#111827] antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        userRole={currentUser.role}
        isAuthenticated={isAuthenticated}
        onSignOut={handleSignOut}
        onSignIn={handleOpenPersonaModal}
        appMode={appMode}
        onToggleAppMode={() => handleSwitchAppMode(appMode === 'PRODUCTION' ? 'DEMO' : 'PRODUCTION')}
        onSelectTab={(tab) => setCurrentTab(tab)}
        potentialSavingsCount={savings.filter((s) => s.status === 'DETECTED').length}
        pendingApprovalsCount={
          expenses.filter((e) => e.approvalStatus === 'PENDING').length +
          procurements.filter((p) => p.status === 'SUBMITTED' || p.status === 'MANAGER_APPROVED').length
        }
        anomaliesCount={expenses.filter((e) => e.isAnomaly).length}
        renewalsSoonCount={getUpcomingRenewals(subscriptions, 30).length}
        companies={companies}
        selectedCompany={selectedCompany}
        onSelectCompany={(comp) => setSelectedCompany(comp)}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenPersonaModal}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          companies={companies}
          selectedCompany={selectedCompany}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          onSignOut={handleSignOut}
          onSignIn={handleOpenPersonaModal}
          currency={currency}
          appMode={appMode}
          onToggleAppMode={() => handleSwitchAppMode(appMode === 'PRODUCTION' ? 'DEMO' : 'PRODUCTION')}
          onOpenSettings={() => setCurrentTab('SETTINGS')}
          onSelectCompany={(comp) => setSelectedCompany(comp)}
          onSelectUser={handleSelectUser}
          onChangeCurrency={(cur) => setCurrency(cur)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenAuthModal={handleOpenPersonaModal}
          onOpenAiChat={() => setCurrentTab('AI_ANALYST')}
          demoUsers={DEMO_USERS}
          pendingApprovalsCount={
            expenses.filter((e) => e.approvalStatus === 'PENDING').length +
            procurements.filter((p) => p.status === 'SUBMITTED' || p.status === 'MANAGER_APPROVED').length
          }
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Auth & Role Switcher Modal */}
      {appMode === 'DEMO' && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          demoUsers={DEMO_USERS}
          companies={companies}
          selectedCompany={selectedCompany}
          onSelectCompany={(comp) => setSelectedCompany(comp)}
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
        />
      )}

      {/* Global Natural Language Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        expenses={expenses}
        subscriptions={subscriptions}
        assets={assets}
        vendors={vendors}
        savings={savings}
        properties={properties}
        currency={currency}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* AI Smart Alternative & Negotiation Engine Modal */}
      <AlternativeEngineModal
        isOpen={!!alternativeTarget}
        onClose={() => setAlternativeTarget(null)}
        targetItem={alternativeTarget}
        currency={currency}
      />

      {/* AI Receipt & Invoice Extraction Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScanOpen}
        onClose={() => setIsReceiptScanOpen(false)}
        currency={currency}
        onExtractedExpense={(exp) => {
          handleAddExpense(exp);
          setCurrentTab('EXPENSES');
        }}
      />

      {/* 5-Step Company Cost Snapshot Onboarding Generator */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currency={currency}
        onComplete={() => {
          setCurrentTab('SAVINGS_CENTER');
        }}
      />

      {/* Pre-Approval Cost Burden & Budget Headroom Inspection Modal */}
      {activeApprovalItem && (
        <ApprovalCostBurdenModal
          item={activeApprovalItem.item}
          type={activeApprovalItem.type}
          currency={currency}
          company={selectedCompany}
          budgets={budgets}
          subscriptions={subscriptions}
          onApprove={(id, notes) => {
            if (activeApprovalItem.type === 'EXPENSE') {
              handleApproveExpense(id, notes);
            } else {
              handleApproveProcurement(id, notes);
            }
            setActiveApprovalItem(null);
          }}
          onReject={(id, reason) => {
            if (activeApprovalItem.type === 'EXPENSE') {
              handleRejectExpense(id, reason);
            } else {
              handleRejectProcurement(id, reason);
            }
            setActiveApprovalItem(null);
          }}
          onCounterOffer={(vendor, spend) => {
            setActiveNegotiationVendor({
              vendorName: vendor,
              annualSpend: spend,
              category: activeApprovalItem.item.category,
            });
          }}
          onClose={() => setActiveApprovalItem(null)}
        />
      )}

      {/* Vendor Negotiation & Counter-Offer Dossier Generator */}
      {activeNegotiationVendor && (
        <VendorNegotiationModal
          vendorName={activeNegotiationVendor.vendorName}
          annualSpend={activeNegotiationVendor.annualSpend}
          category={activeNegotiationVendor.category}
          currency={currency}
          company={selectedCompany}
          onClose={() => setActiveNegotiationVendor(null)}
        />
      )}
    </div>
  );
}
export default App;
