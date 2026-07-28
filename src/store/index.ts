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


const storageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const unknownAction = action as UnknownAction;
  if (typeof window !== 'undefined') {
    // Handle Loan Form Persistence (stored in sessionStorage to avoid localStorage PII)
    if (unknownAction.type === 'loanForm/resetForm') {
      sessionStorage.removeItem('loan_form_state');
    } else if (unknownAction.type.startsWith('loanForm/')) {
      const loanState = (store.getState() as RootState).loanForm;
      sessionStorage.setItem('loan_form_state', JSON.stringify(loanState));
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
    getDefaultMiddleware().concat(storageMiddleware, unauthenticatedMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
