import {
    loanApplicationFullSchema,
    loanApplicationSummarySchema,
    loanMetadataSchema,
    validateResponse,
    type LoanApplicationFull,
    type LoanApplicationSummary,
    type LoanMetadata
} from '@/lib/api/api.schemas';
import { fetchApi } from '@/lib/api/fetchApi';
import { normalizeLeadId } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';
import type { LoanFormData } from '../types/loans.types';

// `LoanApplicationFull` / `LoanApplicationSummary` are the validated shapes for
// `get_full_profile` / `get_all_loans`; their single source of truth is the Zod
// schema in `@/lib/api/api.schemas`. Re-exported here so existing consumers keep
// importing them from the service.
export type { LoanApplicationFull, LoanApplicationSummary, LoanMetadata };

export interface LoanApplication {
  id: string;
  applicant: string;
  type: string;
  status: string;
  statusTone: string;
  updated: string;
  amount?: string;
  phone?: string;
  region?: string;
  loanTerm?: string;
  formData?: LoanFormData;
}

/**
 * The shape `get_loan_summary` actually returns.
 *
 * It previously declared required `processing` / `approved` / `rejected` fields
 * that the endpoint has never sent — names left over from the status model the
 * archetype refactor replaced. Because the type asserted they were there, every
 * consumer type-checked cleanly while reading `undefined` at runtime.
 *
 * `by_status` was the second round of the same mistake: the endpoint returns
 * `total`, `stages` and `tab_counts` and nothing else, so every selector reading
 * `by_status['In Transition']` was reading `undefined` and rendering a dash.
 * Bucket `stages` by archetype instead — see `bucketStagesByArchetype`.
 */
export interface LoanSummaryMetrics {
  total: number;
  /**
   * Counts per *bank-defined* stage label, falling back to the archetype when a
   * loan sits on no named stage. Tenant free text: never key on a literal here.
   */
  stages: Record<string, number>;
  tab_counts?: {
    all: number;
    my: number;
    unassigned: number;
  };
}

export interface SupportingDocument {
  name: string;
  file_name: string;
  file_url: string;
  creation: string;
  file_id?: string;
  document_type?: string;
  is_verified?: boolean;
  owner?: string;
}

export interface CreateLoanApplicationResponse {
  application_id: string;
  application: {
    name: string;
    status: 'Draft';
    farmer_profile: string;
    first_name: string;
    last_name: string;
    loan_type: string;
    loan_amount: number;
    current_step: number | null;
  };
}


export interface GetLoansParams {
  page?: number;
  page_size?: number;
  search_query?: string; // free-text search by Application ID, Lead ID, or Phone Number
  status?: string; // stringified array or comma-separated statuses e.g. 'Draft,Approved'
  min_loan_amount?: string;
  max_loan_amount?: string;
  loan_type?: string;
  phone_number?: string;
  loan_officer?: string; // user email, or the literal 'unassigned' (get_all_loans filter)
  /**
   * Coarse workflow bucket — 'Active' | 'In Transition' | 'Completed' |
   * 'Rejected'. Backend-validated and bank-agnostic, so it is the only status
   * filter that is safe to send before per-bank stages have resolved.
   */
  archetype?: string;
  from_date?: string;
  to_date?: string;
  location?: string;
  lead_id?: string;
  sort_by?: 'loan_amount' | 'creation';
  sort_order?: 'asc' | 'desc';
}

export const loanService = {
  async getLoans(params?: GetLoansParams, options?: RequestInit): Promise<ApiResponse<LoanApplicationSummary[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const path = `oan_a2c.api.v1.loan_applications.get_all_loans?${searchParams.toString()}`;
    const response = await fetchApi(path, options) as ApiResponse<LoanApplicationSummary[]>;
    return {
      ...response,
      data: validateResponse(z.array(loanApplicationSummarySchema), response?.data, 'get_all_loans'),
    };
  },

  async getLoanSummary(): Promise<ApiResponse<LoanSummaryMetrics>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.get_loan_summary') as Promise<ApiResponse<LoanSummaryMetrics>>;
  },

  /**
   * The statuses the *caller* can see, resolved per role by the backend.
   *
   * Prefer this over `loanStagesService.getStages()` anywhere outside the bank
   * portals: that endpoint is a seller API and 403s for a Development Agent or
   * a farmer, neither of whom holds a bank binding.
   */
  async getLoanMetadata(options?: RequestInit): Promise<ApiResponse<LoanMetadata>> {
    const response = await fetchApi(
      'oan_a2c.api.v1.loan_applications.get_loan_metadata',
      options,
    ) as ApiResponse<LoanMetadata>;
    return {
      ...response,
      data: validateResponse(loanMetadataSchema, response?.data, 'get_loan_metadata'),
    };
  },

  async downloadSupportingDocument(file_id: string, view = 0): Promise<null> {
    return fetchApi(`oan_a2c.api.v1.loan_applications.download_supporting_document?file_id=${file_id}&view=${view}`) as Promise<null>;
  },

  async getFullProfile(application_id: string): Promise<ApiResponse<LoanApplicationFull>> {
    const response = await fetchApi(
      `oan_a2c.api.v1.loan_applications.get_full_profile?application_id=${application_id}`,
    ) as ApiResponse<LoanApplicationFull>;
    return {
      ...response,
      data: validateResponse(loanApplicationFullSchema, response?.data, 'get_full_profile'),
    };
  },

  async getSupportingDocuments(application_id: string): Promise<ApiResponse<SupportingDocument[]>> {
    return fetchApi(`oan_a2c.api.v1.loan_applications.get_supporting_documents?application_id=${application_id}`) as Promise<ApiResponse<SupportingDocument[]>>;
  },

  async uploadSupportingDocument(application_id: string, document_type: string, file: File): Promise<ApiResponse<SupportingDocument>> {
    const formData = new FormData();
    formData.append('document_type', document_type);
    formData.append('file', file);

    return fetchApi(`oan_a2c.api.v1.loan_applications.upload_supporting_documents?application_id=${application_id}`, {
      method: 'POST',
      body: formData,
    }) as Promise<ApiResponse<SupportingDocument>>;
  },

  async listSupportingDocuments(application_id: string): Promise<ApiResponse<SupportingDocument[]>> {
    return this.getSupportingDocuments(application_id);
  },

  async deleteSupportingDocument(application_id: string, file_id: string): Promise<ApiResponse<null>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.delete_supporting_document', {
      method: 'POST',
      body: JSON.stringify({ application_id, file_id }),
    }) as Promise<ApiResponse<null>>;
  },

  /**
   * Submits a drafted application into the owning bank's pipeline.
   *
   * Goes through `submit_application` rather than posting a status directly:
   * that endpoint resolves the bank's *own* initial stage, whereas the literal
   * 'Processed' this used to send is a label no bank is obliged to define — for
   * a bank whose first stage is called anything else, the submit 400s. The
   * endpoint accepts `A2C Development Agent` as well as `A2C Farmer`, and it
   * enforces the consent precondition that a raw status write skips.
   */
  async submitApplication(application_id: string): Promise<ApiResponse<null>> {
    return fetchApi('oan_a2c.api.v1.farmer.applications.submit_application', {
      method: 'POST',
      body: JSON.stringify({ application_id }),
    }) as Promise<ApiResponse<null>>;
  },

  async createLoanApplication(lead_id: string): Promise<ApiResponse<CreateLoanApplicationResponse>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.create_loan_application', {
      method: 'POST',
      body: JSON.stringify({ lead_id: normalizeLeadId(lead_id) }),
    }) as Promise<ApiResponse<CreateLoanApplicationResponse>>;
  },

  /**
   * Moves an application to another stage of its owning bank's pipeline.
   *
   * `status` takes a stage label, a stage ID, or an archetype — the backend
   * resolves it against that bank's own stages, so it must come from
   * `get_stages` rather than from a fixed vocabulary.
   *
   * `reason` is optional and recorded on the audit timeline when given. It used
   * to be sent alongside a `notes` field that the endpoint does not accept, so
   * anything typed into the modal's separate note box was discarded in transit;
   * there is one free-text field here now, and it is this one.
   */
  async updateLoanStatus(application_id: string, status: string, reason?: string): Promise<ApiResponse<null>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.update_loan_status', {
      method: 'POST',
      // Omitted rather than sent as undefined: `reason` is optional and an
      // explicit null would land in the audit trail as an empty remark.
      body: JSON.stringify({ application_id, status, ...(reason ? { reason } : {}) }),
    }) as Promise<ApiResponse<null>>;
  },

  async updateLoanStep(application_id: string, step: number): Promise<ApiResponse<null>> {
    return fetchApi('oan_a2c.api.v1.loan_applications.update_loan_step', {
      method: 'POST',
      body: JSON.stringify({ application_id, step }),
    }) as Promise<ApiResponse<null>>;
  },

  /**
   * Finds the loan application summary for a given lead ID.
   * Throws an error if no application is found, ensuring the returned value is always defined.
   */
  async findApplicationByLeadId(lead_id: string, options?: RequestInit): Promise<LoanApplicationSummary> {
    const cleanLeadId = normalizeLeadId(lead_id);
    const response = await this.getLoans({ lead_id: cleanLeadId }, options);
    const results = response?.data || [];
    if (results.length === 0) {
      throw new Error(`No loan application found for Lead ID: ${cleanLeadId}`);
    }
    return results[0] as LoanApplicationSummary;
  },

  /**
   * Helper to check if a loan application exists for a lead.
   * Catches the not-found error and returns null, since not having an application is a normal state here.
   */
  async findApplicationIdByLeadId(lead_id: string, options?: RequestInit): Promise<string | null> {
    try {
      const app = await this.findApplicationByLeadId(lead_id, options);
      return app.application_id;
    } catch {
      return null;
    }
  },
};
