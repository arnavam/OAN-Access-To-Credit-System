'use client';

import { DashboardHeader } from '@/components/header/DashboardHeader';
import Sidebar, { NavSection } from '@/components/Sidebar';
import { selectAuthStatus } from '@/features/auth/store/authSlice';
import { useDashboardSidebar } from '@/hooks/useDashboardSidebar';
import { useAppSelector } from '@/store/hooks';
import { LayoutDashboard, Package, FileText, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

import '@/styles/main-layout.scss';

const navigationSections: NavSection[] = [
  {
    title: 'DASHBOARDS',
    items: [
      {
        path: '/agent-dashboard',
        activePaths: ['/agent-dashboard'],
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        path: '/agent-loan-products',
        activePaths: ['/agent-loan-products'],
        label: 'Loan Products',
        icon: Package,
      },
      {
        path: '/agent-application-lists',
        activePaths: ['/agent-application-lists'],
        label: 'Applications Lists',
        icon: FileText,
      },
      {
        path: '/loan-discovery',
        activePaths: ['/loan-discovery'],
        label: 'Loan Discovery',
        icon: Search,
      },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/agent-dashboard': 'Dashboard',
  '/agent-loan-products': 'Loan Products',
  '/agent-application-lists': 'Applications Lists',
  '/loan-discovery': 'Loan Discovery',
};

export default function BankAgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authStatus = useAppSelector(selectAuthStatus);
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useDashboardSidebar(pathname);

  const activeItem = navigationSections
    .flatMap(s => s.items)
    .find(item =>
      item.path === pathname ||
      item.activePaths?.includes(pathname)
    );

  const pageTitle = activeItem?.label ?? PAGE_TITLES[pathname] ?? 'Dashboard';

  useEffect(() => {
    document.title = `${pageTitle} | Open AgriNet`;
  }, [pageTitle]);

  // getMeThunk (dispatched on app mount) hasn't resolved yet — mounting the
  // dashboard chrome (which reads officerName off this same session) before
  // then risks it hydrating after the session resolves client-side but before
  // the server-rendered (unresolved) HTML is compared, which mismatches and
  // forces a client rebuild that flashes the generic role name. Matches the
  // same gate BankAdminLayout and DevAgentLayout use for the same reason.
  const authResolved = authStatus === 'succeeded' || authStatus === 'failed';

  if (!authResolved) {
    return null;
  }

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
        />
        {/* Keyed on the pathname so the enter animation replays on every
            navigation — the container itself lives in this layout and would
            otherwise only animate once, on first mount. Animating this element
            rather than a new wrapper keeps `.dashboard-content`'s flex gap
            applying directly to the page's own children. */}
        <div
          key={pathname}
          id="dashboard-content"
          className="dashboard-content animate-page-enter motion-reduce:animate-none"
        >
          {children}
        </div>
      </main>
    </div>
  );
}
