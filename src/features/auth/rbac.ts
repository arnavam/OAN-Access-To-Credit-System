// Single source of truth for frontend role-based routing.
//
// IMPORTANT: This is routing/UX, NOT authorization. The security boundary is the
// backend, which verifies the signed JWT and authorizes every API call per role.
// Here we only decide which portal/route a given user_type is allowed to *see*,
// so wrong-portal logins and URL-hacking land users where they belong instead of
// in a broken shell. A forged/unsigned token can bypass this, but every API call
// it makes is still rejected by the backend.

export type UserKind = 'bank_admin' | 'bank_agent' | 'dev_agent' | 'marketplace' | 'farmer';

// Where each role goes after login / when bounced from a disallowed route.
const HOME_ROUTE: Record<UserKind, string> = {
  bank_admin: '/dashboard',
  bank_agent: '/agent-dashboard',
  dev_agent: '/leads',
  marketplace: '/dashboard',
  farmer: '/farmer-dashboard',
};

export function homeRouteFor(kind: UserKind): string {
  return HOME_ROUTE[kind];
}

// Route prefix -> roles allowed to access it.
//
// Ordering matters: the guard picks the FIRST prefix that matches, so more
// specific prefixes (e.g. /agent-loan-products) must precede shorter ones that
// would also match. Keys are matched with startsWith against the pathname.
//
// bank_agent is treated as a restricted bank_admin: it may reach the shared
// loan-product views and its own agent-* routes, but not admin-only areas
// (product approvals, KYC compliance, the admin dashboard).
const ROUTE_ACCESS: ReadonlyArray<readonly [string, ReadonlyArray<UserKind>]> = [
  // --- Bank agent (restricted admin) ---
  ['/agent-dashboard', ['bank_agent']],
  ['/agent-loan-products', ['bank_agent']],

  // --- Bank admin (+ marketplace share the admin surface) ---
  ['/dashboard', ['bank_admin', 'marketplace']],
  ['/loan-products', ['bank_admin', 'marketplace', 'bank_agent']],
  ['/product-approvals', ['bank_admin', 'marketplace']],
  ['/kyc-compliance', ['bank_admin', 'marketplace']],

  // --- Dev agent (field/back-office loan pipeline) ---
  ['/leads', ['dev_agent']],
  ['/loan-application-dashboard', ['dev_agent']],
  ['/update-loan-application-status', ['dev_agent']],
  ['/loans', ['dev_agent']],

  // --- Farmer (marketplace applicant) ---
  ['/farmer-dashboard', ['farmer']],
  ['/discover-loans', ['farmer']],
  ['/my-applications', ['farmer']],
];

// Returns true if `kind` may access `pathname`. Paths with no policy entry are
// treated as unguarded (shared/neutral routes) and allowed.
export function canAccess(kind: UserKind, pathname: string): boolean {
  const match = ROUTE_ACCESS.find(([prefix]) => pathname.startsWith(prefix));
  if (!match) return true;
  return match[1].includes(kind);
}

// Decodes (does NOT verify) the JWT payload segment. Verification is
// intentionally omitted: the frontend has no signing secret/JWKS, and these
// values are used only for routing. The backend verifies the signature.
function decodeJwtClaims(token: string): { user_type?: string; exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob === 'function'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json) as { user_type?: string; exp?: number };
  } catch {
    return null;
  }
}

// Narrows the raw user_type claim to a known UserKind (or null).
function toUserKind(userType: string | undefined): UserKind | null {
  if (
    userType === 'bank_admin' ||
    userType === 'bank_agent' ||
    userType === 'dev_agent' ||
    userType === 'marketplace' ||
    userType === 'farmer'
  ) {
    return userType;
  }
  return null;
}

// Reads the user_type claim for routing, REGARDLESS of token expiry.
//
// The access token's 15-min `exp` governs API-call validity, not login state —
// the session stays alive via the refresh token for days. For routing (e.g.
// bouncing a logged-in user off /login) we only need the role, and an expired
// JWT is still parseable. The `auth_token` cookie is cleared on logout and on
// refresh failure, so its mere presence is a safe signal that a session is
// intended to be alive. This must never be used for authorization.
export function readUserKindForRouting(token: string): UserKind | null {
  const claims = decodeJwtClaims(token);
  if (!claims) return null;
  return toUserKind(claims.user_type);
}
