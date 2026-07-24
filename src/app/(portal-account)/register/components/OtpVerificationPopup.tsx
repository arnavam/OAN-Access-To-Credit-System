'use client';
import { Portal } from '@/components/Portal';

import { X, Info, Smartphone } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface OtpVerificationPopupProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
}

export function OtpVerificationPopup({ email, isOpen, onClose, onSubmit }: OtpVerificationPopupProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(otp.join(''));
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-[16px] font-bold text-[#1F2937]">OTP Verification</h2>
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              <X className="hover:text-red-500 hover:rotate-90 hover:scale-110 transition-transform duration-200" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {/* Consent Banner */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 mb-6 flex items-start space-x-3">
              <Info size={20} className="text-[#3B82F6] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#1E3A8A] mb-1">Consent Authorization</h3>
                <p className="text-[14px] text-[#1E40AF] leading-relaxed">
                  By providing this OTP, you hereby confirm your agreement to share your personal data
                  with the OpenAgriNet portal for purposes of sharing the Registry and enabling
                  associated services on the platform.
                </p>
              </div>
            </div>

            {/* OTP Card */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E5E7EB] mb-4">
                <Smartphone size={24} className="text-[#16A34A]" />
              </div>

              <h3 className="text-[18px] font-bold text-[#1F2937] mb-2">Fayda OTP Verification</h3>
              <p className="text-[14px] text-[#6B7280] mb-6">
                OTP sent to <span className="font-semibold text-[#374151]">{email || 'your email'}</span>.<br />
                Ask the farmer to provide the 6-digit code.
              </p>

              <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
                <div className="flex justify-between gap-2 mb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-[20px] font-bold text-[#1F2937] bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={otp.some(d => d === '')}
                  className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-3 rounded-lg font-bold text-[15px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-sm"
                >
                  Submit
                </button>

                <p className="text-[14px] text-[#6B7280]">
                  Didn't receive code? <button type="button" className="text-[#9CA3AF] hover:text-[#6B7280] font-medium transition-colors">Resend in 01:42</button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
