import type { User } from '@/features/auth/types/auth.types';

export const ROLES = {
  ADMIN: 'A2C Administrator',
  BANK_ADMIN: 'A2C Bank Admin',
  BANK_AGENT: 'A2C Bank Agent',
  DEVELOPMENT_AGENT: 'A2C Development Agent',
  FARMER: 'A2C Farmer',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export function getRedirectRouteForUser(user: User): string {
  switch (user.kind) {
    case 'bank_admin':   return user.bankId ? '/dashboard' : '/register';
    case 'bank_agent':   return '/agent-dashboard';
    case 'dev_agent':    return '/leads';
    case 'marketplace':  return '/dashboard';
    case 'farmer':       return '/farmer-dashboard';
  }
}
