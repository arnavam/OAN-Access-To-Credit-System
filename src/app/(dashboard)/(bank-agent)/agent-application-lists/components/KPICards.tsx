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
 * The tiles are labelled by archetype state, which is what the API can actually
 * answer for. An earlier pass here removed Active / Verified / Processed because
 * they were not statuses and counted nothing — but their replacements (Processing
 * / Granted / Rejected) were names from the model the archetype refactor then
 * replaced, so they counted nothing either, and `?? 0` made that look like data.
 *
 * "Granted" and "Rejected" are absent rather than guessed: the `Rejected`
 * archetype was never implemented, so a declined loan and a disbursed one both
 * sit on `Completed` and only the bank's own stage label separates them.
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
        label="In Progress"
        value={metrics.inTransition}
        icon={FileText}
        iconBgColor="bg-cyan-100"
        iconColor="text-cyan-500"
      />
      <StatCard
        label="Completed"
        value={metrics.completed}
        icon={Award}
        iconBgColor="bg-green-100"
        iconColor="text-green-500"
      />
      <StatCard
        label="Cancelled"
        value={metrics.cancelled}
        icon={XCircle}
        iconBgColor="bg-red-100"
        iconColor="text-red-500"
      />
    </div>
  );
}
