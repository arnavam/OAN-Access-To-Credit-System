export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
}

export interface PaginatedResponse<T> {
  data: T;
  message: string;
  pagination: Pagination;
}

export interface ApiResponse<T = void> {
  data: T;
  message: string;
}

export interface FarmerLoanProduct {
  name: string;
  product_name: string;
  slug: string;
  bank: string;
  min_interest_rate?: number;
  max_interest_rate?: number;
  min_amount?: number;
  max_amount?: number;
  tenure_months?: number;
  /** Whether the calling farmer has bookmarked this product. Sent by the catalog
   *  endpoint so a reload does not reset every card to un-bookmarked. */
  is_saved?: boolean;
}

export interface FarmerLoanApplication {
  application_id: string;
  status: 'Draft' | 'Processing' | 'Approved' | 'Rejected';
  loan_amount: number;
  requested_amount: number;
  loan_product: string;
  loan_product_name: string;
  bank: string;
  creation: string;
  loan_reason?: string;
}

/** Shape returned by api.v1.farmer.dashboard.get_dashboard_summary.
 *
 *  `farmer_profile` comes back as an empty object until a consent binds an
 *  A2C Farmer Profile to the account, so it is optional rather than nullable —
 *  an unbound farmer is a normal state, not an error. */
/** Copied straight from A2C Farmer Profile. Every field is nullable because a
 *  profile created from a partial consent payload may not carry all of them —
 *  the card renders what is there rather than substituting a default. */
export interface FarmerDashboardProfile {
  first_name?: string | null;
  last_name?: string | null;
  farmer_id?: string | null;
  region?: string | null;
  woreda?: string | null;
  kebele?: string | null;
  farmland_size_hectares?: number | null;
  land_ownership_status?: string | null;
  source_of_income?: string | null;
}

export interface FarmerDashboardOffer {
  id: string;
  bank: string;
  loan_product_name: string;
  max_loan_amount: number;
  interest_rate: number;
  max_tenure_months: number;
}

export interface FarmerDashboardApplication {
  application_id: string;
  bank: string;
  loan_product_name: string;
  requested_amount: number;
  status: string;
  creation: string;
}

export interface FarmerDashboardSummary {
  farmer_profile?: FarmerDashboardProfile;
  top_loan_offers: FarmerDashboardOffer[];
  available_loan_types: string[];
  recent_applications: FarmerDashboardApplication[];
}

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
  /** Exact tenures, one per chip the farmer selected. The catalog endpoint
   *  matches these exactly; as an upper bound, picking the longest tenure on
   *  offer matched the whole catalog and read as the filter being ignored. */
  tenure_months?: number[];
  /** Amount bounds are the farmer's borrowing range, not the product's. The
   *  endpoint keeps any product whose own range overlaps this one. */
  min_amount?: number;
  max_amount?: number;
  /** Ceiling on the headline rate the card displays (min_interest_rate). */
  max_interest_rate?: number;
}

export interface CreateApplicationPayload {
  loan_product: string;
  requested_amount: number;
  loan_reason?: string;
}

export interface UpdateApplicationPayload {
  application_id: string;
  requested_amount?: number;
  loan_reason?: string;
}

/**
 * The lead a self-applying farmer's consent step is anchored on, plus where that
 * consent already stands so re-entering the flow resumes instead of restarting.
 *
 * A lead is required because every endpoint in the consent API takes a lead_id —
 * the same ones the Development Agent drives. The farmer has no lead of their own
 * until this is called, and cannot derive one from their A2C Farmer Profile,
 * because completing consent is what creates that profile.
 */
export interface FarmerConsentContext {
  lead_id: string;
  consent_request: string | null;
  consent_status: string | null;
  otp_verified: boolean;
  consent_completed: boolean;
}
