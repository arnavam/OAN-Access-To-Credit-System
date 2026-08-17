'use client';
import {
  clearMutationError,
  clearSelectedProductDetail,
  fetchProductDetail,
  fetchTaxonomy,
  selectAttributes,
  selectCategories,
  selectDetailError,
  selectDetailStatus,
  selectProductsMutationError,
  selectProductsMutationStatus,
  selectSelectedProductDetail,
  selectTags,
  setProductStatus,
} from '@/features/seller/store/loanProductsSlice';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { filterEligibilityAttributes, mapTermOptions } from '@/features/seller/utils/loan-product-form.utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { BaseLoanProductModal } from '../loan-products/BaseLoanProductModal';

interface ReviewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: LoanProductSummary | null;
  initialMode?: 'approve' | 'reject' | null;
  readOnlyView?: boolean;
}

export function ReviewProductModal({ isOpen, onClose, product, initialMode = null, readOnlyView = false }: ReviewProductModalProps) {
  const dispatch = useAppDispatch();
  const mutationStatus = useAppSelector(selectProductsMutationStatus);
  const mutationError = useAppSelector(selectProductsMutationError);
  const detailStatus = useAppSelector(selectDetailStatus);
  const detailError = useAppSelector(selectDetailError);
  const productDetail = useAppSelector(selectSelectedProductDetail);
  const fetchedCategories = useAppSelector(selectCategories);
  const fetchedTags = useAppSelector(selectTags);
  const fetchedAttributes = useAppSelector(selectAttributes);

  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearMutationError());
      setRejectMode(initialMode === 'reject');
      setReason('');
      dispatch(fetchTaxonomy());
      if (product) {
        dispatch(fetchProductDetail(product.name));
      }
    } else {
      dispatch(clearSelectedProductDetail());
    }
  }, [dispatch, isOpen, product, initialMode]);

  const handleApprove = async () => {
    if (!product) return;
    const result = await dispatch(
      setProductStatus({
        productId: product.name,
        status: 'Active',
        refetchParams: { status: 'Draft' },
      })
    );
    if (setProductStatus.fulfilled.match(result)) {
      onClose();
    }
  };

  const handleReject = async () => {
    if (!product || !reason.trim()) return;
    const result = await dispatch(
      setProductStatus({
        productId: product.name,
        status: 'Rejected',
        reason: reason.trim(),
        refetchParams: { status: 'Draft' },
      })
    );
    if (setProductStatus.fulfilled.match(result)) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const isMutating = mutationStatus === 'loading';
  const isLoadingDetail = detailStatus === 'loading' || detailStatus === 'idle';

  const categoryOptions = mapTermOptions(fetchedCategories);
  const tagOptions = mapTermOptions(fetchedTags);
  const realAttributes = filterEligibilityAttributes(fetchedAttributes);

  // Fallback to summary data while detail is loading
  const formValues = {
    productName: productDetail?.product_name ?? product.product_name ?? '',
    minInterestRate: productDetail?.min_interest_rate?.toString() ?? product.min_interest_rate?.toString() ?? '',
    maxInterestRate: productDetail?.max_interest_rate?.toString() ?? product.max_interest_rate?.toString() ?? '',
    minAmount: productDetail?.min_amount?.toString() ?? product.min_amount?.toString() ?? '',
    maxAmount: productDetail?.max_amount?.toString() ?? product.max_amount?.toString() ?? '',
    tenureMonths: productDetail?.tenure_months?.toString() ?? product.tenure_months?.toString() ?? '',
    description: productDetail?.description ?? '',
  };

  const selectedCategoryTermIds = productDetail?.categories ?? [];
  const selectedTagTermIds = productDetail?.tags ?? [];
  const selectedAttributeTermIds = productDetail?.attributes ? Object.values(productDetail.attributes).flat() : [];

  const footerActions = (
    <div className="flex flex-col gap-4 border-t border-[#E5E7EB] p-6 bg-gray-50/50">
      {rejectMode ? (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200 w-full">
          <label htmlFor="rejectReason" className="mb-1.5 block text-[14px] font-bold text-gray-900">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejectReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this product..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[14px] focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            rows={3}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-4">
        {rejectMode ? (
          <>
            <button
              type="button"
              onClick={() => setRejectMode(false)}
              disabled={isMutating}
              className="rounded-lg border border-[#D1D5DB] bg-white px-6 py-2.5 text-[14px] font-bold text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isMutating || !reason.trim()}
              className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isMutating ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
              <span>Confirm Reject</span>
            </button>
          </>
        ) : readOnlyView ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#D1D5DB] bg-white px-6 py-2.5 text-[14px] font-bold text-[#374151] transition-colors hover:bg-gray-50"
          >
            Close
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRejectMode(true)}
              disabled={isMutating}
              className="rounded-lg border border-[#D1D5DB] bg-white px-6 py-2.5 text-[14px] font-bold text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Reject...
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isMutating || isLoadingDetail}
              className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isMutating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              <span>Approve Product</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <BaseLoanProductModal
      isOpen={isOpen}
      onClose={onClose}
      title={readOnlyView ? "View Loan Product" : "Review Loan Product"}
      subtitle={readOnlyView ? "Viewing product details." : "Review product details submitted by the agent."}
      variant="edit"
      readOnly={true}
      form={formValues}
      onFormChange={() => {}}
      imagePreview={productDetail?.image ?? null}
      onImageSelect={() => {}}
      onImageRemove={() => {}}
      fileInputRef={fileInputRef}
      categoryOptions={categoryOptions}
      tagOptions={tagOptions}
      realAttributes={realAttributes}
      selectedCategoryTermIds={selectedCategoryTermIds}
      onChangeCategories={() => {}}
      selectedTagTermIds={selectedTagTermIds}
      onChangeTags={() => {}}
      selectedAttributeTermIds={selectedAttributeTermIds}
      onToggleAttribute={() => {}}
      onClearFieldError={() => {}}
      globalError={mutationError}
      isLoadingDetail={isLoadingDetail}
      detailError={detailError}
      footerActions={footerActions}
      isSuccess={false}
      onSuccessDone={() => {}}
    />
  );
}
