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

// Decodes (does NOT verify) the user_type claim from a JWT's payload segment.
// Verification is intentionally omitted: the frontend has no signing secret/JWKS,
// and this value is used only for routing. The backend verifies the signature.
export function readUserKindFromJwt(token: string): UserKind | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob === 'function'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf-8');
    const claims = JSON.parse(json) as { user_type?: string; exp?: number };

    if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) {
      return null; // expired
    }

    const kind = claims.user_type;
    if (
      kind === 'bank_admin' ||
      kind === 'bank_agent' ||
      kind === 'dev_agent' ||
      kind === 'marketplace' ||
      kind === 'farmer'
    ) {
      return kind;
    }
    return null;
  } catch {
    return null;
  }
}
