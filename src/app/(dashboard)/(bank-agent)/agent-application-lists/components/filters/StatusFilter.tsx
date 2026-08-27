'use client';

import { Portal } from '@/components/Portal';
import { Check, Filter } from 'lucide-react';
import { useState } from 'react';
import { useColumnFilterDropdown } from './useColumnFilterDropdown';
export interface StatusFilterOption {
  /** What `get_all_loans` is filtered by — a stage label or stage_id. */
  value: string;
  /** What the bank calls this step. */
  label: string;
  /** Tailwind background class for the swatch, so the menu reads like the badges. */
  color?: string;
}

interface StatusFilterProps {
  options: readonly StatusFilterOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}

/**
 * The STATUS column's filter.
 *
 * The bank Applications List could filter by loan type and loan amount from the
 * column headers, but status — the one column a reviewer actually works the
 * queue by — was plain text, so the only way to narrow by it was to open the
 * Advanced Filters drawer. The store and `get_all_loans` already understood a
 * status filter; nothing in this table ever offered one.
 *
 * Selection is held as a draft until Apply, matching LoanTypeFilter beside it:
 * every checkbox toggle would otherwise be its own round trip.
 */
export default function StatusFilter({ options, selectedValues, onChange }: StatusFilterProps) {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedValues);
  const { isOpen, setIsOpen, dropdownRef, menuRef, dropdownPos, toggleDropdown: handleClick } = useColumnFilterDropdown({
    menuWidth: 300,
    onOpen: () => setTempSelected(selectedValues),
  });

  const isAllSelected = options.length > 0 && tempSelected.length === options.length;

  const toggleAll = () => {
    setTempSelected(isAllSelected ? [] : options.map((o) => o.value));
  };

  const toggleOption = (value: string) => {
    setTempSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };



  return (
    <div ref={dropdownRef} className="inline-block">
      <div
        className="flex items-center justify-center gap-1.5 cursor-pointer select-none text-gray-500 hover:text-gray-700 transition-colors"
        onClick={handleClick}
      >
        STATUS
        <Filter className={`w-3.5 h-3.5 transition-colors ${isOpen || selectedValues.length > 0 ? 'text-[#16A34A]' : ''}`} />
      </div>

      {isOpen && (
        <Portal>
          <div
            ref={menuRef}
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            className="absolute bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl overflow-hidden z-[100] w-[300px] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-5 py-4 border-b border-gray-100">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
            </div>

            <div className="flex flex-col py-2 max-h-[300px] overflow-y-auto">
              {options.length === 0 ? (
                // Not an empty menu over a live Apply button: a bank that has not
                // defined its pipeline yet has nothing to filter by, and saying so
                // is the difference between "no stages" and "the filter is broken".
                <p className="px-5 py-4 text-[13px] font-medium text-gray-400 normal-case">
                  No stages defined for this bank yet.
                </p>
              ) : (
                <>
                  <div
                    onClick={toggleAll}
                    className="flex items-center gap-4 px-5 py-2.5 hover:bg-gray-50 cursor-pointer text-[14px] font-medium text-gray-800 select-none group transition-colors normal-case"
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

                  {options.map((option) => {
                    const isSelected = tempSelected.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        onClick={() => toggleOption(option.value)}
                        className="flex items-center gap-4 px-5 py-2.5 hover:bg-gray-50 cursor-pointer text-[14px] font-medium text-gray-800 select-none group transition-colors normal-case"
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
                        <span className={`h-2 w-2 shrink-0 rounded-full ${option.color ?? 'bg-slate-400'}`} aria-hidden="true" />
                        <span className="truncate">{option.label}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  // Clears the applied filter too, not just the draft — a Clear
                  // that only emptied the checkboxes left the table still filtered.
                  setTempSelected([]);
                  onChange([]);
                  setIsOpen(false);
                }}
                className="text-[14px] font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span className="font-semibold">Clear</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(tempSelected);
                  setIsOpen(false);
                }}
                className="bg-[#16A34A] hover:bg-[#10883c] text-white px-6 py-2 rounded-lg text-[14px] font-semibold transition-colors shadow-sm"
              >
                <span className="font-semibold">Apply</span>
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
