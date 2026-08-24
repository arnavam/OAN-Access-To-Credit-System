import type { FarmerLoanApplication } from '../types';

export type ApplicationTab = 'total' | 'Draft' | 'Under Review' | 'Disbursed' | 'Rejected';

export type ApplicationCounts = Record<ApplicationTab, number>;

/**
 * Per-status totals for the summary cards and the tab pills.
 *
 * One pass, one definition. Both components used to re-derive these with four
 * `filter(...).length` calls each — eight scans of the same array, and two places
 * to update when a status is added.
 */
export function countByStatus(applications: FarmerLoanApplication[]): ApplicationCounts {
  const counts: ApplicationCounts = {
    total: applications.length,
    Draft: 0,
    'Under Review': 0,
    Disbursed: 0,
    Rejected: 0,
  };
  for (const application of applications) {
    const status = application.status as ApplicationTab;
    if (counts[status] === undefined) {
      counts[status] = 0;
    }
    counts[status] += 1;
  }
  return counts;
}
