'use client';

import { InputHTMLAttributes, forwardRef, KeyboardEvent, ChangeEvent } from 'react';
import { preventInvalidNumberChars, sanitizeNumberInput } from '@/lib/utils';

export interface NumericInputProps extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * A standard numeric input that automatically prevents 'e', 'E', '+', and '-' 
 * characters from being typed or pasted.
 * 
 * Works exactly like a native <input type="number"> and accepts all the same props, 
 * including standard refs and classNames.
 */
export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  ({ onKeyDown, onChange, type = 'number', ...props }, ref) => {
    
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      preventInvalidNumberChars(e);
      onKeyDown?.(e);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeNumberInput(e.target.value);
      // Intercept and clean the value in the event object before passing it up
      // so consumers automatically get the sanitized string when reading e.target.value.
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
