'use client';

import { logoutUser } from '@/features/auth/api/authApi';
import { useIdleSession } from '@/features/auth/hooks/useIdleSession';
import { logout, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Clock } from 'lucide-react';
import { useCallback, useRef } from 'react';

/**
 * Signs someone out after a period of inactivity, with a warning first.
 *
 * Mounted once inside the authenticated layout. The server enforces the same
 * window independently (see `SESSION_ACTIVITY_COOKIE`), so this is the humane
 * half of the mechanism rather than the security-carrying half: it gives the
 * person a chance to keep working before their session goes, which matters most
 * on the multi-step loan form where a silent expiry discards the draft.
 */
export function IdleSessionWatcher() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  // Guards against a double sign-out if the interval fires again while the
  // network round trip is still in flight.
  const isExpiringRef = useRef(false);

  const handleExpire = useCallback(async () => {
    if (isExpiringRef.current) return;
    isExpiringRef.current = true;

    // Revoke server-side first so the refresh token cannot be redeemed, then
    // clear local state. `logoutUser` swallows network errors by design — the
    // redirect below has to happen either way.
    await logoutUser();
    dispatch(logout());
    window.location.href = '/login?reason=idle';
  }, [dispatch]);

  const { isWarning, secondsRemaining, staySignedIn } = useIdleSession(
    isAuthenticated,
    handleExpire
  );

  if (!isAuthenticated || !isWarning) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
      aria-describedby="idle-warning-body"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Clock size={22} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="idle-warning-title" className="text-[17px] font-bold text-[#111827]">
              Still there?
            </h2>
            <p id="idle-warning-body" className="mt-1.5 text-[14px] leading-relaxed text-[#4B5563]">
              You have been inactive for a while. For your security you will be signed out in{' '}
              <span className="font-bold tabular-nums text-[#111827]">{secondsRemaining}</span>{' '}
              second{secondsRemaining === 1 ? '' : 's'}. Any unsaved work will be lost.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => void handleExpire()}
            className="rounded-xl border border-[#D1D5DB] px-4 py-2.5 text-[14px] font-semibold text-[#4B5563] transition-colors hover:bg-gray-50"
          >
            Sign out now
          </button>
          <button
            type="button"
            autoFocus
            onClick={staySignedIn}
            className="rounded-xl bg-[#16A34A] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#15803d]"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
