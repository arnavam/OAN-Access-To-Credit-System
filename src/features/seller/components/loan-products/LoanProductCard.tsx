'use client';

import { getLoanProductStatusPresentation } from '@/features/seller/constants/loan-product-status';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { BarChart3, Box, CalendarDays, LucideIcon, Package, Pencil, Sprout, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { DeleteLoanProductModal } from './DeleteLoanProductModal';
import { EditLoanProductModal } from './EditLoanProductModal';
import { ReviewProductModal } from '../product-approvals/ReviewProductModal';

interface CategoryConfig {
  icon: LucideIcon;
  iconBg: string;
  iconText: string;
  tagBg: string;
  tagText: string;
}

const categoryThemeMap: Record<string, CategoryConfig> = {
  seed: {
    icon: Sprout,
    iconBg: 'bg-[#E6F9F3]',
    iconText: 'text-[#00C48C]',
    tagBg: 'bg-[#E6F9F3]',
    tagText: 'text-[#00C48C]',
  },
  input: {
    icon: Box,
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
    tagBg: 'bg-blue-50',
    tagText: 'text-blue-600',
  },
  livestock: {
    icon: Sprout,
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    tagBg: 'bg-amber-50',
    tagText: 'text-amber-700',
  },
  equipment: {
    icon: BarChart3,
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
    tagBg: 'bg-purple-50',
    tagText: 'text-purple-600',
  },
};

const defaultConfig: CategoryConfig = {
  icon: Package,
  iconBg: 'bg-emerald-50',
  iconText: 'text-emerald-600',
  tagBg: 'bg-emerald-50',
  tagText: 'text-emerald-700',
};

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

export function LoanProductCard({ product, variant = 'default', canDelete = true }: LoanProductCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Extract the LAST category if given more than one
  const categories = product.categories || [];
  const lastCategoryRaw = categories.length > 0 ? categories[categories.length - 1] : '';
  const categoryKey = (lastCategoryRaw || '').replace(/^category[-_]/i, '').toLowerCase();

  const theme = categoryThemeMap[categoryKey] || defaultConfig;
  const CategoryIcon = theme.icon;

  const canEdit = canEditLoanProduct(product.status);
  const isApproval = variant === 'approval';
  const status = getLoanProductStatusPresentation(product.status);

  const applicantsCount = product.applications_count ?? 0;

  return (
    <>
      <div className="flex items-start justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Left Section */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Category Icon */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}>
            <CategoryIcon size={22} />
          </div>

          <div className="space-y-2 min-w-0">
            {/* Header: Title + Category Pill + Status Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[16px] font-bold text-[#1F2937] truncate">{product.product_name}</h3>
              
              {categoryKey ? (
                <span className={`rounded-md px-2.5 py-0.5 text-[12px] font-bold ${theme.tagBg} ${theme.tagText}`}>
                  {categoryKey}
                </span>
              ) : null}

              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-bold ${status.badgeClasses}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotClasses}`} />
                {status.label}
              </span>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#4B5563]">
              <span className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-1 font-bold text-gray-900 shadow-2xs">
                {formatCurrencyRange(product.min_amount, product.max_amount)}
              </span>
              <span className="font-semibold text-gray-700">
                {product.min_interest_rate}%{product.max_interest_rate ? ` - ${product.max_interest_rate}%` : ''} p.a.
              </span>
              <span className="font-semibold text-gray-700">
                {product.tenure_months}m tenure
              </span>
              {!isApproval && (
                <span className="font-bold text-gray-900">
                  {applicantsCount} applicants
                </span>
              )}
            </div>

            {/* Extra Metadata for Approvals */}
            {isApproval && (
              <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                <CalendarDays size={14} />
                <span>Created {formatCreationDate(product.creation)}</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>ID: {product.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isApproval ? (
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#15803d]"
            >
              <span>Review</span>
            </button>
          ) : (
            <>
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100 active:scale-95"
                  aria-label={`Edit ${product.product_name}`}
                >
                  <Pencil size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 active:scale-95"
                  aria-label={`View ${product.product_name}`}
                >
                  <Eye size={15} />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors hover:bg-red-100 active:scale-95"
                  aria-label={`Archive ${product.product_name}`}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

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
