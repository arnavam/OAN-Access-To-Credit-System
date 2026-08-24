'use client';

import {
  BankApplicationRow,
  clearBankFilters,
  selectBankApplicationRows,
  selectBankApplicationsLoading,
  selectBankFilters,
  selectBankLoanTypeOptions,
  selectBankPage,
  selectBankPageSize,
  selectBankSearchQuery,
  selectBankSortBy,
  selectBankSortOrder,
  selectBankStageOptions,
  selectBankStages,
  selectBankTotalCount,
  selectBankTotalPages,
  setBankFilters,
  setBankPage,
  setBankPageSize,
  setBankSearchQuery,
  setBankSort,
} from '@/features/loans/store/bankApplicationsSlice';
import { getStageStyle } from '@/features/loans/utils/stageStyles';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Eye, Inbox, Loader2, Phone, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AdvancedFiltersDrawer, { AdvancedFiltersState } from './filters/AdvancedFilters';
import LoanAmountFilter from './filters/LoanAmountFilter';
import LoanTypeFilter from './filters/LoanTypeFilter';

/**
 * The status pill.
 *
 * Colour comes from the bank's own stage definition (`getStageStyle`), not from the
 * archetype: two banks can call the same step different things and colour it their
 * own way. `label` is the row's `stage_label`, falling back to the archetype for an
 * application no stage has been applied to yet.
 */
function StatusBadge({ status, label }: { status: string; label: string }) {
  const stages = useAppSelector(selectBankStages);
  const style = getStageStyle(label || status, stages);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold select-none ${style.badge}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
      {label || style.label}
    </span>
  );
}

interface PaginationDropdownProps {
  value: number;
  options: number[];
  onChange: (newValue: number) => void;
}

function PaginationDropdown({ value, options, onChange }: PaginationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-[75px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-[14px] font-bold text-gray-700 shadow-sm transition-all duration-200 hover:border-emerald-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] cursor-pointer active:scale-95"
      >
        {value}
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`absolute bottom-full left-0 mb-1 w-full z-50 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg transition-all duration-200 origin-bottom transform ${isOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible translate-y-2'
          }`}
      >
        <div className="p-1 flex flex-col gap-0.5">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-center rounded-md px-2 py-2 text-[13px] font-semibold transition-colors ${value === option
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AgentApplicationTableProps {
  /** Opens the read-only application summary. Owned by the parent, which holds the modal. */
  onView: (row: BankApplicationRow) => void;
}

export default function AgentApplicationTable({ onView }: AgentApplicationTableProps) {
  const dispatch = useAppDispatch();

  // Rows come from `get_all_loans`, which the backend scopes to the caller's own
  // bank (and, via loan_application_scope_query, withholds Active applications —
  // the Development Agent's and the farmer's private drafting stage). Filtering,
  // sorting and paging are therefore all server-side: doing any of it here would
  // only ever narrow one page of an already-scoped result and report misleading
  // totals.
  const rows = useAppSelector(selectBankApplicationRows);
  const isLoading = useAppSelector(selectBankApplicationsLoading);
  const totalEntries = useAppSelector(selectBankTotalCount);
  const totalPages = useAppSelector(selectBankTotalPages);
  const currentPage = useAppSelector(selectBankPage);
  const entriesPerPage = useAppSelector(selectBankPageSize);
  const appliedSearchQuery = useAppSelector(selectBankSearchQuery);
  const filters = useAppSelector(selectBankFilters);
  const loanTypeOptions = useAppSelector(selectBankLoanTypeOptions);
  const stageOptions = useAppSelector(selectBankStageOptions);
  const sortBy = useAppSelector(selectBankSortBy);
  const sortOrder = useAppSelector(selectBankSortOrder);

  const [searchInput, setSearchInput] = useState(appliedSearchQuery);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // The drawer speaks its own filter shape (a from/to pair); the store keeps the
  // two dates flat because that is how the API takes them.
  const drawerFilters: AdvancedFiltersState = {
    status: filters.status,
    loanAmount: filters.loanAmount,
    loanType: filters.loanType,
    region: filters.region,
    dateRange: { from: filters.dateFrom, to: filters.dateTo },
  };

  const handleApplyAdvancedFilters = (next: AdvancedFiltersState) => {
    dispatch(setBankFilters({
      status: next.status,
      loanAmount: next.loanAmount,
      loanType: next.loanType,
      region: next.region,
      dateFrom: next.dateRange.from,
      dateTo: next.dateRange.to,
    }));
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    dispatch(clearBankFilters());
  };

  const applySearch = () => {
    dispatch(setBankSearchQuery(searchInput.trim()));
  };

  const handleSortToggle = () => {
    if (sortBy === 'creation') {
      dispatch(setBankSort({ sortBy: 'creation', sortOrder: sortOrder === 'desc' ? 'asc' : 'desc' }));
    } else {
      dispatch(setBankSort({ sortBy: 'creation', sortOrder: 'desc' }));
    }
  };

  const displayOptions = [10, 20, 50, 100];

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(rows.map(row => row.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = rows.length > 0 && selectedIds.size === rows.length;

  const hasFilters =
    Boolean(appliedSearchQuery) ||
    filters.status.length > 0 ||
    filters.loanType.length > 0 ||
    filters.loanAmount.length > 0 ||
    Boolean(filters.region) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <div className="flex flex-col w-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-[#F1F3F4] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applySearch();
              }}
              placeholder="Search applications..."
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#F8FAFC] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] text-gray-800 placeholder-gray-400 transition-all"
            />
          </div>
          <button
            onClick={applySearch}
            className="bg-[#16A34A] hover:bg-[#15803d] text-white px-6 py-2.5 rounded-lg text-[14px]  transition-colors shadow-sm shrink-0"
          >
            <span className='font-semibold'>Search</span>
          </button>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setIsAdvancedFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <SlidersHorizontal size={18} className="text-gray-500" />
            <span className='font-semibold'>Advanced Filters</span>
          </button>
          <button
            onClick={handleClearAllFilters}
            className="text-[14px] font-semibold text-[#16A34A] hover:text-[#15803d] transition-colors"
          >
            <span className='font-semibold'>Clear Filters</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse bg-white text-left text-base text-gray-500 whitespace-nowrap">
          <thead className="bg-[#fafafa] text-[13px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-center w-[56px]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all applications on this page"
                  className="h-6 w-6 rounded-md border-2 border-gray-300 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-1 cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:shadow-sm hover:scale-110 active:scale-95"
                />
              </th>
              <th className="px-6 py-4 font-semibold">Application Details</th>
              <th className="px-6 py-4 font-semibold">Phone Number</th>
              <th className="px-6 py-4 font-semibold">
                <LoanTypeFilter
                  options={loanTypeOptions}
                  selectedValues={filters.loanType}
                  onChange={(types) => dispatch(setBankFilters({ ...filters, loanType: types }))}
                />
              </th>
              <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">
                <LoanAmountFilter
                  selectedValues={filters.loanAmount}
                  onChange={(amounts) => dispatch(setBankFilters({ ...filters, loanAmount: amounts }))}
                />
              </th>
              <th 
                className="px-6 py-4 font-semibold text-center cursor-pointer hover:bg-gray-100 transition-colors select-none group"
                onClick={handleSortToggle}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Applied On
                  <span className="flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
                    {sortBy === 'creation' ? (
                      sortOrder === 'asc' ? <ArrowUp size={14} className="text-[#16A34A]" /> : <ArrowDown size={14} className="text-[#16A34A]" />
                    ) : (
                      <ArrowUpDown size={14} />
                    )}
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          {rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={8} className="h-[700px]">
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-8 h-8 mb-6 text-[#00C48C] animate-spin" />
                          <h3 className="text-[#1F2937] text-[18px] font-bold mb-2 text-center">Loading applications…</h3>
                        </>
                      ) : (
                        <>
                          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                            <div
                              className="absolute inset-0 bg-[#00C48C]/20 rounded-full animate-ping opacity-75"
                              style={{ animationDuration: '3s' }}
                            />
                            <div className="relative w-16 h-16 bg-[#E6F9F3] rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                              <Inbox className="w-8 h-8 text-[#00C48C] animate-bounce" style={{ animationDuration: '2s' }} />
                            </div>
                          </div>
                          {hasFilters ? (
                            <>
                              <h3 className="text-[#1F2937] text-[18px] font-bold mb-2 text-center">No matching applications</h3>
                              <p className="text-[#6B7280] text-[14px] text-center leading-relaxed mb-4">
                                No application in your bank matches the current filters.
                              </p>
                              <button
                                type="button"
                                onClick={handleClearAllFilters}
                                className="text-[14px] font-semibold text-[#16A34A] hover:text-[#15803d] transition-colors"
                              >
                                Clear Filters
                              </button>
                            </>
                          ) : (
                            <>
                              <h3 className="text-[#1F2937] text-[18px] font-bold mb-2 text-center">No applications yet</h3>
                              <p className="text-[#6B7280] text-[14px] text-center leading-relaxed">
                                Farmer loan applications routed through the OAN Farmer<br />
                                Profiling System will appear here once your loan products are<br />
                                active and published.
                              </p>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const isSelected = selectedIds.has(row.id);

                return (
                  <tr key={row.id} className={`transition-colors hover:bg-gray-50/50 group ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                    <td className="px-6 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(row.id)}
                        aria-label={`Select application ${row.id}`}
                        className="h-6 w-6 rounded-md border-2 border-gray-300 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-1 cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:shadow-sm hover:scale-110 active:scale-95"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${row.initialsColor}`}>
                          {row.initials}
                        </div>
                        <div className="flex flex-col">
                          <strong className="block text-[16px] font-semibold text-[#16A34A]">{row.id}</strong>
                          <span className="mt-1 block text-sm font-medium text-gray-700">{row.applicant}</span>
                          <span className="mt-0.5 block text-[13px] text-gray-400">{row.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-700">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Phone size={14} className="text-gray-400" />
                        {row.phone}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-700 text-sm">
                      <div className="flex flex-col">
                        <span>{row.type}</span>
                        {row.productName && (
                          <span className="mt-0.5 text-[13px] font-normal text-gray-400">{row.productName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-700 text-sm">
                      {row.loanAmount}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col text-sm">
                        <span className='text-sm text-gray-500'>{row.appliedDate}</span>
                        <span className="text-sm text-gray-500">{row.appliedTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={row.status} label={row.statusLabel} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => onView(row)}
                          aria-label={`View application ${row.id}`}
                          className="inline-flex w-[80px] items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:border-gray-300 active:scale-95"
                        >
                          <Eye size={16} className="text-gray-500" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )
          }
        </table >
      </div >

      {/* Pagination Footer */}
      {
        rows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-5 text-[14px] text-gray-500 bg-white rounded-b-lg">
            <div className="flex items-center gap-3">
              <span className="font-medium">Showing</span>
              <PaginationDropdown
                value={entriesPerPage}
                options={displayOptions}
                onChange={(val) => dispatch(setBankPageSize(val))}
              />
              <span className="font-medium">of {totalEntries.toLocaleString()} entries</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => dispatch(setBankPage(Math.max(1, currentPage - 1)))}
                disabled={currentPage === 1}
                className="flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <span className='font-semibold'>&lt; Prev</span>
              </button>

              {getPageNumbers().map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="text-gray-400 px-1 font-bold">...</span>
                ) : (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => dispatch(setBankPage(pageNum as number))}
                    className={`h-10 w-10 flex items-center justify-center rounded-lg text-[14px] font-bold transition-all duration-200 shadow-sm active:scale-95 ${currentPage === pageNum
                      ? 'bg-[#16A34A] text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className='font-semibold'>{pageNum}</span>
                  </button>
                )
              ))}

              <button
                onClick={() => dispatch(setBankPage(Math.min(totalPages, currentPage + 1)))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-[14px] font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <span className='font-semibold'>Next &gt;</span>
              </button>
            </div>
          </div>
        )
      }

      <AdvancedFiltersDrawer
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        onApply={handleApplyAdvancedFilters}
        initialFilters={drawerFilters}
        availableLoanTypes={loanTypeOptions}
        statusOptions={stageOptions}
      />
    </div >
  );
}
