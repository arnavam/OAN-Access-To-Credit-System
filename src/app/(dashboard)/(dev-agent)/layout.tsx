'use client';

import { DashboardShell, resolvePageTitle } from '@/components/layout/DashboardShell';
import { NavSection } from '@/components/Sidebar';
import { FileText, Search, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React from 'react';

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

export default function DevAgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <DashboardShell
      sections={navigationSections}
      pageTitle={resolvePageTitle(navigationSections, pathname)}
    >
      {children}
    </DashboardShell>
  );
}
