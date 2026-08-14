'use client';

import type { LoanApplicationFull } from '@/lib/api/api.schemas';
import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { loanService } from '../../api/loan.service';
import { LoanTableRow } from '../LoanTable';

export function useLoanApplicationModal(isOpen: boolean, data: LoanTableRow | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullProfile, setFullProfile] = useState<LoanApplicationFull | null>(null);

  useEffect(() => {
    const fetchId = data?.application_id || data?.id;
    if (isOpen && fetchId) {
      // Signals loading immediately when the fetch starts, not just once it resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      loanService.getFullProfile(fetchId)
        .then((profileRes) => {
          setFullProfile(profileRes?.data || null);
        })
        .catch((err) => {
          logger.error('Failed to fetch full profile:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setFullProfile(null);
    }
  }, [isOpen, data?.application_id, data?.id]);

  return { isLoading, fullProfile };
}

// Keys already rendered in pinned sections or that are metadata-only.
// Used by both modal variants to compute extra dynamic fields.
export const PINNED_OR_META_KEYS = new Set([
  'first_name', 'last_name', 'father_name', 'farmer_id', 'date_of_birth', 'gender',
  'marital_status', 'phone_number', 'education_level', 'national_id', 'location',
  'woreda', 'kebele',
  'loan_type', 'loan_reason', 'purpose', 'loan_amount', 'duration', 'primary_crops',
  'crop_variety', 'farmland_size_hectares', 'expected_yield',
  'bank_account_no', 'ifsc_code', 'bank_name', 'account_holder',
  'application_id', 'lead_id', 'farmer_profile', 'consent_id', 'status', 'current_step',
  'loan_officer', 'creation', 'submission_date', 'internal_notes', 'applicant', 'amount',
  'updated', 'phone', 'productName', 'loan_product', 'loan_product_name', 'requested_amount',
  'purpose_of_loan',
]);
