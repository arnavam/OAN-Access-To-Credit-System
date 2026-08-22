'use client';
import { LoanProductsList } from '@/features/seller/components/loan-products/LoanProductsList';

export default function AgentLoanProductsPage() {
  return <LoanProductsList portalLabel="Bank Agent Portal - Loan Product Management" canDelete={false} />;
}
