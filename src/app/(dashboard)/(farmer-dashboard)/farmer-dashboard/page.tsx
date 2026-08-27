'use client';

import { DiscoverLoansCta } from '@/components/DiscoverLoansCta';
import { MotionEffects } from '@/components/motion/MotionEffect';
import { PanelLoader } from '@/components/ui/Loader';
import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import AvailableLoanTypes from './components/AvailableLoanTypes';
import FarmerProfileCard from './components/FarmerProfileCard';
import RecentApplicationsList from './components/RecentApplicationsList';
import TopLoanOffersCard, { type TopOffer } from './components/TopLoanOffersCard';
import { getCatalog, getDashboardSummary } from '@/features/(farmer-application)/api/farmerApi';
import type { FarmerDashboardSummary } from '@/features/(farmer-application)/types';

export default function FarmerDashboard() {
  const [data, setData] = useState<FarmerDashboardSummary | null>(null);
  const [offers, setOffers] = useState<TopOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const [summaryResult, catalogResult] = await Promise.allSettled([
          getDashboardSummary(),
          getCatalog({ sort_by: 'newest', limit: 5 }),
        ]);

        if (!isMounted) return;

        if (summaryResult.status === 'fulfilled' && summaryResult.value.data) {
          setData(summaryResult.value.data);
          if (summaryResult.value.data.top_loan_offers?.length) {
            setOffers(summaryResult.value.data.top_loan_offers);
          }
        } else if (summaryResult.status === 'rejected') {
          logger.error('Failed to load dashboard summary', summaryResult.reason);
        }

        // If dashboard summary did not provide top offers, feed from latest catalog products
        if (catalogResult.status === 'fulfilled' && catalogResult.value.data?.products) {
          const products = catalogResult.value.data.products;
          if (products.length > 0) {
            setOffers((existing) => {
              if (existing.length > 0) return existing;
              return products.map((p) => ({
                id: p.name,
                bank: p.bank_name || p.bank,
                bank_logo: p.bank_logo,
                loan_product_name: p.product_name,
                max_loan_amount: p.max_amount ?? 0,
                interest_rate: p.min_interest_rate ?? 0,
                max_tenure_months: p.tenure_months ?? 0,
              }));
            });
          }
        } else if (catalogResult.status === 'rejected') {
          logger.error('Failed to load latest loan products from catalog', catalogResult.reason);
        }
      } catch (error) {
        logger.error('Unexpected error loading farmer dashboard data', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
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
            <TopLoanOffersCard offers={offers} />
          </div>
        </div>

        {/* The way into the catalogue. Sits directly under the loan types so the
            row that shows what is on offer is followed by the way to browse it. */}
        <DiscoverLoansCta href="/discover-loans" />

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
