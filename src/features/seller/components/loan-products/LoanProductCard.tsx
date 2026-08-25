'use client';

import { ProductCard } from '@/components/ProductCard';
import { getLoanProductStatusPresentation } from '@/features/seller/constants/loan-product-status';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { formatAmount, formatRateRange, formatTenure } from '@/lib/loanFormat';
import { CalendarDays, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteLoanProductModal } from './DeleteLoanProductModal';
import { EditLoanProductModal } from './EditLoanProductModal';
import { ReviewProductModal } from '../product-approvals/ReviewProductModal';

function formatCurrencyRange(minAmount: number | null | undefined, maxAmount: number): string {
  const min = minAmount === null || minAmount === undefined ? '0' : minAmount.toLocaleString('en-US');
  const max = maxAmount.toLocaleString('en-US');
  return `ETB ${min}–${max}`;
}

function formatCreationDate(value: string | null | undefined): string {
  if (!value) return 'Created date unavailable';
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface LoanProductCardProps {
  product: LoanProductSummary;
  variant?: 'default' | 'approval';
  canDelete?: boolean;
}

export function canEditLoanProduct(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s !== 'active' && s !== 'pending approval';
}

/**
 * A loan product as the owning bank sees it.
 *
 * Same shell as the farmer's Discover Loans card (`@/components/ProductCard`) —
 * these were two different components for one product and had drifted in wording,
 * spacing and colour. What the bank gets instead of Apply is a status pill and
 * one of Edit or View, decided by whether this viewer may still change the
 * product: a live or in-review product is read-only for everyone, and only a bank
 * admin (`canDelete`) may archive.
 */
export function LoanProductCard({ product, variant = 'default', canDelete = true }: LoanProductCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Extract the LAST category if given more than one
  const categories = product.categories || [];
  const lastCategoryRaw = categories.length > 0 ? categories[categories.length - 1] : '';
  const categoryKey = (lastCategoryRaw || '').replace(/^category[-_]/i, '').toLowerCase();

  const canEdit = canEditLoanProduct(product.status);
  const isApproval = variant === 'approval';
  const status = getLoanProductStatusPresentation(product.status);

  const applicantsCount = product.applications_count ?? 0;
  const bankLabel = product.bank_name || product.bank || null;

  return (
    <>
      <ProductCard
        productName={product.product_name}
        subtitle={bankLabel}
        imageUrl={product.image}
        bankName={bankLabel}
        category={categoryKey || null}
        status={status}
        terms={[
          { value: formatAmount(product.max_amount), label: 'Max Amount' },
          {
            value: formatRateRange(product.min_interest_rate, product.max_interest_rate),
            label: 'Interest p.a',
          },
          { value: formatTenure(product.tenure_months), label: 'Tenure' },
        ]}
        meta={
          // The bank's own operational detail, which the farmer card has no use
          // for: the full lending span (the terms strip above shows only the
          // ceiling, as it does for farmers) plus reach or provenance.
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-gray-700">
              {formatCurrencyRange(product.min_amount, product.max_amount)}
            </span>
            {isApproval ? (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={13} />
                  Created {formatCreationDate(product.creation)}
                </span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>ID: {product.name}</span>
              </>
            ) : (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="font-bold text-gray-900">{applicantsCount} applicants</span>
              </>
            )}
          </div>
        }
        action={
          isApproval ? (
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white font-bold py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
            >
              Review
            </button>
          ) : canEdit ? (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              aria-label={`Edit ${product.product_name}`}
              className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white font-bold py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsViewModalOpen(true)}
              aria-label={`View ${product.product_name}`}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Eye className="w-4 h-4" /> View
            </button>
          )
        }
        secondaryAction={
          !isApproval && canDelete ? (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100 active:scale-95"
              aria-label={`Archive ${product.product_name}`}
            >
              <Trash2 size={16} />
            </button>
          ) : null
        }
      />

      {isEditModalOpen && <EditLoanProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={product} />}
      {isDeleteModalOpen && <DeleteLoanProductModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} product={product} />}
      {!isApproval && isViewModalOpen && (
        <ReviewProductModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} product={product} readOnlyView={true} />
      )}
      {isApproval && isReviewModalOpen && (
        <ReviewProductModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} product={product} initialMode={null} />
      )}
    </>
  );
}
