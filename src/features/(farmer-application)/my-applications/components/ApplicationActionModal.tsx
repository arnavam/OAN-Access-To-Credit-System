"use client";
import { Portal } from '@/components/Portal';
import { useModalA11y } from '@/hooks/useModalA11y';
import { Award, CheckCircle2, Loader2, Send, X, XCircle, Building2, Calendar, FileText, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { getApplication, submitApplication } from '../../api/farmerApi';
import type { FarmerLoanApplication } from '../../types';
import { ApplicationStatus } from './ApplicationCard';

interface ApplicationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string | undefined;
  status: ApplicationStatus;
  title: string;
  subtitle: string;
  maxAmount: string;
  interest: string;
  tenure: string;
  repayment: string;
  modalTitle: string;
  onApplicationUpdated?: (() => void) | undefined;
}

export default function ApplicationActionModal({
  isOpen,
  onClose,
  applicationId,
  status: initialStatus,
  title,
  subtitle,
  maxAmount,
  interest,
  tenure,
  repayment,
  modalTitle,
  onApplicationUpdated,
}: ApplicationActionModalProps) {
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);
  const [details, setDetails] = useState<FarmerLoanApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<ApplicationStatus | null>(null);

  const currentStatus = submittedStatus || initialStatus;

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    let isMounted = true;
    const fetchApp = async () => {
      setIsLoading(true);
      try {
        const res = await getApplication(applicationId);
        const data = res.data ?? res;
        if (isMounted && data) {
          setDetails(data as unknown as FarmerLoanApplication);
        }
      } catch (err) {
        logger.warn('Failed to load application details', { applicationId, error: err });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApp();
    return () => {
      isMounted = false;
    };
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  const themes = {
    Draft: {
      wrapper: 'bg-[#FFF8E1] border-[#FFECB3]',
      iconBg: 'bg-[#FFECB3] text-[#FF8F00]',
      icon: CheckCircle2,
      subtitle: 'text-[#FF8F00]',
      statValue: 'text-[#FF8F00]',
    },
    'Under Review': {
      wrapper: 'bg-[#F0FAFA] border-[#B2EBF2]',
      iconBg: 'bg-[#E0F7FA] text-[#00ACC1]',
      icon: CheckCircle2,
      subtitle: 'text-[#00ACC1]',
      statValue: 'text-[#00ACC1]',
    },
    Disbursed: {
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
  
  const fallbackTheme = {
    wrapper: 'bg-gray-50 border-gray-200',
    iconBg: 'bg-gray-100 text-gray-500',
    icon: CheckCircle2,
    subtitle: 'text-gray-500',
    statValue: 'text-gray-600',
  };

  const theme = themes[currentStatus as keyof typeof themes] || fallbackTheme;
  const Icon = theme.icon;

  const handleSubmitDraft = async () => {
    if (!applicationId) return;
    setIsSubmitting(true);
    try {
      await submitApplication(applicationId);
      toast.success('Application submitted successfully!');
      setSubmittedStatus('Under Review');
      onApplicationUpdated?.();
      onClose();
    } catch (err) {
      logger.error('Failed to submit draft application', err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 id="application-action-modal-title" className="text-xl font-bold text-gray-900">{modalTitle}</h2>
              {applicationId && (
                <p className="text-xs font-semibold text-gray-500 mt-0.5">Application #{applicationId}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
            >
              <X className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-all duration-300" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Replicated Card Header */}
            <div className={`rounded-xl p-5 border ${theme.wrapper}`}>
              <div className="flex items-start gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${theme.wrapper} ${theme.statValue}`}>
                      {currentStatus}
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${theme.subtitle} mt-0.5`}>{subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white rounded-lg p-2.5 text-center shadow-sm border border-gray-100">
                  <h4 className={`text-sm font-bold mb-1 ${theme.statValue}`}>{maxAmount}</h4>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Requested</p>
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
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">Repayment</p>
                </div>
              </div>
            </div>

            {/* Application Extended Details */}
            {isLoading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                Loading application details...
              </div>
            ) : details ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 text-xs">
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">Application Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-400 block">Bank</span>
                      <span className="font-semibold text-gray-800">{details.bank || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-400 block">Requested Amount</span>
                      <span className="font-semibold text-gray-800">
                        {details.requested_amount ? `ETB ${details.requested_amount.toLocaleString()}` : maxAmount}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <span className="text-gray-400 block">Created On</span>
                      <span className="font-semibold text-gray-800">{details.creation || subtitle}</span>
                    </div>
                  </div>
                </div>

                {details.loan_reason && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-gray-400 block flex items-center gap-1 mb-0.5">
                      <FileText className="w-3.5 h-3.5" /> Purpose / Reason
                    </span>
                    <p className="text-gray-700 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-gray-100">
                      {details.loan_reason}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Action Buttons */}
            {currentStatus === 'Draft' && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDraft}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#16A34A] hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
