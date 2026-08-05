'use client';
import { Portal } from '@/components/Portal';

import { CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface OrganizationRegisteredPopupProps {
  isOpen: boolean;
  message?: string | null;
  onClose: () => void;
}

export function OrganizationRegisteredPopup({ isOpen, message, onClose }: OrganizationRegisteredPopupProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[520px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#E5E7EB]">
          <h2 className="text-[18px] font-bold text-[#1F2937]">Registration Successful</h2>
          <button 
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            <X className="hover:text-red-500 hover:rotate-90 hover:scale-110 transition-transform duration-200" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-[#16A34A]" />
          </div>
          <h3 className="text-[24px] font-bold text-[#1F2937] mb-3">Organization Registered</h3>
          <p className="text-[16px] text-[#6B7280] mb-10 leading-relaxed max-w-[400px]">
            {message ?? 'Your organization has been successfully registered on the OAN Access to Credit network.'}
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-3.5 rounded-lg font-bold text-[16px] transition-all duration-300 shadow-sm"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
