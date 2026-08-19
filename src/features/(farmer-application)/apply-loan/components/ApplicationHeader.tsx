"use client";
import type { FarmerLoanProduct } from '../../types';
import { Landmark } from 'lucide-react';

interface ApplicationHeaderProps {
  loan: FarmerLoanProduct;
}

export default function ApplicationHeader({ loan }: ApplicationHeaderProps) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 relative">
          <div className="absolute inset-0 bg-blue-50 text-blue-400 flex items-center justify-center z-0">
            <Landmark className="w-6 h-6" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{loan.product_name}</h2>
          <div className="text-sm text-gray-500 font-medium mt-0.5 mb-3">{loan.bank}</div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#F0FDF4] text-[#16A34A] text-xs font-medium px-4 py-1.5 rounded-full border border-[#16A34A]">
              {loan.bank}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl flex items-center justify-between p-6 w-full flex-wrap gap-4">
        <div className="flex flex-col items-center flex-1 min-w-[120px]">
          <div className="text-xl font-bold text-[#16A34A]">ETB {loan.max_amount ? loan.max_amount.toLocaleString('en-US') : 'N/A'}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Max Amount</div>
        </div>
        <div className="flex flex-col items-center flex-1 min-w-[120px]">
          <div className="text-xl font-bold text-[#16A34A]">{loan.min_interest_rate || 0}%</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Interest p.a</div>
        </div>
        <div className="flex flex-col items-center flex-1 min-w-[120px]">
          <div className="text-xl font-bold text-[#16A34A]">{loan.tenure_months || 0} mo</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Tenure</div>
        </div>
        <div className="flex flex-col items-center flex-1 min-w-[120px]">
          <div className="text-xl font-bold text-[#16A34A]">{loan.min_amount ? `ETB ${loan.min_amount.toLocaleString()}` : 'None'}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Min Amount</div>
        </div>
      </div>
    </div>
  );
}
