"use client";
import { PanelLoader } from '@/components/ui/Loader';
import { logger } from '@/lib/logger';
import { useCallback, useEffect, useState } from 'react';
import { getMyApplications } from '../api/farmerApi';
import type { FarmerLoanApplication } from '../types';
import ApplicationList from './components/ApplicationList';
import ApplicationSummary from './components/ApplicationSummary';

export type TabType = 'total' | 'Draft' | 'Processing' | 'Approved' | 'Rejected';

export default function MyApplicationsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('total');
    const [applications, setApplications] = useState<FarmerLoanApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // A swallowed failure rendered as "no applications", which for someone who
    // has applied is not a neutral message — it is the app telling them their
    // application is gone.
    const [loadFailed, setLoadFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const retry = useCallback(() => setAttempt((n) => n + 1), []);

    useEffect(() => {
        let isMounted = true;
        const fetchApps = async () => {
            setIsLoading(true);
            setLoadFailed(false);
            try {
                const res = await getMyApplications();
                if (isMounted && res.data) {
                    setApplications(res.data);
                }
            } catch (e) {
                logger.error('Failed to load farmer applications', e);
                if (isMounted) setLoadFailed(true);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchApps();
        return () => { isMounted = false; };
    }, [attempt]);

    return (
        <div className="w-full mx-auto pb-8">
            <div className="bg-white p-6 mb-8 border border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-xl">
                <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
            </div>

            {isLoading ? (
                <PanelLoader label="Loading your applications…" />
            ) : loadFailed ? (
                <div className="bg-white rounded-2xl p-10 border border-[#F1F3F4] flex flex-col items-center text-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">We could not load your applications</h2>
                    <p className="text-[15px] text-gray-500 max-w-sm leading-relaxed">
                        This is a problem on our side, not with your applications. Please try again.
                    </p>
                    <button
                        onClick={retry}
                        className="mt-2 bg-[#16A34A] hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
                    >
                        Try again
                    </button>
                </div>
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
