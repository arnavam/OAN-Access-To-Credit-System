import { combineReducers, configureStore, isRejectedWithValue, Middleware, UnknownAction } from '@reduxjs/toolkit';
import { authReducer, logout } from '../features/auth/store/authSlice';
import { leadReducer } from '../features/leads/store/leadSlice';
import { loanDashboardReducer } from '../features/loans/store/loanDashboardSlice';
import { assignmentReducer } from '../features/new-lead/store/assignmentSlice';
import { consentReducer } from '../features/new-lead/store/consentSlice';
import { farmerReducer } from '../features/new-lead/store/farmerSlice';
import { newLeadReducer } from '../features/new-lead/store/newLeadSlice';
import { visitReducer } from '../features/new-lead/store/visitSlice';
import { loanFormReducer } from '../features/new-loan/store/newLoanFormSlice';
import { sellerProductsReducer } from '../features/seller/store/loanProductsSlice';
import { sellerOnboardingReducer } from '../features/seller/store/onboardingSlice';
import { sellerTeamReducer } from '../features/seller/store/teamSlice';
import { ApiErrorCode } from '../lib/api/apiErrors';
import { toast } from '../lib/toast';

import { notificationReducer } from '../features/notifications/store/notificationSlice';

// Shows a toast for permission-denied rejections that no component explicitly handles.
// Extracts the message from either a plain string payload or a { message } object payload.
const permissionToastMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  const a = action as UnknownAction;
  if (isRejectedWithValue(a) || a.type?.toString().endsWith('/rejected')) {
    const payload = a.payload;
    const msg: string =
      typeof payload === 'string'
        ? payload
        : typeof (payload as { message?: string })?.message === 'string'
        ? (payload as { message?: string }).message!
        : '';
    if (msg && /permission denied/i.test(msg)) {
      toast.error('You don\'t have permission to perform this action. Please complete KYC setup first.');
    }
  }
  return result;
};

const LOAN_FORM_STORAGE_KEY = 'loan_form_state';
let loanFormPersistTimer: ReturnType<typeof setTimeout> | null = null;

// Redacted: consent data + OTP-verified status are excluded from Web Storage
// since any script running in the tab can read it. A refresh mid-flow
// re-requires OTP verification rather than trusting a stored flag.
function persistLoanFormState(state: RootState) {
  const { consentRequestData: _consentRequestData, otpVerified: _otpVerified, ...persistable } = state.loanForm;
  sessionStorage.setItem(LOAN_FORM_STORAGE_KEY, JSON.stringify(persistable));
}

const storageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const unknownAction = action as UnknownAction;
  if (typeof window !== 'undefined') {
    // Handle Loan Form Persistence (stored in sessionStorage to avoid localStorage PII)
    if (unknownAction.type === 'loanForm/resetForm') {
      if (loanFormPersistTimer) clearTimeout(loanFormPersistTimer);
      loanFormPersistTimer = null;
      sessionStorage.removeItem(LOAN_FORM_STORAGE_KEY);
    } else if (unknownAction.type.startsWith('loanForm/')) {
      // Debounced so this isn't synchronous main-thread I/O on every keystroke;
      // see the pagehide flush below for the tab-close/navigate-away case.
      if (loanFormPersistTimer) clearTimeout(loanFormPersistTimer);
      loanFormPersistTimer = setTimeout(() => {
        loanFormPersistTimer = null;
        persistLoanFormState(store.getState() as RootState);
      }, 400);
    }
  }
  return result;
};

// Centralized session expiration middleware.
// Intercepts only UNAUTHORIZED (401) errors to trigger a global logout redirect,
// avoiding accidental logouts during transient network issues or generic server errors.
// Note: 403 (permission denied) surfaces as 'FORBIDDEN' and is intentionally NOT
// handled here, so a permission denial never logs out an otherwise-valid session.
const unauthenticatedMiddleware: Middleware = (api) => (next) => (action) => {
  const unknownAction = action as UnknownAction;
  
  // Ignore getMe failure on initial mount to prevent infinite loops
  if (unknownAction.type === 'auth/getMe/rejected') {
    return next(action);
  }

  if (isRejectedWithValue(unknownAction) || unknownAction.type.endsWith('/rejected')) {
    const payload = unknownAction.payload;
    const error = unknownAction.error;
    if (
      payload === ApiErrorCode.Auth ||
      (payload as { message?: string })?.message === ApiErrorCode.Auth ||
      (error as { message?: string })?.message === ApiErrorCode.Auth
    ) {
      api.dispatch(logout());
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        // Clear HttpOnly cookie on the server before redirecting.
        // We use a fire-and-forget .catch(() => {}) block to guarantee the client-side session
        // is cleared and redirect occurs even if the server is offline or unreachable.
        fetch('/api/auth/logout', { method: 'POST' })
          .catch(() => {}) 
          .finally(() => {
            window.location.href = '/login';
          });
      }
    }
  }
  return next(action);
};

const appReducer = combineReducers({
  auth: authReducer,
  leads: leadReducer,
  newLead: newLeadReducer,
  farmer: farmerReducer,
  consent: consentReducer,
  visit: visitReducer,
  assignment: assignmentReducer,
  loanForm: loanFormReducer,
  loanDashboard: loanDashboardReducer,
  sellerProducts: sellerProductsReducer,
  sellerOnboarding: sellerOnboardingReducer,
  sellerTeam: sellerTeamReducer,
  notifications: notificationReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) => {
  if (action.type === logout.type) {
    // Reset all state to undefined so each slice returns its initial state
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storageMiddleware, unauthenticatedMiddleware, permissionToastMiddleware),
});

if (typeof window !== 'undefined') {
  // Flush any pending debounced write immediately so closing the tab or
  // navigating away within the debounce window can't silently drop the last edit.
  window.addEventListener('pagehide', () => {
    if (loanFormPersistTimer) {
      clearTimeout(loanFormPersistTimer);
      loanFormPersistTimer = null;
      persistLoanFormState(store.getState());
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
