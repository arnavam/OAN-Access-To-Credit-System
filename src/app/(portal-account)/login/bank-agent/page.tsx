import { PortalShell } from '@/app/(portal-account)/components/PortalShell';
import { BankAgentLoginForm } from './components/BankAgentLoginForm';

export default function BankAgentLoginPage() {
  return (
    <PortalShell badge="Bank Portal" backHref="/login">
      <BankAgentLoginForm />
    </PortalShell>
  );
}
