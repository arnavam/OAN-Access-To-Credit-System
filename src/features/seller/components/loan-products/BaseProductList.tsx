'use client';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import type { ReactNode } from 'react';

interface BaseProductListProps {
  header: ReactNode;
  products: LoanProductSummary[];
  isLoading: boolean;
  error?: string | null;
  emptyTitle: string;
  emptySubtitle: string;
  renderItem: (product: LoanProductSummary) => ReactNode;
  className?: string;
}

export function BaseProductList({
  header,
  products,
  isLoading,
  error,
  emptyTitle,
  emptySubtitle,
  renderItem,
  className = "mx-auto w-full space-y-4"
}: BaseProductListProps) {
  return (
    <div className={className}>
      {header}

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-[14px] font-semibold">Failed to load products</p>
            <p className="text-[14px]">{error}</p>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading products...
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-[16px] font-semibold text-gray-900">{emptyTitle}</p>
          <p className="mt-2 text-[14px] text-gray-500">
            {emptySubtitle}
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {products.map(renderItem)}
        </div>
      )}
    </div>
  );
}
