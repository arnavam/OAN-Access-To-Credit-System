'use client';
import { DashboardHeader } from '@/components/header/DashboardHeader';
import BankAgentSidebar from '@/components/siderbar/bankAgentSidebar';
import { LoanProductsList } from '@/features/seller/components/loan-products/LoanProductsList';
import { useState } from 'react';

export default function AgentLoanProductsPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <BankAgentSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} title="Loan Products" />
        <main id="main-content" className="flex-1 p-8 overflow-y-auto">
          <LoanProductsList portalLabel="Bank Agent Portal - Loan Product Management" />
        </main>
      </div>
    </div>
  );
}
