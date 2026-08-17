import { describe, expect, it } from 'vitest';
import { canEditLoanProduct } from './LoanProductCard';

describe('LoanProductCard - canEditLoanProduct access rules', () => {
  it('denies edit access for active and pending approval products', () => {
    expect(canEditLoanProduct('Active')).toBe(false);
    expect(canEditLoanProduct('active')).toBe(false);
    expect(canEditLoanProduct('ACTIVE')).toBe(false);
    expect(canEditLoanProduct('Pending Approval')).toBe(false);
    expect(canEditLoanProduct('pending approval')).toBe(false);
  });

  it('allows edit access for rejected, archived, and unrecognised statuses', () => {
    expect(canEditLoanProduct('Rejected')).toBe(true);
    expect(canEditLoanProduct('rejected')).toBe(true);
    expect(canEditLoanProduct('Archived')).toBe(true);
    // Defensive: any status that isn't active/pending stays editable.
    expect(canEditLoanProduct('Unknown')).toBe(true);
  });

  it('denies edit access when status is null or undefined', () => {
    expect(canEditLoanProduct(null)).toBe(false);
    expect(canEditLoanProduct(undefined)).toBe(false);
    expect(canEditLoanProduct('')).toBe(false);
  });
});
