'use client';
import {
    fetchProducts,
    selectProducts,
    selectProductsListError,
    selectProductsListStatus
} from '@/features/seller/store/loanProductsSlice';
import type { ListProductsParams } from '@/features/seller/types/loan-products.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { BankHeaderCard } from './BankHeaderCard';
import { LoanProductCard } from './LoanProductCard';
import { BaseProductList } from './BaseProductList';

interface LoanProductsListProps {
  portalLabel?: string;
  listParams?: ListProductsParams;
}

export function LoanProductsList({ portalLabel, listParams }: LoanProductsListProps) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const listStatus = useAppSelector(selectProductsListStatus);
  const listError = useAppSelector(selectProductsListError);

  useEffect(() => {
    void dispatch(fetchProducts(listParams));
  }, [dispatch, listParams]);

  const isLoading = listStatus === 'idle' || listStatus === 'loading';

  return (
    <BaseProductList
      header={<BankHeaderCard portalLabel={portalLabel} />}
      products={products}
      isLoading={isLoading}
      error={listError}
      emptyTitle="No loan products found"
      emptySubtitle="Create a loan product to publish it to the marketplace."
      renderItem={(product) => (
        <LoanProductCard key={product.name} product={product} />
      )}
    />
  );
}
