'use client';

import { Portal } from '@/components/Portal';
import { Check, Filter } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface LoanTypeFilterProps {
  options: string[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}

export default function LoanTypeFilter({ options, selectedValues, onChange }: LoanTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [tempSelected, setTempSelected] = useState<string[]>(selectedValues);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    const updatePosition = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX
        });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (option === 'All') {
      if (tempSelected.length === options.length) {
        setTempSelected([]);
      } else {
        setTempSelected([...options]);
      }
      return;
    }

    if (tempSelected.includes(option)) {
      setTempSelected(tempSelected.filter(o => o !== option));
    } else {
      setTempSelected([...tempSelected, option]);
    }
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  const handleApply = () => {
    onChange(tempSelected);
    setIsOpen(false);
  };

  const handleClick = () => {
    if (!isOpen && dropdownRef.current) {
      // Opening: start the draft from the committed selection, so an edit that was
      // abandoned last time (closed without Apply) isn't still sitting there.
      //
      // This was an effect on [isOpen, selectedValues]. Resetting draft state in
      // the handler that opens the menu is both the documented React pattern and
      // narrower: the effect also re-ran whenever `selectedValues` changed
      // identity, which could wipe an in-progress selection mid-edit.
      setTempSelected(selectedValues);

      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
    setIsOpen(!isOpen);
  };

  const isAllSelected = tempSelected.length === options.length;

  return (
    <div ref={dropdownRef} className="inline-block">
      <div
        className="flex items-center gap-1.5 cursor-pointer select-none text-gray-500 hover:text-gray-700 transition-colors"
        onClick={handleClick}
      >
        LOAN TYPE <Filter className={`w-3.5 h-3.5 transition-colors ${isOpen || selectedValues.length > 0 ? 'text-[#16A34A]' : ''}`} />
      </div>

      {isOpen && (
        <Portal>
          <div
            ref={menuRef}
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            className="absolute bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl overflow-hidden z-[100] w-[300px] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Loan Product</span>
            </div>

            {/* Options List */}
            <div className="flex flex-col py-2 max-h-[300px] overflow-y-auto">
              {/* All Option */}
              <div
                onClick={() => toggleOption('All')}
                className="flex items-center gap-4 px-5 py-2.5 hover:bg-gray-50 cursor-pointer text-[14px] font-medium text-gray-800 select-none group transition-colors"
              >
                <div
                  className={`w-5 h-5 shrink-0 rounded-[4px] border flex items-center justify-center transition-all duration-200 ${isAllSelected ? 'bg-[#16A34A] border-[#16A34A]' : 'border-gray-300 group-hover:border-[#16A34A]/50'
                    }`}
                >
                  <Check
                    className={`w-3.5 h-3.5 text-white transition-all duration-200 ${isAllSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                      }`}
                    strokeWidth={3}
                  />
                </div>
                All
              </div>

              {/* Individual Options */}
              {options.map(option => {
                const isSelected = tempSelected.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className="flex items-center gap-4 px-5 py-2.5 hover:bg-gray-50 cursor-pointer text-[14px] font-medium text-gray-800 select-none group transition-colors"
                  >
                    <div
                      className={`w-5 h-5 shrink-0 rounded-[4px] border flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-[#16A34A] border-[#16A34A]' : 'border-gray-300 group-hover:border-[#16A34A]/50'
                        }`}
                    >
                      <Check
                        className={`w-3.5 h-3.5 text-white transition-all duration-200 ${isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                          }`}
                        strokeWidth={3}
                      />
                    </div>
                    {option}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button
                onClick={handleClear}
                className="text-[14px] font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >

                <span className='font-semibold'>Clear</span>
              </button>
              <button
                onClick={handleApply}
                className="bg-[#16A34A] hover:bg-[#15803d] text-white px-6 py-2 rounded-lg text-[14px] font-semibold transition-colors shadow-sm"
              >

                <span className='font-semibold'>Apply</span>
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
