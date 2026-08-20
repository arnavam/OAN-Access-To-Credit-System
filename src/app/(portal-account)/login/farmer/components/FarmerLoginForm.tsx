'use client';

import { PortalLoginForm } from '@/features/auth/components/PortalLoginForm';
import { homeRouteFor } from '@/features/auth/rbac';

/**
 * Development sign-in for the farmer portal.
 *
 * In production a farmer authenticates against the Fayda farmer registry over
 * OAuth — the platform holds no farmer credential of its own. Email + password
 * is the stand-in until that lands, which is why this is the one portal whose
 * identifier field accepts an email and nothing else: a phone number is a
 * linking key for the consent webhook, never a login.
 *
 * When OAuth arrives, this component is replaced rather than edited. Everything
 * downstream reads the session, not the form.
 */
export function FarmerLoginForm() {
  return (
    <PortalLoginForm
      heading="Farmer Sign In"
      subtitle="Sign in to browse and apply for loans"
      usernameLabel="Email"
      usernameType="email"
      usernamePlaceholder="you@example.com"
      allowedKinds={['farmer']}
      // rbac's HOME_ROUTE is the single source of truth for where a role lands,
      // so the portal cannot drift from what the route guard considers home.
      redirectTo={(user) => homeRouteFor(user.kind)}
      showRegisterLink={false}
      showPartnerBanks={false}
    />
  );
}
