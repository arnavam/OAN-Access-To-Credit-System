'use client';

import { selectBankMetrics, selectBankStages } from '@/features/loans/store/bankApplicationsSlice';
import { useAppSelector } from '@/store/hooks';
import { Award, CheckCircle2, Clock, FileCheck, FileText, LucideIcon, Users, XCircle } from 'lucide-react';

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

function getStageCardIcon(label: string, archetype?: string): { icon: LucideIcon; iconBgColor: string; iconColor: string } {
  const lower = label.toLowerCase();
  if (lower.includes('submit')) {
    return { icon: FileText, iconBgColor: 'bg-blue-100', iconColor: 'text-blue-500' };
  }
  if (lower.includes('verif') || lower.includes('doc') || lower.includes('kyc')) {
    return { icon: FileCheck, iconBgColor: 'bg-indigo-100', iconColor: 'text-indigo-500' };
  }
  if (lower.includes('underwrit') || lower.includes('review') || lower.includes('process')) {
    return { icon: Clock, iconBgColor: 'bg-cyan-100', iconColor: 'text-cyan-500' };
  }
  if (lower.includes('approv') || lower.includes('grant') || lower.includes('sanction')) {
    return { icon: CheckCircle2, iconBgColor: 'bg-emerald-100', iconColor: 'text-emerald-500' };
  }
  if (lower.includes('disburs') || lower.includes('complet')) {
    return { icon: Award, iconBgColor: 'bg-green-100', iconColor: 'text-green-500' };
  }
  if (lower.includes('reject') || lower.includes('declin') || lower.includes('cancel')) {
    return { icon: XCircle, iconBgColor: 'bg-red-100', iconColor: 'text-red-500' };
  }
  if (archetype === 'Completed') {
    return { icon: Award, iconBgColor: 'bg-green-100', iconColor: 'text-green-500' };
  }
  if (archetype === 'Rejected' || archetype === 'Cancelled') {
    return { icon: XCircle, iconBgColor: 'bg-red-100', iconColor: 'text-red-500' };
  }
  return { icon: FileText, iconBgColor: 'bg-cyan-100', iconColor: 'text-cyan-500' };
}

/**
 * Stage counts and metrics for the bank applications portal.
 * Showcases the bank-specific loan stages dynamically.
 */
export default function StatCards() {
  const metrics = useAppSelector(selectBankMetrics);
  const stages = useAppSelector(selectBankStages);

  if (stages && stages.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          label="Total Applications"
          value={metrics.total}
          icon={Users}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-500"
        />
        {stages.map((stage) => {
          const { icon, iconBgColor, iconColor } = getStageCardIcon(stage.label, stage.archetype_state);
          return (
            <StatCard
              key={stage.stage_id || stage.name || stage.label}
              label={stage.label}
              value={stage.application_count ?? 0}
              icon={icon}
              iconBgColor={iconBgColor}
              iconColor={iconColor}
            />
          );
        })}
      </div>
    );
  }

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

