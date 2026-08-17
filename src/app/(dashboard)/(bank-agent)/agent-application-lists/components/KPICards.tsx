import { CheckCircle2, ClipboardList, FileText, LucideIcon, Users, XCircle } from 'lucide-react';

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

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <StatCard
        label="Total Applications"
        value={151}
        icon={Users}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-500"
      />
      <StatCard
        label="Active"
        value={30}
        icon={ClipboardList}
        iconBgColor="bg-green-100"
        iconColor="text-green-500"
      />
      <StatCard
        label="Verified"
        value={21}
        icon={CheckCircle2}
        iconBgColor="bg-teal-100"
        iconColor="text-teal-500"
      />
      <StatCard
        label="Processed"
        value={30}
        icon={FileText}
        iconBgColor="bg-cyan-100"
        iconColor="text-cyan-500"
      />
      <StatCard
        label="Rejected"
        value={5}
        icon={XCircle}
        iconBgColor="bg-red-100"
        iconColor="text-red-500"
      />
    </div>
  );
}
