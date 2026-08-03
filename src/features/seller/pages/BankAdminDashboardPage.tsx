'use client';
import { DashboardHeader as DashboardTopNav } from '@/components/header/DashboardHeader';
import BankAdminSidebar from '@/components/siderbar/bankAdminSidebar';
import { DashboardHeader } from '@/features/seller/components/dashboard/DashboardHeader';
import { KycAlertBanner } from '@/features/seller/components/dashboard/KycAlertBanner';
import { LoanApplicationsTable } from '@/features/seller/components/dashboard/LoanApplicationsTable';
import { MetricCards } from '@/features/seller/components/dashboard/MetricCards';
import { fetchDashboardStats, selectSellerStats } from '@/features/seller/store/loanProductsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';

export default function BankAdminDashboardPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectSellerStats);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    // Loan fetching (with active filters) is owned by <LoanApplicationsTable/>.
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <BankAdminSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopNav role="bank-admin" onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="w-full mx-auto space-y-6">
            <DashboardHeader portalLabel="Bank Admin Portal - Loan Product Management" />
            <KycAlertBanner />
            <MetricCards
              totalProducts={stats?.total_products ?? 0}
              activeProducts={stats?.active_products ?? 0}
              totalApplicants={stats?.total_applications ?? 0}
              pendingLabel="Pending Approvals"
              pendingValue={String(stats?.pending_products ?? 0)}
            />
            <LoanApplicationsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
