'use client';

import { PortalLoginForm } from '@/features/auth/components/PortalLoginForm';

export function BankAdminLoginForm() {
  return (
    <PortalLoginForm
      subtitle="Manage KYC verification, loan products & approve agent submissions"
      allowedKinds={['bank_admin', 'marketplace']}
      redirectTo={(user) =>
        // A bank_admin whose bank isn't set up yet comes back with all bank
        // fields null (no bank_id/bank_code/bank_status) — send them to finish
        // onboarding before the dashboard, which needs a provisioned bank.
        user.kind === 'bank_admin' && !user.bankId ? '/onboarding' : '/dashboard'
      }
      showRegisterLink
    />
  );
}
