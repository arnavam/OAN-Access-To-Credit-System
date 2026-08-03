'use client';

import { selectAuthStatus, selectUser } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BankAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const authStatus = useAppSelector(selectAuthStatus);

  // getMe has finished (either way) — until then `user` is null simply because
  // the session hasn't loaded, not because the bank is unprovisioned.
  const authResolved = authStatus === 'succeeded' || authStatus === 'failed';
  // A bank_admin whose bank isn't set up yet comes back with all bank fields
  // null. The dashboard needs a provisioned bank (its stats fetch 404s
  // otherwise), so gate these users to onboarding.
  const needsOnboarding = user?.kind === 'bank_admin' && !user.bankId;

  useEffect(() => {
    if (authResolved && needsOnboarding) {
      router.replace('/onboarding');
    }
  }, [authResolved, needsOnboarding, router]);

  // Don't mount the dashboard (and fire its stats fetch) until we know the bank
  // is provisioned — avoids the flash + the failing request during the redirect.
  if (!authResolved || needsOnboarding) {
    return null;
  }

  return <>{children}</>;
}
