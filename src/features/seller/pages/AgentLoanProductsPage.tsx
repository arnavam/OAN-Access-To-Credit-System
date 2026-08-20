'use client';
import { LoanProductsList } from '@/features/seller/components/loan-products/LoanProductsList';

export default function AgentLoanProductsPage() {
  return (
    <div className="w-full h-full p-8">
      <LoanProductsList portalLabel="Bank Agent Portal - Loan Product Management" canDelete={false} />
    </div>
  );
}
