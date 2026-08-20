'use client';

import { CountingNumber } from '@/components/motion/CountingNumber';
import { MotionEffect } from '@/components/motion/MotionEffect';
import { CheckCircle2, FileCheck, LucideIcon, Package, Users } from 'lucide-react';

interface MetricCard {
  label: string;
  /** Kept as the raw prop value, so a non-numeric figure still renders as given. */
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

interface MetricCardsProps {
  pendingLabel?: string;
  pendingValue?: string;
  totalApplicants?: number;
  activeProducts?: number;
  totalProducts?: number;
}

/**
 * Parses a figure for the counter. Returns null when the value isn't a plain
 * number — `pendingValue` is typed as a string and callers are free to pass
 * something like "—", which must be printed verbatim rather than counted to NaN.
 */
function asNumber(value: string): number | null {
  if (!/^-?\d+(\.\d+)?$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function MetricCards({
  pendingLabel = 'Pending Approvals',
  pendingValue,
  totalApplicants = 0,
  activeProducts = 0,
  totalProducts = 0,
}: MetricCardsProps) {
  const metrics: MetricCard[] = [
    { label: 'Active Products', value: activeProducts.toString(), icon: CheckCircle2, iconBg: 'bg-green-100', iconColor: 'text-green-500' },
    { label: 'Total Products', value: totalProducts.toString(), icon: Package, iconBg: 'bg-blue-100', iconColor: 'text-blue-500' },
    { label: 'Total Applicants', value: totalApplicants.toString(), icon: Users, iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
    { label: pendingLabel, value: pendingValue ?? '0', icon: FileCheck, iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* The animated element *is* the card — no wrapper. A wrapper would take
          over as the grid item, and the cards would stop stretching to a common
          height. Staggered so the row reads left to right as it arrives instead
          of four cards appearing at once; the stats are fetched after mount, so
          this covers a real wait rather than decorating ready content. */}
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const numeric = asNumber(metric.value);
        return (
          <MotionEffect
            key={metric.label}
            delay={index * 70}
            slide={{ direction: 'up', offset: 14 }}
            className="group bg-white border border-[#F1F3F4] rounded-xl p-5 flex items-center justify-between shadow-sm shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div>
              <p className="text-[14px] font-semibold text-[#6B7280] mb-1">{metric.label}</p>
              <h4 className="text-[32px] font-bold text-[#1F2937] leading-none">
                {numeric === null ? metric.value : <CountingNumber value={numeric} />}
              </h4>
            </div>
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md ${metric.iconBg}`}>
              <Icon size={32} className={`${metric.iconColor} transition-transform duration-300`} />
            </div>
          </MotionEffect>
        );
      })}
    </div>
  );
}
