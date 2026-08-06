"use client";
import type { Loan } from '@/features/(farmer-application)/discover-loans/data/mockLoans';
import { Landmark } from 'lucide-react';

interface ApplicationHeaderProps {
  loan: Loan;
}

export default function ApplicationHeader({ loan }: ApplicationHeaderProps) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 relative">
          {loan.bankLogo ? (
            <img
              src={loan.bankLogo}
              alt={`${loan.bankName} logo`}
              className="w-full h-full object-cover z-10 bg-white"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <div className="absolute inset-0 bg-blue-50 text-blue-400 flex items-center justify-center z-0">
            <Landmark className="w-6 h-6" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{loan.title}</h2>
          <div className="text-sm text-gray-500 font-medium mt-0.5 mb-3">{loan.bankName}</div>
          <div className="flex flex-wrap gap-2">
            {loan.tags.map((tag, idx) => (
              <span key={idx} className="bg-[#F0FDF4] text-[#16A34A] text-xs font-medium px-4 py-1.5 rounded-full border border-[#16A34A]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl flex items-center justify-between p-6 w-full">
        <div className="flex flex-col items-center flex-1">
          <div className="text-xl font-bold text-[#16A34A]">ETB {loan.amount.toLocaleString('en-US')}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Max Amount</div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-xl font-bold text-[#16A34A]">{loan.interestRate}%</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Interest p.a</div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-xl font-bold text-[#16A34A]">{loan.tenureMonths} mo</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Tenure</div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-xl font-bold text-[#16A34A]">1.0 ha</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Mini Qualifying</div>
        </div>
      </div>
    </div>
  );
}
