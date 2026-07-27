'use client';

import { Header } from '@/app/(portal-account)/components/Header';
import { usePathname } from 'next/navigation';

export default function PortalAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine which tab is active based on the URL
  const activeTab = pathname.includes('/create-account') ? 'create-account' : 'login';

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Header activeTab={activeTab} />
      {children}
    </div>
  );
}
