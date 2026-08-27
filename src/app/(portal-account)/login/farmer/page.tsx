import { PortalShell } from '@/app/(portal-account)/components/PortalShell';
import { Metadata } from 'next';
import { FarmerLoginForm } from './components/FarmerLoginForm';

export const metadata: Metadata = {
  title: 'Farmer Login | Ethiopia OpenAgriNet Access to Credit',
  description: 'Sign in to the Farmer Portal to browse loan offers and apply for credit.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FarmerLoginPage() {
  return (
    <PortalShell badge="Farmer Portal" backHref="/login">
      <FarmerLoginForm />
    </PortalShell>
  );
}
