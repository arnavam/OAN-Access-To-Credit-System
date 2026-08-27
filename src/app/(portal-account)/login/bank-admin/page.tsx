import { PortalShell } from '@/app/(portal-account)/components/PortalShell';
import { BankAdminLoginForm } from './components/BankAdminLoginForm';

export default function BankAdminLoginPage() {
  return (
    <PortalShell badge="Bank Portal" backHref="/login">
      <BankAdminLoginForm />
    </PortalShell>
  );
}
