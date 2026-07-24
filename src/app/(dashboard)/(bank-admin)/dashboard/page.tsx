'use client';
import { useState } from 'react';
import BankAdminSidebar from '@/components/siderbar/bankAdminSidebar';
import { DashboardTopNav } from '@/components/header/bankAdminHeader';
import { DashboardHeader } from './components/DashboardHeader';
import { KycAlertBanner } from './components/KycAlertBanner';
import { MetricCards } from './components/MetricCards';
import { LoanApplicationsTable } from './components/LoanApplicationsTable';

export default function DashboardPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <BankAdminSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopNav onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="w-full mx-auto space-y-6">
            <DashboardHeader />
            <KycAlertBanner />
            <MetricCards />
            <LoanApplicationsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
