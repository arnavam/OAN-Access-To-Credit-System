'use client';
import { Portal } from '@/components/Portal';
import React, { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { ApprovalItem } from './ProductApprovalCard';

interface ApproveProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ApprovalItem | null;
}

export function ApproveProductModal({ isOpen, onClose, product }: ApproveProductModalProps) {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
    // Simulate API call
    setTimeout(() => {
      setIsApproving(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[570px] flex flex-col p-8 text-center animate-in zoom-in-95 duration-200">

          {/* Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#D1FAE5] rounded-full opacity-50 animate-ping"></div>
            <div className="relative w-full h-full bg-[#ECFDF5] rounded-full flex items-center justify-center shadow-sm border-[6px] border-[#D1FAE5] transform transition-transform hover:scale-110 duration-300">
              <CheckCircle2 className="w-10 h-10 text-[#10B981] animate-pulse" />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-[22px] font-bold text-[#111827] mb-3">
            Approve Loan Product?
          </h2>
          <p className="text-[15px] text-[#6B7280] leading-relaxed mb-8 px-2">
            Are you sure you want to approve <span className="font-bold text-[#374151]">"{product?.title}"</span>?<br />
            This product will be published immediately for farmers to apply.
          </p>

          {/* Buttons */}
          <div className="flex items-center space-x-3 w-full">
            <button
              onClick={onClose}
              disabled={isApproving}
              className="flex-1 py-3.5 border border-[#E5E7EB] rounded-xl text-[15px] font-bold text-[#374151] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 py-3.5 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-xl text-[15px] font-bold transition-colors flex items-center justify-center space-x-2 disabled:opacity-80 disabled:cursor-not-allowed shadow-sm shadow-emerald-200"
            >
              {isApproving && <Loader2 size={18} className="animate-spin" />}
              <span>{isApproving ? 'Approving...' : 'Yes, Approve'}</span>
            </button>
          </div>

        </div>
      </div>
    </Portal>
  );
}
