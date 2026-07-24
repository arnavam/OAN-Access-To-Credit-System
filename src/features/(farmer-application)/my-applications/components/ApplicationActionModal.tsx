"use client";
import React from 'react';
import { X, CheckCircle2, Award, XCircle } from 'lucide-react';
import { Portal } from '@/components/Portal';
import { ApplicationStatus } from './ApplicationCard';

interface ApplicationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ApplicationStatus;
  title: string;
  subtitle: string;
  maxAmount: string;
  interest: string;
  tenure: string;
  repayment: string;
  modalTitle: string;
}

export default function ApplicationActionModal({
  isOpen,
  onClose,
  status,
  title,
  subtitle,
  maxAmount,
  interest,
  tenure,
  repayment,
  modalTitle,
}: ApplicationActionModalProps) {
  if (!isOpen) return null;

  const themes = {
    review: {
      wrapper: 'bg-[#F0FAFA] border-[#B2EBF2]',
      iconBg: 'bg-[#E0F7FA] text-[#00ACC1]',
      icon: CheckCircle2,
      subtitle: 'text-[#00ACC1]',
      statValue: 'text-[#00ACC1]',
    },
    disbursed: {
      wrapper: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100 text-green-600',
      icon: Award,
      subtitle: 'text-green-600',
      statValue: 'text-green-700',
    },
    rejected: {
      wrapper: 'bg-red-50/50 border-red-200',
      iconBg: 'bg-red-100 text-red-600',
      icon: XCircle,
      subtitle: 'text-red-500',
      statValue: 'text-red-600',
    },
  };

  const theme = themes[status];
  const Icon = theme.icon;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
            <h2 className="text-xl font-bold text-gray-900">{modalTitle}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-red-50 transition-colors group"
            >
              <X className="w-5 h-5 text-gray-500 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {/* Replicated Card Header */}
            <div className={`rounded-xl p-5 mb-8 border ${theme.wrapper}`}>
              <div className="flex items-start gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                  <p className={`text-xs font-medium ${theme.subtitle}`}>{subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
                  <h4 className={`text-sm font-bold mb-1 ${theme.statValue}`}>{maxAmount}</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Max Amount</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
                  <h4 className={`text-sm font-bold mb-1 ${theme.statValue}`}>{interest}</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Interest p.a</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
                  <h4 className={`text-sm font-bold mb-1 ${theme.statValue}`}>{tenure}</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Tenure</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
                  <h4 className={`text-sm font-bold mb-1 ${theme.statValue}`}>{repayment}</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Repayment Schedule</p>
                </div>
              </div>
            </div>

            {/* Application Timeline */}
            <div className="border border-gray-100 rounded-xl shadow-sm bg-white overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Application Timeline</h3>
              </div>
              <div className="p-6">
                <div className="relative pl-8 border-l-2 border-green-200 ml-4 space-y-8">

                  {/* Timeline Item 1 */}
                  <div className="relative">
                    <div className="absolute -left-[43px] bg-white p-1 rounded-full">
                      <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900">Application Submitted</h4>
                      <span className="text-sm text-gray-500">Jun 10, 2026</span>
                    </div>
                    <p className="text-sm text-gray-600">Application received and reference ID assigned.</p>
                  </div>

                  {/* Timeline Item 2 */}
                  <div className="relative">
                    <div className="absolute -left-[43px] bg-white p-1 rounded-full">
                      <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900">Verification</h4>
                      <span className="text-sm text-gray-500">Jun 12, 2026</span>
                    </div>
                    <p className="text-sm text-gray-600">Registry data verified successfully. Land, crop, and identity data confirmed.</p>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Portal>
  );
}
