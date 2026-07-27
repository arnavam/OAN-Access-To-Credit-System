import { fetchApi } from '@/lib/api/fetchApi';
import { validateResponse, bankStatusSchema, type BankStatus } from '@/lib/api/api.schemas';
import type { ApiResponse } from '@/types/api';
import type {
  RegisterSellerPayload,
  SaveOrgContactsPayload,
  UploadKycDocumentPayload,
} from '../types/onboarding.types';

export const onboardingService = {
  async registerSeller(payload: RegisterSellerPayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.register_seller', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async saveOrgContacts(payload: SaveOrgContactsPayload): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.save_org_contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string }>>;
  },

  async uploadKycDocument(payload: UploadKycDocumentPayload): Promise<ApiResponse<{ message: string; file_url: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.upload_kyc_document', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ message: string; file_url: string }>>;
  },

  async getBankStatus(): Promise<ApiResponse<BankStatus>> {
    const raw = (await fetchApi('oan_a2c.api.v1.seller.onboarding.get_bank_status')) as ApiResponse<Record<string, unknown>>;
    return {
      ...raw,
      data: validateResponse(bankStatusSchema, raw.data, 'seller.get_bank_status'),
    };
  },

  async updateBankStatus(bankCode: string, newStatus: 'Onboarding' | 'Active' | 'Suspended'): Promise<ApiResponse<{ message: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.onboarding.update_bank_status', {
      method: 'POST',
      body: JSON.stringify({ bank_code: bankCode, new_status: newStatus }),
    }) as Promise<ApiResponse<{ message: string }>>;
  },
};
