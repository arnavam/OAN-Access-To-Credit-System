import Button from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function RecentApplicationsList() {
  const applications = [
    {
      bank: 'Bunna Bank',
      type: 'Seed Loan',
      date: 'Jun 12, 2026',
      amount: 'ETB 15,000',
      status: 'Approved',
      statusColor: 'bg-green-100 text-green-700',
    },
    {
      bank: 'Cooperative Bank of Oromia',
      type: 'Input Loan',
      date: 'Jun 12, 2026',
      amount: 'ETB 32,000',
      status: 'Under Review',
      statusColor: 'bg-yellow-100 text-yellow-700',
    },
    {
      bank: 'Bank of Abyssinia',
      type: 'Seed Loan',
      date: 'Jun 12, 2026',
      amount: 'ETB 15,000',
      status: 'Rejected',
      statusColor: 'bg-red-100 text-red-700',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F1F3F4] flex flex-col h-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all">
      <div className="px-6 py-4.5 border-b border-gray-200 flex items-center justify-between min-h-[72px]">
        <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
        <Button as={Link} href="/my-applications" variant="outline" size="md" className="gap-1 !border-[#16A34A]/30 hover:bg-[#16A34A]/5">
          My Applications
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {applications.map((app, idx) => (
          <div key={idx} className={`flex items-start justify-between ${idx !== applications.length - 1 ? 'border-b border-gray-50 pb-5' : ''}`}>
            <div>
              <div className="font-bold text-gray-900 mb-1">{app.bank}</div>
              <div className="text-sm font-medium text-gray-400">
                {app.type} · {app.date}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 mb-1">{app.amount}</div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-bold ${app.statusColor}`}>
                {app.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
