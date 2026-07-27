'use client';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Inbox, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { mockApplications } from '../data/mockData';
import { StatusFilterDropdown, STATUS_OPTIONS } from './StatusFilterDropdown';

export function LoanApplicationsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([...STATUS_OPTIONS]);
  const filterRef = useRef<HTMLTableHeaderCellElement>(null);
  const itemsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsStatusFilterOpen(false);
      }
      if (itemsDropdownRef.current && !itemsDropdownRef.current.contains(event.target as Node)) {
        setIsItemsPerPageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter applications based on selected statuses
  const filteredApplications = mockApplications.filter(app => {
    return app.status ? selectedStatuses.includes(app.status) : false;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage) || 1;

  // Reset to page 1 if filtering reduces pages below current page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredApplications.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const isAllSelected = selectedStatuses.length === STATUS_OPTIONS.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses([...STATUS_OPTIONS]);
    }
  };

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  return (
    <div className="bg-white border border-[#F1F3F4] rounded-xl shadow-sm flex flex-col min-h-[500px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
      {/* Table Header */}
      <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-[16px] font-bold text-[#1F2937] mb-1">Loan Applications</h3>
          <p className="text-[14px] text-[#6B7280]">
            Farmers who applied against your published loan products — via OAN Farmer Profiling System
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700">
            <ShieldCheck size={16} />
            <span className="text-[12px] font-bold">FPS Verified</span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-gray-50/50">
              <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">Farmer Details</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">Loan Product</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">Applied</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#6B7280] uppercase tracking-wider relative" ref={filterRef}>
                <div
                  className="flex items-center space-x-1.5 cursor-pointer hover:text-[#374151] transition-colors"
                  onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                >
                  <span>Status</span>
                  <Filter size={14} className={selectedStatuses.length > 0 ? "text-blue-600" : ""} />
                </div>

                {/* Filter Dropdown */}
                <StatusFilterDropdown
                  isOpen={isStatusFilterOpen}
                  selectedStatuses={selectedStatuses}
                  onToggleAll={toggleAll}
                  onToggleStatus={toggleStatus}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {currentApplications.length > 0 ? (
              currentApplications.map((app, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${app.color}`}>
                        {app.initials}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-[#1F2937]">{app.name}</div>
                        <div className="text-[12px] text-[#6B7280]">{app.farmerId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#4B5563]">{app.product}</td>
                  <td className="px-6 py-4 text-[14px] font-semibold text-[#1F2937]">{app.amount}</td>
                  <td className="px-6 py-4 text-[14px] text-[#6B7280]">
                    <div className="whitespace-pre-line">{app.date.replace(', ', '\n')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold ${app.statusColor}`}>
                      {app.status === 'In Review' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                          In Review
                        </>
                      ) : app.status === 'Pending' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
                          Pending
                        </>
                      ) : (
                        <>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${app.dotColor}`}></span>
                          {app.status}
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6">
                  <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#00C48C]/20 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
                      <div className="relative w-16 h-16 bg-[#E6F9F3] rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                        <Inbox className="w-8 h-8 text-[#00C48C] animate-bounce" style={{ animationDuration: '2s' }} />
                      </div>
                    </div>
                    <h3 className="text-[#1F2937] text-[18px] font-bold mb-2">No applications found</h3>
                    <p className="text-[#6B7280] text-[14px] max-w-[350px] text-center leading-relaxed">
                      We couldn't find any loan applications matching your current filter. Try selecting different statuses.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredApplications.length > 0 && (
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <div className="flex items-center text-[14px] text-[#6B7280]">
            Showing
            <div className="relative mx-2" ref={itemsDropdownRef}>
              <button
                onClick={() => setIsItemsPerPageOpen(!isItemsPerPageOpen)}
                className="w-[60px] px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-center text-[#1F2937] font-medium flex items-center justify-between bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
              >
                <span>{itemsPerPage}</span>
                <ChevronDown size={14} className={`text-gray-500 transform transition-transform duration-200 ${isItemsPerPageOpen ? 'rotate-180' : ''}`} />
              </button>

              {isItemsPerPageOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {[10, 20, 50].map(size => (
                    <button
                      key={size}
                      onClick={() => { setItemsPerPage(size); setIsItemsPerPageOpen(false); setCurrentPage(1); }}
                      className={`w-full text-center py-2 text-[14px] transition-colors ${itemsPerPage === size ? 'text-[#00C48C] font-bold bg-[#E6F9F3]/50' : 'text-[#4B5563] hover:bg-gray-50'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
            of {filteredApplications.length} Application{filteredApplications.length !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 flex items-center space-x-1 text-[14px] font-medium transition-colors ${currentPage === 1 ? 'text-[#9CA3AF] cursor-not-allowed' : 'text-[#4B5563] hover:text-[#1F2937]'}`}
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>

            {getPageNumbers().map((pageNum, i) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[#9CA3AF]">...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum as number)}
                  className={`w-8 h-8 rounded text-[14px] font-medium flex items-center justify-center transition-colors ${currentPage === pageNum ? 'bg-[#16A34A] text-white font-bold' : 'text-[#4B5563] hover:bg-gray-100'}`}
                >
                  {pageNum}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 flex items-center space-x-1 text-[14px] font-medium transition-colors ${currentPage === totalPages ? 'text-[#9CA3AF] cursor-not-allowed' : 'text-[#4B5563] hover:text-[#1F2937]'}`}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
