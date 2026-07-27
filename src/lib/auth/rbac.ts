export const ROLES = {
  ADMIN: 'A2C Administrator',
  BANK_ADMIN: 'A2C Bank Admin',
  BANK_AGENT: 'A2C Bank Agent',
  DEVELOPMENT_AGENT: 'A2C Development Agent',
  FARMER: 'A2C Farmer',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const PORTAL_ALLOWED_ROLES = {
  BANK_ADMIN: [ROLES.BANK_ADMIN, ROLES.ADMIN],
  BANK_AGENT: [ROLES.BANK_AGENT, ROLES.ADMIN],
  DEV_AGENT: [ROLES.DEVELOPMENT_AGENT, ROLES.ADMIN],
  FARMER: [ROLES.FARMER, ROLES.ADMIN],
} as const;

/**
 * Checks if any of the user's assigned roles match the allowed roles for a portal/route.
 * Only the specific portal role or 'A2C Administrator' is granted access.
 */
export function hasPortalAccess(userRoles: string[] | undefined | null, allowedRoles: readonly string[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.some(role => allowedRoles.includes(role));
}

/**
 * Returns the designated dashboard route for a user based strictly on their assigned role.
 */
export function getRedirectRouteForUser(userRoles: string[] | undefined | null): string {
  if (!userRoles || userRoles.length === 0) return '/login';
  
  if (userRoles.includes(ROLES.BANK_ADMIN) || userRoles.includes(ROLES.ADMIN)) {
    return '/dashboard';
  }
  if (userRoles.includes(ROLES.BANK_AGENT)) {
    return '/agent-dashboard';
  }
  if (userRoles.includes(ROLES.DEVELOPMENT_AGENT)) {
    return '/leads';
  }
  if (userRoles.includes(ROLES.FARMER)) {
    return '/farmer-dashboard';
  }
  
  return '/login';
}
