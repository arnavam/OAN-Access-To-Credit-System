'use client';

import { DashboardHeader } from '@/components/header/DashboardHeader';
import Sidebar, { NavSection } from '@/components/Sidebar';
import { selectAuthStatus } from '@/features/auth/store/authSlice';
import { useDashboardSidebar } from '@/hooks/useDashboardSidebar';
import { useAppSelector } from '@/store/hooks';
import { Users, FileText, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

import '@/styles/main-layout.scss';

const navigationSections: NavSection[] = [
  {
    title: 'DASHBOARDS',
    items: [
      {
        path: '/leads',
        activePaths: ['/leads', '/leads/new'],
        label: 'Leads Dashboard',
        icon: Users,
      },
      {
        path: '/loan-discovery',
        activePaths: ['/loan-discovery'],
        label: 'Loan Discovery',
        icon: Search,
      },
      {
        path: '/dev-application-lists',
        activePaths: ['/dev-application-lists'],
        label: 'Application Lists',
        icon: FileText,
      },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/leads': 'Leads Pipeline',
  '/leads/new': 'Create New Lead',
};

export default function DevAgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authStatus = useAppSelector(selectAuthStatus);
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useDashboardSidebar(pathname);

  // getMeThunk (dispatched on app mount) hasn't resolved yet — mounting
  // DashboardHeader before then risks it hydrating after the session resolves
  // client-side but before the server-rendered (unresolved) HTML is compared,
  // which mismatches and forces a client rebuild that flashes the generic role
  // name. Matches the same gate BankAdminLayout uses for the same reason.
  const authResolved = authStatus === 'succeeded' || authStatus === 'failed';

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
