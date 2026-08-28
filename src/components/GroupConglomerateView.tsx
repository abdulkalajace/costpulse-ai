import React, { useState } from 'react';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  Award,
  ChevronRight,
  Hospital,
  Hotel,
  HardHat,
  Cpu,
  Scissors,
  GraduationCap,
  Scale,
  RefreshCw,
  AlertTriangle,
  FileCheck2,
  ExternalLink,
  MapPin,
  Users,
  CheckCircle2,
  Briefcase,
  Store,
  Sparkle,
  X,
} from 'lucide-react';
import { Company, CurrencyCode, IndustryVertical, SavingsOpportunity } from '../types';

interface GroupConglomerateViewProps {
  groupCompany: Company;
  subsidiaries: Company[];
  currency: CurrencyCode;
  onSelectSubsidiary: (sub: Company) => void;
  onNavigateTab: (tab: any) => void;
}

export const GroupConglomerateView: React.FC<GroupConglomerateViewProps> = ({
  groupCompany,
  subsidiaries,
  currency,
  onSelectSubsidiary,
  onNavigateTab,
}) => {
  const [selectedDossierSub, setSelectedDossierSub] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<'ENTITIES' | 'GOVERNANCE' | 'BRANDS_PROJECTS'>('ENTITIES');

  // Subsidiary vertical icons & styling metadata
  const verticalMeta: Record<
    IndustryVertical,
    { icon: any; color: string; bgColor: string; borderColor: string; tag: string }
  > = {
    CONSTRUCTION: {
      icon: HardHat,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      tag: 'Heavy Infrastructure, Townships & Luxury Interiors',
    },
    HEALTHCARE: {
      icon: Hospital,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      tag: 'Functional Foods, Agro Nutrition & Expiries',
    },
    HOTEL_HOSPITALITY: {
      icon: Hotel,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      tag: 'Serviced Living, Banqueting & Clubhouses',
    },
    BEAUTY_WELLNESS: {
      icon: Store,
      color: 'text-pink-700',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      tag: 'Ayurvedic Formulations & Medi-Aesthetic Wellness',
    },
    SOFTWARE_TECH: {
      icon: Cpu,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tag: 'Cloud FinOps & Inactive SSO Seats',
    },
    HIGHER_EDUCATION: {
      icon: GraduationCap,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      tag: 'Research Grants & Lab Instrument Sharing',
    },
  };

  // Group Financial Rollup
  const totalGroupRevenue = subsidiaries.reduce((acc, s) => acc + s.annualRevenue, 0) || groupCompany.annualRevenue;
  const totalGroupExpenses = subsidiaries.reduce((acc, s) => acc + s.totalExpensesYear, 0) || groupCompany.totalExpensesYear;
  const totalMonthlyBurn = subsidiaries.reduce((acc, s) => acc + s.monthlyBurn, 0) || groupCompany.monthlyBurn;
  const netMargin = Math.round(((totalGroupRevenue - totalGroupExpenses) / totalGroupRevenue) * 100);

  // Group-wide Cross-Vertical Synergies
  const synergies = [
    {
      id: 'syn-1',
      title: 'Group-Wide Bulk Cement, Steel & Heavy Diesel Procurement SLA',
      sectors: ['Skandhanshi Infra Projects', 'Skandhanshi Interius', 'Horizon Living'],
      potentialSaving: 28400000,
      description: 'Consolidated 65,000 MT UltraTech/JSW steel & 82,000L monthly fuel quota under a central master purchase agreement, saving 6.8% off list price.',
      status: 'HIGH_LEVERAGE',
    },
    {
      id: 'syn-2',
      title: 'Centralized Agro-Packaging, Printing & Cold-Chain Fleet SLA',
      sectors: ['Skandhanshi Agro Foods (Desi Nutri)', 'Skandhanshi Wellness', 'Horizon Living'],
      potentialSaving: 12500000,
      description: 'Bulk procurement of food-grade aseptic pouch laminates, master corrugated shippers, and refrigerated temperature-controlled freight.',
      status: 'READY_TO_EXECUTE',
    },
    {
      id: 'syn-3',
      title: 'Unified Corporate Health & Group Asset Insurance Underwriting',
      sectors: ['All 5 Subsidiaries (1,000+ Headcount)'],
      potentialSaving: 9800000,
      description: 'Merge 5 standalone policies into a single group captive policy with 0% broker fee slippage and direct TPA claims settlement.',
      status: 'IDENTIFIED',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Skandhanshi Group Executive Overview */}
      <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Diversified National Conglomerate</span>
                </span>
                <span className="bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Founded 2009 • Kurnool & Hyderabad
                </span>
                <a
                  href="https://skandhanshigroup.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 transition-colors"
                >
                  <span>skandhanshigroup.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {groupCompany.name}
              </h1>
              <p className="text-sm text-gray-300 max-w-3xl">
                {groupCompany.tagline || 'Pioneering infrastructure, luxury interiors, functional agro foods, hospitality and wellness across Andhra Pradesh, Telangana & Karnataka.'}
              </p>

              {/* Real Executive Board Quick Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-300">
                <span className="text-gray-400 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" /> Executive Board:
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                  K. Suresh Kumar Reddy (Chairman & MD)
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                  Radha Devi Krishnapuram (Director)
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                  P. Venkatramana (Group CFO)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => onNavigateTab('SAVINGS_CENTER')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Group Savings Engine</span>
              </button>
              <button
                onClick={() => setSelectedDossierSub(groupCompany)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>MCA & RoC Filings Dossier</span>
              </button>
            </div>
          </div>

          {/* Key Conglomerate Financial Rollup Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-xs text-gray-400 font-medium">Consolidated Turnover</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {(totalGroupRevenue / 10000000).toFixed(1)} Cr {currency}
              </p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" /> ~$62.5M USD Group Volume
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">Annual Group Spend</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {(totalGroupExpenses / 10000000).toFixed(1)} Cr {currency}
              </p>
              <span className="text-[10px] text-gray-400 mt-0.5">
                Burn: {(totalMonthlyBurn / 10000000).toFixed(2)} Cr/mo
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">Operating Margin</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
                {netMargin}%
              </p>
              <span className="text-[10px] text-gray-300 mt-0.5">
                Diversified multi-sector hedge
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">Identified Group Synergies</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-300 mt-1">
                5.27 Cr {currency}
              </p>
              <span className="text-[10px] text-amber-300/80 flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3" /> 3 cross-entity bulk contracts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Awards & Honors Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-amber-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Verified Industry Accolades & Accreditations
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-900 block">Leading Residential Developer AP</span>
              <span className="text-[11px] text-gray-600">ET Excellence Awards 2025 (K. Suresh Kumar Reddy)</span>
            </div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-900 block">Emerging Luxury Interior Designer</span>
              <span className="text-[11px] text-gray-600">ET Excellence Awards 2025 (Skandhanshi Interius)</span>
            </div>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-900 block">Start-Up of the Year (Nutri-Cereals)</span>
              <span className="text-[11px] text-gray-600">INCC & ICAR-IIMR (Desi Nutri / Agro Foods)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation View Modes */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('ENTITIES')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'ENTITIES'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Operating Legal Entities ({subsidiaries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'GOVERNANCE'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MCA, RoC & Statutory Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('BRANDS_PROJECTS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'BRANDS_PROJECTS'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Brands & Project Portfolio</span>
        </button>
      </div>

      {/* TAB 1: Operating Subsidiaries Cards */}
      {activeTab === 'ENTITIES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">Skandhanshi Group Operating Subsidiaries</h2>
              <p className="text-xs text-gray-500">
                Click "Open Vertical" to isolate the entire application into that specific company's operational telemetry, WBS costs, and inventory.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subsidiaries.map((sub) => {
              const vertical = sub.industryVertical || 'CONSTRUCTION';
              const meta = verticalMeta[vertical] || verticalMeta['CONSTRUCTION'];
              const Icon = meta.icon;
              const burnMonthly = sub.monthlyBurn || Math.round(sub.totalExpensesYear / 12);

              return (
                <div
                  key={sub.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl ${meta.bgColor} ${meta.color} border ${meta.borderColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        {sub.cin && (
                          <span className="text-[9px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block">
                            {sub.cin}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 mt-0.5 block">
                          Inc. {sub.foundedYear || 2015} • {sub.roc || 'MCA India'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{meta.tag}</p>
                    </div>

                    {/* Brands or Highlights */}
                    {sub.brands && sub.brands.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {sub.brands.slice(0, 2).map((b, i) => (
                          <span key={i} className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Annual Turnover</span>
                        <span className="font-bold text-gray-900">
                          {(sub.annualRevenue / 10000000).toFixed(1)} Cr {currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Annual Spend</span>
                        <span className="font-bold text-gray-900">
                          {(sub.totalExpensesYear / 10000000).toFixed(1)} Cr {currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedDossierSub(sub)}
                      className="text-[11px] font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>RoC Details</span>
                    </button>
                    <button
                      onClick={() => onSelectSubsidiary(sub)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-colors"
                    >
                      <span>Open Vertical</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MCA, RoC & Statutory Compliance Matrix */}
      {activeTab === 'GOVERNANCE' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Ministry of Corporate Affairs (MCA) & Statutory Registrations</h2>
            <p className="text-xs text-gray-500">Official government registration identifiers, RoC filings, GSTINs, and board directors.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold">
                  <th className="py-2.5 px-3">Legal Entity Name</th>
                  <th className="py-2.5 px-3">CIN (Corporate ID)</th>
                  <th className="py-2.5 px-3">RoC & State</th>
                  <th className="py-2.5 px-3">Key Directors</th>
                  <th className="py-2.5 px-3">Statutory Status</th>
                  <th className="py-2.5 px-3">Share Capital</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subsidiaries.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-900 block">{sub.name}</span>
                      <span className="text-[11px] text-gray-500">{sub.industry}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {sub.cin || 'GROUP HOLDING'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      <span className="font-medium">{sub.roc || 'RoC Hyderabad'}</span>
                      <span className="text-[10px] text-gray-400 block">Inc. {sub.foundedYear || 2015}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      {sub.directors && sub.directors.length > 0 ? (
                        <div className="space-y-0.5">
                          {sub.directors.map((d, idx) => (
                            <span key={idx} className="block text-[11px] text-gray-800">
                              • {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">K. Suresh Kumar Reddy</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {sub.statutoryStatus || 'ACTIVE_COMPLIANT'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      <span className="font-medium block">{sub.authorizedCapital || '₹3.0 Cr'}</span>
                      <span className="text-[10px] text-gray-400">Paid-up: {sub.paidUpCapital || '₹2.0 Cr'}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedDossierSub(sub)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Brands & Major Projects Portfolio */}
      {activeTab === 'BRANDS_PROJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subsidiaries.map((sub) => (
            <div key={sub.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900">{sub.name}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {sub.headquarters}
                </span>
              </div>

              {sub.brands && sub.brands.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Operating Brands
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sub.brands.map((brand, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-800 font-medium px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {sub.projectsList && sub.projectsList.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Signature Projects & Deliverables
                  </span>
                  <ul className="space-y-1 text-xs text-gray-700">
                    {sub.projectsList.map((proj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{proj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Section: Group-Wide Synergy Engine */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Skandhanshi Group Cross-Subsidiary Procurement Synergies</h2>
              <p className="text-xs text-gray-500">
                Bulk volume leverage across Infra, Interiors, Retail, Agro Processing & Hospitality.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Total Recapturable: 5.27 Cr {currency}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {synergies.map((syn) => (
            <div
              key={syn.id}
              className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Save {(syn.potentialSaving / 100000).toFixed(1)}L / yr
                </span>
                <span className="text-[10px] font-semibold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                  {syn.status}
                </span>
              </div>
              
              <h3 className="font-semibold text-xs text-gray-900 leading-snug">
                {syn.title}
              </h3>
              
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {syn.description}
              </p>

              <div className="pt-2 border-t border-gray-200/60">
                <p className="text-[10px] text-gray-400 font-medium">Covered Entities:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {syn.sectors.map((sec, i) => (
                    <span key={i} className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Full RoC & MCA Corporate Dossier Modal */}
      {selectedDossierSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                    {selectedDossierSub.cin || 'CONGLOMERATE HOLDING'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    MCA Verified & Active
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedDossierSub.name}</h2>
                <p className="text-xs text-gray-500">{selectedDossierSub.industry}</p>
              </div>
              <button
                onClick={() => setSelectedDossierSub(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corporate Dossier Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Registrar of Companies</span>
                <span className="font-semibold text-gray-900">{selectedDossierSub.roc || 'RoC Hyderabad / Bangalore'}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Incorporation Year</span>
                <span className="font-semibold text-gray-900">{selectedDossierSub.foundedYear || 2015} (11+ Yrs Operational)</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Authorized Capital</span>
                <span className="font-semibold text-gray-900">{selectedDossierSub.authorizedCapital || '₹5,00,00,000 (₹5 Cr)'}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Paid-Up Share Capital</span>
                <span className="font-semibold text-gray-900">{selectedDossierSub.paidUpCapital || '₹3,00,00,000 (₹3 Cr)'}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">GSTIN Identifier</span>
                <span className="font-mono font-semibold text-gray-900">{selectedDossierSub.gstin || '36AAMCS8920K1ZX'}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">PAN Record</span>
                <span className="font-mono font-semibold text-gray-900">{selectedDossierSub.pan || 'AAMCS8920K'}</span>
              </div>
            </div>

            {/* Registered Address */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" /> Registered Corporate Office
              </span>
              <p className="text-gray-800 leading-relaxed font-medium">
                {selectedDossierSub.registeredOffice || 'Plot No. 42, Skandhanshi Hub, Road No. 36, Jubilee Hills / HITEC City, Hyderabad & Skandhanshi Plaza, Kurnool'}
              </p>
            </div>

            {/* Directorship & Key Personnel */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                Board Directors & Signatories
              </span>
              <div className="space-y-1.5">
                {(selectedDossierSub.directors || ['K. Suresh Kumar Reddy (Managing Director)', 'Radha Devi Krishnapuram (Executive Director)']).map((dir, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
                    <span className="font-semibold text-gray-900">{dir}</span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      Active Signatory
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Footprint */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Annual Revenue</span>
                <span className="text-base font-bold text-gray-900">
                  {(selectedDossierSub.annualRevenue / 10000000).toFixed(1)} Cr {currency}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedDossierSub(null);
                  onSelectSubsidiary(selectedDossierSub);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Launch Operational Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
