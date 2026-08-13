'use client';

import { DashboardHeader } from '@/components/header/DashboardHeader';
import FarmerSidebar from '@/components/siderbar/FarmerSidebar';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

function getFarmerPageTitle(pathname: string): string {
  if (pathname.startsWith('/discover-loans/apply')) return 'New Loan Application';
  if (pathname.startsWith('/discover-loans')) return 'Discover Loans';
  if (pathname.startsWith('/my-applications')) return 'My Applications';
  return 'Dashboard';
}

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F8F9fa] font-sans">
      <FarmerSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <DashboardHeader
          title={getFarmerPageTitle(pathname)}
          subtitle="Farmer ID: ETH-2847"
          onMenuClick={() => setIsSidebarExpanded(prev => !prev)}
        />
        <main id="main-content" className="flex-1 p-6 md:p-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
