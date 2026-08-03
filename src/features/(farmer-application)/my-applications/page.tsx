"use client";
import { useState } from 'react';
import ApplicationList from './components/ApplicationList';
import ApplicationSummary from './components/ApplicationSummary';

export type TabType = 'total' | 'review' | 'disbursed' | 'rejected';

export default function MyApplicationsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('total');

    return (
        <div className="w-full mx-auto pb-8">
            <div className="bg-white p-6 mb-8 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
                <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
            </div>

            <ApplicationSummary activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as TabType)} />

            <ApplicationList activeTab={activeTab} onTabChange={(tab: string) => setActiveTab(tab as TabType)} />
        </div>
    );
}
