'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const LOAN_TYPES = ['Seed', 'Input', 'Equipment', 'Livestock'];

interface LoanTypeDropdownProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

export function LoanTypeDropdown({ selectedTypes, onChange }: LoanTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter(t => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-lg focus-within:ring-2 focus-within:ring-[#00C48C] focus-within:border-[#00C48C] bg-white cursor-pointer flex items-center justify-between transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-[14px] text-[#1F2937] truncate flex-1 pr-4">
          {selectedTypes.length > 0 ? selectedTypes.join(', ') : <span className="text-[#6B7280]">Select Loan Type</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {LOAN_TYPES.map((type, index) => (
            <label key={type} className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer group ${index !== LOAN_TYPES.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="relative flex items-center justify-center mr-3">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleToggle(type)}
                  className="peer appearance-none w-5 h-5 border border-gray-300 rounded bg-white checked:bg-[#00C48C] checked:border-[#00C48C] transition-all duration-300 cursor-pointer"
                />
                <svg
                  className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 peer-checked:scale-100 scale-50 transition-all duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[14px] text-[#4B5563] group-hover:text-[#1F2937] transition-colors">{type}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
