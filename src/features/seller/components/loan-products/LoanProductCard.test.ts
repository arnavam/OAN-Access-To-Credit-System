import { describe, expect, it } from 'vitest';
import { canEditLoanProduct } from './LoanProductCard';

describe('LoanProductCard - canEditLoanProduct access rules', () => {
  it('denies edit access for active products', () => {
    expect(canEditLoanProduct('Active')).toBe(false);
    expect(canEditLoanProduct('active')).toBe(false);
    expect(canEditLoanProduct('ACTIVE')).toBe(false);
  });

  it('allows edit access for non-active products (Draft, Archived, etc.)', () => {
    expect(canEditLoanProduct('Draft')).toBe(true);
    expect(canEditLoanProduct('draft')).toBe(true);
    expect(canEditLoanProduct('Archived')).toBe(true);
  });

  it('denies edit access when status is null or undefined', () => {
    expect(canEditLoanProduct(null)).toBe(false);
    expect(canEditLoanProduct(undefined)).toBe(false);
    expect(canEditLoanProduct('')).toBe(false);
  });
});
