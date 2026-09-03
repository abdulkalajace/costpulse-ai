import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Phone,
  Mail,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building2,
  DollarSign,
  KeyRound,
  Zap,
  Network,
  List,
  GitFork,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  ExternalLink,
} from 'lucide-react';
import { Department, DepartmentUser, CurrencyCode, UserRole } from '../types';
import { buildDepartmentOrgTree, OrgTreeNode } from '../data/hrPayrollSyncEngine';
import { Avatar } from './ui/Avatar';

interface DepartmentUsersTabProps {
  department: Department;
  users: DepartmentUser[];
  currency: CurrencyCode;
  onAddUser: () => void;
  onEditUser: (user: DepartmentUser) => void;
  onDeleteUser: (userId: string) => void;
  onOpenHrSync?: () => void;
  onSelectUserForSession?: (user: DepartmentUser) => void;
}

export const DepartmentUsersTab: React.FC<DepartmentUsersTabProps> = ({
  department,
  users,
  currency,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onOpenHrSync,
  onSelectUserForSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'ROSTER_LIST' | 'ORG_CHART'>('ROSTER_LIST');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.reportingToName && u.reportingToName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalSpendingCapacity = users.reduce((acc, u) => acc + (u.spendingLimit || 0), 0);
  const orgTreeNodes = buildDepartmentOrgTree(users);

  const formatCurrency = (amount: number) => {
    if (currency === 'INR') {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount.toLocaleString()}`;
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'DEPT_HEAD':
        return {
          label: 'DEPT HEAD (L1)',
          classes: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'MANAGER':
        return {
          label: 'MANAGER (L2)',
          classes: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'CFO':
      case 'MD_CEO':
      case 'MASTER':
        return {
          label: role.replace('_', ' '),
          classes: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'HR':
        return {
          label: 'HR OPS',
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      default:
        return {
          label: 'STAFF (L3/L4)',
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'TIER_1_AUTO':
        return 'Tier 1: Auto (≤ ₹25k)';
      case 'TIER_2_DEPT_APPROVER':
        return 'Tier 2: Dept Approver (≤ ₹2.5L)';
      case 'TIER_3_HEAD_SIGN':
        return 'Tier 3: Head Sign-off (≤ ₹10L)';
      case 'TIER_4_BOARD_CFO':
        return 'Tier 4: Board & CFO (> ₹10L)';
      default:
        return tier;
    }
  };

  // Synced from HR information
  const syncedSource =
    users.find((u) => u.syncedFromHr)?.syncedFromHr ||
    (department.syncSources && department.syncSources.length > 0 ? department.syncSources[0] : null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Top Banner: Department Staff Capacity & HR Sync CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{department.name} Team & Reporting Hierarchy</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                    {users.length} Active Staff
                  </span>
                </h4>

                {syncedSource && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-indigo-500" />
                    <span>Auto-Synced from {syncedSource}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff hierarchy, reporting lines, approval authority ceilings, and role assignments for {department.code}.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenHrSync && (
            <button
              onClick={onOpenHrSync}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-xs transition-colors shrink-0"
              title="Sync team hierarchy directly from Keka, Darwinbox, Zoho People, ADP, or HR Master Spreadsheet"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>⚡ Sync with HR / Payroll</span>
            </button>
          )}

          <button
            onClick={onAddUser}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add User Manually</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assigned Roster vs Headcount Cap
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-slate-900">{users.length}</span>
            <span className="text-xs text-slate-500 font-medium">
              / {department.headcount} approved seats
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (users.length / (department.headcount || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cumulative Spending Authority
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-blue-700">
              {formatCurrency(totalSpendingCapacity)}
            </span>
            <span className="text-xs text-slate-500 font-medium">max delegated cap</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Department Head limit: {formatCurrency(users.find((u) => u.role === 'DEPT_HEAD')?.spendingLimit || 1000000)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Department Lead
          </span>
          <div className="flex items-center gap-2 mt-1 truncate">
            <span className="text-sm font-bold text-slate-900 truncate">
              {department.headOfDepartment || 'Unassigned'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {department.headEmail || 'lead@enterprise.io'}
          </p>
        </div>
      </div>

      {/* View Switcher & Search / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* List vs Org Chart Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('ROSTER_LIST')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'ROSTER_LIST'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Roster List ({users.length})</span>
            </button>
            <button
              onClick={() => setViewMode('ORG_CHART')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'ORG_CHART'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-indigo-600" />
              <span>Org Hierarchy Tree</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff, designation, code, reporting manager..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles ({users.length})</option>
              <option value="DEPT_HEAD">Dept Heads (L1)</option>
              <option value="MANAGER">Managers (L2)</option>
              <option value="EMPLOYEE">Staff / Engineers (L3/L4)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: HIERARCHY TREE / ORG CHART VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'ORG_CHART' && (
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {department.name} Reporting Hierarchy Tree
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              4-Tier Delegated Approval Authority & Chain of Command
            </span>
          </div>

          {/* Org Tree Rendering */}
          <div className="space-y-4 pt-2">
            {orgTreeNodes.length > 0 ? (
              orgTreeNodes.map((rootNode) => (
                <div key={rootNode.user.id} className="space-y-3">
                  {/* Level 1: Root Department Lead */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={rootNode.user.name} src={rootNode.user.avatar} size="lg" className="w-11 h-11 border-2 border-purple-300" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                            LEVEL 1 • DEPT HEAD
                          </span>
                          <h5 className="text-xs font-bold text-slate-900">{rootNode.user.name}</h5>
                          {rootNode.user.employeeCode && (
                            <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-purple-200">
                              {rootNode.user.employeeCode}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">{rootNode.user.designation}</p>
                        <p className="text-[10px] text-slate-400">Reports directly to: Board of Directors / MD & CEO</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-purple-900 block">{formatCurrency(rootNode.user.spendingLimit)} Cap</span>
                        <span className="text-[10px] text-purple-700 font-medium">{getTierLabel(rootNode.user.approvalTier)}</span>
                      </div>
                      <button
                        onClick={() => onEditUser(rootNode.user)}
                        className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
                        title="Edit Lead"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Level 2: Managers Branching Under Lead */}
                  {rootNode.directReports.length > 0 && (
                    <div className="ml-6 pl-4 border-l-2 border-dashed border-indigo-200 space-y-3 pt-1">
                      {rootNode.directReports.map((mgrNode) => (
                        <div key={mgrNode.user.id} className="space-y-2">
                          <div className="p-3.5 rounded-xl bg-white border border-blue-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <CornerDownRight className="w-4 h-4 text-blue-400 shrink-0" />
                              <Avatar name={mgrNode.user.name} src={mgrNode.user.avatar} size="md" className="w-9 h-9 border border-blue-200" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                    LEVEL 2 • MANAGER
                                  </span>
                                  <h6 className="text-xs font-bold text-slate-900">{mgrNode.user.name}</h6>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5">{mgrNode.user.designation}</p>
                                <p className="text-[10px] text-slate-400">↳ Reports to: {rootNode.user.name}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-xs font-bold text-blue-900 block">{formatCurrency(mgrNode.user.spendingLimit)} Cap</span>
                                <span className="text-[10px] text-blue-600">{getTierLabel(mgrNode.user.approvalTier)}</span>
                              </div>
                              <button
                                onClick={() => onEditUser(mgrNode.user)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Level 3 / 4: Staff & Specialists Branching Under Manager */}
                          {mgrNode.directReports.length > 0 && (
                            <div className="ml-8 pl-4 border-l-2 border-dashed border-slate-200 space-y-2 pt-1">
                              {mgrNode.directReports.map((staffNode) => (
                                <div
                                  key={staffNode.user.id}
                                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                          LEVEL {staffNode.user.hierarchyLevel || 3}
                                        </span>
                                        <span className="font-bold text-slate-900">{staffNode.user.name}</span>
                                        <span className="text-slate-500 font-medium text-[11px]">— {staffNode.user.designation}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5">↳ Reports to: {mgrNode.user.name}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-mono text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                                      {formatCurrency(staffNode.user.spendingLimit)} Limit
                                    </span>
                                    <button
                                      onClick={() => onEditUser(staffNode.user)}
                                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No hierarchy nodes detected. Sync with HR to auto-construct reporting tree.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ROSTER LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'ROSTER_LIST' && (
        <>
          {filteredUsers.length > 0 ? (
            <div className="space-y-3 pt-1">
              {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);

                return (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left info */}
                      <div className="flex items-start gap-3">
                        <Avatar name={user.name} src={user.avatar} size="md" className="w-10 h-10" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-xs font-bold text-slate-900">{user.name}</h5>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleBadge.classes}`}
                            >
                              {roleBadge.label}
                            </span>
                            {user.employeeCode && (
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {user.employeeCode}
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                user.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {user.status}
                            </span>
                            {user.syncedFromHr && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                HR: {user.syncedFromHr}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                            {user.designation}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 flex-wrap">
                            {user.reportingToName && (
                              <span className="text-indigo-600 font-semibold flex items-center gap-1">
                                <span>↳ Reports to: {user.reportingToName}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{user.email}</span>
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{user.phone}</span>
                              </span>
                            )}
                            {user.annualSalary && (
                              <span className="text-slate-500 font-medium">
                                CTC: {formatCurrency(user.annualSalary)}/yr
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Authority Pill & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-bold text-slate-900">
                            {formatCurrency(user.spendingLimit)} Limit
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {getTierLabel(user.approvalTier)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onSelectUserForSession && (
                            <button
                              onClick={() => onSelectUserForSession(user)}
                              title="Switch active user session to this profile"
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              Simulate View
                            </button>
                          )}
                          <button
                            onClick={() => onEditUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Permissions Badges */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                          Permissions:
                        </span>
                        {user.permissions?.canApproveExpenses && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            ✓ Expense Approvals
                          </span>
                        )}
                        {user.permissions?.canInitiatePO && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                            ✓ PO Requisition
                          </span>
                        )}
                        {user.permissions?.canUploadDocs && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                            ✓ Doc Sync
                          </span>
                        )}
                        {user.permissions?.canEditWorkflows && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/80">
                            ✓ Workflow Editor
                          </span>
                        )}
                        {user.permissions?.canOverrideRules && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
                            ⚡ Rule Override
                          </span>
                        )}
                        {user.permissions?.canManageTeam && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            👥 Team Admin
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {user.assignedRulesCount || 3} Active Rules Governed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-700">
                  No staff members found for {department.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                  Skip manual data entry by auto-syncing hierarchy, employee roles, and approval authority from your HRMS.
                </p>
              </div>
              {onOpenHrSync && (
                <button
                  onClick={onOpenHrSync}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Auto-Sync Hierarchy & Employees from HR</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
