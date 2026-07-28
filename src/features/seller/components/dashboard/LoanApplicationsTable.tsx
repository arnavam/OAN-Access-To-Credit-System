'use client';

import LoanTable, { LoanTableRow } from '@/features/loans/components/LoanTable';
import LoanApplicationModal from '@/features/loans/components/modals/LoanApplicationModal';
import {
    fetchLoans,
    selectIsLoansLoading,
    selectLoansError,
    selectPagedRows,
    selectTotalCount
} from '@/features/loans/store/loanDashboardSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AlertCircle, Inbox, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LoanApplicationsTable() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectPagedRows);
  const totalCount = useAppSelector(selectTotalCount);
  const isLoading = useAppSelector(selectIsLoansLoading);
  const error = useAppSelector(selectLoansError);

  const [selectedRow, setSelectedRow] = useState<LoanTableRow | null>(null);

  useEffect(() => {
    dispatch(fetchLoans());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchLoans());
  };

  return (
    <div className="bg-white border border-[#F1F3F4] rounded-xl shadow-sm flex flex-col min-h-[500px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      {/* Table Header */}
      <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-[16px] font-bold text-[#1F2937] mb-1">Loan Applications</h3>
          <p className="text-[14px] text-[#6B7280]">
            Farmers who applied against your published loan products — via OAN Farmer Profiling System
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700">
          <ShieldCheck size={16} />
          <span className="text-[12px] font-bold">FPS Verified</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {isLoading && rows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="w-8 h-8 text-[#00C48C] animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading loan applications...</p>
          </div>
        ) : error && rows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-base font-bold text-gray-900 mb-1">Failed to load applications</h4>
            <p className="text-sm text-gray-500 mb-4 max-w-md">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white text-sm font-semibold rounded-lg hover:bg-[#10883c] transition-colors"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-[#00C48C]/20 rounded-full animate-ping opacity-75"
                style={{ animationDuration: '3s' }}
              />
              <div className="relative w-16 h-16 bg-[#E6F9F3] rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                <Inbox className="w-8 h-8 text-[#00C48C] animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
            </div>
            <h3 className="text-[#1F2937] text-[18px] font-bold mb-2">No applications yet</h3>
            <p className="text-[#6B7280] text-[14px] max-w-[380px] text-center leading-relaxed">
              Farmer loan applications routed through the OAN Farmer Profiling System will appear here once your loan products are active and published.
            </p>
          </div>
        ) : (
          /* Table of applications */
          <div className="p-4 overflow-x-auto">
            <LoanTable onView={(row) => setSelectedRow(row)} totalCount={totalCount} />
          </div>
        )}
      </div>

      {/* Modal for full application details */}
      {selectedRow && (
        <LoanApplicationModal
          isOpen={!!selectedRow}
          onClose={() => setSelectedRow(null)}
          data={selectedRow}
        />
      )}
    </div>
  );
}
