import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { onboardingService } from '../api/onboarding.service';
import { logger } from '@/lib/logger';
import type { BankStatus } from '@/lib/api/api.schemas';
import type {
  RegisterBankPayload,
  RegisterSellerPayload,
  SaveOrgContactsPayload,
  UploadKycDocumentPayload,
  UpdateBankStatusPayload,
} from '../types/onboarding.types';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface OnboardingState {
  bankStatus: BankStatus['status'] | null;
  uploadedFileUrl: string | null;
  statusFetchStatus: AsyncStatus;
  registrationStatus: AsyncStatus;
  mutationStatus: AsyncStatus;
  statusFetchError: string | null;
  registrationError: string | null;
  mutationError: string | null;
}

const initialState: OnboardingState = {
  bankStatus: null,
  uploadedFileUrl: null,
  statusFetchStatus: 'idle',
  registrationStatus: 'idle',
  mutationStatus: 'idle',
  statusFetchError: null,
  registrationError: null,
  mutationError: null,
};

export const registerBank = createAsyncThunk(
  'sellerOnboarding/registerBank',
  async (payload: RegisterBankPayload, { rejectWithValue }) => {
    try {
      const response = await onboardingService.registerBank(payload);
      return response.data;
    } catch (error) {
      logger.error('registerBank thunk failed', { error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to register bank organisation');
    }
  }
);

export const registerSeller = createAsyncThunk(
  'sellerOnboarding/registerSeller',
  async (payload: RegisterSellerPayload, { rejectWithValue }) => {
    try {
      const response = await onboardingService.registerSeller(payload);
      return response.data;
    } catch (error) {
      logger.error('registerSeller thunk failed', { error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to register seller account');
    }
  }
);

export const fetchBankStatus = createAsyncThunk(
  'sellerOnboarding/fetchBankStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await onboardingService.getBankStatus();
      return response.data.status;
    } catch (error) {
      logger.error('fetchBankStatus thunk failed', { error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to retrieve bank onboarding status');
    }
  }
);

export const saveOrgContacts = createAsyncThunk(
  'sellerOnboarding/saveOrgContacts',
  async (payload: SaveOrgContactsPayload, { rejectWithValue }) => {
    try {
      const response = await onboardingService.saveOrgContacts(payload);
      return response.data;
    } catch (error) {
      logger.error('saveOrgContacts thunk failed', { payload, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save organization contacts');
    }
  }
);

export const uploadKycDocument = createAsyncThunk(
  'sellerOnboarding/uploadKycDocument',
  async (payload: UploadKycDocumentPayload, { rejectWithValue }) => {
    try {
      const response = await onboardingService.uploadKycDocument(payload);
      return response.data;
    } catch (error) {
      logger.error('uploadKycDocument thunk failed', { filename: payload.filename, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload KYC document');
    }
  }
);

export const updateBankStatus = createAsyncThunk(
  'sellerOnboarding/updateBankStatus',
  async (payload: UpdateBankStatusPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await onboardingService.updateBankStatus(payload.bank_code, payload.new_status);
      await dispatch(fetchBankStatus());
      return response.data;
    } catch (error) {
      logger.error('updateBankStatus thunk failed', { payload, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update bank onboarding status');
    }
  }
);

const onboardingSlice = createSlice({
  name: 'sellerOnboarding',
  initialState,
  reducers: {
    clearOnboardingErrors(state) {
      state.mutationError = null;
      state.registrationError = null;
      state.mutationStatus = 'idle';
      state.registrationStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerBank.pending, (s) => { s.registrationStatus = 'loading'; s.registrationError = null; })
      .addCase(registerBank.fulfilled, (s) => { s.registrationStatus = 'succeeded'; })
      .addCase(registerBank.rejected, (s, action) => { s.registrationStatus = 'failed'; s.registrationError = action.payload as string; })
      .addCase(registerSeller.pending, (s) => { s.registrationStatus = 'loading'; s.registrationError = null; })
      .addCase(registerSeller.fulfilled, (s) => { s.registrationStatus = 'succeeded'; })
      .addCase(registerSeller.rejected, (s, action) => { s.registrationStatus = 'failed'; s.registrationError = action.payload as string; })
      .addCase(fetchBankStatus.pending, (s) => { s.statusFetchStatus = 'loading'; s.statusFetchError = null; })
      .addCase(fetchBankStatus.fulfilled, (s, action) => { s.statusFetchStatus = 'succeeded'; s.bankStatus = action.payload; })
      .addCase(fetchBankStatus.rejected, (s, action) => { s.statusFetchStatus = 'failed'; s.statusFetchError = action.payload as string; })
      .addCase(saveOrgContacts.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; })
      .addCase(saveOrgContacts.fulfilled, (s) => { s.mutationStatus = 'succeeded'; })
      .addCase(saveOrgContacts.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; })
      .addCase(uploadKycDocument.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; })
      .addCase(uploadKycDocument.fulfilled, (s, action) => { s.mutationStatus = 'succeeded'; s.uploadedFileUrl = action.payload.file_url; })
      .addCase(uploadKycDocument.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; })
      .addCase(updateBankStatus.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; })
      .addCase(updateBankStatus.fulfilled, (s) => { s.mutationStatus = 'succeeded'; })
      .addCase(updateBankStatus.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; });
  },
});

export const { clearOnboardingErrors } = onboardingSlice.actions;
export const sellerOnboardingReducer = onboardingSlice.reducer;
export default onboardingSlice.reducer;

export const selectBankStatus = (state: RootState) => state.sellerOnboarding.bankStatus;
export const selectUploadedFileUrl = (state: RootState) => state.sellerOnboarding.uploadedFileUrl;
export const selectOnboardingRegistrationStatus = (state: RootState) => state.sellerOnboarding.registrationStatus;
export const selectOnboardingRegistrationError = (state: RootState) => state.sellerOnboarding.registrationError;
export const selectOnboardingMutationStatus = (state: RootState) => state.sellerOnboarding.mutationStatus;
export const selectOnboardingMutationError = (state: RootState) => state.sellerOnboarding.mutationError;
