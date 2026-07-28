'use client';
import { selectBankName } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { Landmark, Plus } from 'lucide-react';
import { useState } from 'react';
import { AddLoanProductModal } from './AddLoanProductModal';

interface DashboardHeaderProps {
  portalLabel?: string;
}

export function DashboardHeader({ portalLabel = 'Bank Admin Portal - Loan Product Management' }: DashboardHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bankName = useAppSelector(selectBankName);

  return (
    <>
      <div className="bg-white border border-[#F1F3F4] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100 flex-shrink-0">
            <Landmark size={24} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#1F2937]">{bankName ?? 'Seller Portal'}</h2>
            <p className="text-[14px] text-[#6B7280]">{portalLabel}</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#16A34A] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-lg font-bold text-[14px] transition-colors flex items-center space-x-2 whitespace-nowrap shadow-sm"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Loan Product</span>
        </button>
      </div>
      <AddLoanProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
