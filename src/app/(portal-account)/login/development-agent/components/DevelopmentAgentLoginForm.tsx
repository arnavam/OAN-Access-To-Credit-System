'use client';

import { PortalLoginForm } from '@/features/auth/components/PortalLoginForm';
import { homeRouteFor } from '@/features/auth/rbac';

/**
 * Sign-in for Development (field) Agents.
 *
 * This portal used to be a standalone page that reimplemented the whole
 * screen — its own card, panel gradient, language picker and inputs — and had
 * drifted visually from every other portal. It is now the shared form; the only
 * thing specific to field agents is the subtitle and the role it admits.
 */
export function DevelopmentAgentLoginForm() {
  return (
    <PortalLoginForm
      subtitle="Coordinate field-level agricultural credit access across regions"
      allowedKinds={['dev_agent']}
      // rbac's HOME_ROUTE is the single source of truth for where a role lands,
      // so the portal cannot drift from what the route guard considers home.
      redirectTo={(user) => homeRouteFor(user.kind)}
    />
  );
}
