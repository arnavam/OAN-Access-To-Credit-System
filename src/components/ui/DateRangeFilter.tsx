'use client';

import { useState } from 'react';
import { DatePickerField } from './DatePickerField';

const QUICK_DATE_OPTS = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
] as const;

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  quickDate: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onQuickDateChange: (label: string, from: string, to: string) => void;
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  quickDate,
  onDateFromChange,
  onDateToChange,
  onQuickDateChange,
}: DateRangeFilterProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <section className={isDatePickerOpen ? 'pb-[280px]' : ''}>
      <p className="mb-3 text-base font-semibold text-[#232F34]">Date Range</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <p className="mb-1 text-sm text-gray-500">From</p>
          <DatePickerField
            value={dateFrom}
            onChange={(v) => onDateFromChange(v)}
            usePortal={false}
            align="left"
            {...(dateTo ? { maxDate: new Date(dateTo + 'T00:00:00') } : {})}
            onOpenChange={(isOpen) => setIsDatePickerOpen(isOpen)}
          />
        </div>
        <div className="relative">
          <p className="mb-1 text-sm text-gray-500">To</p>
          <DatePickerField
            value={dateTo}
            onChange={(v) => onDateToChange(v)}
            usePortal={false}
            align="right"
            {...(dateFrom ? { minDate: new Date(dateFrom + 'T00:00:00') } : {})}
            onOpenChange={(isOpen) => setIsDatePickerOpen(isOpen)}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 font-semibold">
        {QUICK_DATE_OPTS.map((o) => {
          const isActive = quickDate === o.label;
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => {
                const to = new Date();
                const from = new Date();
                if (o.days === 1) {
                  from.setDate(from.getDate() - 1);
                  to.setDate(to.getDate() - 1);
                } else {
                  from.setDate(from.getDate() - o.days);
                }
                onQuickDateChange(
                  o.label,
                  from.toISOString().split('T')[0] ?? '',
                  to.toISOString().split('T')[0] ?? '',
                );
              }}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
