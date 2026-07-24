'use client';
import { Portal } from '@/components/Portal';
import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { LoanProduct } from './LoanProductCard';

interface DeleteLoanProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: LoanProduct | null;
}

export function DeleteLoanProductModal({ isOpen, onClose, product }: DeleteLoanProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    // Simulate API call
    setTimeout(() => {
      setIsDeleting(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[520px] flex flex-col p-8 text-center animate-in zoom-in-95 duration-200">

          {/* Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#FEE2E2] rounded-full opacity-50 animate-ping"></div>
            <div className="relative w-full h-full bg-[#FEF2F2] rounded-full flex items-center justify-center shadow-sm border-[6px] border-[#FEE2E2] transform transition-transform hover:scale-110 duration-300">
              <Trash2 className="w-10 h-10 text-[#EF4444] animate-pulse" />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-[22px] font-bold text-[#111827] mb-3">
            Delete Loan Product?
          </h2>
          <p className="text-[15px] text-[#6B7280] leading-relaxed mb-8 px-2">
            Are you sure you want to delete <span className="font-bold text-[#374151]">"{product?.title}"</span>?<br />
            This action cannot be undone.
          </p>

          {/* Buttons */}
          <div className="flex items-center space-x-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-3.5 border border-[#E5E7EB] rounded-xl text-[15px] font-bold text-[#374151] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-3.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl text-[15px] font-bold transition-colors flex items-center justify-center space-x-2 disabled:opacity-80 disabled:cursor-not-allowed shadow-sm shadow-red-200"
            >
              {isDeleting && <Loader2 size={18} className="animate-spin" />}
              <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
            </button>
          </div>

        </div>
      </div>
    </Portal>
  );
}
