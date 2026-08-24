"use client";
import { Award, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import ApplicationActionModal from './ApplicationActionModal';

export type ApplicationStatus = 'Draft' | 'Under Review' | 'Disbursed' | 'Rejected';

export interface ApplicationCardProps {
  applicationId?: string | undefined;
  status: ApplicationStatus;
  title: string;
  subtitle: string;
  maxAmount: string;
  interest: string;
  tenure: string;
  repayment: string;
  onApplicationUpdated?: (() => void) | undefined;
}

export default function ApplicationCard({
  applicationId,
  status,
  title,
  subtitle,
  maxAmount,
  interest,
  tenure,
  repayment,
  onApplicationUpdated,
}: ApplicationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const themes = {
    Draft: {
      wrapper: 'bg-[#FFF8E1] border-[#FFECB3]',
      iconBg: 'bg-[#FFECB3] text-[#FF8F00]',
      icon: CheckCircle2,
      subtitle: 'text-[#FF8F00]',
      statValue: 'text-[#FF8F00]',
      button: 'bg-[#FFB300] hover:bg-[#FF8F00] text-white',
      buttonIcon: CheckCircle2,
      buttonText: 'Resume Draft',
    },
    'Under Review': {
      wrapper: 'bg-[#F0FAFA] border-[#B2EBF2]',
      iconBg: 'bg-[#E0F7FA] text-[#00ACC1]',
      icon: CheckCircle2,
      subtitle: 'text-[#00ACC1]',
      statValue: 'text-[#00ACC1]',
      button: 'bg-[#0097A7] hover:bg-[#00838F] text-white',
      buttonIcon: CheckCircle2,
      buttonText: 'Track Application',
    },
    Disbursed: {
      wrapper: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100 text-green-600',
      icon: Award,
      subtitle: 'text-green-600',
      statValue: 'text-green-700',
      button: 'bg-[#16A34A] hover:bg-green-700 text-white',
      buttonIcon: CheckCircle2,
      buttonText: 'Track Application',
    },
    Rejected: {
      wrapper: 'bg-red-50/50 border-red-200',
      iconBg: 'bg-red-100 text-red-600',
      icon: XCircle,
      subtitle: 'text-red-500',
      statValue: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white',
      buttonIcon: CheckCircle2,
      buttonText: 'Appeal Decision',
    },
  };
  
  const fallbackTheme = {
    wrapper: 'bg-gray-50 border-gray-200',
    iconBg: 'bg-gray-100 text-gray-500',
    icon: CheckCircle2,
    subtitle: 'text-gray-500',
    statValue: 'text-gray-600',
    button: 'bg-gray-600 hover:bg-gray-700 text-white',
    buttonIcon: CheckCircle2,
    buttonText: 'Track Application',
  };

  const theme = themes[status as keyof typeof themes] || fallbackTheme;
  const Icon = theme.icon;
  const ButtonIcon = theme.buttonIcon;

  return (
    <div className={`rounded-xl p-5 flex flex-col justify-between border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-full ${theme.wrapper}`}>
      <div>
        <div className="flex items-start gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
            <p className={`text-xs font-medium ${theme.subtitle}`}>{subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
            <h4 className={`text-md font-bold mb-0.5 ${theme.statValue}`}>{maxAmount}</h4>
            <p className="text-[12px] text-gray-500 font-medium leading-tight">Max Amount</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
            <h4 className={`text-md font-bold mb-0.5 ${theme.statValue}`}>{interest}</h4>
            <p className="text-[12px] text-gray-500 font-medium leading-tight">Interest p.a</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
            <h4 className={`text-md font-bold mb-0.5 ${theme.statValue}`}>{tenure}</h4>
            <p className="text-[12px] text-gray-500 font-medium leading-tight">Tenure</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
            <h4 className={`text-md font-bold mb-0.5 ${theme.statValue}`}>{repayment}</h4>
            <p className="text-[12px] text-gray-500 font-medium leading-tight">Repayment Schedule</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${theme.button}`}
      >
        <ButtonIcon className="w-4 h-4" />
        {theme.buttonText}
      </button>

      <ApplicationActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicationId={applicationId}
        status={status}
        title={title}
        subtitle={subtitle}
        maxAmount={maxAmount}
        interest={interest}
        tenure={tenure}
        repayment={repayment}
        modalTitle={theme.buttonText}
        onApplicationUpdated={onApplicationUpdated}
      />
    </div>
  );
}
