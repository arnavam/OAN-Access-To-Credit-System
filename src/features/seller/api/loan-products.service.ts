import { fetchApi } from '@/lib/api/fetchApi';
import {
  validateResponse,
  loanProductSummarySchema,
  loanProductDetailSchema,
  sellerDashboardStatsSchema,
  type LoanProductSummary,
  type LoanProductDetail,
  type SellerDashboardStats,
} from '@/lib/api/api.schemas';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';
import type {
  ListProductsParams,
  CreateLoanProductPayload,
  UpdateLoanProductPayload,
} from '../types/loan-products.types';

export const loanProductsService = {
  async listProducts(params?: ListProductsParams): Promise<ApiResponse<LoanProductSummary[]>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });
    }
    const queryString = query.toString();
    const path = queryString
      ? `oan_a2c.api.v1.seller.loan_products.list_products?${queryString}`
      : 'oan_a2c.api.v1.seller.loan_products.list_products';

    const raw = (await fetchApi(path)) as ApiResponse<Record<string, unknown>>;
    const productsData = raw.data?.products;

    return {
      ...raw,
      data: validateResponse(z.array(loanProductSummarySchema), productsData, 'seller.list_products'),
    };
  },

  async getProduct(productId: string): Promise<ApiResponse<LoanProductDetail>> {
    const path = `oan_a2c.api.v1.seller.loan_products.get_product?product_id=${encodeURIComponent(productId)}`;
    const raw = (await fetchApi(path)) as ApiResponse<Record<string, unknown>>;
    const productData = raw.data?.product;

    return {
      ...raw,
      data: validateResponse(loanProductDetailSchema, productData, 'seller.get_product'),
    };
  },

  async createProduct(payload: CreateLoanProductPayload): Promise<ApiResponse<{ product_id: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.loan_products.create_product', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ product_id: string }>>;
  },

  async updateProduct(payload: UpdateLoanProductPayload): Promise<ApiResponse<{ product_id: string }>> {
    return fetchApi('oan_a2c.api.v1.seller.loan_products.update_product', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as Promise<ApiResponse<{ product_id: string }>>;
  },

  async setProductStatus(productId: string, status: 'Draft' | 'Active' | 'Archived'): Promise<ApiResponse<null>> {
    return fetchApi('oan_a2c.api.v1.seller.loan_products.set_product_status', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, status }),
    }) as Promise<ApiResponse<null>>;
  },

  async archiveProduct(productId: string): Promise<ApiResponse<null>> {
    return this.setProductStatus(productId, 'Archived');
  },

  async getDashboardStats(bankCode?: string): Promise<ApiResponse<SellerDashboardStats>> {
    const path = bankCode
      ? `oan_a2c.api.v1.seller.dashboard.get_stats?bank=${encodeURIComponent(bankCode)}`
      : 'oan_a2c.api.v1.seller.dashboard.get_stats';

    const raw = (await fetchApi(path)) as ApiResponse<Record<string, unknown>>;
    const statsData = raw.data?.stats;

    return {
      ...raw,
      data: validateResponse(sellerDashboardStatsSchema, statsData, 'seller.get_stats'),
    };
  },
};
