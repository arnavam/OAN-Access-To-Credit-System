'use client';
import {
    fetchProducts,
    selectProducts,
    selectProductsListError,
    selectProductsListStatus
} from '@/features/seller/store/loanProductsSlice';
import type { ListProductsParams } from '@/features/seller/types/loan-products.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useCallback, useEffect } from 'react';
import { BankHeaderCard } from './BankHeaderCard';
import { LoanProductCard } from './LoanProductCard';
import { BaseProductList } from './BaseProductList';

interface LoanProductsListProps {
  portalLabel?: string;
  listParams?: ListProductsParams;
  canDelete?: boolean;
}

export function LoanProductsList({ portalLabel, listParams, canDelete }: LoanProductsListProps) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const listStatus = useAppSelector(selectProductsListStatus);
  const listError = useAppSelector(selectProductsListError);

  const loadProducts = useCallback(() => {
    void dispatch(fetchProducts(listParams));
  }, [dispatch, listParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const isLoading = listStatus === 'idle' || listStatus === 'loading';

  // Archived products are soft-deleted: still stored, but hidden from this view.
  const visibleProducts = products.filter((product) => product.status !== 'Archived');

  return (
    <BaseProductList
      header={<BankHeaderCard portalLabel={portalLabel} />}
      products={visibleProducts}
      isLoading={isLoading}
      error={listError}
      onRetry={loadProducts}
      emptyTitle="No loan products found"
      emptySubtitle="Create a loan product to publish it to the marketplace."
      renderItem={(product) => (
        <LoanProductCard key={product.name} product={product} canDelete={canDelete ?? true} />
      )}
    />
  );
}
