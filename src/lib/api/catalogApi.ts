import { fetchApi } from '@/lib/api/fetchApi';
import type {
  CatalogFacetsResponse,
  CatalogListResponse,
  CatalogQuery,
} from '@/types/loan-catalog';

/**
 * The loan-product catalog.
 *
 * One endpoint, two audiences: a farmer gets the Active products of every bank,
 * and a bank user gets their own bank's products across every status. The
 * scoping is decided server-side from the session, so there is no bank
 * parameter to pass here — which is also why this lives in lib rather than in
 * either portal's feature.
 */
export async function getCatalog(params: CatalogQuery = {}): Promise<CatalogListResponse> {
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
 *
 * Catalog-wide: unlike `getCatalog`, this has no bank dimension, so a bank-side
 * view must not use it — it would offer other banks' tenures and amount ranges
 * and filter the bank's own list to nothing. Those views derive their options
 * from their own products instead (`deriveCatalogFacets`).
 */
export async function getCatalogFacets(): Promise<CatalogFacetsResponse> {
  return fetchApi('oan_a2c.api.v1.farmer.catalog.get_catalog_facets');
}
