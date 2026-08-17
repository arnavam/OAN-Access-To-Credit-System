'use client';

import React from 'react';
import { DatePickerField } from './DatePickerField';

interface DateRangeFilterProps {
  fromValue: string;
  toValue: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  fromLabel?: string;
  toLabel?: string;
}

export function DateRangeFilter({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  fromLabel = 'From',
  toLabel = 'To'
}: DateRangeFilterProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        {fromLabel && (
          <label className="text-sm font-medium text-gray-700">
            {fromLabel}
          </label>
        )}
        <DatePickerField 
          value={fromValue}
          onChange={onFromChange}
        />
      </div>
      
      <div className="flex flex-col gap-1.5">
        {toLabel && (
          <label className="text-sm font-medium text-gray-700">
            {toLabel}
          </label>
        )}
        <DatePickerField 
          value={toValue}
          onChange={onToChange}
          minDate={fromValue ? new Date(fromValue) : undefined}
        />
      </div>
    </div>
  );
}
