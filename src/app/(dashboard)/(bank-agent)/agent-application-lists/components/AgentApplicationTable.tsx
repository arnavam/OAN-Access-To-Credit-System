'use client';
import { ChevronDown, Phone, Search, SlidersHorizontal, Inbox, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import LoanTypeFilter from './filters/LoanTypeFilter';
import LoanAmountFilter from './filters/LoanAmountFilter';
import AdvancedFiltersDrawer, { AdvancedFiltersState } from './filters/AdvancedFilters';

interface StatusStyle {
  badge: string;
  dot: string;
}

// Held outside the lookup rather than as an 'Unknown' key in it. `Record<string, T>`
// under `noUncheckedIndexedAccess` types *every* read as `T | undefined`, including
// the fallback one — so `STATUS_STYLES['Unknown']` was no safer than the lookup it
// was covering for, and both reads below were possibly-undefined errors.
const UNKNOWN_STATUS_STYLE: StatusStyle = {
  badge: 'bg-gray-50 text-gray-700 border border-gray-200',
  dot: 'bg-gray-500',
};

const STATUS_STYLES: Record<string, StatusStyle> = {
  'Active': { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  'Verified': { badge: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
  'Processed': { badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200', dot: 'bg-indigo-500' },
  'Rejected': { badge: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? UNKNOWN_STATUS_STYLE;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold select-none ${style.badge}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
      {status}
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

const initialMockData = [
  { id: 'ET-FRM-2026-00872', name: 'Abebe Girma', initials: 'AG', initialsColor: 'bg-green-100 text-green-700', location: 'Adama', phone: '+251 (555) 123-4567', type: 'Tractor Loan', amount: 'ETB 15,000', applied: 'May 28, 2026, 10:42 AM', status: 'Active' },
  { id: 'ET-FRM-2026-00988', name: 'Dereje Bekele', initials: 'DB', initialsColor: 'bg-blue-100 text-blue-700', location: 'Mekelle', phone: '+251 (555) 222-3333', type: 'Crop Loan', amount: 'ETB 45,000', applied: 'May 28, 2026, 09:15 AM', status: 'Verified' },
  { id: 'ET-FRM-2026-00631', name: 'Mohammed Yusuf', initials: 'MY', initialsColor: 'bg-orange-100 text-orange-700', location: 'Bishoftu', phone: '+251 (555) 343-11111', type: 'Crop Loan', amount: 'ETB 75,000', applied: 'May 27, 2026, 16:30 PM', status: 'Verified' },
  { id: 'ET-FRM-2026-01299', name: 'Selamawit Tadesse', initials: 'ST', initialsColor: 'bg-purple-100 text-purple-700', location: 'Mekelle', phone: '+251 (555) 231-3221', type: 'Livestock Loan', amount: 'ETB 1,50,000', applied: 'May 27, 2026, 14:20 PM', status: 'Processed' },
  { id: 'ET-FRM-2026-01045', name: 'Tigist Haile', initials: 'TH', initialsColor: 'bg-red-100 text-red-700', location: 'Dire Dawa', phone: '+251 (555) 231-0198', type: 'Input Finance', amount: 'ETB 1,75,000', applied: 'May 27, 2026, 11:05 AM', status: 'Rejected' },
  { id: 'ET-FRM-2026-00989', name: 'Dereje Bekele', initials: 'DB', initialsColor: 'bg-blue-100 text-blue-700', location: 'Adama', phone: '+251 (555) 222-3333', type: 'Seed Loan', amount: 'ETB 20,000', applied: 'May 28, 2026, 09:15 AM', status: 'Verified' },
  { id: 'ET-FRM-2026-00873', name: 'Abebe Girma', initials: 'AG', initialsColor: 'bg-green-100 text-green-700', location: 'Adama', phone: '+251 (555) 123-4567', type: 'Input Finance', amount: 'ETB 90,000', applied: 'May 28, 2026, 10:42 AM', status: 'Active' },
  { id: 'ET-FRM-2026-00990', name: 'Dereje Bekele', initials: 'DB', initialsColor: 'bg-blue-100 text-blue-700', location: 'Mekelle', phone: '+251 (555) 222-3333', type: 'Livestock Loan', amount: 'ETB 2,50,000', applied: 'May 28, 2026, 09:15 AM', status: 'Verified' },
];

export default function AgentApplicationTable() {
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  // Extending mock data to allow testing of pagination
  const extendedData = [
    ...initialMockData,
    ...initialMockData.map(item => ({ ...item, id: `${item.id}-01` })),
    ...initialMockData.map(item => ({ ...item, id: `${item.id}-02` })),
    ...initialMockData.map(item => ({ ...item, id: `${item.id}-03` })),
  ];

  // Read-only now that per-row status is a badge rather than an editable dropdown,
  // so the setter is gone. Still `useState` rather than a plain const, to keep the
  // extended mock array stable across renders.
  const [data] = useState(extendedData);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter states
  // We use advancedFilters.loanType and advancedFilters.loanAmount directly

  // Advanced Filters state
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({
    status: [],
    loanAmount: [],
    loanType: [],
    location: '',
    dateRange: { from: '', to: '' }
  });



  const handleApplyAdvancedFilters = (filters: AdvancedFiltersState) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setAppliedSearchQuery('');
    setAdvancedFilters({
      status: [],
      loanAmount: [],
      loanType: [],
      location: '',
      // quickDate is omitted rather than set to undefined: exactOptionalPropertyTypes
      // treats "absent" and "explicitly undefined" as different things, and this must
      // match the initial state above, which omits it.
      dateRange: { from: '', to: '' }
    });
    setCurrentPage(1);
  };

  // Apply filters
  const filteredData = data.filter(row => {
    if (appliedSearchQuery) {
      const query = appliedSearchQuery.toLowerCase();
      const matchesSearch =
        row.id.toLowerCase().includes(query) ||
        row.phone.toLowerCase().includes(query) ||
        row.name.toLowerCase().includes(query) ||
        row.amount.toLowerCase().includes(query) ||
        row.type.toLowerCase().includes(query) ||
        row.location.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query) ||
        row.applied.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (advancedFilters.loanType.length > 0 && !advancedFilters.loanType.includes(row.type)) return false;

    if (advancedFilters.loanAmount.length > 0) {
      const amountValue = parseInt(row.amount.replace(/[^0-9]/g, ''));
      const matchesAmount = advancedFilters.loanAmount.some(range => {
        if (range === '0 - 25,000') return amountValue >= 0 && amountValue <= 25000;
        if (range === '25,001 - 50,000') return amountValue > 25000 && amountValue <= 50000;
        if (range === '50,001 - 1,00,000') return amountValue > 50000 && amountValue <= 100000;
        if (range === '1,00,000 and above') return amountValue > 100000;
        return false;
      });
      if (!matchesAmount) return false;
    }

    if (advancedFilters.status.length > 0 && !advancedFilters.status.includes(row.status)) return false;

    if (advancedFilters.location) {
      const locQuery = advancedFilters.location.toLowerCase();
      if (!row.location.toLowerCase().includes(locQuery)) return false;
    }

    if (advancedFilters.dateRange.from || advancedFilters.dateRange.to) {
      const rowDate = new Date(row.applied);
      if (advancedFilters.dateRange.from) {
        const fromDate = new Date(advancedFilters.dateRange.from);
        if (rowDate < fromDate) return false;
      }
      if (advancedFilters.dateRange.to) {
        const toDate = new Date(`${advancedFilters.dateRange.to}T23:59:59`);
        if (rowDate > toDate) return false;
      }
    }

    return true;
  });

  // Extract unique options for filters
  const loanTypeOptions = Array.from(new Set(data.map(row => row.type)));

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const totalEntries = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));

  // Standard dropdown options
  const displayOptions = [10, 20, 50, 100];

  const offset = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(offset, offset + entriesPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedData.map(row => row.id)));
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

  const isAllSelected = paginatedData.length > 0 && selectedIds.size === paginatedData.length;

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
                if (e.key === 'Enter') {
                  setAppliedSearchQuery(searchInput);
                  setCurrentPage(1);
                }
              }}
              placeholder="Search applications..."
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#F8FAFC] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] text-gray-800 placeholder-gray-400 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setAppliedSearchQuery(searchInput);
              setCurrentPage(1);
            }}
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
                  className="h-6 w-6 rounded-md border-2 border-gray-300 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-1 cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:shadow-sm hover:scale-110 active:scale-95"
                />
              </th>
              <th className="px-6 py-4 font-semibold">Application Details</th>
              <th className="px-6 py-4 font-semibold">Phone Number</th>
              <th className="px-6 py-4 font-semibold">
                <LoanTypeFilter
                  options={loanTypeOptions}
                  selectedValues={advancedFilters.loanType}
                  onChange={(types) => setAdvancedFilters(prev => ({ ...prev, loanType: types }))}
                />
              </th>
              <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">
                <LoanAmountFilter
                  selectedValues={advancedFilters.loanAmount}
                  onChange={(amounts) => setAdvancedFilters(prev => ({ ...prev, loanAmount: amounts }))}
                />
              </th>
              <th className="px-6 py-4 font-semibold text-center">Applied On</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          {filteredData.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={8} className="h-[700px]">
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                      <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                        <div
                          className="absolute inset-0 bg-[#00C48C]/20 rounded-full animate-ping opacity-75"
                          style={{ animationDuration: '3s' }}
                        />
                        <div className="relative w-16 h-16 bg-[#E6F9F3] rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                          <Inbox className="w-8 h-8 text-[#00C48C] animate-bounce" style={{ animationDuration: '2s' }} />
                        </div>
                      </div>
                      <h3 className="text-[#1F2937] text-[18px] font-bold mb-2 text-center">No applications yet</h3>
                      <p className="text-[#6B7280] text-[14px] text-center leading-relaxed">
                        Farmer loan applications routed through the OAN Farmer<br />
                        Profiling System will appear here once your loan products are<br />
                        active and published.
                      </p>
                    </div>


                  </div>


                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((row, index) => {
                const isSelected = selectedIds.has(row.id);

                return (
                  <tr key={index} className={`transition-colors hover:bg-gray-50/50 group ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                    <td className="px-6 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(row.id)}
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
                          <span className="mt-1 block text-sm font-medium text-gray-700">{row.name}</span>
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
                      {row.type}
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-700 text-sm">
                      {row.amount}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col text-sm">
                        <span className='text-sm text-gray-500 '>{row.applied.split(', ')[0] + ', ' + row.applied.split(', ')[1]}</span>
                        <span className="text-sm text-gray-500">{row.applied.split(', ')[2]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        {/* No handler yet — this button was the old "Add" action,
                            and its `onClick` still marked the row as added, which
                            nothing read and which "View" should not do anyway.
                            Wire it to the application detail route when that lands. */}
                        <button
                          type="button"
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
        filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-5 text-[14px] text-gray-500 bg-white rounded-b-lg">
            <div className="flex items-center gap-3">
              <span className="font-medium">Showing</span>
              <PaginationDropdown
                value={entriesPerPage}
                options={displayOptions}
                onChange={(val) => {
                  setEntriesPerPage(val);
                  setCurrentPage(1);
                }}
              />
              <span className="font-medium">of {totalEntries.toLocaleString()} entries</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    onClick={() => setCurrentPage(pageNum as number)}
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
        initialFilters={advancedFilters}
        availableLoanTypes={loanTypeOptions}
      />
    </div >
  );
}
