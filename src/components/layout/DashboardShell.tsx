'use client';

import { DashboardHeader } from '@/components/header/DashboardHeader';
import Sidebar, { NavSection } from '@/components/Sidebar';
import { useDashboardSidebar } from '@/hooks/useDashboardSidebar';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

import '@/styles/main-layout.scss';

interface DashboardShellProps {
  /** Nav for this portal. Build it per role; the chrome around it is the same. */
  sections: NavSection[];
  /** Header title and the `<title>` suffix. */
  pageTitle: string;
  children: React.ReactNode;
  /**
   * Farmer portal only. When set, the page is wrapped in its own padded box
   * instead of being laid out directly by `#dashboard-content`. The other
   * portals rely on that element's flex gap applying to the page's own
   * children, so they must not get an extra wrapper.
   */
  innerContentClassName?: string;
}

/**
 * The chrome every signed-in portal renders: sidebar, header, animated content
 * area, and the mobile drawer overlay.
 *
 * The bank-agent, dev-agent and farmer layouts each held a copy of this, and the
 * bank-admin portal had no layout shell at all — its five pages each hand-rolled
 * `useState` + a private sidebar + a header, which is why it was the one portal
 * without a mobile drawer or an active-page indicator. One shell now, so the
 * portals can only differ where they are meant to: their nav.
 *
 * No local auth gate here. `AuthBootstrapGate` (mounted in app/providers.tsx)
 * already holds the first paint of every protected route until getMe settles.
 */
export function DashboardShell({
  sections,
  pageTitle,
  children,
  innerContentClassName,
}: DashboardShellProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useDashboardSidebar(pathname);

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
        sections={sections}
      />
      <main id="dashboard-main" className="dashboard-main">
        <DashboardHeader onMenuClick={toggle} title={pageTitle} />
        {/* Keyed on the pathname so the enter animation replays on every
            navigation — the container lives in the layout and would otherwise
            only animate once, on first mount. */}
        {innerContentClassName ? (
          <div id="dashboard-content" className="dashboard-content">
            <div key={pathname} className={`${innerContentClassName} animate-page-enter motion-reduce:animate-none`}>
              {children}
            </div>
          </div>
        ) : (
          <div
            key={pathname}
            id="dashboard-content"
            className="dashboard-content animate-page-enter motion-reduce:animate-none"
          >
            {children}
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardShell;

/**
 * Picks the title for the current path: the label of the deepest-matching nav
 * item, then an explicit override for paths that have no nav item of their own,
 * then a fallback.
 *
 * Each layout resolved this inline, matching `activePaths` by exact equality
 * only — so a detail route like `/leads/123` fell through to the generic
 * "Dashboard" even though the sidebar (which does match by prefix) correctly
 * highlighted Leads. Same matcher as `Sidebar` now, so the highlighted nav item
 * and the header title can no longer disagree.
 */
export function resolvePageTitle(
  sections: NavSection[],
  pathname: string,
  overrides: Record<string, string> = {},
  fallback = 'Dashboard',
): string {
  let best: string | null = null;
  let bestLen = -1;
  for (const section of sections) {
    for (const item of section.items) {
      for (const candidate of item.activePaths ?? [item.path]) {
        if ((pathname === candidate || pathname.startsWith(candidate + '/')) && candidate.length > bestLen) {
          bestLen = candidate.length;
          best = item.label;
        }
      }
    }
  }
  return best ?? overrides[pathname] ?? fallback;
}
