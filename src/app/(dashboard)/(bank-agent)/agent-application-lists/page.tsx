'use client';
import { DashboardHeader as DashboardTopNav } from '@/components/header/DashboardHeader';
import BankAgentSidebar from '@/components/siderbar/bankAgentSidebar';
import { useState } from 'react';
import AgentApplicationListClient from './components/AgentApplicationListClient';

export default function AgentApplicationListsPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <BankAgentSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopNav title="Application Lists" onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} />
        <main id="main-content" className="flex-1 p-8 overflow-y-auto">
          <AgentApplicationListClient />
        </main>
      </div>
    </div>
  );
}
