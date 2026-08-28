import React, { useState } from 'react';
import {
  Building2,
  HardHat,
  Stethoscope,
  Sparkles,
  Laptop,
  GraduationCap,
  Hotel,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Fuel,
  Clock,
  Activity,
  Layers,
  ArrowRight,
  Calculator,
  ShieldAlert,
  FileCheck,
  Zap,
  Calendar,
  Percent,
  Sliders,
  UtensilsCrossed,
  BedDouble,
  RefreshCw,
  Cpu,
  Scissors,
  BookmarkPlus,
  Send,
} from 'lucide-react';
import {
  CurrencyCode,
  IndustryVertical,
  ConstructionJobCostRecord,
  HeavyEquipmentTelemetry,
  MedicalSupplyExpiryRecord,
  LocumShiftComparison,
  BiomedicalDeviceAMC,
  BackbarColorUsageRecord,
  StylistCompensationBreakEven,
  CloudFinOpsAnomaly,
  SsoInactivitySeat,
  GrantComplianceRecord,
  CampusLabEquipmentShare,
  HotelCostPerOccupiedRoom,
  KitchenFbWasteAudit,
} from '../types';
import {
  INITIAL_CONSTRUCTION_JOB_COSTS,
  INITIAL_HEAVY_EQUIPMENT,
  INITIAL_HOSPITAL_EXPIRIES,
  INITIAL_LOCUM_SHIFTS,
  INITIAL_BIOMEDICAL_AMCS,
  INITIAL_BEAUTY_BACKBAR,
  INITIAL_STYLIST_COMPENSATION,
  INITIAL_CLOUD_FINOPS,
  INITIAL_SSO_INACTIVE_SEATS,
  INITIAL_GRANT_RECORDS,
  INITIAL_CAMPUS_LAB_EQUIPMENT,
  INITIAL_HOTEL_CPOR_METRICS,
  INITIAL_KITCHEN_FB_WASTE,
} from '../data/mockData';

interface IndustryIntelligenceViewProps {
  currency: CurrencyCode;
  activeIndustry?: IndustryVertical;
  onSelectIndustry?: (industry: IndustryVertical) => void;
  onAskAi: (prompt: string) => void;
  onAddSavingsOpportunity?: (title: string, amount: number, category: string) => void;
}

export const IndustryIntelligenceView: React.FC<IndustryIntelligenceViewProps> = ({
  currency,
  activeIndustry = 'HOTEL_HOSPITALITY',
  onSelectIndustry,
  onAskAi,
  onAddSavingsOpportunity,
}) => {
  const [selectedVertical, setSelectedVertical] = useState<IndustryVertical>(activeIndustry);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Construction Simulator State
  const [concreteVarianceTarget, setConcreteVarianceTarget] = useState<number>(5);
  const [excavatorIdleHoursReduction, setExcavatorIdleHoursReduction] = useState<number>(25);

  // Healthcare Simulator State
  const [locumConversionPct, setLocumConversionPct] = useState<number>(60);

  // Beauty Simulator State
  const [colorOvermixReductionPct, setColorOvermixReductionPct] = useState<number>(40);

  // Software FinOps Simulator State
  const [gpuIdleDownscalePct, setGpuIdleDownscalePct] = useState<number>(80);

  // Education Simulator State
  const [labSharingHoursAdd, setLabSharingHoursAdd] = useState<number>(12);

  // Hotel Hospitality Simulator State
  const [otaDirectShiftPct, setOtaDirectShiftPct] = useState<number>(15);
  const [buffetWasteCutPct, setBuffetWasteCutPct] = useState<number>(30);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleVerticalChange = (vert: IndustryVertical) => {
    setSelectedVertical(vert);
    if (onSelectIndustry) {
      onSelectIndustry(vert);
    }
  };

  const formatCurrency = (val: number) => {
    if (currency === 'INR') {
      if (Math.abs(val) >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    if (currency === 'EUR') return `€${val.toLocaleString()}`;
    if (currency === 'GBP') return `£${val.toLocaleString()}`;
    return `$${val.toLocaleString()}`;
  };

  const industriesConfig = [
    {
      id: 'HOTEL_HOSPITALITY' as IndustryVertical,
      name: 'Hotels & Hospitality',
      icon: Hotel,
      badge: 'Hotels & Banquets',
      description: 'CPOR metrics, F&B buffet shrinkage, OTA commission bleed, linen par wear & HVAC thermal zoning.',
      color: 'blue',
    },
    {
      id: 'CONSTRUCTION' as IndustryVertical,
      name: 'Construction & Civil',
      icon: HardHat,
      badge: 'Job Costing & Heavy Plant',
      description: 'WBS cost code variance, equipment runtime/idle fuel telemetry, retainage & subcontractor change orders.',
      color: 'amber',
    },
    {
      id: 'HEALTHCARE' as IndustryVertical,
      name: 'Hospitals & Healthcare',
      icon: Stethoscope,
      badge: 'Expiries & Locums',
      description: '30/60/90d sterile supply & drug shelf-life, locum doctor arbitrage & biomedical AMC uptime penalties.',
      color: 'emerald',
    },
    {
      id: 'BEAUTY_WELLNESS' as IndustryVertical,
      name: 'Beauty & Spas',
      icon: Scissors,
      badge: 'Backbar & Labor Ratios',
      description: 'Gram-level color overmixing waste, stylist commission vs booth rent modeler & branch utilities.',
      color: 'rose',
    },
    {
      id: 'SOFTWARE_TECH' as IndustryVertical,
      name: 'Software & Tech FinOps',
      icon: Laptop,
      badge: 'Cloud & SaaS Sprawl',
      description: 'Idle GPU/compute decommissioning, SSO 60d inactive seat recovery & AI API token caching.',
      color: 'indigo',
    },
    {
      id: 'HIGHER_EDUCATION' as IndustryVertical,
      name: 'Universities & Labs',
      icon: GraduationCap,
      badge: 'Grants & Shared Labs',
      description: 'Restricted grant compliance gates, indirect overhead limits & cross-department lab equipment sharing.',
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-gray-800 text-sm font-medium animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                Multi-Industry Cost Intelligence
              </span>
              <span className="text-xs text-gray-500 font-medium">Domain-Specific Telemetry & Financial Rules</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Industry Vertical Intelligence & Optimization
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-3xl">
              Specialized cost structures, operational leak detectors, and compliance telemetry calibrated for real-world sector workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAskAi(`Generate a comprehensive multi-industry cost benchmark report analyzing savings for ${selectedVertical}.`)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI Industry Analyst
            </button>
          </div>
        </div>

        {/* Industry Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-gray-100">
          {industriesConfig.map((ind) => {
            const Icon = ind.icon;
            const isSelected = selectedVertical === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => handleVerticalChange(ind.id)}
                className={`flex flex-col items-start p-3.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 shadow-xs'
                    : 'bg-gray-50/50 hover:bg-gray-100/70 border-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-2 rounded-md ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                </div>
                <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {ind.name}
                </span>
                <span className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {ind.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HOTELS & HOSPITALITY VIEW */}
      {/* ========================================================================= */}
      {selectedVertical === 'HOTEL_HOSPITALITY' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Avg CPOR (Cost per Occupied Room)</span>
                <BedDouble className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹3,666</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.5% above ₹3,200 budget target</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Monthly OTA Commission Bleed</span>
                <Percent className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-rose-600 mt-2">{formatCurrency(4080000)}</p>
              <p className="text-xs text-gray-500 mt-1">Across 3 properties (18-22% commission)</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Annualized Kitchen & Buffet Waste</span>
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-2">{formatCurrency(54020000)}</p>
              <p className="text-xs text-gray-500 mt-1">17.8% prep spoilage & buffet discard</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Identified Recapturable Margin</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(26400000)}</p>
              <p className="text-xs text-emerald-700 font-medium mt-1">Via direct booking + F&B yield dynamic batching</p>
            </div>
          </div>

          {/* Properties CPOR Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Property Portfolio Cost Per Occupied Room (CPOR) Telemetry
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tracks linen laundry, guest amenities, HVAC kilowatt load per key, and OTA distribution bleed.
                </p>
              </div>
              <button
                onClick={() => {
                  if (onAddSavingsOpportunity) {
                    onAddSavingsOpportunity('Shift 15% OTA bookings to Direct Guest Loyalty', 7340000, 'Hotel Operations');
                  }
                  showToast('Added OTA Direct Capture saving opportunity to Savings Center!');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-md transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Capture Hotel Savings
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Property & Rooms</th>
                    <th className="py-3 px-4">Occupancy</th>
                    <th className="py-3 px-4">Actual CPOR</th>
                    <th className="py-3 px-4">Budget Target</th>
                    <th className="py-3 px-4">Linen / Room</th>
                    <th className="py-3 px-4">Energy HVAC / Key</th>
                    <th className="py-3 px-4">OTA Commission Bleed</th>
                    <th className="py-3 px-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {INITIAL_HOTEL_CPOR_METRICS.map((htl) => (
                    <tr key={htl.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{htl.propertyName}</div>
                        <div className="text-gray-500 font-mono text-[11px]">{htl.propertyCode} • {htl.availableRooms} Keys</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {htl.occupancyRatePct}%
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {formatCurrency(htl.cporActual)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {formatCurrency(htl.cporBudget)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-700">
                        {formatCurrency(htl.linenLaundryCostPerRoom)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-700">
                        {formatCurrency(htl.energyHvacCostPerRoom)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-rose-600">
                        {formatCurrency(htl.monthlyOtaCommissionBleed)} / mo ({htl.otaCommissionPct}%)
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          htl.varianceStatus === 'OPTIMAL'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : htl.varianceStatus === 'ELEVATED_LAUNDRY'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {htl.varianceStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* F&B Kitchen Spoilage & Buffet Yield Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-gray-900">F&B Buffet Spoilage & Recipe Yield Audit</h3>
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-200">
                  Kitchen Telemetry
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {INITIAL_KITCHEN_FB_WASTE.map((fb) => (
                  <div key={fb.id} className="p-3.5 border border-gray-200 rounded-lg bg-gray-50/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{fb.outletName}</h4>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Daily Covers: <span className="font-semibold text-gray-700">{fb.dailyBuffetCovers}</span> • Daily Prep: {formatCurrency(fb.prepCostDaily)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-rose-600">{formatCurrency(fb.annualizedWasteLoss)}/yr</div>
                        <div className="text-[11px] text-rose-500 font-medium">{fb.spoilagePct}% Waste Discard</div>
                      </div>
                    </div>

                    <div className="mt-2.5 p-2 bg-white rounded border border-gray-200 text-xs text-gray-700 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>AI Reduction:</strong> {fb.aiSuggestedReduction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Hospitality Yield & OTA Recapture Simulator */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-900">Hospitality Yield & OTA Recapture Modeler</h3>
                  </div>
                  <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200">
                    Simulator
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Model financial recovery by converting OTA agency bookings (18-22% commission) into direct loyalty reservations and instituting dynamic kitchen batch replenishment.
                </p>

                <div className="space-y-4 mt-5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-800 mb-1">
                      <span>Shift OTA Bookings to Direct Loyalty Portal</span>
                      <span className="text-blue-600 font-bold">{otaDirectShiftPct}% Shift</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      value={otaDirectShiftPct}
                      onChange={(e) => setOtaDirectShiftPct(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[11px] text-gray-400 mt-0.5">
                      <span>5% (Conservative)</span>
                      <span>40% (Aggressive Brand Loyalty)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-800 mb-1">
                      <span>Buffet Spoilage & Batch Prep Reduction</span>
                      <span className="text-emerald-600 font-bold">{buffetWasteCutPct}% Waste Cut</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      value={buffetWasteCutPct}
                      onChange={(e) => setBuffetWasteCutPct(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                      Projected Annual Net Savings
                    </span>
                    <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                      {formatCurrency(
                        (4080000 * 12 * (otaDirectShiftPct / 100)) + (54020000 * (buffetWasteCutPct / 100))
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const savingAmt = (4080000 * 12 * (otaDirectShiftPct / 100)) + (54020000 * (buffetWasteCutPct / 100));
                      if (onAddSavingsOpportunity) {
                        onAddSavingsOpportunity(`Hotel Direct Booking & Kitchen Waste Plan (${otaDirectShiftPct}% OTA shift)`, savingAmt, 'Hospitality Operations');
                      }
                      showToast('Injected simulated hotel savings into central Savings Center!');
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors"
                  >
                    Commit Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONSTRUCTION & CIVIL INFRASTRUCTURE VIEW */}
      {/* ========================================================================= */}
      {selectedVertical === 'CONSTRUCTION' && (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Active Projects Value</span>
                <Building2 className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(153500000)}</p>
              <p className="text-xs text-gray-500 mt-1">4 Major Civil & MEP Sites</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Cumulative Retainage Held</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(15700000)}</p>
              <p className="text-xs text-gray-500 mt-1">10% Subcontractor Retention Escrow</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Heavy Plant Idle Fuel Loss</span>
                <Fuel className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-rose-600 mt-2">{formatCurrency(285000)} / mo</p>
              <p className="text-xs text-rose-500 mt-1">141 idle machine hours across sites</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>WBS Budget Variance</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-2">+₹60.0 L</p>
              <p className="text-xs text-gray-500 mt-1">Driven by Structural Steel escalation</p>
            </div>
          </div>

          {/* Job Costing WBS Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Project WBS Job Costing & Progress Variance
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tracking MasterFormat cost codes, committed subcontracts, progress billing, and 10% retainage.
                </p>
              </div>
              <button
                onClick={() => onAskAi('Analyze construction WBS cost code variances and suggest change order dispute mitigation.')}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200"
              >
                AI Cost Code Analysis
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                  <tr>
                    <th className="py-3 px-4">Project & Cost Code</th>
                    <th className="py-3 px-4">Subcontractor</th>
                    <th className="py-3 px-4">Phase</th>
                    <th className="py-3 px-4">Estimated Budget</th>
                    <th className="py-3 px-4">Progress Billed</th>
                    <th className="py-3 px-4">Variance</th>
                    <th className="py-3 px-4">Retainage (10%)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {INITIAL_CONSTRUCTION_JOB_COSTS.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{rec.projectName}</div>
                        <div className="text-gray-500 font-mono text-[11px]">{rec.costCode}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">{rec.subcontractorName}</td>
                      <td className="py-3.5 px-4 text-gray-600">{rec.phase}</td>
                      <td className="py-3.5 px-4 text-gray-900 font-medium">{formatCurrency(rec.estimatedBudget)}</td>
                      <td className="py-3.5 px-4 text-gray-900 font-bold">{formatCurrency(rec.actualProgressBilled)}</td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span className={rec.variance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {rec.variance > 0 ? `+${formatCurrency(rec.variance)}` : formatCurrency(rec.variance)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-700">{formatCurrency(rec.retainageWithheld)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          rec.status === 'ON_BUDGET'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rec.status === 'AT_RISK'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {rec.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Heavy Equipment Telemetry & Idle Loss */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Heavy Plant Runtime, Idle Telemetry & Fuel Waste</h3>
              </div>
              <span className="text-xs text-gray-500 font-mono">GPS & CAN-bus Telemetry</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INITIAL_HEAVY_EQUIPMENT.map((eq) => (
                <div key={eq.id} className="p-3.5 border border-gray-200 rounded-lg bg-gray-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{eq.machineType}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        eq.telemetryHealth === 'OPTIMAL'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : eq.telemetryHealth === 'HIGH_IDLE'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {eq.telemetryHealth.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-800 mt-1">{eq.assetName}</div>
                    
                    <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Runtime / Month:</span>
                        <span className="font-semibold text-gray-900">{eq.runtimeHoursMonth} hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Idle Time:</span>
                        <span className="font-semibold text-rose-600">{eq.idleHoursMonth} hrs ({Math.round((eq.idleHoursMonth / (eq.runtimeHoursMonth + eq.idleHoursMonth)) * 100)}%)</span>
                      </div>
                      {eq.fuelWasteEstimate > 0 && (
                        <div className="flex justify-between">
                          <span>Idle Fuel Waste:</span>
                          <span className="font-bold text-rose-600">{formatCurrency(eq.fuelWasteEstimate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[11px] pt-1 text-gray-500 border-t border-gray-200">
                        <span>Next Service:</span>
                        <span>{eq.nextServiceDue}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onAddSavingsOpportunity) {
                        onAddSavingsOpportunity(`Excavator & Plant Idle Auto-Shutdown Engine (${eq.assetName})`, eq.fuelWasteEstimate * 12, 'Plant & Equipment');
                      }
                      showToast(`Captured fuel waste reduction for ${eq.assetName}!`);
                    }}
                    className="mt-3 w-full py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded text-xs font-semibold transition-colors"
                  >
                    Optimize Machine Cycle
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HOSPITALS & HEALTHCARE VIEW */}
      {/* ========================================================================= */}
      {selectedVertical === 'HEALTHCARE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Sterile Supplies At-Risk (30-90d)</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-rose-600 mt-2">{formatCurrency(2581000)}</p>
              <p className="text-xs text-gray-500 mt-1">4 batches nearing expiration</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Monthly Locum Agency Spend</span>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-2">{formatCurrency(3572000)}</p>
              <p className="text-xs text-gray-500 mt-1">Emergency, CICU & Night Teleradiology</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Locum-to-FTE Recapturable Arbitrage</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(1866000)} / mo</p>
              <p className="text-xs text-emerald-700 font-medium mt-1">₹2.23 Cr annual full-time doctor savings</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Biomedical SLA Penalty Rebates</span>
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(1070000)}</p>
              <p className="text-xs text-gray-500 mt-1">Claimable against MRI & Surgical Robot AMCs</p>
            </div>
          </div>

          {/* Expiry Tracking */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Medical Supplies & Pharmaceutical Expiry Telemetry
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  FIFO inventory tracking, 30/60/90-day alert triggers, and inter-department ward reallocations.
                </p>
              </div>
              <button
                onClick={() => {
                  if (onAddSavingsOpportunity) {
                    onAddSavingsOpportunity('Prevent Surgical & Pharma Expiration via Ward Swaps', 2581000, 'Hospital Supplies');
                  }
                  showToast('Added Expiry Mitigation to Savings Center!');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md"
              >
                Execute Ward Swaps
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                  <tr>
                    <th className="py-3 px-4">Item & Batch Lot</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Ward Location</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Batch Value</th>
                    <th className="py-3 px-4">Days Left</th>
                    <th className="py-3 px-4">Action Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {INITIAL_HOSPITAL_EXPIRIES.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{med.itemName}</div>
                        <div className="text-gray-500 font-mono text-[11px]">{med.lotNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">{med.category}</td>
                      <td className="py-3.5 px-4 text-gray-600">{med.wardLocation}</td>
                      <td className="py-3.5 px-4 font-mono">{med.quantityUnits} units</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{formatCurrency(med.totalBatchValue)}</td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          med.riskStatus === 'CRITICAL_30D'
                            ? 'bg-rose-100 text-rose-800'
                            : med.riskStatus === 'WARNING_60D'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {med.daysToExpiry} days ({med.riskStatus.replace('_', ' ')})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 max-w-xs">{med.actionRecommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Locum Tenens Staffing Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Locum Agency Doctor vs. Full-Time Overtime Arbitrage</h3>
              <p className="text-xs text-gray-500 mb-4">Replaces agency markups (120-200% premium) with dedicated FTE on-call staffing.</p>
              
              <div className="space-y-3">
                {INITIAL_LOCUM_SHIFTS.map((loc) => (
                  <div key={loc.id} className="p-3.5 border border-gray-200 rounded-lg bg-gray-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-xs text-gray-900">{loc.roleSpecialty}</div>
                        <div className="text-[11px] text-gray-500">{loc.department} • {loc.agencyShiftHoursMonth} hrs/mo</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-700">Save {formatCurrency(loc.potentialFteSavings)}/mo</div>
                        <div className="text-[11px] text-gray-500">Agency: {formatCurrency(loc.locumAgencyHourlyRate)}/hr vs FTE: {formatCurrency(loc.fteOvertimeHourlyRate)}/hr</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
                      {loc.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Biomedical Device AMC Uptime */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Biomedical Device AMC Uptime & SLA Penalties</h3>
              <p className="text-xs text-gray-500 mb-4">Monitors vendor maintenance SLAs for MRI, CT scanners, and surgical robotics.</p>
              
              <div className="space-y-3">
                {INITIAL_BIOMEDICAL_AMCS.map((bio) => (
                  <div key={bio.id} className="p-3.5 border border-gray-200 rounded-lg bg-gray-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-xs text-gray-900">{bio.deviceName}</div>
                        <div className="text-[11px] text-gray-500">{bio.oemVendor} • AMC: {formatCurrency(bio.annualAmcCost)}/yr</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-bold ${bio.actualUptimePct < bio.guaranteedUptimePct ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {bio.actualUptimePct}% Uptime (SLA: {bio.guaranteedUptimePct}%)
                        </div>
                        <div className="text-[11px] text-gray-500">{bio.unplannedDowntimeHours} hrs downtime</div>
                      </div>
                    </div>

                    {bio.slaPenaltyRebateEligible > 0 ? (
                      <div className="mt-2.5 flex items-center justify-between p-2 bg-rose-50 border border-rose-200 rounded text-xs">
                        <span className="font-semibold text-rose-800">Eligible SLA Penalty Credit: {formatCurrency(bio.slaPenaltyRebateEligible)}</span>
                        <button
                          onClick={() => showToast(`Claimed ${formatCurrency(bio.slaPenaltyRebateEligible)} SLA rebate with ${bio.oemVendor}!`)}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-bold"
                        >
                          Claim Credit
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-emerald-700 font-medium">✓ Vendor SLA within guaranteed threshold.</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BEAUTY, SALONS & SPAS VIEW */}
      {/* ========================================================================= */}
      {selectedVertical === 'BEAUTY_WELLNESS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Annual Backbar Overmix Waste</span>
                <Sparkles className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-rose-600 mt-2">{formatCurrency(713000)}</p>
              <p className="text-xs text-gray-500 mt-1">Bleach, color bowls & keratin product leftover</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Target Labor Ratio</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-2">38.5%</p>
              <p className="text-xs text-gray-500 mt-1">Healthy threshold (35-42% of revenue)</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Retail Inventory Shrinkage</span>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-2">1.8%</p>
              <p className="text-xs text-gray-500 mt-1">Shampoo & styling retail FIFO variance</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Linen Laundry & Utility Cost</span>
                <TrendingDown className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(145000)} / mo</p>
              <p className="text-xs text-gray-500 mt-1">Hot water heat pumps & towel cycle optimization</p>
            </div>
          </div>

          {/* Backbar Usage Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Gram-Level Backbar Product Dispensing & Overmixing Audit</h3>
                <p className="text-xs text-gray-500 mt-0.5">Calculates wasted product left in bowls across salon locations.</p>
              </div>
              <button
                onClick={() => {
                  if (onAddSavingsOpportunity) {
                    onAddSavingsOpportunity('Standardize Salon Smart Scale Backbar Color Dispensing', 520000, 'Salon Operations');
                  }
                  showToast('Captured Backbar Scale Optimization in Savings Center!');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md"
              >
                Implement Smart Scales
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INITIAL_BEAUTY_BACKBAR.map((bb) => (
                <div key={bb.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="font-bold text-xs text-gray-900">{bb.serviceType}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{bb.branchName} • {bb.technicianName}</div>
                  
                  <div className="mt-3 space-y-1.5 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Target Formula:</span>
                      <span className="font-semibold">{bb.targetFormulaGrams}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actual Dispensed:</span>
                      <span className="font-bold text-rose-600">{bb.actualDispensedGrams}g (+{bb.overmixingPct}%)</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-1 border-t border-gray-200">
                      <span>Annual Bowl Waste:</span>
                      <span className="text-rose-600">{formatCurrency(bb.annualOvermixLoss)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stylist Commission vs Booth Rent Modeler */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Stylist Compensation Model Optimizer (Commission vs. Booth Rental)</h3>
            <p className="text-xs text-gray-500 mb-4">Evaluates whether high-revenue bridal & color artists should operate on 50% commission or fixed booth rental + product fees.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INITIAL_STYLIST_COMPENSATION.map((st) => (
                <div key={st.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900">{st.stylistName}</div>
                    <div className="text-[11px] text-gray-500">{st.branchName}</div>

                    <div className="mt-3 space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Monthly Revenue:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(st.monthlyServiceRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission Paid:</span>
                        <span>{formatCurrency(st.commissionPayout)} ({st.commissionRatePct}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Salon Net Margin:</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(st.salonNetMargin)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-white rounded border border-gray-200 text-xs">
                    <span className="text-gray-500">Recommended Model: </span>
                    <span className="font-bold text-blue-700">{st.optimalModelRecommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SOFTWARE & TECH FINOPS VIEW */}
      {/* ========================================================================= */}
      {selectedVertical === 'SOFTWARE_TECH' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Cloud FinOps Optimization</span>
                <Cpu className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-600 mt-2">{formatCurrency(9912000)}</p>
              <p className="text-xs text-gray-500 mt-1">Annual idle GPU, EBS & token caching savings</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>SSO Inactive Seats (60d+)</span>
                <Layers className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-2">{formatCurrency(396500)} / yr</p>
              <p className="text-xs text-gray-500 mt-1">Figma, Zoom, Datadog & Salesforce unassigned</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>AI Model Token Burn</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(450000)} / mo</p>
              <p className="text-xs text-gray-500 mt-1">72% reducible via Flash routing & caching</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Engineering Contractors vs FTE</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-2">1.82x Ratio</p>
              <p className="text-xs text-gray-500 mt-1">Conversion pipeline identified for 4 developers</p>
            </div>
          </div>

          {/* Cloud FinOps Anomalies Grid */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Cloud FinOps Idle Resources & Waste Detector</h3>
                <p className="text-xs text-gray-500 mt-0.5">Automated detection of overprovisioned clusters, idle GPUs, and unattached storage.</p>
              </div>
              <button
                onClick={() => {
                  if (onAddSavingsOpportunity) {
                    onAddSavingsOpportunity('Decommission Idle GPU Instances & Orphaned EBS Volumes', 4800000, 'Cloud Infrastructure');
                  }
                  showToast('Added Cloud FinOps Savings to Savings Center!');
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md"
              >
                Auto-Decommission Selected
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_CLOUD_FINOPS.map((fin) => (
                <div key={fin.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-800">
                      {fin.serviceType}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">Save {formatCurrency(fin.potentialAnnualSaving)}/yr</span>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mt-2">{fin.resourceId}</div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Monthly Spend: {formatCurrency(fin.monthlyCost)} • Utilization: {fin.utilizationRatePct}%
                  </div>
                  <div className="mt-2.5 p-2 bg-white rounded border border-gray-200 text-xs text-gray-700">
                    <strong>Action:</strong> {fin.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SSO Inactivity Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">SSO Inactive Seat De-provisioning Pipeline</h3>
              <p className="text-xs text-gray-500 mt-0.5">Identifies licenses with zero activity in 60+ days.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200 uppercase">
                  <tr>
                    <th className="py-3 px-4">Software Application</th>
                    <th className="py-3 px-4">Assigned User</th>
                    <th className="py-3 px-4">Annual Cost</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {INITIAL_SSO_INACTIVE_SEATS.map((sso) => (
                    <tr key={sso.id} className="hover:bg-gray-50/60">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{sso.softwareName}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">{sso.employeeEmail}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{formatCurrency(sso.seatCostAnnual)}</td>
                      <td className="py-3.5 px-4 text-rose-600 font-semibold">{sso.lastLoginDaysAgo} days ago</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-200 text-[11px]">
                          {sso.action.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. UNIVERSITIES & HIGHER EDUCATION VIEW */}
      {/* ========================================================================= */}
      {selectedVertical === 'HIGHER_EDUCATION' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Sponsored Research Grants</span>
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(165000000)}</p>
              <p className="text-xs text-gray-500 mt-1">3 Major Government & International Grants</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Overhead Cost Recovery</span>
                <Percent className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">24.2%</p>
              <p className="text-xs text-gray-500 mt-1">Institutional indirect research rate</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Shared Lab Prevented CapEx</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(78000000)}</p>
              <p className="text-xs text-emerald-700 font-medium mt-1">Saved via cross-department spectrometry booking</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                <span>Campus HVAC Energy Load</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-2">{formatCurrency(3800000)} / mo</p>
              <p className="text-xs text-gray-500 mt-1">Night & weekend setback schedules enabled</p>
            </div>
          </div>

          {/* Grant Compliance Grid */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Restricted Research Grant Compliance & Allowable Spending Gates</h3>
            <p className="text-xs text-gray-500 mb-4">Audits compliance with sponsor expenditure caps, international travel rules, and overhead allocation.</p>

            <div className="space-y-3">
              {INITIAL_GRANT_RECORDS.map((grt) => (
                <div key={grt.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-xs text-gray-900">{grt.sponsorName}</div>
                      <div className="text-[11px] font-mono text-gray-500">{grt.grantCode} • Total: {formatCurrency(grt.totalGrantAllocation)}</div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      grt.complianceStatus === 'COMPLIANT'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {grt.complianceStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Allowable Spent:</span>
                      <div className="font-bold text-gray-900">{formatCurrency(grt.spentAllowable)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Pending Encumbrances:</span>
                      <div className="font-semibold text-gray-800">{formatCurrency(grt.pendingUnapprovedEncumbrances)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Indirect Rate:</span>
                      <div className="font-semibold text-blue-700">{grt.overheadIndirectRatePct}%</div>
                    </div>
                  </div>

                  <div className="mt-2.5 p-2 bg-white rounded border border-gray-200 text-xs text-gray-700">
                    <strong>Rule:</strong> {grt.restrictedCategoryLimitNotes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Lab Instruments */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Cross-Department Research Lab Equipment Sharing Matrix</h3>
            <p className="text-xs text-gray-500 mb-4">Maximizes instrument utilization hours to prevent redundant CapEx equipment requests.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INITIAL_CAMPUS_LAB_EQUIPMENT.map((lab) => (
                <div key={lab.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900">{lab.instrumentName}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{lab.departmentHost}</div>

                    <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Replacement CapEx:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(lab.replacementCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shared Usage:</span>
                        <span className="font-semibold text-blue-700">{lab.crossDeptUsageHoursPerWeek} hrs/week</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Idle Capacity:</span>
                        <span className="font-bold text-emerald-700">{lab.idleCapacityPct}% Available</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-200 text-xs font-bold text-emerald-700">
                    Saved {formatCurrency(lab.preventDuplicatePurchaseSavings)} in Duplicate CapEx
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
