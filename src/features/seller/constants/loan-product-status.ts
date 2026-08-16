// The A2C Loan Product status field is a Select with exactly these options
// (a2c_loan_product.json: "Draft\nActive\nArchived"). Keeping the presentation
// for all three in one map means a new status can't silently inherit another
// one's colour — which is what happened when this was a Draft/not-Draft boolean
// and Archived products rendered in the same green as Active ones.
export type LoanProductStatus = 'Draft' | 'Active' | 'Archived';

interface StatusPresentation {
  /** Wording for the bank user, which is not always the raw status value. */
  label: string;
  /** Badge container classes (background + border + text). */
  badgeClasses: string;
  /** The small leading dot. */
  dotClasses: string;
}

export const LOAN_PRODUCT_STATUS_PRESENTATION: Record<LoanProductStatus, StatusPresentation> = {
  // Draft is "submitted, waiting for a Bank Admin to approve it" — amber reads
  // as "needs attention" rather than "finished".
  Draft: {
    label: 'Pending Approval',
    badgeClasses: 'bg-amber-50 border-amber-200 text-amber-700',
    dotClasses: 'bg-amber-500',
  },
  // Live in the marketplace and visible to farmers.
  Active: {
    label: 'Approved',
    badgeClasses: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dotClasses: 'bg-emerald-500',
  },
  // Withdrawn from the marketplace. Deliberately grey, not green: an archived
  // product accepts no new applications and must not read as a live one.
  Archived: {
    label: 'Archived',
    badgeClasses: 'bg-gray-100 border-gray-200 text-gray-600',
    dotClasses: 'bg-gray-400',
  },
};

const UNKNOWN_STATUS: StatusPresentation = {
  label: 'Unknown',
  badgeClasses: 'bg-gray-100 border-gray-200 text-gray-600',
  dotClasses: 'bg-gray-400',
};

/**
 * Presentation for a status coming off the wire.
 *
 * Falls back to a neutral "Unknown" badge rather than assuming the last known
 * status: if the backend adds a fourth option, showing it greyed and unnamed is
 * honest, whereas defaulting to green would claim a product is live when nobody
 * has checked whether it is.
 */
export function getLoanProductStatusPresentation(status: string | null | undefined): StatusPresentation {
  if (status && status in LOAN_PRODUCT_STATUS_PRESENTATION) {
    return LOAN_PRODUCT_STATUS_PRESENTATION[status as LoanProductStatus];
  }
  return UNKNOWN_STATUS;
}
