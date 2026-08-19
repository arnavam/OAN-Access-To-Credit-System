"use client";
import { useEffect, useState } from 'react';
import { getMyApplications } from '../api/farmerApi';
import type { FarmerLoanApplication } from '../types';
import ApplicationList from './components/ApplicationList';
import ApplicationSummary from './components/ApplicationSummary';

export type TabType = 'total' | 'Draft' | 'Processing' | 'Approved' | 'Rejected';

export default function MyApplicationsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('total');
    const [applications, setApplications] = useState<FarmerLoanApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchApps = async () => {
            setIsLoading(true);
            try {
                const res = await getMyApplications();
                if (isMounted && res.data) {
                    setApplications(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchApps();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="w-full mx-auto pb-8">
            <div className="bg-white p-6 mb-8 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
                <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
            </div>

            {isLoading ? (
                <div className="py-20 text-center">Loading applications...</div>
            ) : (
                <>
                    <ApplicationSummary 
                        activeTab={activeTab} 
                        onTabChange={(tab: string) => setActiveTab(tab as TabType)} 
                        applications={applications}
                    />
                    <ApplicationList 
                        activeTab={activeTab} 
                        onTabChange={(tab: string) => setActiveTab(tab as TabType)} 
                        applications={applications}
                    />
                </>
            )}
        </div>
    );
}
