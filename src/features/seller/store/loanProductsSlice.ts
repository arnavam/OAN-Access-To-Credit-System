import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { loanProductsService } from '../api/loan-products.service';
import { taxonomyService } from '../api/taxonomy.service';
import { logger } from '@/lib/logger';
import type {
  LoanProductSummary,
  LoanProductDetail,
  SellerDashboardStats,
  TaxonomyCategory,
  TaxonomyTag,
  TaxonomyAttribute,
} from '@/lib/api/api.schemas';
import type {
  ListProductsParams,
  CreateLoanProductCompoundInput,
  UpdateLoanProductCompoundInput,
  ArchiveLoanProductInput,
} from '../types/loan-products.types';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface LoanProductsState {
  products: LoanProductSummary[];
  selectedProductDetail: LoanProductDetail | null;
  categories: TaxonomyCategory[];
  tags: TaxonomyTag[];
  attributes: TaxonomyAttribute[];
  stats: SellerDashboardStats | null;
  listStatus: AsyncStatus;
  detailStatus: AsyncStatus;
  taxonomyStatus: AsyncStatus;
  statsStatus: AsyncStatus;
  mutationStatus: AsyncStatus;
  listError: string | null;
  detailError: string | null;
  mutationError: string | null;
}

const initialState: LoanProductsState = {
  products: [],
  selectedProductDetail: null,
  categories: [],
  tags: [],
  attributes: [],
  stats: null,
  listStatus: 'idle',
  detailStatus: 'idle',
  taxonomyStatus: 'idle',
  statsStatus: 'idle',
  mutationStatus: 'idle',
  listError: null,
  detailError: null,
  mutationError: null,
};

export const fetchProducts = createAsyncThunk(
  'sellerProducts/fetchProducts',
  async (params: ListProductsParams | undefined, { rejectWithValue }) => {
    try {
      const response = await loanProductsService.listProducts(params);
      return response.data;
    } catch (error) {
      logger.error('fetchProducts thunk failed', { error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load loan products');
    }
  }
);

export const fetchProductDetail = createAsyncThunk(
  'sellerProducts/fetchProductDetail',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await loanProductsService.getProduct(productId);
      return response.data;
    } catch (error) {
      logger.error('fetchProductDetail thunk failed', { productId, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load product details');
    }
  }
);

export const fetchTaxonomy = createAsyncThunk(
  'sellerProducts/fetchTaxonomy',
  async (_, { rejectWithValue }) => {
    try {
      const [categoriesRes, tagsRes, attributesRes] = await Promise.all([
        taxonomyService.getCategories(),
        taxonomyService.getTags(),
        taxonomyService.getAttributes(),
      ]);
      return {
        categories: categoriesRes.data,
        tags: tagsRes.data,
        attributes: attributesRes.data,
      };
    } catch (error) {
      logger.error('fetchTaxonomy thunk failed', { error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load taxonomy metadata');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'sellerProducts/fetchDashboardStats',
  async (bankCode: string | undefined, { rejectWithValue }) => {
    try {
      const response = await loanProductsService.getDashboardStats(bankCode);
      return response.data;
    } catch (error) {
      logger.error('fetchDashboardStats thunk failed', { bankCode, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load dashboard statistics');
    }
  }
);

export const createProductCompound = createAsyncThunk(
  'sellerProducts/createProductCompound',
  async (input: CreateLoanProductCompoundInput, { dispatch, rejectWithValue }) => {
    try {
      const created = await loanProductsService.createProduct(input.payload);
      const productId = created.data.product_id;

      if (input.categoryTermIds && input.categoryTermIds.length > 0) {
        await taxonomyService.setProductCategories(productId, input.categoryTermIds);
      }
      if (input.tagTermIds && input.tagTermIds.length > 0) {
        await taxonomyService.setProductTags(productId, input.tagTermIds);
      }
      if (input.attributes && Object.keys(input.attributes).length > 0) {
        await taxonomyService.setProductAttributes(productId, input.attributes);
      }

      await dispatch(fetchProducts(input.refetchParams));
      return created.data;
    } catch (error) {
      logger.error('createProductCompound thunk failed', { input, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create loan product');
    }
  }
);

export const updateProductCompound = createAsyncThunk(
  'sellerProducts/updateProductCompound',
  async (input: UpdateLoanProductCompoundInput, { dispatch, rejectWithValue }) => {
    try {
      const updated = await loanProductsService.updateProduct(input.payload);
      const productId = input.payload.product_id;

      if (input.categoryTermIds !== undefined) {
        await taxonomyService.setProductCategories(productId, input.categoryTermIds);
      }
      if (input.tagTermIds !== undefined) {
        await taxonomyService.setProductTags(productId, input.tagTermIds);
      }
      if (input.attributes !== undefined) {
        await taxonomyService.setProductAttributes(productId, input.attributes);
      }

      await dispatch(fetchProducts(input.refetchParams));
      return updated.data;
    } catch (error) {
      logger.error('updateProductCompound thunk failed', { input, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update loan product');
    }
  }
);

export const archiveProduct = createAsyncThunk(
  'sellerProducts/archiveProduct',
  async (input: string | ArchiveLoanProductInput, { dispatch, rejectWithValue }) => {
    try {
      const productId = typeof input === 'string' ? input : input.productId;
      const refetchParams = typeof input === 'string' ? undefined : input.refetchParams;
      const response = await loanProductsService.archiveProduct(productId);
      await dispatch(fetchProducts(refetchParams));
      return response.data;
    } catch (error) {
      logger.error('archiveProduct thunk failed', { input, error });
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to archive loan product');
    }
  }
);

const loanProductsSlice = createSlice({
  name: 'sellerProducts',
  initialState,
  reducers: {
    clearMutationError(state) {
      state.mutationError = null;
      state.mutationStatus = 'idle';
    },
    clearSelectedProductDetail(state) {
      state.selectedProductDetail = null;
      state.detailStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.listStatus = 'loading'; s.listError = null; })
      .addCase(fetchProducts.fulfilled, (s, action) => { s.listStatus = 'succeeded'; s.products = action.payload; })
      .addCase(fetchProducts.rejected, (s, action) => { s.listStatus = 'failed'; s.listError = action.payload as string; })
      .addCase(fetchProductDetail.pending, (s) => { s.detailStatus = 'loading'; s.detailError = null; })
      .addCase(fetchProductDetail.fulfilled, (s, action) => { s.detailStatus = 'succeeded'; s.selectedProductDetail = action.payload; })
      .addCase(fetchProductDetail.rejected, (s, action) => { s.detailStatus = 'failed'; s.detailError = action.payload as string; })
      .addCase(fetchTaxonomy.pending, (s) => { s.taxonomyStatus = 'loading'; })
      .addCase(fetchTaxonomy.fulfilled, (s, action) => {
        s.taxonomyStatus = 'succeeded';
        s.categories = action.payload.categories;
        s.tags = action.payload.tags;
        s.attributes = action.payload.attributes;
      })
      .addCase(fetchTaxonomy.rejected, (s) => { s.taxonomyStatus = 'failed'; })
      .addCase(fetchDashboardStats.pending, (s) => { s.statsStatus = 'loading'; })
      .addCase(fetchDashboardStats.fulfilled, (s, action) => { s.statsStatus = 'succeeded'; s.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (s) => { s.statsStatus = 'failed'; })
      .addCase(createProductCompound.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; })
      .addCase(createProductCompound.fulfilled, (s) => { s.mutationStatus = 'succeeded'; })
      .addCase(createProductCompound.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; })
      .addCase(updateProductCompound.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; })
      .addCase(updateProductCompound.fulfilled, (s) => { s.mutationStatus = 'succeeded'; })
      .addCase(updateProductCompound.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; })
      .addCase(archiveProduct.pending, (s) => { s.mutationStatus = 'loading'; s.mutationError = null; })
      .addCase(archiveProduct.fulfilled, (s) => { s.mutationStatus = 'succeeded'; })
      .addCase(archiveProduct.rejected, (s, action) => { s.mutationStatus = 'failed'; s.mutationError = action.payload as string; });
  },
});

export const { clearMutationError, clearSelectedProductDetail } = loanProductsSlice.actions;
export const sellerProductsReducer = loanProductsSlice.reducer;
export default loanProductsSlice.reducer;

export const selectProducts = (state: RootState) => state.sellerProducts.products;
export const selectSelectedProductDetail = (state: RootState) => state.sellerProducts.selectedProductDetail;
export const selectCategories = (state: RootState) => state.sellerProducts.categories;
export const selectTags = (state: RootState) => state.sellerProducts.tags;
export const selectAttributes = (state: RootState) => state.sellerProducts.attributes;
export const selectSellerStats = (state: RootState) => state.sellerProducts.stats;
export const selectProductsListStatus = (state: RootState) => state.sellerProducts.listStatus;
export const selectProductsListError = (state: RootState) => state.sellerProducts.listError;
export const selectProductsMutationStatus = (state: RootState) => state.sellerProducts.mutationStatus;
export const selectProductsMutationError = (state: RootState) => state.sellerProducts.mutationError;
