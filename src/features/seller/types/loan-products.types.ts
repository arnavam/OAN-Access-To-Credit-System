export interface ListProductsParams {
  status?: 'Draft' | 'Active' | 'Archived';
  search?: string;
  category?: string;
  tag?: string;
  min_interest_rate?: number;
  max_interest_rate?: number;
  min_amount?: number;
  max_amount?: number;
  tenure_months?: number;
  limit?: number;
  start?: number;
}

export interface CreateLoanProductPayload {
  product_name: string;
  min_interest_rate: number;
  max_amount: number;
  tenure_months: number;
  max_interest_rate?: number;
  min_amount?: number;
  description?: string;
  image?: string;
  product_meta?: Array<{ meta_key: string; meta_value: string }>;
}

export interface UpdateLoanProductPayload {
  product_id: string;
  product_name?: string;
  min_interest_rate?: number;
  max_interest_rate?: number;
  min_amount?: number;
  max_amount?: number;
  tenure_months?: number;
  description?: string;
  image?: string;
  product_meta?: Array<{ meta_key: string; meta_value: string }>;
}

export interface CreateLoanProductCompoundInput {
  payload: CreateLoanProductPayload;
  categoryTermIds?: string[];
  tagTermIds?: string[];
  attributes?: Record<string, string[]>;
  refetchParams?: ListProductsParams;
}

export interface UpdateLoanProductCompoundInput {
  payload: UpdateLoanProductPayload;
  categoryTermIds?: string[];
  tagTermIds?: string[];
  attributes?: Record<string, string[]>;
  refetchParams?: ListProductsParams;
}

export interface ArchiveLoanProductInput {
  productId: string;
  refetchParams?: ListProductsParams;
}

export interface SetLoanProductStatusInput {
  productId: string;
  status: 'Draft' | 'Active' | 'Archived';
  refetchParams?: ListProductsParams;
}
