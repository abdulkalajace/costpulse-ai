import {
  Company,
  SavingsOpportunity,
  Expense,
  Budget,
  Subscription,
  Vendor,
  ProcurementRequest,
  CurrencyCode,
  OpportunityAction,
} from '../types';

export interface QuickCostCut {
  id: string;
  title: string;
  category: string;
  actionType: OpportunityAction;
  annualSavings: number;
  monthlyImpact: number;
  effort: 'INSTANT' | 'LOW' | 'MEDIUM';
  risk: 'NONE' | 'LOW' | 'MEDIUM';
  roiTimeline: string;
  description: string;
  targetEntity: string;
  isExecuted?: boolean;
}

export interface CompanyIntelligenceProfile {
  companyId: string;
  monthlyBurn: number;
  dailyBurnVelocity: number;
  cashRunwayMonths: number;
  annualRevenue: number;
  annualSpend: number;
  costRevenueRatio: number;
  totalIdentifiedWaste: number;
  targetSavingsAnnual: number;
  confirmedSavingsAnnual: number;
  realizedSavingsAnnual: number;
  executionRatePct: number;
  aiBriefing: string;
  burnDrivers: { category: string; pctChange: string; trend: 'UP' | 'DOWN' }[];
  spendingBreakdown: { name: string; spend: number; pct: string; color: string }[];
  monthlyTrajectory: { month: string; revenue: number; expenses: number; projected: number }[];
  quickCuts: QuickCostCut[];
  departmentBurnTable: {
    deptCode: string;
    deptName: string;
    monthlyBudgetCap: number;
    monthlyBurnActual: number;
    headcount: number;
    variancePct: number;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    topLeak: string;
  }[];
}

// ----------------------------------------------------------------------------
// 1. DEDICATED SAVINGS OPPORTUNITIES PER COMPANY
// ----------------------------------------------------------------------------
export const COMPANY_SAVINGS_MAP: Record<string, SavingsOpportunity[]> = {
  // 1. Skandhanshi Group Holdings (Consolidated Multi-Vertical Conglomerate)
  'comp-skandhanshi-group': [
    {
      id: 'sav-grp-01',
      companyId: 'comp-skandhanshi-group',
      title: 'Consolidate Cross-Subsidiary Steel & Cement Bulk Volume Master Rate Contract',
      category: 'Property & Facilities',
      problem: 'Skandhanshi Infra, Interius, and Horizon Living independently purchase Fe550D TMT Rebar and 53-Grade OPC Cement at local regional rates without unified conglomerate pooling.',
      evidence: 'Combined group order volume is 38,000 MT steel and 2.4 lakh cement bags. Centralized negotiations unlock ₹7,200/MT tier discount.',
      currentCostAnnual: 248000000,
      estimatedSavingAnnual: 38500000, // ₹3.85 Cr/yr
      actualSavingConfirmed: 38500000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: '14.2x Immediate',
      status: 'APPROVED',
      actionType: 'CONSOLIDATE',
      targetEntityName: 'Tata Steel / UltraTech Direct Mill Contract',
      alternatives: [
        {
          name: 'Group Master Purchasing Agreement with JSW Steel & UltraTech',
          estimatedCostAnnual: 209500000,
          pros: ['Direct factory dispatch to 6 sites', 'Guaranteed price lock for 12 months', 'Saves ₹3.85 Cr/year'],
          cons: ['Requires central purchase committee sign-off'],
          switchingDifficulty: 'EASY',
          securityCompliant: true,
        },
      ],
    },
    {
      id: 'sav-grp-02',
      companyId: 'comp-skandhanshi-group',
      title: 'Unified Corporate ERP, HRMS & IT Licensing Consolidation',
      category: 'Software & SaaS',
      problem: '5 subsidiaries operate separate instances of TallyPrime, Keka HRMS, and cloud file storage with fragmented multi-tenant license markups.',
      evidence: 'Group pays for 1,280 employee seats across 4 independent vendor billing agreements with redundant admin overhead.',
      currentCostAnnual: 18500000,
      estimatedSavingAnnual: 6400000, // ₹64 Lakhs/yr
      actualSavingConfirmed: 6400000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'MEDIUM',
      risk: 'LOW',
      roi: '8.5x',
      status: 'REALIZED',
      actionType: 'CONSOLIDATE',
      targetEntityName: 'Group Master IT & Cloud Stack',
      alternatives: [],
    },
    {
      id: 'sav-grp-03',
      companyId: 'comp-skandhanshi-group',
      title: 'Captive Solar Power Wheel & Net-Metering across Kurnool & Hyderabad Facilities',
      category: 'Utilities & Services',
      problem: 'Commercial grid electricity tariff averages ₹9.85/kWh across industrial plants, modular factory, corporate offices, and clubhouses.',
      evidence: 'Installing a 1.2 MW rooftop and ground-mount captive solar array offsets 68% of group daytime power draw.',
      currentCostAnnual: 36000000,
      estimatedSavingAnnual: 14200000, // ₹1.42 Cr/yr
      actualSavingConfirmed: 0,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'MEDIUM',
      risk: 'LOW',
      roi: '3.4 Years Payback',
      status: 'UNDER_REVIEW',
      actionType: 'AUTOMATE',
      targetEntityName: 'Captive Solar Project',
      alternatives: [],
    },
    {
      id: 'sav-grp-04',
      companyId: 'comp-skandhanshi-group',
      title: 'Logistics & Fleet Transport Route Pooling between Hyderabad and Kurnool Corridor',
      category: 'Workforce & Contractors',
      problem: 'Dedicated trucks return empty on return trips between Bachupally modular plant and Kurnool infrastructure sites.',
      evidence: 'GPS telematics indicates 42% empty deadhead kilometers on interstate logistics runs.',
      currentCostAnnual: 22000000,
      estimatedSavingAnnual: 5800000, // ₹58 Lakhs/yr
      actualSavingConfirmed: 0,
      currency: 'INR',
      confidence: 'MEDIUM',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'DETECTED',
      actionType: 'CONSOLIDATE',
      targetEntityName: 'Fleet Routing Optimization',
      alternatives: [],
    },
  ],

  // 2. Skandhanshi Infra Projects India Pvt Ltd (Real Estate & Civil)
  'comp-sk-infra': [
    {
      id: 'sav-inf-01',
      companyId: 'comp-sk-infra',
      title: 'Captive Ready-Mix Concrete (RMC) Batching Plant Mix Optimization & Fly Ash Blending',
      category: 'Property & Facilities',
      problem: 'Site batching plants are utilizing standard M25/M30 mix designs with 380 kg/m3 cement content without calibrated chemical plasticizers and processed fly ash.',
      evidence: 'Third-party lab trial cubes confirm 18% cement reduction while maintaining 28-day characteristic compressive strength (32.4 MPa).',
      currentCostAnnual: 84000000,
      estimatedSavingAnnual: 12600000, // ₹1.26 Cr/yr
      actualSavingConfirmed: 12600000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate upon mix calibration',
      status: 'REALIZED',
      actionType: 'AUTOMATE',
      targetEntityName: 'Site Batching Plants (Silicon Valley & Grandeur)',
      alternatives: [],
    },
    {
      id: 'sav-inf-02',
      companyId: 'comp-sk-infra',
      title: 'Heavy Equipment Idle Engine Fuel Cut & GPS Telematics Auto-Shutoff',
      category: 'Hardware & Devices',
      problem: 'CAT 336D Excavators, Transit Mixers, and JCB Backhoes average 34% engine idle time during staging and material transfer.',
      evidence: 'IoT fuel sensor logs show 3,800 liters of diesel wasted monthly across 14 machines in idling status alone.',
      currentCostAnnual: 28500000,
      estimatedSavingAnnual: 4200000, // ₹42 Lakhs/yr
      actualSavingConfirmed: 4200000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: '100% fuel reduction',
      status: 'APPROVED',
      actionType: 'AUTOMATE',
      targetEntityName: 'Heavy Equipment Telematics',
      alternatives: [],
    },
    {
      id: 'sav-inf-03',
      companyId: 'comp-sk-infra',
      title: 'Structural Steel Rebar Off-Cut Scrap Optimization & BBS Bar-Bending Automation',
      category: 'Property & Facilities',
      problem: 'Manual on-site rebar cutting generates 7.8% scrap loss compared to international benchmark of 2.5%.',
      evidence: 'Deploying Bar Bending Schedule (BBS) 1D cutting stock optimization software reduces steel scrap generation to 2.1%.',
      currentCostAnnual: 46000000,
      estimatedSavingAnnual: 6800000, // ₹68 Lakhs/yr
      actualSavingConfirmed: 0,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: '8.2x',
      status: 'UNDER_REVIEW',
      actionType: 'AUTOMATE',
      targetEntityName: 'Civil BBS Cutting Software',
      alternatives: [],
    },
    {
      id: 'sav-inf-04',
      companyId: 'comp-sk-infra',
      title: 'Subcontractor Labor Rate Harmonization & Biometric Field Attendance',
      category: 'Workforce & Contractors',
      problem: 'Labor contractor muster rolls had 11% phantom attendance disparity against real-time biometric face turnstile scans.',
      evidence: 'Audit of Kurnool Grandeur site muster roll revealed ₹8.4L monthly unverified contractor wage payouts.',
      currentCostAnnual: 72000000,
      estimatedSavingAnnual: 8600000, // ₹86 Lakhs/yr
      actualSavingConfirmed: 5200000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'IN_PROGRESS',
      actionType: 'REMOVE',
      targetEntityName: 'Site Biometric Wage Verification',
      alternatives: [],
    },
  ],

  // 3. Skandhanshi Interius Pvt Ltd (Turnkey Interiors & Modular Plant)
  'comp-sk-interius': [
    {
      id: 'sav-int-01',
      companyId: 'comp-sk-interius',
      title: 'German CNC Automated Nesting & Panel Cutting Optimization (Reduce Plywood Waste)',
      category: 'Property & Facilities',
      problem: 'Manual CAD layout on German CNC beam saws generates 14.8% board scrap off-cuts on premium calibrated plywood and HDHMR sheets.',
      evidence: 'Automated 2D nesting algorithm increases panel yield from 85.2% to 94.6%, saving 420 full sheets per month.',
      currentCostAnnual: 24000000,
      estimatedSavingAnnual: 2900000, // ₹29 Lakhs/yr
      actualSavingConfirmed: 2900000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'REALIZED',
      actionType: 'AUTOMATE',
      targetEntityName: 'Bachupally CNC Factory Automation',
      alternatives: [],
    },
    {
      id: 'sav-int-02',
      companyId: 'comp-sk-interius',
      title: 'Direct Hardware & Fittings OEM Import Contract (Hafele & Hettich)',
      category: 'Property & Facilities',
      problem: 'Interius was purchasing soft-close hinges, tandem boxes, and sliding systems via local regional distributors with a 24% markup.',
      evidence: 'Direct annual OEM commitment of ₹3.5 Cr unlocks direct factory pricing with 19% gross cost reduction.',
      currentCostAnnual: 35000000,
      estimatedSavingAnnual: 6650000, // ₹66.5 Lakhs/yr
      actualSavingConfirmed: 6650000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'MEDIUM',
      risk: 'LOW',
      roi: '7.8x',
      status: 'APPROVED',
      actionType: 'RENEGOTIATE',
      targetEntityName: 'Hafele / Hettich Direct Procurement',
      alternatives: [],
    },
    {
      id: 'sav-int-03',
      companyId: 'comp-sk-interius',
      title: 'Cloud 3D GPU Rendering Spot Instance Migration for Architectural Visualizations',
      category: 'Cloud Infrastructure',
      problem: 'Design studio runs on-demand rendering workstations during peak hours at standard high-tariff electricity and cloud rates.',
      evidence: 'Switching 3ds Max / V-Ray rendering batch jobs to AWS EC2 Spot Instances saves 68% in compute bills.',
      currentCostAnnual: 4800000,
      estimatedSavingAnnual: 2400000, // ₹24 Lakhs/yr
      actualSavingConfirmed: 0,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'DETECTED',
      actionType: 'DOWNGRADE',
      targetEntityName: '3D Render Farm Infrastructure',
      alternatives: [],
    },
  ],

  // 4. Skandhanshi Agro Foods Pvt Ltd (Desi Nutri)
  'comp-sk-agro': [
    {
      id: 'sav-agr-01',
      companyId: 'comp-sk-agro',
      title: 'Direct Rayalaseema & Telangana Farmer Collective Millet Procurement Hub',
      category: 'Property & Facilities',
      problem: 'Sourcing ragi, foxtail, and jowar grains through tier-2 middlemen incurs APMC mandi cess and 14% commission markups.',
      evidence: 'Direct procurement agreements with 3,500 organic millet farmers in Kurnool and Anantapur saves ₹6.40 per kg raw grain.',
      currentCostAnnual: 42000000,
      estimatedSavingAnnual: 7200000, // ₹72 Lakhs/yr
      actualSavingConfirmed: 7200000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'MEDIUM',
      risk: 'LOW',
      roi: '4.2x',
      status: 'REALIZED',
      actionType: 'CONSOLIDATE',
      targetEntityName: 'Desi Nutri Farmer Procurement Hub',
      alternatives: [],
    },
    {
      id: 'sav-agr-02',
      companyId: 'comp-sk-agro',
      title: 'Packaging Cylinder & Multi-SKU Flexible Pouch Gang-Printing Consolidation',
      category: 'Marketing & Ads',
      problem: '18 snack and cereal SKUs have independent rotogravure cylinder tooling setups and short printing run penalties.',
      evidence: 'Consolidating to common master pouch dimensions with shared cylinder tooling saves ₹18.5L in one-time tooling and 12% in film run costs.',
      currentCostAnnual: 16500000,
      estimatedSavingAnnual: 2600000, // ₹26 Lakhs/yr
      actualSavingConfirmed: 0,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'UNDER_REVIEW',
      actionType: 'CONSOLIDATE',
      targetEntityName: 'Pouch Packaging Supply Chain',
      alternatives: [],
    },
    {
      id: 'sav-agr-03',
      companyId: 'comp-sk-agro',
      title: 'Cold Storage Room Variable Frequency Drive (VFD) Temperature Cycling',
      category: 'Utilities & Services',
      problem: 'Cold storage chillers for cold-pressed oils run fixed-speed compressors 24/7 regardless of ambient night temperatures.',
      evidence: 'VFD retrofit reduces nighttime compressor electricity draw by 34% with zero temperature fluctuation.',
      currentCostAnnual: 8200000,
      estimatedSavingAnnual: 1800000, // ₹18 Lakhs/yr
      actualSavingConfirmed: 1800000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: '8 Months Payback',
      status: 'APPROVED',
      actionType: 'AUTOMATE',
      targetEntityName: 'Cold Storage Chiller System',
      alternatives: [],
    },
  ],

  // 5. Skandhanshi Wellness Pvt Ltd (Ayurveda & Aesthetics)
  'comp-sk-wellness': [
    {
      id: 'sav-wel-01',
      companyId: 'comp-sk-wellness',
      title: 'In-House Supercritical CO2 Herb Extraction vs. Outsourced Botanical Extracts',
      category: 'Property & Facilities',
      problem: 'Purchasing pre-extracted ashwagandha, brahmi, and kumkumadi oils from third-party formulators carries a 32% margin premium.',
      evidence: 'Commissioning in-house AYUSH GMP extraction lab yields 99.4% active phytocompounds at 40% lower cost.',
      currentCostAnnual: 18000000,
      estimatedSavingAnnual: 3900000, // ₹39 Lakhs/yr
      actualSavingConfirmed: 3900000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'MEDIUM',
      risk: 'LOW',
      roi: '14 Months',
      status: 'REALIZED',
      actionType: 'AUTOMATE',
      targetEntityName: 'Ayush Extraction Laboratory',
      alternatives: [],
    },
    {
      id: 'sav-wel-02',
      companyId: 'comp-sk-wellness',
      title: 'Clinic & Med-Spa Product Dispensing Micro-Dosing Scales (Cut 22% Backbar Waste)',
      category: 'Property & Facilities',
      problem: 'Therapists and aesthetic practitioners over-dispense luxury massage oils, peel serums, and botanical face masks by 20-25% per session.',
      evidence: 'Smart Bluetooth dispensing scales calibrated to exact treatment recipes reduce product wastage from 24% to 2.8%.',
      currentCostAnnual: 7500000,
      estimatedSavingAnnual: 1650000, // ₹16.5 Lakhs/yr
      actualSavingConfirmed: 0,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'UNDER_REVIEW',
      actionType: 'REMOVE',
      targetEntityName: 'Med-Spa Backbar Dispensing',
      alternatives: [],
    },
  ],

  // 6. Skandhanshi Horizon Living & Hospitality
  'comp-sk-horizon': [
    {
      id: 'sav-hor-01',
      companyId: 'comp-sk-horizon',
      title: 'Banquet & Wedding Kitchen RFID Plate-Level Spoilage Control & Dynamic Batch Cooking',
      category: 'Property & Facilities',
      problem: 'Large banquet events prepare 18-22% excess food buffer based on static contractor guarantees, resulting in heavy food disposal.',
      evidence: 'Real-time RFID entry count syncing with kitchen batch replenishment cuts banquet prep overage by 60%.',
      currentCostAnnual: 19500000,
      estimatedSavingAnnual: 3400000, // ₹34 Lakhs/yr
      actualSavingConfirmed: 3400000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'REALIZED',
      actionType: 'AUTOMATE',
      targetEntityName: 'Horizon Grand Ballroom Banqueting',
      alternatives: [],
    },
    {
      id: 'sav-hor-02',
      companyId: 'comp-sk-horizon',
      title: 'Direct Corporate Booking Engine to Bypass 20% OTA Aggregator Commissions',
      category: 'Marketing & Ads',
      problem: 'Corporate long-stay suites and event bookings through MakeMyTrip / Booking.com lose 18-22% in commission fees.',
      evidence: 'Direct corporate portal with corporate billing terms redirects 45% of OTA bookings to zero-commission direct channels.',
      currentCostAnnual: 14000000,
      estimatedSavingAnnual: 2800000, // ₹28 Lakhs/yr
      actualSavingConfirmed: 0,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'APPROVED',
      actionType: 'RENEGOTIATE',
      targetEntityName: 'Direct Booking Engine',
      alternatives: [],
    },
  ],

  // Standalone Software Tech (ApexTech)
  'comp-standalone-tech': [
    {
      id: 'sav-tech-01',
      companyId: 'comp-standalone-tech',
      title: 'Decommission 14 Idle Cloud Servers & Reclaim Unattached EBS Volumes',
      category: 'Cloud Infrastructure',
      problem: '14 GPU and test instances in us-east-1 have maintained 0% utilization for 45 days.',
      evidence: 'AWS CloudWatch verified zero workload throughput with ₹3.6L monthly billing penalty.',
      currentCostAnnual: 4800000,
      estimatedSavingAnnual: 3600000,
      actualSavingConfirmed: 3600000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'REALIZED',
      actionType: 'REMOVE',
      targetEntityName: 'AWS Cloud Compute',
      alternatives: [],
    },
    {
      id: 'sav-tech-02',
      companyId: 'comp-standalone-tech',
      title: 'Right-Size Salesforce CRM Licenses & Purge 38 Inactive Seats',
      category: 'Software & SaaS',
      problem: '38 user accounts have had zero login activity in >75 days.',
      evidence: 'SSO log audit verified 38 dormant seats costing ₹2.85L/mo.',
      currentCostAnnual: 10500000,
      estimatedSavingAnnual: 2850000,
      actualSavingConfirmed: 2850000,
      currency: 'INR',
      confidence: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      roi: 'Immediate',
      status: 'APPROVED',
      actionType: 'DOWNGRADE',
      targetEntityName: 'Salesforce Org',
      alternatives: [],
    },
  ],
};

// ----------------------------------------------------------------------------
// 2. COMPANY INTELLIGENCE SNAPSHOT BUILDER
// ----------------------------------------------------------------------------
export function getCompanyIntelligence(
  company: Company,
  activeSavings: SavingsOpportunity[] = []
): CompanyIntelligenceProfile {
  const companyId = company.id;
  const isGroup = Boolean(company.isGroup);

  // Determine specific savings for this company
  const companySavings =
    activeSavings.length > 0 && activeSavings.some((s) => s.companyId === companyId)
      ? activeSavings.filter((s) => s.companyId === companyId)
      : COMPANY_SAVINGS_MAP[companyId] || COMPANY_SAVINGS_MAP['comp-sk-infra'];

  const totalIdentifiedWaste = companySavings.reduce((acc, s) => acc + s.estimatedSavingAnnual, 0);
  const confirmedSavingsAnnual = companySavings
    .filter((s) => ['APPROVED', 'IN_PROGRESS', 'IMPLEMENTED', 'REALIZED'].includes(s.status))
    .reduce((acc, s) => acc + (s.actualSavingConfirmed || s.estimatedSavingAnnual), 0);
  const realizedSavingsAnnual = companySavings
    .filter((s) => ['IMPLEMENTED', 'REALIZED'].includes(s.status))
    .reduce((acc, s) => acc + (s.actualSavingConfirmed || s.estimatedSavingAnnual), 0);

  const targetSavingsAnnual = totalIdentifiedWaste;
  const executionRatePct =
    targetSavingsAnnual > 0 ? Math.round((realizedSavingsAnnual / targetSavingsAnnual) * 100) : 0;

  const monthlyBurn = company.monthlyBurn || Math.round(company.totalExpensesYear / 12);
  const dailyBurnVelocity = Math.round(monthlyBurn / 30);
  const annualSpend = company.totalExpensesYear || monthlyBurn * 12;
  const annualRevenue = company.annualRevenue || annualSpend * 1.6;
  const costRevenueRatio = Number(((annualSpend / annualRevenue) * 100).toFixed(1));

  // Runway in months (calculated assuming cash reserves of ~2.4x annual revenue or 28-36 months)
  const estimatedCashReserves = annualSpend * 2.5;
  const cashRunwayMonths = Number((estimatedCashReserves / monthlyBurn).toFixed(1));

  // Quick Cuts list derived from savings
  const quickCuts: QuickCostCut[] = companySavings.map((s, idx) => ({
    id: `qc-${s.id}`,
    title: s.title,
    category: s.category,
    actionType: s.actionType,
    annualSavings: s.estimatedSavingAnnual,
    monthlyImpact: Math.round(s.estimatedSavingAnnual / 12),
    effort: idx === 0 ? 'INSTANT' : s.effort === 'LOW' ? 'LOW' : 'MEDIUM',
    risk: s.risk === 'LOW' ? 'NONE' : 'LOW',
    roiTimeline: s.roi || 'Immediate',
    description: s.problem,
    targetEntity: s.targetEntityName,
    isExecuted: ['IMPLEMENTED', 'REALIZED'].includes(s.status),
  }));

  // Spending Breakdown tailored to industry vertical
  let spendingBreakdown: { name: string; spend: number; pct: string; color: string }[] = [];
  if (company.industryVertical === 'CONSTRUCTION' || companyId === 'comp-sk-infra') {
    spendingBreakdown = [
      { name: 'Direct Civil Materials (Steel/Cement/Aggregates)', spend: Math.round(annualSpend * 0.44), pct: '44%', color: '#2563eb' },
      { name: 'Subcontractor Labor & Execution', spend: Math.round(annualSpend * 0.26), pct: '26%', color: '#4f46e5' },
      { name: 'Heavy Plant & Machinery Fuel/AMC', spend: Math.round(annualSpend * 0.14), pct: '14%', color: '#0891b2' },
      { name: 'Land Liaisoning & Approvals', spend: Math.round(annualSpend * 0.08), pct: '8%', color: '#d97706' },
      { name: 'Sales, Marketing & Broker Commissions', spend: Math.round(annualSpend * 0.05), pct: '5%', color: '#16a34a' },
      { name: 'Corporate Admin & IT Stack', spend: Math.round(annualSpend * 0.03), pct: '3%', color: '#64748b' },
    ];
  } else if (isGroup) {
    spendingBreakdown = [
      { name: 'Infrastructure & Civil Operations', spend: Math.round(annualSpend * 0.58), pct: '58%', color: '#2563eb' },
      { name: 'Agro Foods Processing & Supply Chain', spend: Math.round(annualSpend * 0.15), pct: '15%', color: '#16a34a' },
      { name: 'Interius Modular Factory & Design', spend: Math.round(annualSpend * 0.12), pct: '12%', color: '#4f46e5' },
      { name: 'Hospitality & Horizon Living Banquets', spend: Math.round(annualSpend * 0.08), pct: '8%', color: '#d97706' },
      { name: 'Wellness & Clinical Formulations', spend: Math.round(annualSpend * 0.04), pct: '4%', color: '#0891b2' },
      { name: 'Corporate Treasury & Governance', spend: Math.round(annualSpend * 0.03), pct: '3%', color: '#64748b' },
    ];
  } else if (companyId === 'comp-sk-agro') {
    spendingBreakdown = [
      { name: 'Raw Grain & Farmer Procurement', spend: Math.round(annualSpend * 0.48), pct: '48%', color: '#16a34a' },
      { name: 'Processing Plant Energy & Cold Storage', spend: Math.round(annualSpend * 0.22), pct: '22%', color: '#d97706' },
      { name: 'Packaging Materials & Cylinders', spend: Math.round(annualSpend * 0.14), pct: '14%', color: '#2563eb' },
      { name: 'Distribution Freight & Mandi Logistics', spend: Math.round(annualSpend * 0.10), pct: '10%', color: '#4f46e5' },
      { name: 'Quality Lab, FSSAI & Admin', spend: Math.round(annualSpend * 0.06), pct: '6%', color: '#64748b' },
    ];
  } else {
    spendingBreakdown = [
      { name: 'Core Operations & Materials', spend: Math.round(annualSpend * 0.42), pct: '42%', color: '#2563eb' },
      { name: 'Workforce & Talent', spend: Math.round(annualSpend * 0.28), pct: '28%', color: '#4f46e5' },
      { name: 'Facilities & Power', spend: Math.round(annualSpend * 0.15), pct: '15%', color: '#d97706' },
      { name: 'Software, IT & Cloud', spend: Math.round(annualSpend * 0.10), pct: '10%', color: '#0891b2' },
      { name: 'Admin & Compliance', spend: Math.round(annualSpend * 0.05), pct: '5%', color: '#64748b' },
    ];
  }

  // 12-Month Trajectory
  const baseMonthlyRev = annualRevenue / 12;
  const baseMonthlyExp = annualSpend / 12;
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug (Live)'];
  const monthlyTrajectory = months.map((m, idx) => {
    const revMult = 0.92 + idx * 0.015;
    const expMult = 0.95 + idx * 0.009;
    const rev = Math.round(baseMonthlyRev * revMult);
    const exp = Math.round(baseMonthlyExp * expMult);
    const proj = Math.round(exp * 0.88); // With cost cutting
    return {
      month: m,
      revenue: rev,
      expenses: exp,
      projected: proj,
    };
  });

  // Burn Drivers
  const burnDrivers = [
    { category: 'Bulk Raw Materials', pctChange: '+8.4%', trend: 'UP' as const },
    { category: 'Contractor Labor Index', pctChange: '+5.2%', trend: 'UP' as const },
    { category: 'Plant & Diesel Telemetry', pctChange: '-6.8%', trend: 'DOWN' as const },
    { category: 'Software & IT Subscriptions', pctChange: '-14.2%', trend: 'DOWN' as const },
  ];

  // AI Briefing
  const aiBriefing = isGroup
    ? `Consolidated Skandhanshi Group burn rate is ₹${(monthlyBurn / 10000000).toFixed(2)} Cr/month. Realized cost cuts generated ₹${(realizedSavingsAnnual / 10000000).toFixed(2)} Cr in annualized EBITDA recovery. Centralizing cross-subsidiary steel/cement and ERP licensing represents the single largest margin dividend.`
    : `${company.name} operating at ₹${(monthlyBurn / 10000000).toFixed(2)} Cr monthly burn with ${cashRunwayMonths} months cash runway. AI detected ₹${(totalIdentifiedWaste / 10000000).toFixed(2)} Cr in actionable cost-cutting leaks across operational ledgers.`;

  // Department Burn Table
  const departmentBurnTable = [
    {
      deptCode: 'DEP-EXEC',
      deptName: 'CIVIL & EXECUTION',
      monthlyBudgetCap: Math.round(monthlyBurn * 0.38),
      monthlyBurnActual: Math.round(monthlyBurn * 0.41),
      headcount: 142,
      variancePct: 7.9,
      status: 'WARNING' as const,
      topLeak: 'Over-batching cement mix & transit mixer idle time',
    },
    {
      deptCode: 'DEP-STORE',
      deptName: 'CENTRAL STORES & INVENTORY',
      monthlyBudgetCap: Math.round(monthlyBurn * 0.22),
      monthlyBurnActual: Math.round(monthlyBurn * 0.21),
      headcount: 48,
      variancePct: -4.5,
      status: 'HEALTHY' as const,
      topLeak: 'Steel off-cut BBS rebar scrap generation',
    },
    {
      deptCode: 'DEP-MEP',
      deptName: 'MEP, ELECTRICAL & PLUMBING',
      monthlyBudgetCap: Math.round(monthlyBurn * 0.16),
      monthlyBurnActual: Math.round(monthlyBurn * 0.18),
      headcount: 36,
      variancePct: 12.5,
      status: 'CRITICAL' as const,
      topLeak: 'Copper conduit scrap & unmonitored diesel gen-set power',
    },
    {
      deptCode: 'DEP-PROC',
      deptName: 'PURCHASE & PROCUREMENT',
      monthlyBudgetCap: Math.round(monthlyBurn * 0.12),
      monthlyBurnActual: Math.round(monthlyBurn * 0.11),
      headcount: 18,
      variancePct: -8.3,
      status: 'HEALTHY' as const,
      topLeak: 'Fragmented local vendor stationery & consumables',
    },
    {
      deptCode: 'DEP-IT',
      deptName: 'IT, ERP & AUTOMATION',
      monthlyBudgetCap: Math.round(monthlyBurn * 0.06),
      monthlyBurnActual: Math.round(monthlyBurn * 0.05),
      headcount: 12,
      variancePct: -16.7,
      status: 'HEALTHY' as const,
      topLeak: 'Dormant SaaS user seats & idle GPU cloud servers',
    },
  ];

  return {
    companyId,
    monthlyBurn,
    dailyBurnVelocity,
    cashRunwayMonths,
    annualRevenue,
    annualSpend,
    costRevenueRatio,
    totalIdentifiedWaste,
    targetSavingsAnnual,
    confirmedSavingsAnnual,
    realizedSavingsAnnual,
    executionRatePct,
    aiBriefing,
    burnDrivers,
    spendingBreakdown,
    monthlyTrajectory,
    quickCuts,
    departmentBurnTable,
  };
}
