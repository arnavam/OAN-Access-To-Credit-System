import { fetchApi } from '@/lib/api/fetchApi';
import type {
  CreateApplicationPayload,
  FarmerLoanApplication,
  CatalogFacets,
  CatalogFilters,
  CatalogSortKey,
  FarmerDashboardSummary,
  FarmerLoanProduct,
  DetailedLoanProduct,
  BankDetails,
  PaginatedResponse,
  UpdateApplicationPayload,
  ApiResponse,
} from '../types';

/**
 * Retrieves the catalog of active loan products available to the farmer.
 */
export async function getCatalog(
  params: CatalogFilters & {
    search?: string;
    limit?: number;
    start?: number;
    loan_product?: string;
    sort_by?: CatalogSortKey;
  } = {}
): Promise<PaginatedResponse<{ products: FarmerLoanProduct[] }>> {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.min_amount !== undefined) query.append('min_amount', params.min_amount.toString());
  if (params.max_amount !== undefined) query.append('max_amount', params.max_amount.toString());
  if (params.max_interest_rate !== undefined) query.append('max_interest_rate', params.max_interest_rate.toString());
  // `min_tenure_months`/`max_tenure_months` — the only tenure params
  // ListCatalogSchema accepts. This used to send a comma-separated `tenure_months`,
  // which the schema has no field for, so pydantic dropped it and the chips filtered
  // nothing. One exact tenure is the same value on both bounds.
  if (params.tenure_months !== undefined) {
    query.append('min_tenure_months', params.tenure_months.toString());
    query.append('max_tenure_months', params.tenure_months.toString());
  }
  if (params.category) query.append('category', params.category);
  if (params.sort_by) query.append('sort_by', params.sort_by);
  if (params.limit !== undefined) query.append('limit', params.limit.toString());
  if (params.start !== undefined) query.append('start', params.start.toString());
  if (params.loan_product) query.append('loan_product', params.loan_product);

  return fetchApi(`oan_a2c.api.v1.farmer.catalog.list_catalog?${query.toString()}`);
}

/**
 * Filter options for the discovery sidebar, derived from the live catalog.
 *
 * Fetched rather than hardcoded so the sidebar can never offer a filter that
 * matches nothing — and never offers one the catalog endpoint cannot apply.
 */
export async function getCatalogFacets(): Promise<ApiResponse<CatalogFacets>> {
  return fetchApi('oan_a2c.api.v1.farmer.catalog.get_catalog_facets');
}

/**
 * Retrieves the farmer's bookmarked/saved products.
 */
export async function getSavedProducts(
  params: { limit?: number; start?: number } = {}
): Promise<PaginatedResponse<{ products: FarmerLoanProduct[] }>> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) query.append('limit', params.limit.toString());
  if (params.start !== undefined) query.append('start', params.start.toString());

  return fetchApi(`oan_a2c.api.v1.farmer.catalog.get_saved_products?${query.toString()}`);
}

/**
 * Bookmarks a product for the farmer.
 */
export async function saveBookmark(loan_product: string): Promise<ApiResponse> {
  return fetchApi('oan_a2c.api.v1.farmer.catalog.save_product', {
    method: 'POST',
    body: JSON.stringify({ loan_product }),
  });
}

/**
 * Removes a bookmark for the farmer.
 */
export async function removeBookmark(loan_product: string): Promise<ApiResponse> {
  return fetchApi('oan_a2c.api.v1.farmer.catalog.unsave_product', {
    method: 'POST',
    body: JSON.stringify({ loan_product }),
  });
}

/**
 * Retrieves a list of applications owned by the farmer.
 */
export async function getMyApplications(
  params: { status?: string; page?: number; page_size?: number } = {}
): Promise<PaginatedResponse<FarmerLoanApplication[]>> {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.page !== undefined) query.append('page', params.page.toString());
  if (params.page_size !== undefined) query.append('page_size', params.page_size.toString());

  return fetchApi(`oan_a2c.api.v1.farmer.applications.list_applications?${query.toString()}`);
}

/**
 * Retrieves a single application by application_id.
 */
export async function getApplication(application_id: string): Promise<ApiResponse<FarmerLoanApplication>> {
  return fetchApi(`oan_a2c.api.v1.farmer.applications.get_application?application_id=${encodeURIComponent(application_id)}`);
}

/**
 * Creates a new Draft application.
 */
export async function startApplication(
  data: CreateApplicationPayload
): Promise<ApiResponse<{ application_id: string }>> {
  return fetchApi('oan_a2c.api.v1.farmer.applications.create_application', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Updates an existing Draft application.
 */
export async function updateApplication(
  data: UpdateApplicationPayload
): Promise<ApiResponse> {
  return fetchApi('oan_a2c.api.v1.farmer.applications.update_application', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Submits an application to the bank (Draft -> Processing).
 */
export async function submitApplication(application_id: string): Promise<ApiResponse> {
  return fetchApi('oan_a2c.api.v1.farmer.applications.submit_application', {
    method: 'POST',
    body: JSON.stringify({ application_id }),
  });
}

/**
 * Fetches dashboard summary for the farmer.
 */
export async function getDashboardSummary(): Promise<ApiResponse<FarmerDashboardSummary>> {
  return fetchApi('oan_a2c.api.v1.farmer.dashboard.get_dashboard_summary');
}

/**
 * Retrieves detailed information for a loan product.
 */
export async function getProduct(productId: string): Promise<ApiResponse<{ product: DetailedLoanProduct }>> {
  return fetchApi(`oan_a2c.api.v1.seller.loan_products.get_product?product_id=${encodeURIComponent(productId)}`);
}

/**
 * Retrieves bank storefront details and branding.
 */
export async function getBankDetails(bank: string): Promise<ApiResponse<BankDetails>> {
  return fetchApi(`oan_a2c.api.v1.farmer.catalog.get_bank_details?bank=${encodeURIComponent(bank)}`);
}


