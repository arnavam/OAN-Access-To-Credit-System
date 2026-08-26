/**
 * The loan-product catalog, as `api/v1/farmer/catalog.py` describes it.
 *
 * These types live outside any one feature because two portals read the same
 * endpoint: the farmer browses every bank's Active products, and a bank user
 * gets the same payload scoped to their own bank (all statuses). Putting them
 * here is what lets `src/components/loan-catalog` be shared by both without a
 * cross-feature import.
 */

export interface CatalogProduct {
  name: string;
  product_name: string;
  slug: string;
  bank: string;
  bank_name?: string;
  bank_logo?: string | null;
  min_interest_rate?: number;
  max_interest_rate?: number;
  min_amount?: number;
  max_amount?: number;
  tenure_months?: number;
  image?: string | null;
  image_url?: string | null;
  /** The product's own category slug, e.g. `crop-input-loans`. */
  category?: string;
  /** Older shape of the same thing. Read both through `resolveCategory`. */
  categories?: string[];
  /**
   * Approval status, sent to bank callers. Absent for the farmer catalog, which
   * only ever lists Active products — so this is optional rather than the
   * `LoanProductStatus` union, and unrecognised values fall back to a neutral
   * badge rather than being assumed live.
   */
  status?: string;
  /** How many applications the product has attracted. Bank-facing. */
  applications_count?: number;
  /** Whether the calling farmer has bookmarked this product. Sent by the catalog
   *  endpoint so a reload does not reset every card to un-bookmarked. */
  is_saved?: boolean;
}

/**
 * The catalog sends a single `category` slug; earlier responses sent a
 * `categories` array. One reader for both, so a card never has to know which
 * shape it was handed.
 */
export function resolveCategory(product: CatalogProduct): string | undefined {
  return product.category ?? product.categories?.[0];
}

/** @deprecated Name kept for the farmer feature's existing imports. */
export type FarmerLoanProduct = CatalogProduct;

/** Sort keys the catalog endpoint accepts. Kept in step with _SORT_COLUMNS in
 *  api/v1/farmer/catalog.py — anything else is rejected by the schema. */
export type CatalogSortKey =
  | 'product_name'
  | 'interest_low_high'
  | 'interest_high_low'
  | 'amount_low_high'
  | 'amount_high_low'
  | 'tenure_low_high'
  | 'newest';

export interface CatalogCategoryFacet {
  name: string;
  count: number;
}

/** Filter options derived from the live catalog. Every entry is backed by at
 *  least one visible product, so the sidebar can only offer filters that return
 *  something. There is no region facet: a loan product has no region. */
export interface CatalogFacets {
  categories: CatalogCategoryFacet[];
  tenures: number[];
  amount_range: { min: number; max: number } | null;
  max_interest_rate: number | null;
}

export interface CatalogFilters {
  category?: string;
  /** One exact tenure, sent as both bounds of the endpoint's tenure range.
   *
   *  Single-valued, not a set: `list_catalog` filters tenure as a min/max span, so
   *  a multi-select of non-adjacent tenures cannot be expressed — the span between
   *  them would drag in every tenure the farmer did not tick. */
  tenure_months?: number;
  /** Amount bounds are the farmer's borrowing range, not the product's. The
   *  endpoint keeps any product whose own range overlaps this one. */
  min_amount?: number;
  max_amount?: number;
  /** Ceiling on the headline rate the card displays (min_interest_rate). */
  max_interest_rate?: number;
  /** Restrict the catalog to products this user has bookmarked.
   *
   *  Only ever true or absent. `is_saved=false` on the wire would read as "show
   *  me what I have *not* saved", which is not what an unticked box means — the
   *  key is deleted instead. */
  is_saved?: true;
}

/** Query accepted by `list_catalog`. */
export type CatalogQuery = CatalogFilters & {
  search?: string;
  limit?: number;
  start?: number;
  loan_product?: string;
  sort_by?: CatalogSortKey;
};

/**
 * Response envelopes for the catalog endpoints.
 *
 * Structurally identical to the farmer feature's `PaginatedResponse` /
 * `ApiResponse`, which is deliberate: the farmer code passes its own types
 * around and TypeScript's structural typing lets the two meet without either
 * side importing the other.
 */
export interface CatalogPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
}

export interface CatalogListResponse {
  data: { products: CatalogProduct[] };
  message: string;
  pagination: CatalogPagination;
}

export interface CatalogFacetsResponse {
  data: CatalogFacets;
  message: string;
}

/** The one call shape `CatalogBrowser` needs from whichever feature hosts it. */
export type CatalogFetcher = (params?: CatalogQuery) => Promise<CatalogListResponse>;
