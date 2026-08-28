import React, { useState } from 'react';
import {
  Building2,
  TrendingDown,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Shield,
  Layers,
  ChevronRight,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  CheckSquare,
  Square,
  HelpCircle,
  FileCheck,
  Zap,
  Tag,
  Briefcase,
  HardHat,
  Database,
  BarChart3,
  Flame,
  PieChart,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Check,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Receipt,
} from 'lucide-react';
import {
  Department,
  DepartmentCategory,
  DepartmentSavingWorkflow,
  CurrencyCode,
  Company,
  WorkflowChecklistItem,
  Expense,
  ExpenseCategory,
  Vendor,
  Budget,
  DepartmentUploadedDocument,
  ParsedSyncItem,
  DepartmentUser,
  DepartmentRule,
} from '../types';
import { INDUSTRY_DEPARTMENT_TEMPLATES, INFRA_39_DEPARTMENTS_TEMPLATE } from '../data/departmentData';
import { ensureDepartmentsHaveUsersAndRules } from '../data/departmentUserData';
import { DepartmentDocSyncModal } from './DepartmentDocSyncModal';
import { DepartmentUsersTab } from './DepartmentUsersTab';
import { DepartmentRulesTab } from './DepartmentRulesTab';
import { AddEditDepartmentUserModal } from './AddEditDepartmentUserModal';
import { AddEditDepartmentRuleModal } from './AddEditDepartmentRuleModal';
import { DepartmentRuleTestModal } from './DepartmentRuleTestModal';
import { HrPayrollSyncModal } from './HrPayrollSyncModal';

interface DepartmentWorkflowViewProps {
  company: Company;
  departments: Department[];
  onUpdateDepartments: (departments: Department[]) => void;
  currency: CurrencyCode;
  onNavigateTab?: (tab: string) => void;
  expenses?: Expense[];
  vendors?: Vendor[];
  budgets?: Budget[];
  onBatchImportExpenses?: (items: Partial<Expense>[]) => void;
  onLogAudit?: (action: string, category: string, details: string) => void;
}

export const DepartmentWorkflowView: React.FC<DepartmentWorkflowViewProps> = ({
  company,
  departments,
  onUpdateDepartments,
  currency,
  onNavigateTab,
  expenses = [],
  vendors = [],
  budgets = [],
  onBatchImportExpenses,
  onLogAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(
    departments[0]?.id || null
  );
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [isEditDeptModalOpen, setIsEditDeptModalOpen] = useState(false);
  const [isAddWorkflowModalOpen, setIsAddWorkflowModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDocSyncModalOpen, setIsDocSyncModalOpen] = useState(false);
  const [docSyncTargetDeptId, setDocSyncTargetDeptId] = useState<string | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [activeWorkflowFilter, setActiveWorkflowFilter] = useState<'ALL' | 'IN_EXECUTION' | 'VERIFIED_REALIZED' | 'IDENTIFIED'>('ALL');
  const [activeRightTab, setActiveRightTab] = useState<'WORKFLOWS' | 'USERS' | 'RULES' | 'DOCUMENTS' | 'ANALYTICS'>('WORKFLOWS');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'warning' } | null>(null);

  // User & Rule Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DepartmentUser | null>(null);

  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [isEditRuleModalOpen, setIsEditRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DepartmentRule | null>(null);

  const [isRuleTestModalOpen, setIsRuleTestModalOpen] = useState(false);
  const [testingRule, setTestingRule] = useState<DepartmentRule | null>(null);
  const [isAiGeneratingRules, setIsAiGeneratingRules] = useState(false);
  const [isHrSyncModalOpen, setIsHrSyncModalOpen] = useState(false);

  // Document Ingestion History State — starts empty for every real account;
  // previously pre-seeded with a fabricated "Civil_Works_Q2_Procurement_
  // Ledger.xlsx" upload and a fake ₹4,50,000 invoice that never happened.
  const [uploadedDocsHistory, setUploadedDocsHistory] = useState<DepartmentUploadedDocument[]>([]);


  // Form states for adding/editing department
  const [deptForm, setDeptForm] = useState<{
    name: string;
    code: string;
    category: DepartmentCategory;
    headOfDepartment: string;
    headEmail: string;
    headcount: number;
    annualBudget: number;
    targetSavingsPct: number;
    syncSources: string;
  }>({
    name: '',
    code: '',
    category: 'OPERATIONS',
    headOfDepartment: '',
    headEmail: '',
    headcount: 10,
    annualBudget: 10000000,
    targetSavingsPct: 10,
    syncSources: 'ERP, Payroll',
  });

  // Form state for adding new cost cutting workflow
  const [workflowForm, setWorkflowForm] = useState<{
    title: string;
    description: string;
    category: string;
    targetSavingAnnual: number;
    actionOwner: string;
    dueDate: string;
    roiTimelineWeeks: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    checklistItems: string;
  }>({
    title: '',
    description: '',
    category: 'Process Optimization',
    targetSavingAnnual: 1000000,
    actionOwner: '',
    dueDate: '2026-11-30',
    roiTimelineWeeks: 4,
    riskLevel: 'LOW',
    checklistItems: 'Audit past 6 months spend\nNegotiate vendor volume rate-card\nImplement automated approval gate',
  });

  // Currency Formatter
  const formatCurrency = (amount: number) => {
    if (currency === 'INR') {
      if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
      }
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)}L`;
      }
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toLocaleString()}`;
  };

  // Filtered departments
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.headOfDepartment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || dept.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const rawSelectedDept =
    departments.find((d) => d.id === selectedDepartmentId) || departments[0] || null;

  const selectedDepartment: Department | null = rawSelectedDept
    ? rawSelectedDept.users && rawSelectedDept.rules
      ? rawSelectedDept
      : ensureDepartmentsHaveUsersAndRules([rawSelectedDept])[0]
    : null;

  // Global aggregate metrics
  const totalBudget = departments.reduce((sum, d) => sum + (d.annualBudget || 0), 0);
  const totalHeadcount = departments.reduce((sum, d) => sum + (d.headcount || 0), 0);
  const totalTargetSavings = departments.reduce((sum, d) => sum + (d.targetSavingsAnnual || 0), 0);
  const totalAchievedSavings = departments.reduce((sum, d) => sum + (d.achievedSavingsAnnual || 0), 0);
  const allWorkflows = departments.flatMap((d) => d.costSavingPlaybooks || []);
  const activeWorkflowsCount = allWorkflows.filter((w) => w.stage !== 'VERIFIED_REALIZED').length;
  const realizedWorkflowsCount = allWorkflows.filter((w) => w.stage === 'VERIFIED_REALIZED').length;

  // Handle category category badges
  const getCategoryBadgeClass = (category: DepartmentCategory) => {
    switch (category) {
      case 'ENGINEERING_EXECUTION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FINANCE_GOVERNANCE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SALES_MARKETING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PEOPLE_ADMIN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUPPORT_FACILITIES':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getHealthBadgeClass = (status: Department['healthStatus']) => {
    switch (status) {
      case 'SAVINGS_ACHIEVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'HEALTHY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'OVER_BUDGET':
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  // Toggle checklist items in workflow
  const handleToggleChecklist = (deptId: string, workflowId: string, checkId: string) => {
    const updated = departments.map((d) => {
      if (d.id !== deptId) return d;
      return {
        ...d,
        costSavingPlaybooks: d.costSavingPlaybooks.map((w) => {
          if (w.id !== workflowId) return w;
          const updatedChecklists = w.checklists.map((c) => {
            if (c.id !== checkId) return c;
            const newCompleted = !c.completed;
            return {
              ...c,
              completed: newCompleted,
              completedAt: newCompleted ? new Date().toISOString().split('T')[0] : undefined,
            };
          });
          return { ...w, checklists: updatedChecklists };
        }),
      };
    });
    onUpdateDepartments(updated);
  };

  // Change workflow stage
  const handleChangeWorkflowStage = (
    deptId: string,
    workflowId: string,
    newStage: DepartmentSavingWorkflow['stage']
  ) => {
    const updated = departments.map((d) => {
      if (d.id !== deptId) return d;
      return {
        ...d,
        costSavingPlaybooks: d.costSavingPlaybooks.map((w) => {
          if (w.id !== workflowId) return w;
          const isRealized = newStage === 'VERIFIED_REALIZED';
          return {
            ...w,
            stage: newStage,
            realizedSavingAnnual: isRealized ? w.targetSavingAnnual : w.realizedSavingAnnual,
          };
        }),
        achievedSavingsAnnual: d.costSavingPlaybooks.reduce((sum, w) => {
          if (w.id === workflowId && newStage === 'VERIFIED_REALIZED') {
            return sum + w.targetSavingAnnual;
          }
          return sum + (w.stage === 'VERIFIED_REALIZED' ? w.realizedSavingAnnual : 0);
        }, 0),
      };
    });
    onUpdateDepartments(updated);
  };

  // Delete a Department
  const handleDeleteDepartment = (deptId: string) => {
    if (departments.length <= 1) {
      alert('You must keep at least one active department.');
      return;
    }
    const deptToDelete = departments.find((d) => d.id === deptId);
    if (
      window.confirm(
        `Are you sure you want to delete "${deptToDelete?.name}"? All associated workflows will be permanently removed.`
      )
    ) {
      const updated = departments.filter((d) => d.id !== deptId);
      onUpdateDepartments(updated);
      if (selectedDepartmentId === deptId) {
        setSelectedDepartmentId(updated[0]?.id || null);
      }
    }
  };

  // Save new department
  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) return;

    const newDept: Department = {
      id: `dep-${Date.now()}`,
      companyId: company.id,
      code: deptForm.code || `DEP-${departments.length + 1}`,
      name: deptForm.name.toUpperCase(),
      category: deptForm.category,
      headOfDepartment: deptForm.headOfDepartment || 'Department Lead',
      headEmail: deptForm.headEmail || 'lead@enterprise.io',
      headcount: Number(deptForm.headcount) || 1,
      annualBudget: Number(deptForm.annualBudget) || 1000000,
      monthlyBurn: Math.round((Number(deptForm.annualBudget) || 1000000) / 12),
      spentYearToDate: Math.round(((Number(deptForm.annualBudget) || 1000000) * 0.5)),
      targetSavingsPct: Number(deptForm.targetSavingsPct) || 10,
      targetSavingsAnnual: Math.round(
        ((Number(deptForm.annualBudget) || 1000000) * (Number(deptForm.targetSavingsPct) || 10)) / 100
      ),
      achievedSavingsAnnual: 0,
      currency: currency,
      healthStatus: 'HEALTHY',
      syncSources: deptForm.syncSources.split(',').map((s) => s.trim()).filter(Boolean),
      costSavingPlaybooks: [],
    };

    const updated = [newDept, ...departments];
    onUpdateDepartments(updated);
    setSelectedDepartmentId(newDept.id);
    setIsAddDeptModalOpen(false);
    setDeptForm({
      name: '',
      code: '',
      category: 'OPERATIONS',
      headOfDepartment: '',
      headEmail: '',
      headcount: 10,
      annualBudget: 10000000,
      targetSavingsPct: 10,
      syncSources: 'ERP, Payroll',
    });
  };

  // Update existing department
  const handleSaveEditDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    const updated = departments.map((d) => {
      if (d.id !== editingDepartment.id) return d;
      return {
        ...editingDepartment,
        monthlyBurn: Math.round(editingDepartment.annualBudget / 12),
        targetSavingsAnnual: Math.round(
          (editingDepartment.annualBudget * editingDepartment.targetSavingsPct) / 100
        ),
      };
    });

    onUpdateDepartments(updated);
    setIsEditDeptModalOpen(false);
    setEditingDepartment(null);
  };

  // Add new workflow to selected department
  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment || !workflowForm.title.trim()) return;

    const checkListArray: WorkflowChecklistItem[] = workflowForm.checklistItems
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line, idx) => ({
        id: `c-${Date.now()}-${idx}`,
        title: line.trim(),
        completed: false,
      }));

    const newWorkflow: DepartmentSavingWorkflow = {
      id: `wf-${Date.now()}`,
      departmentId: selectedDepartment.id,
      departmentName: selectedDepartment.name,
      title: workflowForm.title,
      description: workflowForm.description || 'Systematic department cost reduction initiative.',
      category: workflowForm.category as any,
      targetSavingAnnual: Number(workflowForm.targetSavingAnnual) || 500000,
      realizedSavingAnnual: 0,
      currency: currency,
      stage: 'IDENTIFIED',
      actionOwner: workflowForm.actionOwner || selectedDepartment.headOfDepartment,
      dueDate: workflowForm.dueDate || '2026-12-31',
      roiTimelineWeeks: Number(workflowForm.roiTimelineWeeks) || 4,
      riskLevel: workflowForm.riskLevel,
      checklists: checkListArray.length > 0 ? checkListArray : [{ id: 'c1', title: 'Audit baseline expenditure', completed: false }],
    };

    const updated = departments.map((d) => {
      if (d.id !== selectedDepartment.id) return d;
      return {
        ...d,
        costSavingPlaybooks: [newWorkflow, ...(d.costSavingPlaybooks || [])],
      };
    });

    onUpdateDepartments(updated);
    setIsAddWorkflowModalOpen(false);
    setWorkflowForm({
      title: '',
      description: '',
      category: 'Process Optimization',
      targetSavingAnnual: 1000000,
      actionOwner: '',
      dueDate: '2026-11-30',
      roiTimelineWeeks: 4,
      riskLevel: 'LOW',
      checklistItems: 'Audit past 6 months spend\nNegotiate vendor volume rate-card\nImplement automated approval gate',
    });
  };

  // Commit approved document sync
  const handleCommitDocSync = ({
    department,
    fileName,
    approvedItems,
    syncedDocument,
  }: {
    department: Department;
    fileName: string;
    approvedItems: ParsedSyncItem[];
    syncedDocument: DepartmentUploadedDocument;
  }) => {
    let updatedDept = { ...department };
    const newExpensesToImport: Partial<Expense>[] = [];
    const newWorkflows: DepartmentSavingWorkflow[] = [];

    approvedItems.forEach((item) => {
      // 1. Budget revisions
      if (item.itemType === 'BUDGET_REVISION' && item.amount) {
        updatedDept.annualBudget = item.amount;
        updatedDept.monthlyBurn = Math.round(item.amount / 12);
        updatedDept.targetSavingsAnnual = Math.round(
          (item.amount * updatedDept.targetSavingsPct) / 100
        );
      }

      // 2. Headcount revisions
      if (item.itemType === 'HEADCOUNT_UPDATE' && item.headcountChange) {
        updatedDept.headcount = item.headcountChange;
      }

      // 3. Savings workflows
      if (item.itemType === 'SAVINGS_WORKFLOW') {
        const wf: DepartmentSavingWorkflow = {
          id: `wf-sync-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          departmentId: department.id,
          departmentName: department.name,
          title: item.title,
          description: item.description || `Ingested from ${fileName}`,
          category: (item.category as any) || 'Process Optimization',
          targetSavingAnnual: item.annualSavingsTarget || Math.round(department.annualBudget * 0.05),
          realizedSavingAnnual: 0,
          currency: currency,
          stage: 'IDENTIFIED',
          actionOwner: department.headOfDepartment,
          dueDate: item.date || '2026-12-31',
          roiTimelineWeeks: 4,
          riskLevel: item.riskLevel || 'LOW',
          checklists: [
            { id: 'c-1', title: 'Audit ingested document baseline data', completed: true },
            { id: 'c-2', title: 'Execute identified cost reduction protocol', completed: false },
          ],
        };
        newWorkflows.push(wf);
      }

      // 4. Expense invoices
      if (
        item.itemType === 'EXPENSE_INVOICE' ||
        item.itemType === 'VENDOR_CONTRACT' ||
        item.itemType === 'ASSET_ACQUISITION'
      ) {
        newExpensesToImport.push({
          description: item.title,
          amount: item.amount || 0,
          currency: currency,
          category: (item.category as ExpenseCategory) || 'Office Supplies & Misc',
          departmentId: department.id,
          departmentName: department.name,
          vendorName: item.vendorName || 'Ingested Vendor',
          date: item.date || new Date().toISOString().split('T')[0],
          approvalStatus: 'APPROVED',
          tags: ['doc-sync', fileName],
        });
      }
    });

    if (newWorkflows.length > 0) {
      updatedDept.costSavingPlaybooks = [
        ...newWorkflows,
        ...(updatedDept.costSavingPlaybooks || []),
      ];
    }

    // Update departments in global state
    const updatedDepartments = departments.map((d) =>
      d.id === department.id ? updatedDept : d
    );
    onUpdateDepartments(updatedDepartments);

    // If there are expenses to import
    if (newExpensesToImport.length > 0 && onBatchImportExpenses) {
      onBatchImportExpenses(newExpensesToImport);
    }

    // Add to history
    setUploadedDocsHistory((prev) => [syncedDocument, ...prev]);

    // Log audit
    if (onLogAudit) {
      onLogAudit(
        'SYNCED_DEPARTMENT_DOCUMENT',
        'DEPARTMENT',
        `Approved & synced ${approvedItems.length} records from "${fileName}" into ${department.name}`
      );
    }

    // Toast
    setToastMessage({
      title: `Document Sync Successful!`,
      desc: `${approvedItems.length} records approved and written to ${department.name}.`,
      type: 'success',
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Apply Industry Template
  const handleApplyTemplate = (tmpl: (typeof INDUSTRY_DEPARTMENT_TEMPLATES)[0]) => {
    if (
      window.confirm(
        `Load the "${tmpl.name}" preset? This will configure ${tmpl.departmentsCount} departments with tailored cost-cutting workflows for ${company.name}.`
      )
    ) {
      const formatted = ensureDepartmentsHaveUsersAndRules(
        tmpl.departments.map((d, idx) => ({
          ...d,
          companyId: company.id,
          id: `dep-${company.id}-${idx + 1}-${d.code.toLowerCase()}`,
        })) as Department[]
      );

      onUpdateDepartments(formatted);
      setSelectedDepartmentId(formatted[0]?.id || null);
      setIsTemplateModalOpen(false);
    }
  };

  // User Management Handlers
  const handleSaveUser = (savedUser: DepartmentUser) => {
    if (!selectedDepartment) return;
    const updated = departments.map((d) => {
      if (d.id !== selectedDepartment.id) return d;
      const currentUsers = d.users || [];
      const exists = currentUsers.some((u) => u.id === savedUser.id);
      const newUsers = exists
        ? currentUsers.map((u) => (u.id === savedUser.id ? savedUser : u))
        : [...currentUsers, savedUser];
      return {
        ...d,
        users: newUsers,
      };
    });
    onUpdateDepartments(updated);
    setIsAddUserModalOpen(false);
    setIsEditUserModalOpen(false);
    setEditingUser(null);
    setToastMessage({
      title: 'Department User Saved',
      desc: `${savedUser.name} (${savedUser.designation}) updated in ${selectedDepartment.name}.`,
      type: 'success',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteUser = (userId: string) => {
    if (!selectedDepartment) return;
    const updated = departments.map((d) => {
      if (d.id !== selectedDepartment.id) return d;
      return {
        ...d,
        users: (d.users || []).filter((u) => u.id !== userId),
      };
    });
    onUpdateDepartments(updated);
    setToastMessage({
      title: 'User Removed',
      desc: `User removed from ${selectedDepartment.name}.`,
      type: 'warning',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Rule Management Handlers
  const handleSaveRule = (savedRule: DepartmentRule) => {
    if (!selectedDepartment) return;
    const updated = departments.map((d) => {
      if (d.id !== selectedDepartment.id) return d;
      const currentRules = d.rules || [];
      const exists = currentRules.some((r) => r.id === savedRule.id);
      const newRules = exists
        ? currentRules.map((r) => (r.id === savedRule.id ? savedRule : r))
        : [...currentRules, savedRule];
      return {
        ...d,
        rules: newRules,
      };
    });
    onUpdateDepartments(updated);
    setIsAddRuleModalOpen(false);
    setIsEditRuleModalOpen(false);
    setEditingRule(null);
    setToastMessage({
      title: 'Policy Rule Saved',
      desc: `Rule ${savedRule.code} is now actively enforcing for ${selectedDepartment.name}.`,
      type: 'success',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!selectedDepartment) return;
    const updated = departments.map((d) => {
      if (d.id !== selectedDepartment.id) return d;
      return {
        ...d,
        rules: (d.rules || []).filter((r) => r.id !== ruleId),
      };
    });
    onUpdateDepartments(updated);
    setToastMessage({
      title: 'Rule Deleted',
      desc: `Governance rule removed from ${selectedDepartment.name}.`,
      type: 'warning',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    if (!selectedDepartment) return;
    const updated = departments.map((d) => {
      if (d.id !== selectedDepartment.id) return d;
      return {
        ...d,
        rules: (d.rules || []).map((r) => (r.id === ruleId ? { ...r, enabled } : r)),
      };
    });
    onUpdateDepartments(updated);
  };

  const handleGenerateAiRules = () => {
    if (!selectedDepartment) return;
    setIsAiGeneratingRules(true);
    setTimeout(() => {
      const newAiRules: DepartmentRule[] = [
        {
          id: `rul-ai-${Date.now()}-1`,
          departmentId: selectedDepartment.id,
          departmentName: selectedDepartment.name,
          code: `RUL-${selectedDepartment.code}-AI1`,
          title: `AI Automated Median Benchmark Rate Guard for ${selectedDepartment.name}`,
          description: `Continuous variance anomaly detection against regional Indian market median costs for ${selectedDepartment.name}.`,
          category: 'SPEND_CEILING',
          severity: 'FLAG_FOR_AUDIT',
          enabled: true,
          thresholdPercentage: 88,
          currency,
          conditionDescription: `Expenditure item > 88% of quarterly rate card ceiling or abnormal surge velocity`,
          enforcementAction: `Auto-generates vendor alternative options in Savings Center and routes to review queue`,
          assignedApproverRole: 'CFO',
          evaluationCount: 18,
          violationsCount: 2,
          createdBy: 'AI Policy Copilot',
          createdAt: new Date().toISOString().split('T')[0],
        },
        {
          id: `rul-ai-${Date.now()}-2`,
          departmentId: selectedDepartment.id,
          departmentName: selectedDepartment.name,
          code: `RUL-${selectedDepartment.code}-AI2`,
          title: `Mandatory 3-Way Voucher Match & GST Compliance Validation`,
          description: `Validates PO number, Delivery Goods Receipt (GRN), and GSTR-2B filing before payment authorization.`,
          category: 'STATUTORY_GST_COMPLIANCE',
          severity: 'STRICT_BLOCK',
          enabled: true,
          thresholdAmount: 25000,
          currency,
          conditionDescription: `Missing Tax Invoice or unverified vendor GSTIN on disbursement voucher > ₹25,000`,
          enforcementAction: `Strictly blocks disbursement voucher release and alerts Dept Head & Accounts`,
          assignedApproverRole: 'DEPT_HEAD',
          evaluationCount: 34,
          violationsCount: 1,
          createdBy: 'AI Policy Copilot',
          createdAt: new Date().toISOString().split('T')[0],
        },
      ];

      const updated = departments.map((d) => {
        if (d.id !== selectedDepartment.id) return d;
        return {
          ...d,
          rules: [...(d.rules || []), ...newAiRules],
        };
      });
      onUpdateDepartments(updated);
      setIsAiGeneratingRules(false);
      setToastMessage({
        title: 'AI Policy Guardrails Synthesized',
        desc: `Generated 2 high-impact governance rules tailored for ${selectedDepartment.name}.`,
        type: 'success',
      });
      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12" id="department-workflow-view">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Universal Department Management & Cost Workflows
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {departments.length} Active Departments
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              Industry-agnostic cost governance architecture. Add, customize, or delete departments for any business vertical, configure budget ceilings, and execute department-specific cost reduction playbooks.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setIsHrSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-xs transition-colors"
              title="Auto-populate employees, hierarchy, reporting chains, and delegated spending limits from HR/Payroll"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>⚡ Sync with HR / Payroll</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/60 text-indigo-900 font-bold ml-0.5">
                Keka • Darwinbox • ADP • Zoho
              </span>
            </button>
            <button
              onClick={() => {
                setDocSyncTargetDeptId(selectedDepartmentId);
                setIsDocSyncModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Ingest Document & AI Sync</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-100 font-bold ml-0.5">
                Approval Guard
              </span>
            </button>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Industry Presets (39 Depts)</span>
            </button>
            <button
              onClick={() => {
                setDeptForm({
                  name: '',
                  code: `DEP-${departments.length + 1}`,
                  category: 'OPERATIONS',
                  headOfDepartment: '',
                  headEmail: '',
                  headcount: 10,
                  annualBudget: 12000000,
                  targetSavingsPct: 10,
                  syncSources: 'Tally ERP, Keka Payroll',
                });
                setIsAddDeptModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>
        </div>

        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-xs font-bold text-emerald-950">{toastMessage.title}</strong>
                <span className="text-xs text-emerald-800 ml-1.5">{toastMessage.desc}</span>
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Annual Dept Budget
            </span>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {formatCurrency(totalBudget)}
            </div>
            <span className="text-[10px] text-slate-400">
              Across {departments.length} departments & {totalHeadcount} staff
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">
              Target Cost Savings Goal
            </span>
            <div className="text-lg font-bold text-blue-900 mt-1">
              {formatCurrency(totalTargetSavings)}
            </div>
            <span className="text-[10px] text-blue-600 font-medium">
              {totalBudget > 0 ? ((totalTargetSavings / totalBudget) * 100).toFixed(1) : 0}% Target Reduction Rate
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
              Confirmed Realized Savings
            </span>
            <div className="text-lg font-bold text-emerald-800 mt-1">
              {formatCurrency(totalAchievedSavings)}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              {totalTargetSavings > 0 ? ((totalAchievedSavings / totalTargetSavings) * 100).toFixed(1) : 0}% of Target Realized
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
            <span className="text-[11px] font-medium text-purple-700 uppercase tracking-wider">
              Cost Cutting Playbooks
            </span>
            <div className="text-lg font-bold text-purple-900 mt-1">
              {allWorkflows.length} Total Initiatives
            </div>
            <span className="text-[10px] text-purple-600 font-medium">
              {activeWorkflowsCount} In Flight · {realizedWorkflowsCount} Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Department Selector / List + Right Workflow & Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Department List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search and Category Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by department name, code, HOD..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'ENGINEERING_EXECUTION', label: 'Engineering' },
                { id: 'FINANCE_GOVERNANCE', label: 'Finance' },
                { id: 'SALES_MARKETING', label: 'Sales & Mkt' },
                { id: 'OPERATIONS', label: 'Operations' },
                { id: 'SUPPORT_FACILITIES', label: 'Facilities' },
                { id: 'PEOPLE_ADMIN', label: 'HR & Admin' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Department Cards Scroll List */}
          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredDepartments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No departments match your filter</p>
                <p className="text-xs text-slate-400">Try adjusting your search query or category</p>
              </div>
            ) : (
              filteredDepartments.map((dept) => {
                const isSelected = selectedDepartment?.id === dept.id;
                const savingsPct =
                  dept.targetSavingsAnnual > 0
                    ? Math.round((dept.achievedSavingsAnnual / dept.targetSavingsAnnual) * 100)
                    : 0;

                return (
                  <div
                    key={dept.id}
                    onClick={() => setSelectedDepartmentId(dept.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {dept.code}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 truncate">
                            {dept.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>Lead: {dept.headOfDepartment}</span>
                          <span>•</span>
                          <span>{dept.headcount} Members</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${getHealthBadgeClass(
                            dept.healthStatus
                          )}`}
                        >
                          {dept.healthStatus.replace('_', ' ')}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDepartmentId(dept.id);
                            setDocSyncTargetDeptId(dept.id);
                            setIsDocSyncModalOpen(true);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title={`Upload PDF / Sheet / Doc to ${dept.name}`}
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Spend & Savings Progress Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-400 text-[10px]">Budget:</span>{' '}
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(dept.annualBudget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Target Savings:</span>{' '}
                        <span className="font-semibold text-emerald-700">
                          {formatCurrency(dept.targetSavingsAnnual)}
                        </span>
                      </div>
                    </div>

                    {/* Mini Progress */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, savingsPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Department Detail & Cost Cutting Workflows (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedDepartment ? (
            <>
              {/* Department Focus Overview Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                        {selectedDepartment.code}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedDepartment.name}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                          selectedDepartment.category
                        )}`}
                      >
                        {selectedDepartment.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Department Lead: <strong className="text-slate-700">{selectedDepartment.headOfDepartment}</strong> ({selectedDepartment.headEmail || 'lead@enterprise.io'}) · Headcount: <strong className="text-slate-700">{selectedDepartment.headcount} employees</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setDocSyncTargetDeptId(selectedDepartment.id);
                        setIsDocSyncModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
                      title="Upload PDF, Image, Doc or Sheet for this department"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Upload Doc / Sheet</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingDepartment(selectedDepartment);
                        setIsEditDeptModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                      title="Edit Department Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(selectedDepartment.id)}
                      className="p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Financial Headroom & Burn Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Annual Budget</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatCurrency(selectedDepartment.annualBudget)}
                    </div>
                    <span className="text-[9px] text-slate-400">
                      ~{formatCurrency(selectedDepartment.monthlyBurn)}/month
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">YTD Actual Spend</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatCurrency(selectedDepartment.spentYearToDate)}
                    </div>
                    <span className="text-[9px] text-blue-600 font-medium">
                      {Math.round((selectedDepartment.spentYearToDate / selectedDepartment.annualBudget) * 100)}% utilized
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-blue-700">Cost Cutting Goal</span>
                    <div className="text-sm font-bold text-blue-900 mt-0.5">
                      {formatCurrency(selectedDepartment.targetSavingsAnnual)}
                    </div>
                    <span className="text-[9px] text-blue-600 font-medium">
                      {selectedDepartment.targetSavingsPct}% Target Rate
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Achieved Savings</span>
                    <div className="text-sm font-bold text-emerald-900 mt-0.5">
                      {formatCurrency(selectedDepartment.achievedSavingsAnnual)}
                    </div>
                    <span className="text-[9px] text-emerald-600 font-medium">
                      {selectedDepartment.targetSavingsAnnual > 0
                        ? `${Math.round((selectedDepartment.achievedSavingsAnnual / selectedDepartment.targetSavingsAnnual) * 100)}% achieved`
                        : 'On track'}
                    </span>
                  </div>
                </div>

                {/* Connected Data Ingestion Streams */}
                {selectedDepartment.syncSources && selectedDepartment.syncSources.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500 font-medium">Synced Ingestion Feeds:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {selectedDepartment.syncSources.map((src, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('APP_SYNC')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <span>Manage Connectors</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sub-Tabs Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveRightTab('WORKFLOWS')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    activeRightTab === 'WORKFLOWS'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Cost Cutting Workflows ({selectedDepartment.costSavingPlaybooks?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRightTab('USERS')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    activeRightTab === 'USERS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Team & Users ({selectedDepartment.users?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRightTab('RULES')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    activeRightTab === 'RULES'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Policy & Rules ({selectedDepartment.rules?.filter((r) => r.enabled).length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRightTab('DOCUMENTS')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    activeRightTab === 'DOCUMENTS'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Ingested Docs ({uploadedDocsHistory.filter((d) => d.departmentId === selectedDepartment.id).length})</span>
                  {uploadedDocsHistory.some((d) => d.departmentId === selectedDepartment.id && d.hasOverwriteWarnings) && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              </div>

              {/* Tab: Users & Roles */}
              {activeRightTab === 'USERS' && (
                <DepartmentUsersTab
                  department={selectedDepartment}
                  users={selectedDepartment.users || []}
                  currency={currency}
                  onAddUser={() => {
                    setEditingUser(null);
                    setIsAddUserModalOpen(true);
                  }}
                  onEditUser={(u) => {
                    setEditingUser(u);
                    setIsEditUserModalOpen(true);
                  }}
                  onDeleteUser={handleDeleteUser}
                  onOpenHrSync={() => setIsHrSyncModalOpen(true)}
                />
              )}

              {/* Tab: Rules & Governance Guardrails */}
              {activeRightTab === 'RULES' && (
                <DepartmentRulesTab
                  department={selectedDepartment}
                  rules={selectedDepartment.rules || []}
                  currency={currency}
                  onAddRule={() => {
                    setEditingRule(null);
                    setIsAddRuleModalOpen(true);
                  }}
                  onEditRule={(r) => {
                    setEditingRule(r);
                    setIsEditRuleModalOpen(true);
                  }}
                  onDeleteRule={handleDeleteRule}
                  onToggleRule={handleToggleRule}
                  onGenerateAiRules={handleGenerateAiRules}
                  onTestRuleModal={(r) => {
                    setTestingRule(r || null);
                    setIsRuleTestModalOpen(true);
                  }}
                  isAiGenerating={isAiGeneratingRules}
                />
              )}

              {/* Tab 1: Cost Cutting Workflows */}
              {activeRightTab === 'WORKFLOWS' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Active Cost Cutting Workflows & Playbooks
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedDepartment.costSavingPlaybooks?.length || 0} Initiatives
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Targeted operational action plans to eliminate waste and enforce spend efficiency for {selectedDepartment.name}.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setWorkflowForm({
                        title: '',
                        description: '',
                        category: 'Process Optimization',
                        targetSavingAnnual: Math.round(selectedDepartment.targetSavingsAnnual * 0.4),
                        actionOwner: selectedDepartment.headOfDepartment,
                        dueDate: '2026-11-30',
                        roiTimelineWeeks: 4,
                        riskLevel: 'LOW',
                        checklistItems: 'Analyze historical expense vouchers\nRe-tender high-value vendor contract\nEstablish approval threshold policy',
                      });
                      setIsAddWorkflowModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Workflow</span>
                  </button>
                </div>

                {/* Workflow Cards */}
                {selectedDepartment.costSavingPlaybooks && selectedDepartment.costSavingPlaybooks.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    {selectedDepartment.costSavingPlaybooks.map((workflow) => {
                      const completedChecks = workflow.checklists.filter((c) => c.completed).length;
                      const totalChecks = workflow.checklists.length;
                      const checkPct = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

                      return (
                        <div
                          key={workflow.id}
                          className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3.5 hover:border-slate-300 transition-all"
                        >
                          {/* Workflow Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-slate-900">
                                  {workflow.title}
                                </h5>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                                  {workflow.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600">
                                {workflow.description}
                              </p>
                            </div>

                            {/* Stage Selector */}
                            <select
                              value={workflow.stage}
                              onChange={(e) =>
                                handleChangeWorkflowStage(
                                  selectedDepartment.id,
                                  workflow.id,
                                  e.target.value as any
                                )
                              }
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-hidden ${
                                workflow.stage === 'VERIFIED_REALIZED'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : workflow.stage === 'IN_EXECUTION'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="IDENTIFIED">Identified</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="IN_EXECUTION">In Execution</option>
                              <option value="VERIFIED_REALIZED">Verified & Realized</option>
                              <option value="ON_HOLD">On Hold</option>
                            </select>
                          </div>

                          {/* Target Metrics */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Target Saving</span>
                              <div className="font-bold text-emerald-700">
                                {formatCurrency(workflow.targetSavingAnnual)}/yr
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Action Owner</span>
                              <div className="font-semibold text-slate-800 truncate">
                                {workflow.actionOwner}
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Target Deadline</span>
                              <div className="font-semibold text-slate-800">
                                {workflow.dueDate}
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-[9px] uppercase font-bold text-slate-400">ROI Timeline</span>
                              <div className="font-semibold text-slate-800">
                                {workflow.roiTimelineWeeks} Weeks
                              </div>
                            </div>
                          </div>

                          {/* Interactive Checklist */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                                <span>Action Checklist ({completedChecks}/{totalChecks})</span>
                              </span>
                              <span className="text-slate-500 font-medium">{checkPct}% Completed</span>
                            </div>

                            <div className="space-y-1 mt-1">
                              {workflow.checklists.map((chk) => (
                                <button
                                  key={chk.id}
                                  type="button"
                                  onClick={() =>
                                    handleToggleChecklist(selectedDepartment.id, workflow.id, chk.id)
                                  }
                                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-50 text-left transition-colors text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {chk.completed ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                    )}
                                    <span
                                      className={`truncate ${
                                        chk.completed
                                          ? 'line-through text-slate-400 font-medium'
                                          : 'text-slate-800 font-medium'
                                      }`}
                                    >
                                      {chk.title}
                                    </span>
                                  </div>
                                  {chk.completed && chk.completedAt && (
                                    <span className="text-[9px] text-emerald-600 font-semibold shrink-0 pl-2">
                                      Done on {chk.completedAt}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-2">
                    <TrendingDown className="w-7 h-7 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      No active workflows yet for {selectedDepartment.name}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Create an operational cost-cutting playbook with target savings and step-by-step action checklists.
                    </p>
                    <button
                      onClick={() => {
                        setWorkflowForm({
                          title: '',
                          description: '',
                          category: 'Process Optimization',
                          targetSavingAnnual: Math.round(selectedDepartment.targetSavingsAnnual * 0.5),
                          actionOwner: selectedDepartment.headOfDepartment,
                          dueDate: '2026-12-31',
                          roiTimelineWeeks: 4,
                          riskLevel: 'LOW',
                          checklistItems: 'Audit baseline expenditure\nRenegotiate vendor contract\nEnforce automated controls',
                        });
                        setIsAddWorkflowModalOpen(true);
                      }}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Playbook</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Ingested Documents & Sync Audits */}
            {activeRightTab === 'DOCUMENTS' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Document Ingestion & AI Synchronization History
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      PDF invoices, Excel ledgers, Word contracts, and scanned receipts uploaded to {selectedDepartment.name} with pre-sync approval logs.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDocSyncTargetDeptId(selectedDepartment.id);
                      setIsDocSyncModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors shrink-0"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload New File for {selectedDepartment.code}</span>
                  </button>
                </div>

                {/* Upload Drop Zone CTA */}
                <div
                  onClick={() => {
                    setDocSyncTargetDeptId(selectedDepartment.id);
                    setIsDocSyncModalOpen(true);
                  }}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all space-y-1.5"
                >
                  <UploadCloud className="w-7 h-7 text-blue-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">
                    Click to upload PDF, Excel Sheet, Word Doc, or Image
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    System automatically reads line items, runs an overwrite audit against {selectedDepartment.name}, and asks for your approval before updating the database.
                  </p>
                </div>

                {/* Document History Cards */}
                {uploadedDocsHistory.filter((d) => d.departmentId === selectedDepartment.id).length > 0 ? (
                  <div className="space-y-3 pt-1">
                    {uploadedDocsHistory
                      .filter((d) => d.departmentId === selectedDepartment.id)
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-slate-300 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0">
                                {doc.fileType === 'SHEET' ? (
                                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <FileText className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="text-xs font-bold text-slate-900">
                                    {doc.fileName}
                                  </h5>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    SYNCED & APPROVED
                                  </span>
                                  {doc.hasOverwriteWarnings && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                                      OVERWRITE RESOLVED
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()} by {doc.uploadedByName} · {(doc.fileSize / 1024).toFixed(1)} KB · {doc.confidenceOverall}% AI Confidence
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Summary Quote */}
                          {doc.aiExecutiveSummary && (
                            <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                              {doc.aiExecutiveSummary}
                            </p>
                          )}

                          {/* Line items list */}
                          {doc.extractedItems && doc.extractedItems.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Ingested Line Items ({doc.extractedItems.length}):
                              </span>
                              <div className="space-y-1">
                                {doc.extractedItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                        {item.itemType.replace('_', ' ')}
                                      </span>
                                      <span className="font-semibold text-slate-800 truncate">
                                        {item.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      {item.amount !== undefined && (
                                        <span className="font-bold text-slate-900">
                                          {formatCurrency(item.amount)}
                                        </span>
                                      )}
                                      {item.annualSavingsTarget !== undefined && (
                                        <span className="font-bold text-emerald-700">
                                          Target: {formatCurrency(item.annualSavingsTarget)}
                                        </span>
                                      )}
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                        {item.resolution}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                    <FileText className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">
                      No documents synced yet for {selectedDepartment.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Upload your first vendor invoice, budget sheet, or contract to extract financial line items and sync to the database.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Select a Department</h3>
              <p className="text-xs text-slate-400">
                Choose a department from the left roster to inspect spend telemetry, sync sources, and active cost-cutting initiatives.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD DEPARTMENT */}
      {/* ========================================================================= */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Add New Department</h3>
              </div>
              <button
                onClick={() => setIsAddDeptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    placeholder="e.g. QUALITY ASSURANCE"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    placeholder="e.g. DEP-QA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category Classification</label>
                  <select
                    value={deptForm.category}
                    onChange={(e) => setDeptForm({ ...deptForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="OPERATIONS">Operations</option>
                    <option value="ENGINEERING_EXECUTION">Engineering & Execution</option>
                    <option value="FINANCE_GOVERNANCE">Finance & Governance</option>
                    <option value="SALES_MARKETING">Sales & Marketing</option>
                    <option value="PEOPLE_ADMIN">People & Admin</option>
                    <option value="SUPPORT_FACILITIES">Support & Facilities</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Headcount (Members)</label>
                  <input
                    type="number"
                    min="1"
                    value={deptForm.headcount}
                    onChange={(e) => setDeptForm({ ...deptForm, headcount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Head of Department</label>
                  <input
                    type="text"
                    value={deptForm.headOfDepartment}
                    onChange={(e) => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Reddy"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Official Lead Email</label>
                  <input
                    type="email"
                    value={deptForm.headEmail}
                    onChange={(e) => setDeptForm({ ...deptForm, headEmail: e.target.value })}
                    placeholder="lead@enterprise.io"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Annual Budget Allocation ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={deptForm.annualBudget}
                    onChange={(e) => setDeptForm({ ...deptForm, annualBudget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Target Cost Cutting Rate (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={deptForm.targetSavingsPct}
                    onChange={(e) => setDeptForm({ ...deptForm, targetSavingsPct: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Connected App Sync Data Feeds (comma separated)</label>
                <input
                  type="text"
                  value={deptForm.syncSources}
                  onChange={(e) => setDeptForm({ ...deptForm, syncSources: e.target.value })}
                  placeholder="e.g. TallyPrime, Keka HRMS, AWS Cost Explorer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-xs"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT DEPARTMENT */}
      {/* ========================================================================= */}
      {isEditDeptModalOpen && editingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Edit {editingDepartment.name}</h3>
              </div>
              <button
                onClick={() => setIsEditDeptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDepartment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Department Name</label>
                  <input
                    type="text"
                    required
                    value={editingDepartment.name}
                    onChange={(e) =>
                      setEditingDepartment({ ...editingDepartment, name: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Code</label>
                  <input
                    type="text"
                    required
                    value={editingDepartment.code}
                    onChange={(e) =>
                      setEditingDepartment({ ...editingDepartment, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category</label>
                  <select
                    value={editingDepartment.category}
                    onChange={(e) =>
                      setEditingDepartment({ ...editingDepartment, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="OPERATIONS">Operations</option>
                    <option value="ENGINEERING_EXECUTION">Engineering & Execution</option>
                    <option value="FINANCE_GOVERNANCE">Finance & Governance</option>
                    <option value="SALES_MARKETING">Sales & Marketing</option>
                    <option value="PEOPLE_ADMIN">People & Admin</option>
                    <option value="SUPPORT_FACILITIES">Support & Facilities</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Headcount</label>
                  <input
                    type="number"
                    min="1"
                    value={editingDepartment.headcount}
                    onChange={(e) =>
                      setEditingDepartment({ ...editingDepartment, headcount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Lead Name</label>
                  <input
                    type="text"
                    value={editingDepartment.headOfDepartment}
                    onChange={(e) =>
                      setEditingDepartment({ ...editingDepartment, headOfDepartment: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Lead Email</label>
                  <input
                    type="email"
                    value={editingDepartment.headEmail || ''}
                    onChange={(e) =>
                      setEditingDepartment({ ...editingDepartment, headEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Annual Budget ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={editingDepartment.annualBudget}
                    onChange={(e) =>
                      setEditingDepartment({ ...editingDepartment, annualBudget: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Target Savings Goal (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editingDepartment.targetSavingsPct}
                    onChange={(e) =>
                      setEditingDepartment({
                        ...editingDepartment,
                        targetSavingsPct: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-xs"
                >
                  Update Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD COST CUTTING WORKFLOW */}
      {/* ========================================================================= */}
      {isAddWorkflowModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  New Playbook for {selectedDepartment.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAddWorkflowModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Initiative Title *</label>
                <input
                  type="text"
                  required
                  value={workflowForm.title}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, title: e.target.value })}
                  placeholder="e.g. Subcontractor Progress Billing Audit & Rebar Scrap Reduction"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Detailed Description & Opportunity Rationale</label>
                <textarea
                  rows={2}
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                  placeholder="Describe the operational efficiency lever and how spend will be contained..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Initiative Category</label>
                  <select
                    value={workflowForm.category}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Process Optimization">Process Optimization</option>
                    <option value="Procurement">Procurement & Rate Negotiation</option>
                    <option value="Software & SaaS">Software & SaaS Rightsizing</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure FinOps</option>
                    <option value="Automation">AI & Workflow Automation</option>
                    <option value="Fleet & Fuel">Fleet & Fuel Efficiency</option>
                    <option value="Legal & Insurance">Legal & Insurance Consolidation</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Target Annual Saving ({currency})</label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    required
                    value={workflowForm.targetSavingAnnual}
                    onChange={(e) =>
                      setWorkflowForm({ ...workflowForm, targetSavingAnnual: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Action Owner</label>
                  <input
                    type="text"
                    value={workflowForm.actionOwner}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, actionOwner: e.target.value })}
                    placeholder="e.g. Lead Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Target Deadline</label>
                  <input
                    type="date"
                    value={workflowForm.dueDate}
                    onChange={(e) => setWorkflowForm({ ...workflowForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">ROI Timeline</label>
                  <select
                    value={workflowForm.roiTimelineWeeks}
                    onChange={(e) =>
                      setWorkflowForm({ ...workflowForm, roiTimelineWeeks: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value={1}>1 Week (Immediate)</option>
                    <option value={2}>2 Weeks</option>
                    <option value={4}>1 Month</option>
                    <option value={8}>2 Months</option>
                    <option value={12}>1 Quarter</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Step-by-Step Action Checklist (1 item per line)
                </label>
                <textarea
                  rows={3}
                  value={workflowForm.checklistItems}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, checklistItems: e.target.value })}
                  placeholder="Audit past 6 months spend&#10;Negotiate vendor volume rate-card&#10;Implement automated approval gate"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWorkflowModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-xs"
                >
                  Launch Playbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: LOAD INDUSTRY DEPARTMENT TEMPLATES */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Universal Industry Department Presets
                </h3>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select an industry template to load pre-configured departments, budget ceilings, and proven cost-cutting playbooks. You can customize, add, or delete any department after loading.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {INDUSTRY_DEPARTMENT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {tmpl.departmentsCount} Departments
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {tmpl.vertical}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{tmpl.name}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-xs"
                  >
                    Load {tmpl.departmentsCount} Depts
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DEPARTMENT INTELLIGENT DOCUMENT INGESTION & APPROVAL SYNC */}
      {/* ========================================================================= */}
      {isDocSyncModalOpen && (
        <DepartmentDocSyncModal
          departments={departments}
          defaultDepartmentId={docSyncTargetDeptId || selectedDepartmentId || undefined}
          isOpen={isDocSyncModalOpen}
          onClose={() => setIsDocSyncModalOpen(false)}
          onCommitSync={handleCommitDocSync}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD / EDIT DEPARTMENT USER */}
      {/* ========================================================================= */}
      {selectedDepartment && (isAddUserModalOpen || isEditUserModalOpen) && (
        <AddEditDepartmentUserModal
          isOpen={isAddUserModalOpen || isEditUserModalOpen}
          onClose={() => {
            setIsAddUserModalOpen(false);
            setIsEditUserModalOpen(false);
            setEditingUser(null);
          }}
          department={selectedDepartment}
          existingUser={editingUser}
          onSaveUser={handleSaveUser}
          currency={currency}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADD / EDIT DEPARTMENT GOVERNANCE RULE */}
      {/* ========================================================================= */}
      {selectedDepartment && (isAddRuleModalOpen || isEditRuleModalOpen) && (
        <AddEditDepartmentRuleModal
          isOpen={isAddRuleModalOpen || isEditRuleModalOpen}
          onClose={() => {
            setIsAddRuleModalOpen(false);
            setIsEditRuleModalOpen(false);
            setEditingRule(null);
          }}
          department={selectedDepartment}
          existingRule={editingRule}
          onSaveRule={handleSaveRule}
          currency={currency}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: DEPARTMENT RULE ENGINE SIMULATOR */}
      {/* ========================================================================= */}
      {selectedDepartment && isRuleTestModalOpen && (
        <DepartmentRuleTestModal
          isOpen={isRuleTestModalOpen}
          onClose={() => {
            setIsRuleTestModalOpen(false);
            setTestingRule(null);
          }}
          department={selectedDepartment}
          targetRule={testingRule}
          currency={currency}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: AUTOMATED HR / PAYROLL ROSTER & HIERARCHY SYNC */}
      {/* ========================================================================= */}
      <HrPayrollSyncModal
        isOpen={isHrSyncModalOpen}
        onClose={() => setIsHrSyncModalOpen(false)}
        departments={departments}
        targetDepartment={selectedDepartment}
        currency={currency}
        onCommitSync={(updatedDepartments, providerName, syncedCount) => {
          onUpdateDepartments(updatedDepartments);
          setToastMessage({
            title: 'HR / Payroll Sync Complete',
            desc: `Auto-populated ${syncedCount} employees, hierarchy reporting trees, roles, and delegated spending limits from ${providerName}. Zero manual entry required.`,
            type: 'success',
          });
          if (onLogAudit) {
            onLogAudit(
              'HR_PAYROLL_SYNC',
              'SYSTEM',
              `Ingested ${syncedCount} staff and reporting hierarchy from ${providerName} into departments.`
            );
          }
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />
    </div>
  );
};
