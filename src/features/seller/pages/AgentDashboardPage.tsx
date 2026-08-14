'use client';
import { DashboardHeader as DashboardTopNav } from '@/components/header/DashboardHeader';
import BankAgentSidebar from '@/components/siderbar/bankAgentSidebar';
import { DashboardHeader } from '@/features/seller/components/dashboard/DashboardHeader';
import { LoanApplicationsTable } from '@/features/seller/components/dashboard/LoanApplicationsTable';
import { MetricCards } from '@/features/seller/components/dashboard/MetricCards';
import { fetchDashboardStats, selectSellerStats } from '@/features/seller/store/loanProductsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';

export default function AgentDashboardPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectSellerStats);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <BankAgentSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopNav onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} />
        <main id="main-content" className="flex-1 p-8 overflow-y-auto">
          <div className="w-full mx-auto space-y-6">
            <DashboardHeader portalLabel="Bank Agent Portal - Loan Product Management" />
            <MetricCards
              totalProducts={stats?.total_products ?? 0}
              activeProducts={stats?.active_products ?? 0}
              totalApplicants={stats?.total_applications ?? 0}
              pendingLabel="Awaiting Admin Approvals"
              pendingValue={String(stats?.pending_applications ?? 0)}
            />
            <LoanApplicationsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
