'use client';
import {
    fetchProducts,
    selectProducts,
    selectProductsListError,
    selectProductsListStatus
} from '@/features/seller/store/loanProductsSlice';
import type { ListProductsParams } from '@/features/seller/types/loan-products.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { BankHeaderCard } from './BankHeaderCard';
import { LoanProductCard } from './LoanProductCard';

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
    <div className="mx-auto w-full space-y-4">
      <BankHeaderCard portalLabel={portalLabel} />

      {listError ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-[14px] font-semibold">Failed to load loan products</p>
            <p className="text-[14px]">{listError}</p>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading loan products...
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-[16px] font-semibold text-gray-900">No loan products found</p>
          <p className="mt-2 text-[14px] text-gray-500">
            Create a loan product to publish it to the marketplace.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {products.map((product) => (
            <LoanProductCard key={product.name} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
