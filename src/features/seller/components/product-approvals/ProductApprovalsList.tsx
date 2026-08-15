'use client';
import { selectBankName } from '@/features/auth/store/authSlice';
import { fetchProducts, selectProducts, selectProductsListError, selectProductsListStatus } from '@/features/seller/store/loanProductsSlice';
import type { ListProductsParams } from '@/features/seller/types/loan-products.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AlertCircle, Landmark, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { ProductApprovalCard } from './ProductApprovalCard';

interface ProductApprovalsListProps {
  listParams?: ListProductsParams;
}

export function ProductApprovalsList({ listParams }: ProductApprovalsListProps) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const listStatus = useAppSelector(selectProductsListStatus);
  const listError = useAppSelector(selectProductsListError);
  const bankName = useAppSelector(selectBankName);

  useEffect(() => {
    void dispatch(fetchProducts({ status: 'Pending Approval', ...listParams }));
  }, [dispatch, listParams]);

  const isLoading = listStatus === 'idle' || listStatus === 'loading';
  const pendingProducts = products.filter((product) => product.status === 'Pending Approval');

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Landmark size={24} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-gray-900">{bankName ?? 'Draft Product Approvals'}</h2>
            <p className="text-[14px] text-gray-500">Review product submissions before they are published to farmers.</p>
          </div>
        </div>
        <p className="border-t border-gray-200 pt-4 text-[14px] text-gray-600">
          Approve to publish a product as active or reject it.
        </p>
      </div>

      {listError ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-[14px] font-semibold">Failed to load pending products</p>
            <p className="text-[14px]">{listError}</p>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading pending products...
          </div>
        </div>
      ) : pendingProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-[16px] font-semibold text-gray-900">No products waiting for approval</p>
          <p className="mt-2 text-[14px] text-gray-500">
            New product submissions will appear here after an agent creates them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingProducts.map((product) => (
            <ProductApprovalCard key={product.name} item={{ product }} />
          ))}
        </div>
      )}
    </div>
  );
}
