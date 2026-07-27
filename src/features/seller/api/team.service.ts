import { fetchApi } from '@/lib/api/fetchApi';
import { validateResponse, teamUserSchema, type TeamUser } from '@/lib/api/api.schemas';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';
import type { InviteUserPayload, UpdateUserProfilePayload } from '../types/team.types';

export const teamService = {
  async listUsers(): Promise<ApiResponse<TeamUser[]>> {
    const raw = (await fetchApi('oan_a2c.api.v1.seller.onboarding.list_users')) as ApiResponse<Record<string, unknown>>;
    return {
      ...raw,
      data: validateResponse(z.array(teamUserSchema), raw.data?.users, 'seller.list_users'),
    };
  },

  async inviteUser(payload: InviteUserPayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.invite_user', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async deactivateUser(email: string): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.deactivate_user', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async updateUserProfile(payload: UpdateUserProfilePayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.update_user_profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },
};
