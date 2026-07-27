'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { mockLoans } from '../data/mockLoans';
import LoanCard from './LoanCard';
import Pagination from './Pagination';
import SidebarFilters from './SidebarFilters';
import TopBar from './TopBar';

// Generate a larger dataset for pagination demonstration
const allLoans = Array.from({ length: 6 }, (_, i) =>
  mockLoans.map(loan => ({ ...loan, id: `${loan.id}-${i}` }))
).flat();

export default function DiscoverLoansClient() {
  const [activeTab, setActiveTab] = useState('All Loans');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('best_match');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 8;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy]);

  // Apply filtering based on Active Tab and Search Query
  const filteredLoans = allLoans.filter(loan => {
    let tabMatch = true;
    if (activeTab === 'Short-Term') {
      tabMatch = loan.tenureMonths <= 3;
    } else if (activeTab === 'Long-Term') {
      tabMatch = loan.tenureMonths > 3;
    }

    let searchMatch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      searchMatch = 
        loan.bankName.toLowerCase().includes(q) ||
        loan.title.toLowerCase().includes(q) ||
        loan.tags.some(tag => tag.toLowerCase().includes(q));
    }

    return tabMatch && searchMatch;
  });

  // Apply sorting
  filteredLoans.sort((a, b) => {
    if (sortBy === 'interest_low_high') {
      return a.interestRate - b.interestRate;
    }
    if (sortBy === 'amount_high_low') {
      return b.amount - a.amount;
    }
    // best_match (default)
    return b.matchPercentage - a.matchPercentage;
  });

  // Calculate Pagination
  const totalEntries = filteredLoans.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const displayLoans = filteredLoans.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Sidebar - Left */}
      <div className="w-full lg:w-[320px] shrink-0">
        <SidebarFilters />
      </div>

      {/* Main Content - Right */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {displayLoans.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {displayLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : (
          <div
            key={activeTab}
            className="flex-1 flex flex-col items-center justify-center p-10 bg-white rounded-2xl border border-[#F1F3F4] text-center px-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Search className="w-7 h-7 text-[#16A34A]" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {activeTab === 'Long-Term'
                ? "No Long-Term Loans Available"
                : "No loans found"}
            </h3>
            <p className="text-[15px] text-gray-500 max-w-sm mx-auto leading-relaxed">
              {activeTab === 'Long-Term'
                ? "We currently don't have any long-term loan options that match your criteria. Try switching to \"Short-Term\" or \"All Loans\" to explore other great financial products!"
                : "Try adjusting your filters or search query to find what you're looking for."}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalEntries={totalEntries}
              entriesPerPage={entriesPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
