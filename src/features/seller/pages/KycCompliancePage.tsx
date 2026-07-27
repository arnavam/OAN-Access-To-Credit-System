'use client';
import { DashboardTopNav } from '@/components/header/bankAdminHeader';
import BankAdminSidebar from '@/components/siderbar/bankAdminSidebar';
import { KycComplianceContent } from '@/features/seller/components/kyc-compliance/KycComplianceContent';
import { useState } from 'react';

export default function KycCompliancePage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <BankAdminSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopNav onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} title="KYC & Compliance" />
        <main className="flex-1 p-8 overflow-y-auto">
          <KycComplianceContent />
        </main>
      </div>
    </div>
  );
}
