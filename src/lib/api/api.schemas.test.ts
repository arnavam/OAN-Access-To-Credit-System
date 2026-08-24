import { logger } from '@/lib/logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
    loanApplicationFullSchema, loanApplicationSummarySchema, validateResponse
} from './api.schemas';

describe('api.schemas validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateResponse', () => {
    it('should pass and return validated data when input conforms to schema', () => {
      const mockSchema = z.object({ id: z.string() });
      const input = { id: 'test-id' };
      const result = validateResponse(mockSchema, input, 'test_endpoint');
      expect(result).toEqual(input);
    });

    it('should throw an error and log api contract violation when input does not conform to schema', () => {
      const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
      const mockSchema = z.object({ id: z.string() });
      const input = { id: 123 }; // invalid type

      expect(() => validateResponse(mockSchema, input, 'test_endpoint')).toThrow(
        'Data format error in response from test_endpoint. Please try again later.'
      );
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('loanApplicationSummarySchema', () => {
    it('should validate correctly with valid fields and default null/missing values', () => {
      const validData = {
        application_id: 'APP-123',
        status: 'In Transition' as const,
        stage_label: 'Credit Committee',
        step: 1,
        lead_id: 'LEAD-123',
        loan_amount: 1000,
        loan_type: 'Agri',
        region: 'Oromia',
        woreda: 'Adama',
        kebele: '01',
        phone_number: '1234567890',
        creation: '2026-06-24',
        first_name: 'John',
        last_name: 'Doe',
      };

      const result = loanApplicationSummarySchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should leave null location, stage and name fields undefined', () => {
      const inputData = {
        application_id: 'APP-123',
        status: 'Active' as const,
        stage_label: null,
        step: 1,
        lead_id: 'LEAD-123',
        loan_amount: 1000,
        loan_type: 'Agri',
        region: null,
        woreda: null,
        kebele: null,
        phone_number: '1234567890',
        creation: '2026-06-24',
        first_name: null,
        last_name: null,
      };

      const result = loanApplicationSummarySchema.parse(inputData);
      // Not '' — a blank string renders as a real but empty value, which is how the
      // never-populated `location` field used to read as a legitimately empty cell.
      expect(result.region).toBeUndefined();
      expect(result.woreda).toBeUndefined();
      expect(result.kebele).toBeUndefined();
      // `stage_label` keeps its null rather than collapsing to undefined — every
      // consumer reads it as `stage_label || status`, so absent and null are the
      // same thing to them, and the raw value stays faithful to the payload.
      expect(result.stage_label).toBeNull();
      expect(result.first_name).toBeUndefined();
      expect(result.last_name).toBeUndefined();
    });

    it('should handle missing optional fields', () => {
      const inputData = {
        application_id: 'APP-123',
        status: 'Active' as const,
        step: 1,
        lead_id: 'LEAD-123',
        loan_amount: 1000,
        loan_type: 'Agri',
        phone_number: '1234567890',
        creation: '2026-06-24',
      };

      const result = loanApplicationSummarySchema.parse(inputData);
      expect(result.region).toBeUndefined();
      expect(result.stage_label).toBeUndefined();
      expect(result.first_name).toBeUndefined();
      expect(result.last_name).toBeUndefined();
    });

    it('should reject a `location` field, which no longer exists on the doctype', () => {
      const parsed = loanApplicationSummarySchema.parse({
        application_id: 'APP-123',
        status: 'Active' as const,
        step: 1,
        loan_amount: 1000,
        loan_type: 'Agri',
        phone_number: '1234567890',
        creation: '2026-06-24',
        location: 'Kabul',
      });

      expect(parsed).not.toHaveProperty('location');
    });
  });

  describe('loanApplicationFullSchema', () => {
    it('should transform nullish name and reason fields', () => {
      const inputData = {
        application_id: 'APP-123',
        status: 'Draft' as const,
        phone_number: '1234567890',
        loan_type: 'Agri',
        loan_amount: 1000,
        loan_reason: null,
        first_name: null,
        last_name: null,
        farmer_profile: null,
        loan_officer: null,
        gender: null,
        marital_status: null,
        education_level: null,
      };

      const result = loanApplicationFullSchema.parse(inputData);
      expect(result.loan_reason).toBe('');
      expect(result.first_name).toBeUndefined();
      expect(result.last_name).toBeUndefined();
      expect(result.farmer_profile).toBeUndefined();
      expect(result.loan_officer).toBeUndefined();
      expect(result.gender).toBeUndefined();
      expect(result.marital_status).toBeUndefined();
      expect(result.education_level).toBeUndefined();
    });
  });
});
