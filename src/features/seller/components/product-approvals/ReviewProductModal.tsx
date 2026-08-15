'use client';
import { Portal } from '@/components/Portal';
import { LoanTypeDropdown } from '@/features/seller/components/dashboard/LoanTypeDropdown';
import { ProductAttributesGrid, ProductImageDropzone, ProductTextField } from '@/features/seller/components/loan-products/ProductFormFields';
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
import { useModalA11y } from '@/hooks/useModalA11y';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { filterEligibilityAttributes, mapTermOptions } from '@/features/seller/utils/loan-product-form.utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AlertCircle, CheckCircle2, Loader2, Package, X, XCircle } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

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

  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();

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
    image: productDetail?.image ?? null,
  };

  const selectedCategoryTermIds = productDetail?.categories ?? [];
  const selectedTagTermIds = productDetail?.tags ?? [];
  const selectedAttributeTermIds = productDetail?.attributes ? Object.values(productDetail.attributes).flat() : [];

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-xl bg-white shadow-xl animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] p-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E6F9F3]">
                <Package className="h-6 w-6 text-[#00C48C]" />
              </div>
              <div>
                <h2 id={titleId} className="text-[18px] font-bold text-[#1F2937]">Review Loan Product</h2>
                <p className="text-[14px] text-[#6B7280]">Review product details submitted by the agent.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isMutating}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close review modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          {isLoadingDetail ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={32} className="animate-spin text-[#00C48C]" />
            </div>
          ) : detailError ? (
            <div className="p-6">
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-[14px]">{detailError}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <ProductImageDropzone
                variant="edit"
                imagePreview={formValues.image}
                onPick={() => {}}
                onRemove={() => {}}
                fileInputRef={{ current: null }}
                onFileSelect={() => {}}
                altText="Product"
                placeholderText="No product image"
                disabled={true}
              />

              <ProductTextField
                variant="edit"
                label="Product Name"
                value={formValues.productName}
                onChange={() => {}}
                placeholder="Product Name"
                disabled={true}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-[#1F2937]">Loan Type</label>
                  <LoanTypeDropdown
                    selectedTypes={selectedCategoryTermIds}
                    options={categoryOptions}
                    placeholder="Select Loan Type"
                    singleSelect={true}
                    hideCheckbox={true}
                    onChange={() => {}}
                    disabled={true}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-[#1F2937]">Loan Tags</label>
                  <LoanTypeDropdown
                    selectedTypes={selectedTagTermIds}
                    options={tagOptions}
                    placeholder="Select Loan Tags"
                    onChange={() => {}}
                    disabled={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ProductTextField
                  variant="edit"
                  label="Interest rate (% p.a.)"
                  type="number"
                  value={formValues.minInterestRate}
                  onChange={() => {}}
                  placeholder="Min interest rate"
                  disabled={true}
                />
                <ProductTextField
                  variant="edit"
                  label="Max interest rate (% p.a.)"
                  type="number"
                  value={formValues.maxInterestRate}
                  onChange={() => {}}
                  placeholder="N/A"
                  disabled={true}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ProductTextField
                  variant="edit"
                  label="Min amount (ETB)"
                  type="number"
                  value={formValues.minAmount}
                  onChange={() => {}}
                  placeholder="N/A"
                  disabled={true}
                />
                <ProductTextField
                  variant="edit"
                  label="Max amount (ETB)"
                  type="number"
                  value={formValues.maxAmount}
                  onChange={() => {}}
                  placeholder="Max amount"
                  disabled={true}
                />
              </div>

              <ProductTextField
                variant="edit"
                label="Tenure (months)"
                type="number"
                value={formValues.tenureMonths}
                onChange={() => {}}
                placeholder="Tenure"
                disabled={true}
              />

              <ProductAttributesGrid
                variant="edit"
                heading="Eligibility Attributes"
                attributes={realAttributes}
                selectedAttributeTermIds={selectedAttributeTermIds}
                onToggle={() => {}}
                emptyMessage="No eligibility attributes configured."
                disabled={true}
              />

              <div className="space-y-1.5">
                <label className="text-[14px] font-bold text-[#1F2937]">Description</label>
                <textarea
                  value={formValues.description}
                  onChange={() => {}}
                  placeholder="No description provided."
                  rows={3}
                  disabled={true}
                  className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] bg-gray-50 opacity-70 cursor-not-allowed focus:outline-none"
                />
              </div>

              {mutationError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                  {mutationError}
                </div>
              ) : null}
            </div>
          )}

          {/* Footer actions */}
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
        </div>
      </div>
    </Portal>
  );
}
