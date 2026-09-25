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
import { EmployeePortal } from './components/EmployeePortal';
import { SavingsCenter } from './components/SavingsCenter';
import { ExpensesView } from './components/ExpensesView';
import { SubscriptionsView, needsDecision } from './components/SubscriptionsView';
import { HomeView } from './components/HomeView';
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
          versionRef.current = session.version;
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
  // Server version of the workspace we last loaded/saved (optimistic lock).
  const versionRef = React.useRef(0);
  // Saves run one at a time so each one quotes the version the previous returned.
  const saveChainRef = React.useRef<Promise<void>>(Promise.resolve());
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
      saveChainRef.current = saveChainRef.current.then(async () => {
        try {
          const res = await api.saveWorkspace(workspace, versionRef.current);
          versionRef.current = res.version;
        } catch (err) {
          if (!(err instanceof api.ApiError && err.status === 409)) {
            console.error('Failed to save workspace:', err);
            return;
          }
          // Someone else saved first: take theirs rather than overwrite it.
          // ponytail: last local edit is dropped (and said so); per-entity endpoints remove this.
          const latest = await api.getWorkspace();
          versionRef.current = latest.version;
          isFirstAuthedRender.current = true; // don't echo the reload straight back
          applyFullDataset({ ...latest.workspace, currentUser } as EnterpriseAppData);
          window.alert(`${err.message} Your last change was not saved; please redo it.`);
        }
      });
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
  const handleAuthenticated = (user: UserProfile, workspace: WorkspaceData, version: number) => {
    isFirstAuthedRender.current = true;
    versionRef.current = version;
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

  /** Edit handler for any record list: applies the update and logs a field-level
   * diff to the audit trail. `ignore` adds derived fields to skip beyond id/companyId. */
  const makeUpdate = <T extends { id: string }>(
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    action: string,
    entityType: AuditLog['entityType'],
    noun: string,
    name: (x: T) => string,
    ignore: string[],
    label: (x: T) => string = name
  ) => (id: string, updates: Partial<T>) =>
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        const updated = { ...x, ...updates };
        const changes = diffFields(x, updated, ['id', 'companyId', ...ignore]);
        if (changes.length > 0) {
          logAuditEvent(action, entityType, `Edited ${noun} "${label(x)}"`, { entityId: x.id, entityName: name(updated), changes });
        }
        return updated;
      })
    );

  /** Delete handler for any record list: removes it and logs `details(record)`. */
  const makeDelete = <T extends { id: string }>(
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    action: string,
    entityType: AuditLog['entityType'],
    name: (x: T) => string,
    details: (x: T) => string
  ) => (id: string) =>
    setItems((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target) logAuditEvent(action, entityType, details(target), { entityId: target.id, entityName: name(target) });
      return prev.filter((x) => x.id !== id);
    });

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

  const handleUpdateExpense = makeUpdate(setExpenses, 'UPDATED_EXPENSE', 'EXPENSE', 'expense', (e) => e.description, ['employeeId', 'departmentId', 'vendorId', 'costCenter', 'tags']);
  const handleDeleteExpense = makeDelete(setExpenses, 'DELETED_EXPENSE', 'EXPENSE', (e) => e.description, (e) => `Deleted expense "${e.description}" (${e.amount} ${e.currency})`);

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
    // Only what the user actually entered; never invent seats, cost or usage.
    const seatsTotal = newSub.seatsTotal ?? 0;
    const seatsUsed = newSub.seatsUsed ?? 0;
    const sub: Subscription = {
      softwareName: 'New Tool',
      vendorName: newSub.softwareName || 'Vendor',
      category: 'Productivity & Collaboration',
      planName: '',
      annualCost: 0,
      monthlyCost: 0,
      billingCycle: 'Annual',
      renewalDate: '',
      contractEnd: newSub.renewalDate || '',
      ownerName: currentUser.name,
      departmentName: 'Unassigned',
      status: 'ACTIVE',
      ...newSub,
      id: `sub-${Date.now()}`,
      companyId: selectedCompany.id,
      currency: currency,
      seatsTotal,
      seatsUsed,
      seatsUnused: Math.max(0, seatsTotal - seatsUsed),
      usageRate: seatsTotal > 0 ? Math.round((seatsUsed / seatsTotal) * 100) : 0,
    };

    setSubscriptions((prev) => [sub, ...prev]);
    logAuditEvent('REGISTERED_SUBSCRIPTION', 'SUBSCRIPTION', `Registered SaaS license "${sub.softwareName}" (${sub.annualCost} ${sub.currency}/yr)`, {
      entityId: sub.id,
      entityName: sub.softwareName,
    });
  };

  const handleUpdateSubscription = makeUpdate(setSubscriptions, 'UPDATED_SUBSCRIPTION', 'SUBSCRIPTION', 'subscription', (s) => s.softwareName, ['currency', 'contractEnd', 'usageRate']);
  const handleDeleteSubscription = makeDelete(setSubscriptions, 'DELETED_SUBSCRIPTION', 'SUBSCRIPTION', (s) => s.softwareName, (s) => `Deleted subscription "${s.softwareName}"`);

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

  const handleUpdateAsset = makeUpdate(setAssets, 'UPDATED_ASSET', 'ASSET', 'asset', (a) => a.name, ['currentValue', 'utilizationScore', 'maintenanceCostYearly', 'insuranceCostYearly', 'depreciationRateYearly']);
  const handleDeleteAsset = makeDelete(setAssets, 'DELETED_ASSET', 'ASSET', (a) => a.name, (a) => `Deleted asset "${a.name}" (${a.serialNumber})`);

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

  const handleUpdateVendor = makeUpdate(setVendors, 'UPDATED_VENDOR', 'VENDOR', 'vendor', (v) => v.name, []);
  const handleDeleteVendor = makeDelete(setVendors, 'DELETED_VENDOR', 'VENDOR', (v) => v.name, (v) => `Deleted vendor "${v.name}"`);

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

  const budgetName = (b: Budget) => `${b.departmentName} — ${b.fiscalQuarter}`;
  const handleUpdateBudget = makeUpdate(setBudgets, 'UPDATED_BUDGET', 'BUDGET', 'budget for', budgetName, ['currency'], (b) => b.departmentName);
  const handleDeleteBudget = makeDelete(setBudgets, 'DELETED_BUDGET', 'BUDGET', budgetName, (b) => `Deleted budget for "${b.departmentName}" (${b.fiscalQuarter})`);

  // Handler: Add Procurement Request
  const handleAddProcurement = (newReq: Partial<ProcurementRequest>) => {
    const req: ProcurementRequest = {
      id: `proc-${Date.now()}`,
      companyId: selectedCompany.id,
      title: newReq.title || 'New Purchase Requisition',
      requestedByName: newReq.requestedByName || currentUser.name,
      requestedById: currentUser.id,
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
    logAuditEvent('SUBMITTED_PROCUREMENT_REQUEST', 'PROCUREMENT', `Requisition "${req.title}" submitted (${req.estimatedCost} ${req.currency})`, {
      entityId: req.id,
      entityName: req.title,
    });
  };

  // Procurement requests are only editable/withdrawable while still pending
  const handleUpdateProcurement = makeUpdate(setProcurements, 'UPDATED_PROCUREMENT_REQUEST', 'PROCUREMENT', 'requisition', (p) => p.title, ['currency', 'status', 'requestDate']);
  const handleDeleteProcurement = makeDelete(setProcurements, 'WITHDREW_PROCUREMENT_REQUEST', 'PROCUREMENT', (p) => p.title, (p) => `Withdrew requisition "${p.title}" (${p.estimatedCost} ${p.currency})`);

  // Handler: Add Property
  const handleAddProperty = (newProp: Partial<PropertyLocation>) => {
    const prop: PropertyLocation = {
      id: `prop-${Date.now()}`,
      companyId: selectedCompany.id,
      name: newProp.name || 'New Site',
      type: newProp.type || 'REGIONAL_OFFICE',
      city: newProp.city || '',
      address: newProp.address || '',
      areaSqFt: newProp.areaSqFt || 0,
      capacitySeats: newProp.capacitySeats || 0,
      occupancySeats: newProp.occupancySeats || 0,
      rentAnnual: newProp.rentAnnual || 0,
      currency: currency,
      leaseEndDate: newProp.leaseEndDate || '',
      utilitiesCostAnnual: newProp.utilitiesCostAnnual || 0,
      maintenanceCostAnnual: newProp.maintenanceCostAnnual || 0,
      propertyTaxesAnnual: newProp.propertyTaxesAnnual || 0,
      costPerSqFt: newProp.costPerSqFt || 0,
      costPerSeat: newProp.costPerSeat || 0,
      costPerOccupiedSeat: newProp.costPerOccupiedSeat || 0,
      utilizationRate: newProp.utilizationRate || 0,
    };

    setProperties((prev) => [prop, ...prev]);
    logAuditEvent('ADDED_PROPERTY', 'PROPERTY', `Added property "${prop.name}" (${prop.city})`, {
      entityId: prop.id,
      entityName: prop.name,
    });
  };

  const handleUpdateProperty = makeUpdate(setProperties, 'UPDATED_PROPERTY', 'PROPERTY', 'property', (p) => p.name, ['currency', 'costPerSqFt', 'costPerSeat', 'costPerOccupiedSeat', 'utilizationRate']);
  const handleDeleteProperty = makeDelete(setProperties, 'DELETED_PROPERTY', 'PROPERTY', (p) => p.name, (p) => `Deleted property "${p.name}" (${p.city})`);

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
          userRole={currentUser.role}
          onAddProperty={handleAddProperty}
          onUpdateProperty={handleUpdateProperty}
          onDeleteProperty={handleDeleteProperty}
          onOpenAlternativeEngine={(item) => setAlternativeTarget(item)}
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
          onUpdateProcurement={handleUpdateProcurement}
          onDeleteProcurement={handleDeleteProcurement}
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

    // Default: 'DASHBOARD'. Employees get their own portal; everyone else
    // gets one Home (roles control permissions, not which dashboard you see).
    if (currentUser.role === 'EMPLOYEE') {
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
    }
    return (
      <HomeView
        userName={currentUser.name}
        userRole={currentUser.role}
        currency={currency}
        expenses={expenses}
        procurements={procurements}
        subscriptions={subscriptions}
        savings={savings}
        budgets={budgets}
        onNavigate={(tab) => setCurrentTab(tab)}
      />
    );
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
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans text-foreground antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        userRole={currentUser.role}
        appMode={appMode}
        onSelectTab={(tab) => setCurrentTab(tab)}
        pendingApprovalsCount={
          expenses.filter((e) => e.approvalStatus === 'PENDING').length +
          procurements.filter((p) => p.status === 'SUBMITTED' || p.status === 'MANAGER_APPROVED').length
        }
        renewalsSoonCount={subscriptions.filter(needsDecision).length}
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
          appMode={appMode}
          onOpenSettings={() => setCurrentTab('SETTINGS')}
          onSelectCompany={(comp) => setSelectedCompany(comp)}
          onSelectUser={handleSelectUser}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAiChat={() => setCurrentTab('AI_ANALYST')}
          demoUsers={DEMO_USERS}
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
