'use client';

import { selectLeadStatusesOptions } from '@/features/new-lead/store/newLeadSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Check, Eye, Filter } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import {
    selectActivityPage, selectPagedRows, selectPageSize, selectTableStatusFilters,
    setActivityPage,
    setPageSize,
    setTableStatusFilters
} from '../store/loanDashboardSlice';
import LoanEmptyState from './LoanEmptyState';

export interface LoanTableRow {
  id: string;
  applicant: string;
  initials?: string;
  productName?: string;
  phone: string;
  loanAmount: string;
  amount?: string;
  type: string;
  status: string;
  statusTone: string;
  updated: string;
  action: string;
  timestamp: number;
  application_id?: string;
  creation?: string;
  region?: string;
  loanTerm?: string;
}

interface LoanTableProps {
  onView?: (row: LoanTableRow) => void;
  totalCount?: number;
}

const AVATAR_BG_PALETTE = [
  'bg-[#E6F9F3] text-[#00C48C]',
  'bg-blue-100 text-blue-600',
  'bg-amber-100 text-amber-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
];

function getStatusStyle(status: string) {
  const s = status.toLowerCase();
  if (s === 'draft' || s.includes('pending')) {
    return {
      label: 'Pending',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    };
  }
  if (s === 'processing' || s.includes('review') || s.includes('underwriting')) {
    return {
      label: 'In Review',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    };
  }
  if (s === 'approved' || s.includes('granted')) {
    return {
      label: 'Approved',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    };
  }
  if (s === 'rejected') {
    return {
      label: 'Rejected',
      badge: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
    };
  }
  return {
    label: status,
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  };
}

const LoanTable = memo(({ onView, totalCount = 0 }: LoanTableProps) => {
  const dispatch = useAppDispatch();
  const rows: LoanTableRow[] = useAppSelector(selectPagedRows);
  const statusOptions = useAppSelector(selectLeadStatusesOptions);
  const selectedStatuses = useAppSelector(selectTableStatusFilters);

  const currentPage = useAppSelector(selectActivityPage);
  const pageSize = useAppSelector(selectPageSize);

  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<string[]>([]);
  const statusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (statusFilterOpen) setLocalStatuses(selectedStatuses);
  }, [statusFilterOpen, selectedStatuses]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if ((target as Element).closest?.('.loan-filter-popup')) return;
      if (statusRef.current && !statusRef.current.contains(target)) setStatusFilterOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLocalStatus = (val: string) => {
    setLocalStatuses((prev) => (prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]));
  };

  const handleApplyStatus = () => {
    dispatch(setTableStatusFilters(localStatuses));
    setStatusFilterOpen(false);
  };

  const handleClearStatus = () => {
    setLocalStatuses([]);
    dispatch(setTableStatusFilters([]));
    setStatusFilterOpen(false);
  };

  const handleClearFilters = () => {
    dispatch(setTableStatusFilters([]));
    setLocalStatuses([]);
  };

  const effectiveTotal = totalCount || rows.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));

  return (
    <div className="flex flex-col min-h-[400px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse text-left text-sm text-gray-500 whitespace-nowrap">
          <thead className="bg-[#fafafa] text-[13px] font-bold uppercase tracking-wider text-gray-400">
            <tr>
              <th className="border-b border-gray-100 px-6 py-4 font-semibold">Farmer Details</th>
              <th className="border-b border-gray-100 px-6 py-4 font-semibold">Loan Product</th>
              <th className="border-b border-gray-100 px-6 py-4 font-semibold">Amount</th>
              <th className="border-b border-gray-100 px-6 py-4 font-semibold">Applied</th>
              <th className="border-b border-gray-100 px-6 py-4 font-semibold">
                <div className="relative inline-flex items-center gap-1.5">
                  STATUS
                  <button
                    ref={statusRef}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusFilterOpen(!statusFilterOpen);
                    }}
                    className={`rounded p-0.5 transition hover:bg-slate-200 outline-none ${
                      statusFilterOpen || selectedStatuses.length > 0 ? 'text-[#1E6865]' : 'text-[#AEB4BA]'
                    }`}
                  >
                    <Filter size={16} strokeWidth={2.5} />
                  </button>
                  {statusFilterOpen && (
                    <div
                      className="loan-filter-popup absolute top-full right-0 mt-2 z-[99] flex min-w-[240px] w-max flex-col rounded-xl border border-gray-200 bg-white shadow-xl normal-case tracking-normal text-gray-900"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                        <Filter size={16} className="text-emerald-600" /> FILTER BY STATUS
                      </div>
                      <div className="flex flex-col max-h-[300px] overflow-y-auto font-medium [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {statusOptions.map((opt, idx) => {
                          const isChecked = localStatuses.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleLocalStatus(opt)}
                              className={`flex items-center gap-4 px-5 py-3 text-[15px] font-medium transition-colors hover:bg-gray-50 text-[#4B5563] text-left ${
                                idx !== statusOptions.length - 1 ? 'border-b border-[#F3F3F3]' : ''
                              }`}
                            >
                              <span
                                className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border transition-all duration-200 ease-in-out ${
                                  isChecked ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-[#9CA3AF] bg-white'
                                }`}
                              >
                                <Check size={12} strokeWidth={3} className={isChecked ? 'opacity-100' : 'opacity-0'} />
                              </span>
                              <span className="flex-1 text-[15px] whitespace-normal">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 p-3 bg-gray-50/50 rounded-b-xl font-bold">
                        <button onClick={handleClearStatus} className="text-sm font-medium text-gray-500 hover:text-gray-600">
                          Clear
                        </button>
                        <button
                          onClick={handleApplyStatus}
                          className="rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#10883c]"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </th>
              <th className="border-b border-gray-100 px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.length === 0 ? (
              <LoanEmptyState hasFilters={selectedStatuses.length > 0} onClearFilters={handleClearFilters} />
            ) : (
              rows.map((row, i) => {
                const paletteClass = AVATAR_BG_PALETTE[i % AVATAR_BG_PALETTE.length];
                const initials = row.initials || row.applicant.substring(0, 2).toUpperCase() || 'AG';
                const statusStyle = getStatusStyle(row.status);
                const appIdDisplay = row.application_id || row.id;
                const displayName = row.applicant || 'Applicant';
                const displayProduct = row.productName || row.type || 'Loan Product';

                return (
                  <tr
                    key={`${row.id}-${i}`}
                    onClick={() => onView?.(row)}
                    className="transition-colors hover:bg-gray-50/60 cursor-pointer group"
                  >
                    {/* Farmer Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-[13px] ${paletteClass}`}>
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-bold text-gray-900 leading-tight">{displayName}</span>
                          <span className="text-[12px] font-medium text-gray-400 mt-0.5">{appIdDisplay}</span>
                        </div>
                      </div>
                    </td>

                    {/* Loan Product */}
                    <td className="px-6 py-4 font-medium text-gray-700 text-[14px]">
                      {displayProduct}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-bold text-gray-900 text-[14px]">
                      {row.loanAmount}
                    </td>

                    {/* Applied Date */}
                    <td className="px-6 py-4 font-medium text-gray-600 text-[13px]">
                      {row.updated}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold ${statusStyle.badge}`}>
                        <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onView?.(row)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-95"
                      >
                        <Eye size={14} className="text-gray-400" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
            aria-label="Items per page"
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>of {effectiveTotal} Application</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => dispatch(setActivityPage(currentPage - 1))}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            &lt; Prev
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => dispatch(setActivityPage(pageNum))}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                  isActive ? 'bg-[#16A34A] text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => dispatch(setActivityPage(currentPage + 1))}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div>
  );
});

LoanTable.displayName = 'LoanTable';
export default LoanTable;
