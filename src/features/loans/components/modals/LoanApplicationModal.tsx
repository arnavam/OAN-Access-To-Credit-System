import { FORM_SECTIONS, mapApiToFarmerDetails } from '@/features/loans/constants/form-sections';
import { logger } from '@/lib/logger';
import { maskSensitiveId } from '@/lib/utils';
import { Building2, CheckCircle2, Coins, Eye, EyeOff, FileText, Loader2, Lock, Sprout, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LoanApplicationFull, loanService } from '../../api/loan.service';
import { LoanTableRow } from '../LoanTable';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LoanTableRow | null;
}

const Field = ({ label, value, sensitive = false, isList = false }: { label: string; value: string | null | undefined; sensitive?: boolean, isList?: boolean }) => {
  const [revealed, setRevealed] = useState(false);
  const hasValue = !!value && value.trim() !== '';

  if (isList) {
    const listItems = hasValue ? value!.split(',').map(s => s.trim()).filter(Boolean) : [];
    return (
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</span>
        {listItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {listItems.map((item, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-[13px] font-bold text-gray-800">
                {item}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[15px] font-bold text-gray-800">—</span>
        )}
      </div>
    );
  }

  const display = sensitive && hasValue && !revealed ? maskSensitiveId(value!) : value;

  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
      <span className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
        <span>{hasValue ? display : '—'}</span>
        {sensitive && hasValue && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </span>
    </div>
  );
};

const SECTION_ICONS: Record<string, any> = {
  'Loan Details': Lock,
  'Basic Information': User,
  'Socio Economic Information': Coins,
  'Land, Crop and Livestock Information': Sprout,
  'Agronomic Data': FileText,
};


export default function LoanApplicationModal({ isOpen, onClose, data }: LoanApplicationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullProfile, setFullProfile] = useState<LoanApplicationFull | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchId = data?.application_id || data?.id;
    if (isOpen && fetchId) {
      setIsLoading(true);
      loanService.getFullProfile(fetchId)
        .then((profileRes) => {
          setFullProfile(profileRes?.data || null);
          setIsLoading(false);
        })
        .catch((err) => {
          logger.error("Failed to fetch full profile:", err);
          setIsLoading(false);
        });
    } else {
      setFullProfile(null);
    }
  }, [isOpen, data?.application_id, data?.id]);

  if (!mounted || !isOpen || !data) return null;

  const farmerDetails = fullProfile ? mapApiToFarmerDetails(fullProfile) : null;

  const modalContent = (
    <>
      <style type="text/css" media="print">
        {`
          body > *:not(#loan-application-modal-print-area) {
            display: none !important;
          }
          #loan-application-modal-print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          /* Ensure backgrounds print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        `}
      </style>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm overflow-y-auto no-print"></div>
      <div
        id="loan-application-modal-print-area"
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto pointer-events-none"
      >
        <div
          className="relative flex flex-col w-full max-w-[850px] bg-white rounded-[10px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#387f50] px-8 py-5 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Application Summary</h2>
              <p className="text-emerald-100 text-[13px] font-medium tracking-wide">
                ID: {data.id} &bull; Submitted {data.updated}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Sub-header / Status */}
          <div className="bg-emerald-50/80 px-8 py-4 flex items-center gap-3 border-b border-emerald-100/50">
            <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-100 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-emerald-800">Submitted & {data.status}</h3>
              <p className="text-xs font-medium text-emerald-600">Transmitted to Cooperative Bank of Oromia via SFTP</p>
            </div>
          </div>

          {/* Body content */}
          <div className="px-8 py-8 overflow-y-auto max-h-[60vh] space-y-10 custom-scrollbar">

            {/* Dynamic Sections from FORM_SECTIONS */}
            {FORM_SECTIONS.map((section) => {
              const Icon = SECTION_ICONS[section.title] || Building2;
              return (
                <section key={section.title}>
                  <div className="flex items-center gap-2 mb-6">
                    <Icon size={20} className="text-[#3b5998]" fill="#3b5998" />
                    <h4 className="text-[17px] font-bold text-gray-900">{section.title}</h4>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#387f50]" />
                    </div>
                  ) : (
                    <div className={`grid gap-y-6 gap-x-8 ${section.gridCols || 'lg:grid-cols-3'}`}>
                      {section.fields.map((field) => (
                        <Field
                          key={field.key}
                          label={field.label}
                          value={farmerDetails ? farmerDetails[field.key] : ''}
                          sensitive={!!field.sensitive}
                          isList={!!field.isList}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

            {/* Section: Banking Information (Extra, since it's not in Step2FarmerDetails) */}
            {/* <section>
            <div className="flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-[#5f6e7a]" fill="#5f6e7a" />
              <h4 className="text-[17px] font-bold text-gray-900">Banking Information</h4>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#387f50]" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-y-6 gap-x-8">
                <Field label="BANK ACCOUNT NO." value={fullProfile?.bank_account_no || null} />
                <Field label="IFSC / FSC CODE" value={fullProfile?.ifsc_code || null} />
                <Field label="BANK NAME" value={fullProfile?.bank_name || null} />
                <Field label="ACCOUNT HOLDER" value={fullProfile?.account_holder || null} />
              </div>
            )}
          </section> */}

          </div>

          {/* Footer */}
          <div className="bg-white px-8 py-5 flex justify-between items-center border-t border-gray-100 no-print">
            <span className="text-xs font-medium text-gray-400">
              {mounted ? `Generated on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}
            </span>
            <div className="flex items-center gap-3">
              {/* <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95"
            >
              Print PDF
            </button> */}
              <button
                onClick={onClose}
                className="bg-[#387f50] hover:bg-[#2c633f] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors active:scale-95"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
