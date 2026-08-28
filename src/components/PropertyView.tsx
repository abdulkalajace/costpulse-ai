import React from 'react';
import {
  Building,
  MapPin,
  TrendingDown,
  Users,
  Maximize2,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PropertyLocation, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PropertyViewProps {
  properties: PropertyLocation[];
  currency: CurrencyCode;
  onOpenAlternativeEngine: (item: {
    itemName: string;
    itemType: string;
    currentCost: number;
    currentVendor: string;
  }) => void;
}

export const PropertyView: React.FC<PropertyViewProps> = ({
  properties,
  currency,
  onOpenAlternativeEngine,
}) => {
  const totalRentAnnual = properties.reduce((acc, p) => acc + p.rentAnnual, 0);
  const totalAreaSqFt = properties.reduce((acc, p) => acc + p.areaSqFt, 0);
  const totalSeats = properties.reduce((acc, p) => acc + p.capacitySeats, 0);
  const totalOccupied = properties.reduce((acc, p) => acc + p.occupancySeats, 0);
  const overallOccupancyPct = Math.round((totalOccupied / (totalSeats || 1)) * 100);
  const subleaseCandidates = properties.filter((p) => p.subleasePotential);
  const identifiedSubleaseAnnual = subleaseCandidates.reduce(
    (acc, p) => acc + (p.subleasePotential?.estimatedAnnualRevenue || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Real Estate, Facilities & Office Cost Intelligence
            </h1>
            <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase tracking-wider">
              {properties.length} Active Sites
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track office rent, cost per seat, physical badge-swipe utilization, lease expiry, and sublease opportunities.
          </p>
        </div>
      </div>

      {/* Facilities KPIs */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Real Estate Run-Rate</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalRentAnnual, currency)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {properties.length} offices & facilities
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Physical Footprint</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {totalAreaSqFt.toLocaleString()} sqft
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Avg: ₹{(totalRentAnnual / (totalAreaSqFt || 1)).toFixed(0)} / sqft / yr
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Overall Seat Utilization</span>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              {overallOccupancyPct}% OCCUPIED
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
            {totalOccupied} / {totalSeats} Seats
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {totalSeats - totalOccupied} empty seats across floors
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Identified Sublease / Downsize</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            {formatCurrency(identifiedSubleaseAnnual, currency, true)} /yr
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            {subleaseCandidates.length > 0
              ? `${subleaseCandidates.length} site${subleaseCandidates.length === 1 ? '' : 's'} with sublease potential`
              : 'No sublease opportunities identified'}
          </div>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
          <Building className="h-8 w-8 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900">No properties tracked yet</h3>
          <p className="mt-1.5 max-w-sm text-xs text-slate-500">
            Once you add office and facility locations, you'll see rent, occupancy, and sublease opportunities here.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {properties.map((prop) => {
          const costPerSeat = Math.round(prop.rentAnnual / (prop.capacitySeats || 1));
          const isUnderutilized = prop.utilizationRate < 50;

          return (
            <div
              key={prop.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-500" />
                    <h2 className="text-sm font-bold text-slate-900">{prop.name}</h2>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{prop.address}, {prop.city}</span>
                  </div>
                </div>

                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    isUnderutilized
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {prop.utilizationRate}% Utilized
                </span>
              </div>

              {/* Physical Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Rent</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {formatCurrency(prop.rentAnnual, currency)}/yr
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Area & Cost/sqft</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {prop.areaSqFt.toLocaleString()} sqft (₹{prop.costPerSqFt}/mo)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Seat Capacity</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {prop.occupancySeats} / {prop.capacitySeats} ({formatCurrency(costPerSeat, currency, true)}/seat)
                  </div>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                  <span>Badge-Swipe Attendance</span>
                  <span className={isUnderutilized ? 'text-amber-700 font-bold' : 'text-slate-800'}>
                    {prop.utilizationRate}% Capacity
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isUnderutilized ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${prop.utilizationRate}%` }}
                  />
                </div>
              </div>

              {/* Sublease Opportunity Prompt */}
              {prop.subleasePotential && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                      Sublease Optimization Available
                    </span>
                    <span>Save {formatCurrency(prop.subleasePotential.estimatedAnnualRevenue, currency, true)}/yr</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Sublease {prop.subleasePotential.subleaseAreaSqFt.toLocaleString()} sqft ({prop.subleasePotential.subleaseSeats} seats) to an external co-working tenant or subsidiary.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Lease Expiry: <strong>{prop.leaseExpiryDate}</strong></span>
                <button
                  onClick={() =>
                    onOpenAlternativeEngine({
                      itemName: prop.name,
                      itemType: 'Real Estate & Facilities',
                      currentCost: prop.rentAnnual,
                      currentVendor: 'Commercial Real Estate Lessor',
                    })
                  }
                  className="font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
                >
                  <span>Evaluate Coworking / Sublease</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
