'use client';

import { MotionEffects } from '@/components/motion/MotionEffect';
import { PanelLoader } from '@/components/ui/Loader';
import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import AvailableLoanTypes from './components/AvailableLoanTypes';
import FarmerProfileCard from './components/FarmerProfileCard';
import RecentApplicationsList from './components/RecentApplicationsList';
import TopLoanOffersCard from './components/TopLoanOffersCard';
import { getDashboardSummary } from '@/features/(farmer-application)/api/farmerApi';
import type { FarmerDashboardSummary } from '@/features/(farmer-application)/types';

export default function FarmerDashboard() {
  const [data, setData] = useState<FarmerDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const response = await getDashboardSummary();
        if (isMounted && response.data) {
          setData(response.data);
        }
      } catch (error) {
        // Shared logger, not console — see the logging rule in .agents/project-structure.md.
        logger.error('Failed to load dashboard summary', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDashboard();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return <PanelLoader label="Loading your dashboard…" />;
  }

  return (
    <div className="space-y-6">
      {/* Each row arrives just after the one above it. `MotionEffects` gives each
          child its own wrapper, so they stay direct children of this container
          and `space-y-6` keeps applying between them. */}
      <MotionEffects slide={{ direction: 'up', offset: 12 }} stagger={80}>
        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FarmerProfileCard profile={data?.farmer_profile} />
          </div>
          <div className="lg:col-span-1">
            <TopLoanOffersCard offers={data?.top_loan_offers || []} />
          </div>
        </div>

        {/* Middle Row */}
        <AvailableLoanTypes types={data?.available_loan_types || []} />

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <RecentApplicationsList applications={data?.recent_applications || []} />
          </div>
        </div>
      </MotionEffects>
    </div>
  );
}
