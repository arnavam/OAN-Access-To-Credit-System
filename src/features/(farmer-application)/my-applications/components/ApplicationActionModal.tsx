"use client";
import { Portal } from '@/components/Portal';
import { useModalA11y } from '@/hooks/useModalA11y';
import { Award, CheckCircle2, X, XCircle } from 'lucide-react';
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
  // Same dialog behaviour as every other modal in the app: focus trap, Escape to
  // close, scroll lock, focus restored on close. Called before the early return
  // below so the hook order is the same on every render.
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const themes = {
    Draft: {
      wrapper: 'bg-[#FFF8E1] border-[#FFECB3]',
      iconBg: 'bg-[#FFECB3] text-[#FF8F00]',
      icon: CheckCircle2,
      subtitle: 'text-[#FF8F00]',
      statValue: 'text-[#FF8F00]',
    },
    Processing: {
      wrapper: 'bg-[#F0FAFA] border-[#B2EBF2]',
      iconBg: 'bg-[#E0F7FA] text-[#00ACC1]',
      icon: CheckCircle2,
      subtitle: 'text-[#00ACC1]',
      statValue: 'text-[#00ACC1]',
    },
    Approved: {
      wrapper: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100 text-green-600',
      icon: Award,
      subtitle: 'text-green-600',
      statValue: 'text-green-700',
    },
    Rejected: {
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
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-action-modal-title"
          tabIndex={-1}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
        >

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
            <h2 id="application-action-modal-title" className="text-xl font-bold text-gray-900">{modalTitle}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
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

            {/* No timeline here. The one that used to sit in this space was
                hardcoded — the same two events on the same two dates for every
                application, whatever its real status — so it told the farmer
                something the system had never recorded. A2C Loan Application
                Audit Event holds the real history; when an endpoint exposes it to
                the farmer, it belongs here. */}

          </div>
        </div>
      </div>
    </Portal>
  );
}
