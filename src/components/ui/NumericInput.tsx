'use client';

import { InputHTMLAttributes, forwardRef, KeyboardEvent, ChangeEvent } from 'react';
import { preventInvalidNumberChars, sanitizeNumberInput } from '@/lib/utils';

export interface NumericInputProps extends InputHTMLAttributes<HTMLInputElement> {
  maxIntegerDigits?: number;
  maxDecimalDigits?: number;
  maxDigits?: number;
}

/**
 * A standard numeric input that automatically prevents 'e', 'E', '+', and '-' 
 * characters from being typed or pasted, and optionally caps integer/decimal digits.
 * 
 * Works exactly like a native <input type="number"> and accepts all the same props, 
 * including standard refs and classNames.
 */
export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      onKeyDown,
      onChange,
      type = 'number',
      maxIntegerDigits,
      maxDecimalDigits,
      maxDigits,
      ...props
    },
    ref
  ) => {
    
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      preventInvalidNumberChars(e);
      onKeyDown?.(e);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      let sanitized = sanitizeNumberInput(e.target.value);

      if (maxDigits !== undefined && sanitized) {
        const digitsOnly = sanitized.replace(/\D/g, '');
        sanitized = digitsOnly.slice(0, maxDigits);
      }

      if ((maxIntegerDigits !== undefined || maxDecimalDigits !== undefined) && sanitized) {
        const parts = sanitized.split('.');
        let intPart = parts[0] ?? '';
        if (maxIntegerDigits !== undefined && intPart.length > maxIntegerDigits) {
          intPart = intPart.slice(0, maxIntegerDigits);
        }

        if (parts.length > 1) {
          let decPart = parts.slice(1).join('');
          if (maxDecimalDigits !== undefined && decPart.length > maxDecimalDigits) {
            decPart = decPart.slice(0, maxDecimalDigits);
          }
          sanitized = `${intPart}.${decPart}`;
        } else {
          sanitized = intPart;
        }
      }

      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
      }
      onChange?.(e);
    };

    return (
      <input
        ref={ref}
        type={type}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
NumericInput.displayName = 'NumericInput';
