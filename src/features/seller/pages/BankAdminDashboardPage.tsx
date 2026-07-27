'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import { DashboardTopNav } from '@/components/header/bankAdminHeader';
import BankAdminSidebar from '@/components/siderbar/bankAdminSidebar';
import { DashboardHeader } from '@/features/seller/components/dashboard/DashboardHeader';
import { KycAlertBanner } from '@/features/seller/components/dashboard/KycAlertBanner';
import { LoanApplicationsTable } from '@/features/seller/components/dashboard/LoanApplicationsTable';
import { MetricCards } from '@/features/seller/components/dashboard/MetricCards';
import { fetchDashboardStats, selectSellerStats } from '@/features/seller/store/loanProductsSlice';

export default function BankAdminDashboardPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector(selectSellerStats);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <BankAdminSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopNav onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="w-full mx-auto space-y-6">
            <DashboardHeader portalLabel="Bank Admin Portal - Loan Product Management" />
            <KycAlertBanner />
            <MetricCards
              totalApplicants={stats?.total_applications ?? 0}
              pendingLabel="Pending Approvals"
              pendingValue={String(stats?.pending_applications ?? 0)}
            />
            <LoanApplicationsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
