'use client';

import { PortalLoginForm } from '@/features/auth/components/PortalLoginForm';

export function BankAgentLoginForm() {
  return (
    <PortalLoginForm
      subtitle="Access your agent dashboard and manage loan submissions"
      usernamePlaceholder="test_agent@coopbank.com"
      allowedKinds={['bank_agent']}
      redirectTo={() => '/agent-dashboard'}
    />
  );
}
