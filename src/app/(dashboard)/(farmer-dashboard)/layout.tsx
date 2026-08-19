'use client';

import { DashboardHeader } from '@/components/header/DashboardHeader';
import Sidebar, { NavSection } from '@/components/Sidebar';
import { useDashboardSidebar } from '@/hooks/useDashboardSidebar';
import { LayoutDashboard, Search, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

import '@/styles/main-layout.scss';

const navigationSections: NavSection[] = [
  {
    title: 'DASHBOARDS',
    items: [
      {
        path: '/farmer-dashboard',
        activePaths: ['/farmer-dashboard'],
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        path: '/discover-loans',
        activePaths: ['/discover-loans', '/discover-loans/apply'],
        label: 'Discover Loans',
        icon: Search,
      },
      {
        path: '/my-applications',
        activePaths: ['/my-applications'],
        label: 'My Applications',
        icon: FileText,
      },
    ],
  },
];

function getFarmerPageTitle(pathname: string): string {
  if (pathname.startsWith('/discover-loans/apply')) return 'New Loan Application';
  if (pathname.startsWith('/discover-loans')) return 'Discover Loans';
  if (pathname.startsWith('/my-applications')) return 'My Applications';
  return 'Dashboard';
}

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useDashboardSidebar(pathname);

  const pageTitle = getFarmerPageTitle(pathname);

  useEffect(() => {
    document.title = `${pageTitle} | Open AgriNet`;
  }, [pageTitle]);

  return (
    <div
      id="dashboard-shell"
      className={`dashboard-shell ${isCollapsed ? 'dashboard-shell--collapsed' : ''}`}
    >
      {isMobileOpen && (
        <div
          className="dashboard-sidebar-overlay"
          aria-hidden="true"
          onClick={closeMobile}
        />
      )}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        sections={navigationSections}
      />
      <main id="dashboard-main" className="dashboard-main">
        <DashboardHeader
          onMenuClick={toggle}
          title={pageTitle}
          subtitle="Farmer ID: ETH-2847"
        />
        <div id="dashboard-content" className="dashboard-content">
          {/* Keyed on the pathname so the enter animation replays on every
              navigation, not just on first mount. */}
          <div key={pathname} className="p-6 md:p-10 animate-page-enter motion-reduce:animate-none">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
