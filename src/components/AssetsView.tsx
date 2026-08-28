import React, { useState } from 'react';
import {
  Laptop,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Server,
  Car,
  RotateCw,
  HardDrive,
} from 'lucide-react';
import { Asset, CurrencyCode, UserRole, AssetType, AssetStatus } from '../types';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';

interface AssetsViewProps {
  assets: Asset[];
  currency: CurrencyCode;
  userRole: UserRole;
  departments?: { name: string }[];
  onAddAsset: (asset: Partial<Asset>) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  currency,
  userRole,
  departments = [],
  onAddAsset,
}) => {
  const [filterType, setFilterType] = useState('ALL');
  const [filterIdle, setFilterIdle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('LAPTOP');
  const [serial, setSerial] = useState('');
  const [price, setPrice] = useState(150000);
  const [location, setLocation] = useState('');
  const [dept, setDept] = useState('');
  const [assignedName, setAssignedName] = useState('');

  const types = ['ALL', 'LAPTOP', 'MONITOR', 'PHONE', 'SERVER', 'VEHICLE'];

  const filteredAssets = assets.filter((a) => {
    if (filterType !== 'ALL' && a.type !== filterType) return false;
    if (filterIdle && a.status !== 'IDLE') return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        (a.assignedToName && a.assignedToName.toLowerCase().includes(q)) ||
        a.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAssetValue = assets.reduce((acc, a) => acc + a.purchasePrice, 0);
  const idleAssetsCount = assets.filter((a) => a.status === 'IDLE').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddAsset({
      name,
      type,
      serialNumber: serial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      purchasePrice: Number(price),
      currentValue: Math.round(Number(price) * 0.8),
      currency,
      purchaseDate: new Date().toISOString().split('T')[0],
      assignedToName: assignedName || undefined,
      departmentName: dept || 'Unassigned',
      status: (assignedName ? 'ACTIVE' : 'IDLE') as AssetStatus,
      location: location,
      utilizationScore: assignedName ? 85 : 0,
      maintenanceCostYearly: Math.round(Number(price) * 0.05),
      insuranceCostYearly: Math.round(Number(price) * 0.02),
      depreciationRateYearly: 20,
    });

    setName('');
    setSerial('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Hardware, Digital & Physical Asset Registry
            </h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              {assets.length} Assets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track hardware lifecycle, detect idle laptops/servers, monitor straight-line depreciation, and redeploy capital.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Asset KPIs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Registered Asset Base</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalAssetValue, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {assets.length} active hardware units
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Idle & Unassigned Hardware</span>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              {idleAssetsCount} UNITS
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
            {idleAssetsCount} Idle Devices
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-medium">
            Candidates for onboarding reuse instead of new purchases
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Annual Maintenance Outlay</div>
          <div className="mt-2 text-2xl font-bold text-indigo-700 tracking-tight">
            {formatCurrency(assets.reduce((acc, a) => acc + (a.maintenanceCostYearly || 0), 0), currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Includes warranty, AMC & facility servicing
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                filterType === t
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterIdle(!filterIdle)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              filterIdle
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Idle Assets Only
          </button>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search serial, model, owner..."
              className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Asset Name & Model</th>
                <th className="py-3 px-4 font-semibold">Serial Number</th>
                <th className="py-3 px-4 font-semibold">Assigned Employee</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Purchase Price</th>
                <th className="py-3 px-4 font-semibold">Book Value</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-500">
                    {assets.length === 0 ? (
                      <>
                        No assets registered yet.{' '}
                        <button onClick={() => setShowAddModal(true)} className="font-semibold text-blue-600 hover:text-blue-700">
                          Register your first asset
                        </button>
                      </>
                    ) : (
                      'No assets match the current filters.'
                    )}
                  </td>
                </tr>
              )}
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-slate-400" />
                      <span>{asset.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {asset.serialNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {asset.assignedToName || (
                      <span className="text-amber-700 font-semibold italic">Unassigned (Pool)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{asset.location}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {formatCurrency(asset.purchasePrice, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatCurrency(asset.currentValue, currency)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{asset.utilizationScore}%</span>
                      <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            asset.utilizationScore > 70
                              ? 'bg-emerald-500'
                              : asset.utilizationScore > 30
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${asset.utilizationScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-900 text-sm">Register Physical/Digital Asset</div>
              <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Asset Description / Model</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MacBook Pro 16-inch M3 Max"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssetType)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="LAPTOP">LAPTOP</option>
                    <option value="MONITOR">MONITOR</option>
                    <option value="PHONE">PHONE</option>
                    <option value="SERVER">SERVER</option>
                    <option value="VEHICLE">VEHICLE</option>
                    <option value="OFFICE_EQUIPMENT">OFFICE EQUIPMENT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Purchase Price ({currency})</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. HQ Office"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  {departments.length > 0 ? (
                    <select
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                    >
                      <option value="">Select…</option>
                      {departments.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      placeholder="e.g. Engineering"
                      className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assign to Employee (Optional)</label>
                <input
                  type="text"
                  value={assignedName}
                  onChange={(e) => setAssignedName(e.target.value)}
                  placeholder="Leave empty for unassigned inventory"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-1.5 font-semibold text-white"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
