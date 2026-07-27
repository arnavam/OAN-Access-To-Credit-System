import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { teamService } from '../api/team.service';
import { logger } from '@/lib/logger';
import type { TeamUser } from '@/lib/api/api.schemas';
import type { InviteUserPayload, UpdateUserProfilePayload } from '../types/team.types';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface TeamState {
  users: TeamUser[];
  listStatus: AsyncStatus;
  mutationStatus: AsyncStatus;
  listError: string | null;
  mutationError: string | null;
}

const initialState: TeamState = {
  users: [],
  listStatus: 'idle',
  mutationStatus: 'idle',
  listError: null,
  mutationError: null,
};

export const fetchTeamUsers = createAsyncThunk(
  'sellerTeam/fetchTeamUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await teamService.listUsers();
      return response.data;
    } catch (error) {
      logger.error('fetchTeamUsers thunk failed', { error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load bank team members');
    }
  }
);

export const inviteUser = createAsyncThunk(
  'sellerTeam/inviteUser',
  async (payload: InviteUserPayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await teamService.inviteUser(payload);
      await dispatch(fetchTeamUsers());
      return response.data;
    } catch (error) {
      logger.error('inviteUser thunk failed', { email: payload.email, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to invite team member');
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'sellerTeam/deactivateUser',
  async (email: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await teamService.deactivateUser(email);
      await dispatch(fetchTeamUsers());
      return response.data;
    } catch (error) {
      logger.error('deactivateUser thunk failed', { email, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to deactivate team member');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'sellerTeam/updateUserProfile',
  async (payload: UpdateUserProfilePayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await teamService.updateUserProfile(payload);
      await dispatch(fetchTeamUsers());
      return response.data;
    } catch (error) {
      logger.error('updateUserProfile thunk failed', { email: payload.email, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user profile');
    }
  }
);

const teamSlice = createSlice({
  name: 'sellerTeam',
  initialState,
  reducers: {
    clearTeamMutationError(state) {
      state.mutationError = null;
      state.mutationStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamUsers.pending, (s) => { s.listStatus = 'loading'; s.listError = null; })
      .addCase(fetchTeamUsers.fulfilled, (s, action) => { s.listStatus = 'succeeded'; s.users = action.payload; })
      .addCase(fetchTeamUsers.rejected, (s, action) => { s.listStatus = 'failed'; s.listError = action.payload as string; })
      .addCase(inviteUser.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; })
      .addCase(inviteUser.fulfilled, (s) => { s.mutationStatus = 'succeeded'; })
      .addCase(inviteUser.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; })
      .addCase(deactivateUser.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; })
      .addCase(deactivateUser.fulfilled, (s) => { s.mutationStatus = 'succeeded'; })
      .addCase(deactivateUser.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; })
      .addCase(updateUserProfile.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; })
      .addCase(updateUserProfile.fulfilled, (s) => { s.mutationStatus = 'succeeded'; })
      .addCase(updateUserProfile.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; });
  },
});

export const { clearTeamMutationError } = teamSlice.actions;
export const sellerTeamReducer = teamSlice.reducer;
export default teamSlice.reducer;

export const selectTeamUsers = (state: RootState) => state.sellerTeam.users;
export const selectTeamListStatus = (state: RootState) => state.sellerTeam.listStatus;
export const selectTeamListError = (state: RootState) => state.sellerTeam.listError;
export const selectTeamMutationStatus = (state: RootState) => state.sellerTeam.mutationStatus;
export const selectTeamMutationError = (state: RootState) => state.sellerTeam.mutationError;
