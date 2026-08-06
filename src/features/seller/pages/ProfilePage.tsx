'use client';

import { selectUserKind } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { DashboardHeader as DashboardTopNav } from '@/components/header/DashboardHeader';
import { ArrowLeft, Building2, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import OrganizationManagementTab from '../components/profile/OrganizationManagementTab';
import TeamManagementTab from '../components/profile/TeamManagementTab';

function ProfilePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userKind = useAppSelector(selectUserKind);
  const canManageTeam = userKind === 'bank_admin';
  const activeTab = canManageTeam && searchParams.get('tab') === 'team' ? 'team' : 'organization';

  const handleTabChange = (tab: 'organization' | 'team') => {
    router.push(`/profile?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <DashboardTopNav title="My Profile" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header Card & Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-6 border-b border-gray-100 pb-4">
            <button
              onClick={() => handleTabChange('organization')}
              className={`flex items-center gap-2 text-sm font-bold transition-colors pb-1 ${
                activeTab === 'organization'
                  ? 'text-[#16A34A] border-b-2 border-[#16A34A]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Organization Management
            </button>

            {canManageTeam && (
              <button
                onClick={() => handleTabChange('team')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors pb-1 ${
                  activeTab === 'team'
                    ? 'text-[#16A34A] border-b-2 border-[#16A34A]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <UsersRound className="w-4 h-4" />
                Team Management
              </button>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === 'organization' ? 'Organization profile' : 'Team Members'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'organization'
                ? 'Org data is collected during registration (Organisation Section, KYC docs) but cannot be viewed or updated afterward.'
                : 'Manage your organization team members, roles, and account statuses.'}
            </p>
          </div>
        </div>

        {/* Tab Component Content */}
        {activeTab === 'organization' || !canManageTeam ? (
          <OrganizationManagementTab readOnly={!canManageTeam} />
        ) : (
          <TeamManagementTab />
        )}
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <ProfilePageInner />
    </Suspense>
  );
}
