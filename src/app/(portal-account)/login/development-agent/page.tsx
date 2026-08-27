import { PortalShell } from '@/app/(portal-account)/components/PortalShell';
import { Metadata } from 'next';
import { DevelopmentAgentLoginForm } from './components/DevelopmentAgentLoginForm';

export const metadata: Metadata = {
  title: 'Field Agent Login | Ethiopia OpenAgriNet Access to Credit',
  description: 'Log in to the Field Agent Portal to manage your agricultural lead pipeline and process credit applications.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DevelopmentAgentLoginPage() {
  return (
    <PortalShell badge="Field Agent Portal" backHref="/login">
      <DevelopmentAgentLoginForm />
    </PortalShell>
  );
}
