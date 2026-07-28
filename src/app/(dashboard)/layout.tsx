'use client';

import { DashboardHeader } from '@/components/header/DashboardHeader';
import Sidebar, { NavSection } from '@/components/Sidebar';
import FarmerSidebar from '@/components/siderbar/FarmerSidebar';
import { LayoutDashboard, ListChecks, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import '@/styles/main-layout.scss';

const navigationSections: NavSection[] = [
  {
    title: 'DASHBOARDS',
    items: [
      { 
        path: '/leads',
        activePaths: ['/leads', '/leads/new'],
        label: 'Leads Dashboard', 
        icon: Users 
      },
      { 
        path: '/loan-application-dashboard',
        activePaths: ['/loan-application-dashboard'],
        label: 'Loans Dashboard', 
        icon: LayoutDashboard 
      },
    ],
  },
  {
    title: 'WORKFLOW',
    items: [
      {
        path: '#', // Dynamically overridden in component
        label: 'New Loan Application',
        icon: ListChecks,
      },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/leads': 'Leads Pipeline',
  '/loans/new-loan-application': 'New Loan Application',
  '/leads/new': 'Create New Lead',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Dev Agent specific state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Farmer specific state
  const [isFarmerSidebarExpanded, setIsFarmerSidebarExpanded] = useState(true);

  const pathname = usePathname();

  // ----- DEV AGENT LOGIC -----
  const activeItem = navigationSections
    .flatMap((section) => section.items)
    .find((item) => 
      item.path === pathname || 
      item.activePaths?.includes(pathname) || 
      (item.label === 'New Loan Application' && pathname.endsWith('/new-loan-application'))
    );

  const pageTitle = activeItem?.label ?? PAGE_TITLES[pathname] ?? 'Dashboard';

  // Farmer branch derives its header title from the current path.
  let farmerHeaderTitle = 'Dashboard';
  if (pathname.startsWith('/discover-loans/apply')) {
    farmerHeaderTitle = 'New Loan Application';
  } else if (pathname.startsWith('/discover-loans')) {
    farmerHeaderTitle = 'Discover Loans';
  } else if (pathname.startsWith('/my-applications') || pathname.startsWith('/farmer-dashboard/applications')) {
    farmerHeaderTitle = 'My Applications';
  }

  // update the title of the page
  useEffect(() => {
    document.title = `${pageTitle} | Open AgriNet`;
  }, [pageTitle]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  function handleToggleSidebar() {
    if (window.innerWidth <= 900) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  }

  const filteredNavigationSections = navigationSections.map(section => {
    if (section.title === 'WORKFLOW') {
      return {
        ...section,
        items: section.items.map(item => ({
          ...item,
          path: pathname.endsWith('/new-loan-application') ? pathname : item.path
        }))
      };
    }
    return section;
  }).filter(section => {
    if (section.title === 'WORKFLOW') {
      return pathname.endsWith('/new-loan-application');
    }
    return true;
  });

  // ----- ROUTING LOGIC -----

  // Check if we should pass through without wrapper (Bank Admin / Agent / etc)
  if (
    pathname === '/dashboard' || 
    pathname === '/agent-dashboard' || 
    pathname === '/loan-products' || 
    pathname === '/agent-loan-products' || 
    pathname === '/product-approvals' || 
    pathname === '/kyc-compliance'
  ) {
    return <>{children}</>;
  }

  // Check if Dev Agent route
  const isDevAgentRoute = 
    pathname.startsWith('/leads') || 
    pathname.startsWith('/loan-application-dashboard') || 
    pathname.startsWith('/update-loan-application-status') || 
    pathname.startsWith('/loans/new-loan-application');

  if (isDevAgentRoute) {
    return (
      <div
        id="dashboard-shell"
        className={`dashboard-shell ${isSidebarCollapsed ? 'dashboard-shell--collapsed' : ''}`}
      >
        {isMobileOpen && (
          <div
            className="dashboard-sidebar-overlay"
            aria-hidden="true"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
        <Sidebar isCollapsed={isSidebarCollapsed} isMobileOpen={isMobileOpen} sections={filteredNavigationSections} />
        <main id="dashboard-main" className="dashboard-main">
          <DashboardHeader
            role="officer"
            onMenuClick={handleToggleSidebar}
            title={pageTitle}
          />
          <div id="dashboard-content" className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Default to Farmer Layout
  return (
    <div className="flex min-h-screen bg-[#F8F9fa] font-sans">
      <FarmerSidebar isExpanded={isFarmerSidebarExpanded} setIsExpanded={setIsFarmerSidebarExpanded} />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <DashboardHeader
          role="farmer"
          title={farmerHeaderTitle}
          subtitle="Farmer ID: ETH-2847"
          onMenuClick={() => setIsFarmerSidebarExpanded(!isFarmerSidebarExpanded)}
        />
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
