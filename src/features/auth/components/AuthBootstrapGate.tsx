'use client';

import { FullPageLoader } from '@/components/ui/Loader';
import { isProtectedRoute } from '@/features/auth/rbac';
import { selectAuthStatus } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { usePathname } from 'next/navigation';

/**
 * Holds the first paint of an authenticated screen until the session has been
 * restored.
 *
 * `Providers` dispatches `getMe` on mount, but nothing used to wait for it, so a
 * dashboard rendered with `user === null` for a beat and then re-rendered with
 * the real user — showing "User", "User Portal", empty initials and a header with
 * no bank name for as long as the round trip took. That flash is what this
 * removes.
 *
 * Only protected routes are gated. On a public page (any login screen, the signup
 * flow) there is usually no session to restore, and gating would put a spinner in
 * front of the sign-in form for the length of a request that is expected to fail.
 * On a protected route the proxy middleware has already checked for a session
 * cookie before this renders, so the wait is real work and not a guess.
 *
 * `failed` renders through deliberately: a session that could not be restored is
 * for the 401 middleware to act on, and spinning forever would hide whatever the
 * screen wants to say about it.
 */
export function AuthBootstrapGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const status = useAppSelector(selectAuthStatus);

  const isRestoring = status === 'idle' || status === 'loading';

  if (isProtectedRoute(pathname) && isRestoring) {
    return <FullPageLoader label="Restoring your session…" />;
  }

  return <>{children}</>;
}
