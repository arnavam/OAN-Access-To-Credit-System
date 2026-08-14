import type { SendOtpAndCreateConsentResponse, SubmitConsentResponse, VerifyOtpResponse } from '@/lib/api/api.schemas';
import type { RootState } from '@/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { newLeadService } from '../api/newLead.service';
import { clearForm, initializeLead } from './actions';
import { fetchLeadDetailsThunk } from './farmerSlice';
import { formatConsentDate } from './helpers';

interface ConsentState {
  isLoadingConsent: boolean;
  consentError: string | null;
  isVerifyingOtp: boolean;
  isOtpVerified: boolean;
  isSubmittingConsent: boolean;
  consentRequestId: string | null;
  consentDate: string | null;
  consentFormFilename: string | null;
  consentFormBase64: string | null;
}

const initialState: ConsentState = {
  isLoadingConsent: false,
  consentError: null,
  isVerifyingOtp: false,
  isOtpVerified: false,
  isSubmittingConsent: false,
  consentRequestId: null,
  consentDate: null,
  consentFormFilename: null,
  consentFormBase64: null,
};

export const searchFarmerConsent = createAsyncThunk<
  SendOtpAndCreateConsentResponse,
  { farmerId: string; partnerName: string; leadId: string }
>(
  'consent/searchConsent',
  async ({ farmerId, leadId }, { rejectWithValue }) => {
    try {
      return await newLeadService.sendOtpAndCreateConsent({ farmerId, leadId });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Failed to request consent');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk<
  VerifyOtpResponse,
  { otp_code: string; leadId: string },
  { state: RootState }
>(
  'consent/verifyOtp',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const consentRequestId = state.consent.consentRequestId;
      if (!consentRequestId) {
        throw new Error('No active consent request found. Please request OTP again.');
      }
      return await newLeadService.verifyOtp({
        leadId: payload.leadId,
        consent_request: consentRequestId,
        otp_code: payload.otp_code
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown Cause: Verification failed');
    }
  }
);

export const submitConsentThunk = createAsyncThunk<
  SubmitConsentResponse,
  {
    leadId: string;
    consent_type?: string;
    consent_reason_id?: number;
    validity_months?: number;
    allowed_data_field_ids?: (number | string)[];
    consentFormFilename: string;
    consentFormBase64: string;
  },
  { state: RootState }
>(
  'consent/submitConsent',
  async (payload, { getState, dispatch, rejectWithValue, signal }) => {
    // Registered before the submitConsent call starts (not after it resolves) so
    // an abort fired while that request is still in flight isn't missed — the
    // polling dispatch below has its own AbortController, independent of this
    // thunk's `signal`, so this is what wires them together on unmount.
    let pollingRequest: { abort: (reason?: string) => void; unwrap: () => Promise<unknown> } | null = null;
    const abortPolling = () => pollingRequest?.abort();
    signal.addEventListener('abort', abortPolling);

    try {
      const state = getState();
      const consentRequestId = state.consent.consentRequestId;

      if (!consentRequestId) {
        throw new Error('Missing active consent request.');
      }

      const response = await newLeadService.submitConsent({
        lead_id: payload.leadId,
        consent_request: consentRequestId,
        consent_type: payload.consent_type,
        consent_reason_id: payload.consent_reason_id,
        validity_months: payload.validity_months,
        consent_form_filename: payload.consentFormFilename,
        consent_form_base64: payload.consentFormBase64,
        allowed_data_field_ids: payload.allowed_data_field_ids,
      });

      if (signal.aborted) {
        // Cancelled while submitConsent itself was still in flight — don't start polling.
        throw new DOMException('Aborted', 'AbortError');
      }

      pollingRequest = dispatch(fetchLeadDetailsThunk({ leadId: payload.leadId, shouldPoll: true }));

      // .unwrap() so a demographic-sync failure (or an abort) rejects this thunk
      // instead of being silently discarded — without it, submitConsentThunk
      // always resolved as "success" even when the sync polling failed.
      await pollingRequest.unwrap();
      return response;
    } catch (error) {
      // unwrap() throws the raw rejectWithValue payload (often a plain string),
      // not always an Error instance — fall back to it, then to a SerializedError's
      // .message, before the generic message.
      const message =
        error instanceof Error ? error.message
          : typeof error === 'string' ? error
            : (error as { message?: string } | undefined)?.message ?? 'Failed to submit consent details';
      return rejectWithValue(message);
    } finally {
      signal.removeEventListener('abort', abortPolling);
    }
  }
);

const consentSlice = createSlice({
  name: 'consent',
  initialState,
  reducers: {
    clearConsentState() {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFarmerConsent.pending, (state) => {
        state.isLoadingConsent = true;
        state.consentError = null;
        state.consentDate = null;
        state.isOtpVerified = false;
        state.isSubmittingConsent = false;
      })
      .addCase(searchFarmerConsent.fulfilled, (state, action) => {
        state.isLoadingConsent = false;
        state.consentRequestId = action.payload.consent_request;
      })
      .addCase(searchFarmerConsent.rejected, (state, action) => {
        state.isLoadingConsent = false;
        state.consentError = action.payload as string;
      })
      .addCase(verifyOtpThunk.pending, (state) => {
        state.isVerifyingOtp = true;
        state.consentError = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state) => {
        state.isVerifyingOtp = false;
        state.isOtpVerified = true;
        state.consentError = null;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.isVerifyingOtp = false;
        state.consentError = action.payload as string;
      })
      .addCase(submitConsentThunk.pending, (state) => {
        state.isSubmittingConsent = true;
        state.consentError = null;
      })
      .addCase(submitConsentThunk.fulfilled, (state) => {
        state.isSubmittingConsent = false;
        state.consentDate = formatConsentDate();
      })
      .addCase(submitConsentThunk.rejected, (state, action) => {
        state.isSubmittingConsent = false;
        state.consentError = action.payload as string;
      })
      .addCase(fetchLeadDetailsThunk.fulfilled, (state, action) => {
        if (action.payload.farmer_profile_created === false) {
          // If the profile isn't created, force a complete reset of the consent flow
          state.isOtpVerified = false;
          state.consentDate = null;
          state.consentRequestId = null;
          state.isVerifyingOtp = false;
          state.isSubmittingConsent = false;
          state.consentFormFilename = null;
          state.consentFormBase64 = null;
        } else {
          // If profile is created, ensure UI treats it as verified and consented
          state.isOtpVerified = true;
          // We can optionally set consentDate to a default or true value if missing,
          // but typically it's loaded via existingLead or we leave it if it's already set.
        }
      })
      .addCase(fetchLeadDetailsThunk.rejected, (state, action) => {
        if (action.payload === 'Demographic sync failed. Please request a new OTP and re-submit the consent.') {
          state.isOtpVerified = false;
          state.consentDate = null;
          state.consentRequestId = null;
          state.consentError = action.payload as string;
        }
      })
      .addCase(initializeLead, (state, action) => {
        const payload = action.payload ?? {};
        state.consentDate = payload.consentDate || null;
        state.consentRequestId = payload.consentRequestId ?? null;
        state.isLoadingConsent = false;
        state.consentError = null;
        state.isVerifyingOtp = false;
        state.isOtpVerified = false;
        state.isSubmittingConsent = false;
        state.consentFormFilename = null;
        state.consentFormBase64 = null;
      })
      .addCase(clearForm, () => {
        return initialState;
      });
  }
});

export const { clearConsentState } = consentSlice.actions;

export const selectConsentState = (state: RootState) => state.consent;

export const consentReducer = consentSlice.reducer;
