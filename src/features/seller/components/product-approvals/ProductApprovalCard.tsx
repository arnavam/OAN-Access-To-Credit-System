'use client';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { BarChart3, CalendarDays, LucideIcon, Package, Sprout } from 'lucide-react';
import { useState } from 'react';
import { ReviewProductModal } from './ReviewProductModal';

const statusStyles = {
  Draft: { text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', bg: 'bg-orange-100' },
  'Pending Approval': { text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', bg: 'bg-amber-100' },
  Active: { text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', bg: 'bg-green-100' },
  Archived: { text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500', bg: 'bg-gray-100' },
  Rejected: { text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', bg: 'bg-red-100' },
} as const;

const iconByStatus: Record<LoanProductSummary['status'], LucideIcon> = {
  Draft: Package,
  'Pending Approval': Package,
  Active: Sprout,
  Archived: BarChart3,
  Rejected: BarChart3,
};

function formatCurrencyRange(minAmount: number | null | undefined, maxAmount: number): string {
  const min = minAmount === null || minAmount === undefined ? 'n/a' : `ETB ${minAmount.toLocaleString('en-US')}`;
  return `${min} - ETB ${maxAmount.toLocaleString('en-US')}`;
}

function formatCreationDate(value: string | null | undefined): string {
  if (!value) return 'Created date unavailable';
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface ApprovalItem {
  product: LoanProductSummary;
}

export function ProductApprovalCard({ item }: { item: ApprovalItem }) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { product } = item;
  const statusStyle = statusStyles[product.status];
  const Icon = iconByStatus[product.status];

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={24} />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-bold text-gray-900">{product.product_name}</h3>
                <span className={`rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                  {product.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#4B5563]">
                <span className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 font-medium text-gray-900">
                  {formatCurrencyRange(product.min_amount, product.max_amount)}
                </span>
                <span className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 font-medium text-gray-900">
                  {product.min_interest_rate}%{product.max_interest_rate ? ` - ${product.max_interest_rate}%` : ''} p.a.
                </span>
                <span className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 font-medium text-gray-900">
                  {product.tenure_months} months
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                <CalendarDays size={14} />
                <span>Created {formatCreationDate(product.creation)}</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>ID: {product.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#15803d]"
            >
              <span>Review</span>
            </button>
          </div>
        </div>
      </div>

      <ReviewProductModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={product}
        initialMode={null}
      />
    </>
  );
}
