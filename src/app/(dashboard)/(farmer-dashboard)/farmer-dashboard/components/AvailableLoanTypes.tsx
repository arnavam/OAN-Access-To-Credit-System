import Button from '@/components/ui/Button';
import { ChevronRight, CreditCard, Sprout, Tractor, Wheat } from 'lucide-react';
import Link from 'next/link';

export default function AvailableLoanTypes() {
  const loans = [
    {
      title: 'Seed Loan',
      range: '₹5,000 - ₹25,000',
      icon: <Sprout className="w-7 h-7 text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-700',
      iconBg: 'bg-white',
    },
    {
      title: 'Input Loan',
      range: '₹10,000 - ₹60,000',
      icon: <Wheat className="w-7 h-7 text-orange-600" />,
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      text: 'text-orange-700',
      iconBg: 'bg-white',
    },
    {
      title: 'Equipment Loan',
      range: '₹50,000 - ₹5,00,000',
      icon: <Tractor className="w-7 h-7 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      iconBg: 'bg-white',
    },
    {
      title: 'Livestock Loan',
      range: '₹20,000 - ₹1,50,000',
      icon: <CreditCard className="w-7 h-7 text-purple-600" />,
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-700',
      iconBg: 'bg-white',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F1F3F4] overflow-hidden shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all">
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200 min-h-[72px]">
        <h3 className="text-lg font-bold text-gray-900">Available Loan Types</h3>
        <Button as={Link} href="/discover-loans" variant="primary" size="md" className="gap-1">
          Discover loans
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loans.map((loan, idx) => (
          <div key={idx} className={`rounded-xl p-4 flex items-center justify-between ${loan.bg} border ${loan.border} cursor-pointer hover:-translate-y-0.5 transition-transform shadow-sm`}>
            <div>
              <div className={`font-bold text-[16px] ${loan.text} mb-1`}>{loan.title}</div>
              <div className={`text-[12px] font-bold ${loan.text} opacity-80`}>{loan.range}</div>
            </div>
            <div className={`w-16 h-16 rounded-xl ${loan.iconBg} flex items-center justify-center shadow-sm shrink-0`}>
              {loan.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
