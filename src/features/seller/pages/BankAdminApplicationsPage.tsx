'use client';
// Same list the Bank Agent portal renders, under the admin's own chrome. The
// endpoint behind it (`get_all_loans`) is bank-scoped server-side and hides
// Draft applications from every bank role, so an admin sees exactly its own
// bank's submitted applications — no admin-specific variant is needed here.
import AgentApplicationListClient from '@/app/(dashboard)/(bank-agent)/agent-application-lists/components/AgentApplicationListClient';
import { DashboardHeader } from '@/components/header/DashboardHeader';
import BankAdminSidebar from '@/components/siderbar/bankAdminSidebar';
import { useState } from 'react';

export default function BankAdminApplicationsPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <BankAdminSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} title="Applications Lists" />
        <main id="main-content" className="flex-1 p-8 overflow-y-auto">
          <AgentApplicationListClient />
        </main>
      </div>
    </div>
  );
}
