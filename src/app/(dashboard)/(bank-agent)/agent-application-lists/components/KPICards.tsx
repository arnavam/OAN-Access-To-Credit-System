'use client';

import { selectBankMetrics } from '@/features/loans/store/bankApplicationsSlice';
import { useAppSelector } from '@/store/hooks';
import { Award, FileText, LucideIcon, Users, XCircle } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

function StatCard({ label, value, icon: Icon, iconBgColor, iconColor }: StatCardProps) {
  return (
    <div className="group bg-white border border-[#F1F3F4] rounded-xl p-5 flex items-center justify-between shadow-sm shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div>
        <p className="text-[14px] font-semibold text-[#6B7280] mb-1">{label}</p>
        <h4 className="text-[32px] font-bold text-[#1F2937] leading-none">{value}</h4>
      </div>
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md ${iconBgColor}`}>
        <Icon size={32} className={`${iconColor} transition-transform duration-300`} />
      </div>
    </div>
  );
}

/**
 * Counts for the bank's own applications.
 *
 * Sourced from `get_loan_summary`, which aggregates through `frappe.get_list`
 * and so is scoped by the same bank/lifecycle rules as the table below — the
 * totals can never describe applications the list refuses to show.
 *
 * There are four cards, not the five that were here before: Active / Verified /
 * Processed are not A2C Loan Application statuses, so those tiles were counting
 * nothing. The lifecycle a bank sees is Processing → Granted (Approved) or
 * Rejected.
 */
export default function StatCards() {
  const metrics = useAppSelector(selectBankMetrics);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Applications"
        value={metrics.total}
        icon={Users}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-500"
      />
      <StatCard
        label="Processing"
        value={metrics.processing}
        icon={FileText}
        iconBgColor="bg-cyan-100"
        iconColor="text-cyan-500"
      />
      <StatCard
        label="Granted"
        value={metrics.approved}
        icon={Award}
        iconBgColor="bg-green-100"
        iconColor="text-green-500"
      />
      <StatCard
        label="Rejected"
        value={metrics.rejected}
        icon={XCircle}
        iconBgColor="bg-red-100"
        iconColor="text-red-500"
      />
    </div>
  );
}
