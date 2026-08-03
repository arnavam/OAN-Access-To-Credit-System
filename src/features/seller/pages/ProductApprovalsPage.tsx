'use client';
import { DashboardHeader } from '@/components/header/DashboardHeader';
import BankAdminSidebar from '@/components/siderbar/bankAdminSidebar';
import { ProductApprovalsList } from '@/features/seller/components/product-approvals/ProductApprovalsList';
import { useState } from 'react';

export default function ProductApprovalsPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <BankAdminSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader role="bank-admin" onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} title="Product Approvals" />
        <main className="flex-1 p-8 overflow-y-auto">
          <ProductApprovalsList />
        </main>
      </div>
    </div>
  );
}
