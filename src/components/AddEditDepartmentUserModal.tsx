import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, DollarSign, CheckCircle2, UserCheck, KeyRound } from 'lucide-react';
import { DepartmentUser, UserRole, ApprovalTier, CurrencyCode, Department } from '../types';

interface AddEditDepartmentUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  existingUser?: DepartmentUser | null;
  onSaveUser: (user: DepartmentUser) => void;
  currency: CurrencyCode;
}

export const AddEditDepartmentUserModal: React.FC<AddEditDepartmentUserModalProps> = ({
  isOpen,
  onClose,
  department,
  existingUser,
  onSaveUser,
  currency,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [designation, setDesignation] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [spendingLimit, setSpendingLimit] = useState<number>(50000);
  const [approvalTier, setApprovalTier] = useState<ApprovalTier>('TIER_1_AUTO');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');
  
  // Permissions
  const [canApproveExpenses, setCanApproveExpenses] = useState(false);
  const [canInitiatePO, setCanInitiatePO] = useState(true);
  const [canUploadDocs, setCanUploadDocs] = useState(true);
  const [canEditWorkflows, setCanEditWorkflows] = useState(false);
  const [canOverrideRules, setCanOverrideRules] = useState(false);
  const [canManageTeam, setCanManageTeam] = useState(false);

  useEffect(() => {
    if (existingUser) {
      setName(existingUser.name);
      setEmail(existingUser.email);
      setPhone(existingUser.phone || '+91 98490 00000');
      setRole(existingUser.role);
      setDesignation(existingUser.designation);
      setEmployeeCode(existingUser.employeeCode || `EMP-${department.code}-${Math.floor(100 + Math.random() * 900)}`);
      setSpendingLimit(existingUser.spendingLimit);
      setApprovalTier(existingUser.approvalTier);
      setStatus(existingUser.status);
      setCanApproveExpenses(existingUser.permissions?.canApproveExpenses ?? false);
      setCanInitiatePO(existingUser.permissions?.canInitiatePO ?? true);
      setCanUploadDocs(existingUser.permissions?.canUploadDocs ?? true);
      setCanEditWorkflows(existingUser.permissions?.canEditWorkflows ?? false);
      setCanOverrideRules(existingUser.permissions?.canOverrideRules ?? false);
      setCanManageTeam(existingUser.permissions?.canManageTeam ?? false);
    } else {
      setName('');
      setEmail('');
      setPhone('+91 ');
      setRole('EMPLOYEE');
      setDesignation(`${department.name} Specialist`);
      setEmployeeCode(`EMP-${department.code}-${Math.floor(100 + Math.random() * 900)}`);
      setSpendingLimit(50000);
      setApprovalTier('TIER_1_AUTO');
      setStatus('ACTIVE');
      setCanApproveExpenses(false);
      setCanInitiatePO(true);
      setCanUploadDocs(true);
      setCanEditWorkflows(false);
      setCanOverrideRules(false);
      setCanManageTeam(false);
    }
  }, [existingUser, department, isOpen]);

  // Adjust defaults when role changes
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'DEPT_HEAD') {
      setApprovalTier('TIER_3_HEAD_SIGN');
      setSpendingLimit(1000000);
      setCanApproveExpenses(true);
      setCanEditWorkflows(true);
      setCanOverrideRules(true);
      setCanManageTeam(true);
    } else if (newRole === 'MANAGER') {
      setApprovalTier('TIER_2_DEPT_APPROVER');
      setSpendingLimit(250000);
      setCanApproveExpenses(true);
      setCanEditWorkflows(true);
      setCanOverrideRules(false);
      setCanManageTeam(true);
    } else if (newRole === 'CFO' || newRole === 'MD_CEO' || newRole === 'MASTER') {
      setApprovalTier('TIER_4_BOARD_CFO');
      setSpendingLimit(5000000);
      setCanApproveExpenses(true);
      setCanEditWorkflows(true);
      setCanOverrideRules(true);
      setCanManageTeam(true);
    } else {
      setApprovalTier('TIER_1_AUTO');
      setSpendingLimit(25000);
      setCanApproveExpenses(false);
      setCanEditWorkflows(false);
      setCanOverrideRules(false);
      setCanManageTeam(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const user: DepartmentUser = {
      id: existingUser?.id || `usr-${department.id}-${Date.now()}`,
      departmentId: department.id,
      departmentName: department.name,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      designation: designation.trim() || `${department.name} Member`,
      employeeCode: employeeCode.trim(),
      spendingLimit: Number(spendingLimit) || 0,
      approvalTier,
      status,
      joinedDate: existingUser?.joinedDate || new Date().toISOString().split('T')[0],
      assignedRulesCount: existingUser?.assignedRulesCount || 3,
      avatar: existingUser?.avatar,
      permissions: {
        canApproveExpenses,
        canInitiatePO,
        canUploadDocs,
        canEditWorkflows,
        canOverrideRules,
        canManageTeam,
      },
    };

    onSaveUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {existingUser ? 'Edit Department User' : 'Add Department User & Authority'}
              </h3>
              <p className="text-xs text-slate-500">
                Assign role, spending ceiling, and approval tier for {department.name} ({department.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Corporate Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh.c@enterprise.io"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designation / Job Title
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Billing Engineer"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Employee Code / ID
              </label>
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder={`e.g. EMP-${department.code}-004`}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98490 00000"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_LEAVE">ON LEAVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {/* Role & Authority Grid */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Role & Spending Governance</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned User Role
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-slate-800"
                >
                  <option value="EMPLOYEE">EMPLOYEE (Staff)</option>
                  <option value="MANAGER">MANAGER (Approver)</option>
                  <option value="DEPT_HEAD">DEPT_HEAD (Head of Dept)</option>
                  <option value="HR">HR (People Ops)</option>
                  <option value="CFO">CFO (Executive Treasury)</option>
                  <option value="CTO">CTO (Technology Exec)</option>
                  <option value="MD_CEO">MD_CEO (Board / Executive)</option>
                  <option value="MASTER">MASTER (Super Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Approval Authority Tier
                </label>
                <select
                  value={approvalTier}
                  onChange={(e) => setApprovalTier(e.target.value as ApprovalTier)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs font-semibold"
                >
                  <option value="TIER_1_AUTO">Tier 1: Auto Approval (≤ ₹25k)</option>
                  <option value="TIER_2_DEPT_APPROVER">Tier 2: Dept Approver (≤ ₹2.5L)</option>
                  <option value="TIER_3_HEAD_SIGN">Tier 3: Dept Head Sign-off (≤ ₹10L)</option>
                  <option value="TIER_4_BOARD_CFO">Tier 4: Board & CFO (&gt; ₹10L)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Spending Limit ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={spendingLimit}
                    onChange={(e) => setSpendingLimit(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Granular Permission Toggles */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              Department Granular Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={canApproveExpenses}
                  onChange={(e) => setCanApproveExpenses(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Can Approve Expense Claims</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={canInitiatePO}
                  onChange={(e) => setCanInitiatePO(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Can Initiate Purchase Orders (PO)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={canUploadDocs}
                  onChange={(e) => setCanUploadDocs(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Can Upload Docs & Sync Invoices</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={canEditWorkflows}
                  onChange={(e) => setCanEditWorkflows(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Can Edit Cost-Saving Workflows</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={canOverrideRules}
                  onChange={(e) => setCanOverrideRules(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Can Request Rule Overrides</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={canManageTeam}
                  onChange={(e) => setCanManageTeam(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-800">Can Manage Department Team</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              {existingUser ? 'Update User' : 'Add User to Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
