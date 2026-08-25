/**
 * Loan term display helpers.
 *
 * The implementations moved to `@/lib/loanFormat` so the shared `ProductCard`
 * — which now renders the bank's catalogue as well as the farmer's — can reach
 * them without importing from this feature. Re-exported here so the existing
 * farmer-side call sites keep their short relative import.
 */
export { NO_VALUE, formatAmount, formatRate, formatRateRange, formatTenure } from '@/lib/loanFormat';
