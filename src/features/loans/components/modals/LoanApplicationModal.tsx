'use client';

import { logger } from '@/lib/logger';
import { toast } from '@/lib/toast';
import { CheckCircle2, ChevronDown, Loader2, Package, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LoanApplicationFull, loanService } from '../../api/loan.service';
import { LoanTableRow } from '../LoanTable';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LoanTableRow | null;
  onStatusChange?: (id: string, status: 'Approved' | 'Rejected', reason?: string, note?: string) => void;
}

export default function LoanApplicationModal({ isOpen, onClose, data, onStatusChange }: LoanApplicationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullProfile, setFullProfile] = useState<LoanApplicationFull | null>(null);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');

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
        })
        .catch((err) => {
          logger.error("Failed to fetch full profile:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setFullProfile(null);
    }

    if (isOpen) {
      setIsRejecting(false);
      setRejectReason('');
      setRejectNote('');
    }
  }, [isOpen, data?.application_id, data?.id]);

  if (!mounted || !isOpen || !data) return null;

  const statusBadgeColor =
    data.status === 'Approved'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : data.status === 'Rejected'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  const handleConfirmReject = () => {
    if (!rejectReason) {
      toast.error('Please select a reason for rejection');
      return;
    }
    if (onStatusChange) {
      onStatusChange(data.id, 'Rejected', rejectReason, rejectNote);
    }
    toast.success(`Application #${data.id} has been rejected`);
    setIsRejecting(false);
    onClose();
  };

  const handleApprove = () => {
    if (onStatusChange) {
      onStatusChange(data.id, 'Approved');
    }
    toast.success(`Application #${data.id} has been approved`);
    onClose();
  };

  // Extract dynamic values safely from data & fullProfile
  const farmerName = data.applicant || fullProfile?.farmer_name || '—';
  const phone = data.phone || fullProfile?.phone_number || '—';
  const region = data.region || fullProfile?.region || '—';
  const loanProduct = data.productName || fullProfile?.loan_product || '—';
  const amount = data.amount || data.loanAmount || (fullProfile?.requested_amount ? `ETB ${fullProfile.requested_amount.toLocaleString()}` : '—');
  const appliedDate = data.updated || data.creation || fullProfile?.submission_date || '—';
  const purpose = fullProfile?.purpose_of_loan || null;
  const farmSize = fullProfile?.farm_size ? `${fullProfile.farm_size} hectares` : null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative flex flex-col w-full max-w-[620px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Application Details</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span className="font-semibold text-gray-700">#{data.id}</span>
                <span>&bull;</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold border ${statusBadgeColor}`}>
                  &bull; {data.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-6 overflow-y-auto max-h-[70vh] space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-medium text-gray-500">Loading application details...</p>
            </div>
          ) : (
            <>
              {/* Section 1: LOAN DETAILS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">LOAN DETAILS</h3>
                <div className="bg-[#F9FAFB] rounded-2xl p-5 border border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">APPLICATION ID</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">#{data.id}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LOAN PRODUCT</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{loanProduct}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">REQUESTED AMOUNT</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{amount}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SUBMISSION DATE</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{appliedDate}</p>
                    </div>
                  </div>
                  {purpose && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PURPOSE OF LOAN</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{purpose}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: FARMER DETAILS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">FARMER DETAILS</h3>
                <div className="bg-[#F9FAFB] rounded-2xl p-5 border border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FULL NAME</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{farmerName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PHONE NUMBER</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{phone}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">REGION</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{region}</p>
                    </div>
                    {farmSize && (
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">FARM SIZE</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{farmSize}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: INTERNAL NOTES (Conditional) */}
              {fullProfile?.internal_notes && fullProfile.internal_notes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">INTERNAL NOTES</h3>
                  <div className="space-y-2">
                    {fullProfile.internal_notes.map((note: any, idx: number) => (
                      <div key={idx} className="bg-[#F9FAFB] rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {note.author?.[0]?.toUpperCase() || 'N'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-900">{note.author || 'Officer'}</p>
                            <span className="text-xs text-gray-400">{note.timestamp || ''}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{note.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Confirmation Form */}
              {isRejecting && (
                <div className="border-2 border-red-200 bg-red-50/30 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="text-sm font-bold text-gray-900">Confirm Rejection</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Reason for Decision <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none"
                      >
                        <option value="">Select Reason for Decison</option>
                        <option value="Insufficient Income">Insufficient Income</option>
                        <option value="Incomplete Documentation">Incomplete Documentation</option>
                        <option value="Eligibility Criteria Not Met">Eligibility Criteria Not Met</option>
                        <option value="High Risk Profile">High Risk Profile</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Add Note (Optional)
                    </label>
                    <textarea 
                      rows={3}
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Placeholder for notes"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReject}
                      className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
                    >
                      Confirm Decision
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Close
          </button>

          {!isRejecting && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="px-6 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
