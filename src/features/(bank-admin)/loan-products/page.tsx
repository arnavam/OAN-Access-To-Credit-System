'use client';
import { DashboardTopNav } from '@/components/header/bankAdminHeader';
import BankAdminSidebar from '@/components/siderbar/bankAdminSidebar';
import { useState } from 'react';
import { LoanProductsList } from './components/LoanProductsList';

export default function LoanProductsPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar */}
            <BankAdminSidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <DashboardTopNav onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)} title="Loan Products" />

                <main className="flex-1 p-8 overflow-y-auto">
                    <LoanProductsList />
                </main>
            </div>
        </div>
    );
}
