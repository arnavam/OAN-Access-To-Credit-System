// Loan-term formatting is shared with the bank portals' catalog view, so the
// helpers live in lib. Re-exported here so this feature's existing imports of
// `../../format` keep working.
export { NO_VALUE, formatAmount, formatRate, formatTenure } from '@/lib/format/loanTerms';
