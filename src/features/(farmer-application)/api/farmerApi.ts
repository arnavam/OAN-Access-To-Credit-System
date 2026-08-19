import { fetchApi } from '@/lib/api/fetchApi';
import type {
  CreateApplicationPayload,
  FarmerLoanApplication,
  CatalogFacets,
  CatalogFilters,
  CatalogSortKey,
  FarmerDashboardSummary,
  FarmerLoanProduct,
  PaginatedResponse,
  UpdateApplicationPayload,
  FarmerConsentContext,
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
  // Comma-separated: the sidebar's tenure chips are a multi-select and the
  // endpoint matches the listed months exactly.
  if (params.tenure_months?.length) query.append('tenure_months', params.tenure_months.join(','));
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
 * Shared in-flight promise, so overlapping callers await one request instead of
 * racing. React invokes effects twice in development, which sent two of these
 * concurrently — and on a farmer's first ever call both would try to create the
 * lead. The server serialises that safely now, but making the loser wait out a
 * lock to be told what the winner already knew is pure latency.
 *
 * Deliberately not a cache: it is cleared as soon as the request settles, so a
 * later visit still re-reads consent status rather than trusting a stale one.
 */
let inFlightConsentStart: Promise<ApiResponse<FarmerConsentContext>> | null = null;

/**
 * Resolves (creating on first call) the lead the farmer's consent runs against.
 *
 * Idempotent server-side too: repeat calls return the same lead, so revisiting
 * the apply page does not strand a trail of empty leads or re-request consent
 * that is already approved and still valid.
 */
export async function startConsent(): Promise<ApiResponse<FarmerConsentContext>> {
  if (inFlightConsentStart) return inFlightConsentStart;

  const request = fetchApi('oan_a2c.api.v1.farmer.consent.start_consent', {
    method: 'POST',
    body: JSON.stringify({}),
  }) as Promise<ApiResponse<FarmerConsentContext>>;

  inFlightConsentStart = request;
  try {
    return await request;
  } finally {
    inFlightConsentStart = null;
  }
}
