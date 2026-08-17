'use client';

import { Portal } from '@/components/Portal';
import { Check, Filter } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TableColumnFilterProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}

export default function TableColumnFilter({ label, options, selectedValues, onChange }: TableColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
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
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(o => o !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleClick = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} className="inline-block">
      <div 
        className="flex items-center gap-1.5 cursor-pointer select-none text-gray-500 hover:text-gray-700 transition-colors"
        onClick={handleClick}
      >
        {label} <Filter className={`w-3.5 h-3.5 transition-colors ${isOpen ? 'text-[#16A34A]' : ''}`} />
      </div>

      {isOpen && (
        <Portal>
          <div
            ref={menuRef}
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            className="absolute bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden z-[100] w-48 text-sm font-medium animate-in fade-in zoom-in-95 duration-200"
          >
            {options.map(option => {
              const isSelected = selectedValues.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 text-gray-700 select-none group transition-colors"
                >
                  <div
                    className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-all duration-200 ${
                      isSelected ? 'bg-[#16A34A] border-[#16A34A]' : 'border-gray-300 group-hover:border-[#16A34A]/50'
                    }`}
                  >
                    <Check
                      className={`w-3 h-3 text-white transition-all duration-200 ${
                        isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                      }`}
                      strokeWidth={3}
                    />
                  </div>
                  <span className="truncate">{option}</span>
                </div>
              );
            })}
          </div>
        </Portal>
      )}
    </div>
  );
}
