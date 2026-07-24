'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function TopBar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: TopBarProps) {
  const tabs = ['All Loans', 'Short-Term', 'Long-Term'];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const sortOptions = [
    { value: 'best_match', label: 'Best Match' },
    { value: 'interest_low_high', label: 'Interest: Low to High' },
    { value: 'amount_high_low', label: 'Amount: High to Low' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Best Match';

  return (
    <div className="flex flex-col gap-4 mb-6 bg-white border border-[#E5E7EB] rounded-xl p-4 border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all">
      {/* Top section: Tabs */}
      <div className="flex justify-end">
        <div className="inline-flex items-center bg-gray-50 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-5 py-2 text-[14px] font-bold rounded-lg transition-all duration-200 ${activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom section: Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-[18px] w-[18px] text-gray-400" strokeWidth={2} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-[#E5E7EB] rounded-xl text-[15px] bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="Search by bank name, crop type, or loan program..."
          />
        </div>

        {/* Custom Animated Sort Dropdown */}
        <div className="relative shrink-0 w-full sm:w-[190px]" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full pl-4 pr-4 py-3 border border-[#E5E7EB] rounded-xl text-[15px] bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors font-medium text-left"
          >
            <span className="truncate">{currentSortLabel}</span>
            <ChevronDown className={`h-[18px] w-[18px] text-gray-500 transition-transform duration-200 shrink-0 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-full min-w-[220px] bg-white border border-gray-100 shadow-lg rounded-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSortChange(opt.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${sortBy === opt.value
                      ? 'bg-green-50/50 text-green-700 font-bold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'
                    }`}
                >
                  {opt.label}
                  {sortBy === opt.value && <Check className="w-4 h-4 text-green-600" strokeWidth={3} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
