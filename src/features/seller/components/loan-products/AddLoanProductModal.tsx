'use client';
import { Portal } from '@/components/Portal';
import { LoanProductCreatedSuccess } from '@/features/seller/components/dashboard/LoanProductCreatedSuccess';
import { LoanTypeDropdown } from '@/features/seller/components/dashboard/LoanTypeDropdown';
import { ProductAttributesGrid, ProductImageDropzone, ProductTextField } from '@/features/seller/components/loan-products/ProductFormFields';
import {
    clearMutationError,
    createProductCompound,
    fetchTaxonomy,
    selectAttributes,
    selectCategories,
    selectMutationFieldErrors,
    selectProductsMutationError,
    selectProductsMutationStatus,
    selectTags
} from '@/features/seller/store/loanProductsSlice';
import { useModalA11y } from '@/hooks/useModalA11y';
import { toast } from '@/lib/toast';
import type { CreateLoanProductCompoundInput, CreateLoanProductPayload } from '@/features/seller/types/loan-products.types';
import {
    buildAttributesPayload,
    filterEligibilityAttributes,
    initialProductFormState as initialFormState,
    mapTermOptions,
    MAX_PRODUCT_IMAGE_BYTES,
    readImageFileAsDataUrl,
    resolveProductImageUrl,
    toggleSelectedId,
    toNumber,
    validateProductForm,
    type ProductFormState
} from '@/features/seller/utils/loan-product-form.utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Loader2, Package, Plus, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

interface AddLoanProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddLoanProductModal({ isOpen, onClose }: AddLoanProductModalProps) {
  const dispatch = useAppDispatch();
  const mutationStatus = useAppSelector(selectProductsMutationStatus);
  const mutationError = useAppSelector(selectProductsMutationError);
  const backendFieldErrors = useAppSelector(selectMutationFieldErrors);
  const fetchedCategories = useAppSelector(selectCategories);
  const fetchedTags = useAppSelector(selectTags);
  const fetchedAttributes = useAppSelector(selectAttributes);

  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [selectedCategoryTermIds, setSelectedCategoryTermIds] = useState<string[]>([]);
  const [selectedTagTermIds, setSelectedTagTermIds] = useState<string[]>([]);
  const [selectedAttributeTermIds, setSelectedAttributeTermIds] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();

  useEffect(() => {
    // This modal stays mounted while closed (isOpen just gates the render via
    // the early return below), so its form state must be reset here on
    // reopen rather than relying on unmount/remount to clear stale values.
    if (isOpen) {
      void dispatch(fetchTaxonomy());
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialFormState);
      setSelectedCategoryTermIds([]);
      setSelectedTagTermIds([]);
      setSelectedAttributeTermIds([]);
      setIsSuccess(false);
      setLocalError(null);
      setFieldErrors({});
      setImagePreview(null);
      dispatch(clearMutationError());
    }
  }, [dispatch, isOpen]);

  // Merge backend field errors into local field errors when they arrive
  useEffect(() => {
    if (backendFieldErrors && Object.keys(backendFieldErrors).length > 0) {
      // Syncs local state from a Redux selector when it changes — the backend
      // errors only exist in the store, so this can't be computed during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFieldErrors(backendFieldErrors);
    }
  }, [backendFieldErrors]);

  const clearFieldError = (key: string) =>
    setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });

  const toggleAttribute = (termId: string) => {
    setSelectedAttributeTermIds((prev) => toggleSelectedId(prev, termId));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      setLocalError('Image size must be less than 5MB.');
      return;
    }
    readImageFileAsDataUrl(file, setImagePreview);
  };

  const handleCreatePublish = async () => {
    const errors = validateProductForm(form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    const productName = form.productName.trim();
    const minInterestRate = toNumber(form.minInterestRate)!;
    const maxInterestRate = form.maxInterestRate.trim() ? toNumber(form.maxInterestRate) : null;
    const minAmount = form.minAmount.trim() ? toNumber(form.minAmount) : null;
    const maxAmount = toNumber(form.maxAmount)!;
    const tenureMonths = toNumber(form.tenureMonths)!;

    setFieldErrors({});
    setLocalError(null);
    setIsSuccess(false);

    // Upload image first if one was selected
    let imageUrl: string | undefined;
    try {
      imageUrl = await resolveProductImageUrl(imagePreview);
    } catch {
      setLocalError('Failed to upload product image. Please try again.');
      return;
    }

    // Dynamic grouping of selected attributes by taxonomy key/slug
    const attributesPayload = buildAttributesPayload(selectedAttributeTermIds, fetchedAttributes);

    const createPayload: CreateLoanProductPayload = {
      product_name: productName,
      min_interest_rate: minInterestRate,
      max_amount: maxAmount,
      tenure_months: tenureMonths,
    };

    if (maxInterestRate !== null) createPayload.max_interest_rate = maxInterestRate;
    if (minAmount !== null) createPayload.min_amount = minAmount;
    if (form.description.trim()) createPayload.description = form.description.trim();
    if (imageUrl) createPayload.image = imageUrl;

    const compoundInput: CreateLoanProductCompoundInput = {
      payload: createPayload,
    };
    if (selectedCategoryTermIds.length > 0) {
      compoundInput.categoryTermIds = selectedCategoryTermIds;
    }
    if (selectedTagTermIds.length > 0) {
      compoundInput.tagTermIds = selectedTagTermIds;
    }
    if (Object.keys(attributesPayload).length > 0) {
      compoundInput.attributes = attributesPayload;
    }

    const result = await dispatch(createProductCompound(compoundInput));

    if (createProductCompound.fulfilled.match(result)) {
      setIsSuccess(true);
      setForm(initialFormState);
    } else {
      // Surface the server error (e.g. duplicate product name) as a toast — the
      // inline error box sits at the bottom of a long scrollable form and is
      // easy to miss.
      const errMsg =
        (result.payload as { message?: string } | undefined)?.message ??
        'Failed to create loan product.';
      toast.error(errMsg);
    }
  };

  if (!isOpen) return null;

  const isSubmitting = mutationStatus === 'loading';

  const categoryOptions = mapTermOptions(fetchedCategories);

  const tagOptions = mapTermOptions(fetchedTags);

  const realAttributes = filterEligibilityAttributes(fetchedAttributes);

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="flex max-h-[92vh] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        >
          {isSuccess ? (
            <LoanProductCreatedSuccess
              onDone={() => {
                onClose();
                setTimeout(() => setIsSuccess(false), 300);
              }}
            />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                    <Package className="h-5 w-5 text-[#16A34A]" />
                  </div>
                  <div>
                    <h2 id={titleId} className="text-lg font-bold text-gray-900">New Loan Product</h2>
                    <p className="text-xs text-gray-500">
                      Products you create are published immediately as Active.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close create loan product modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 space-y-5 overflow-y-auto p-6">

                <ProductImageDropzone
                  variant="add"
                  required
                  imagePreview={imagePreview}
                  onPick={() => fileInputRef.current?.click()}
                  onRemove={() => setImagePreview(null)}
                  fileInputRef={fileInputRef}
                  onFileSelect={handleImageSelect}
                  altText="Product Preview"
                  placeholderText="Drag and drop an image, or click to upload"
                />

                {/* 2-Column Fields Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ProductTextField
                    variant="add"
                    label="Product Name"
                    required
                    value={form.productName}
                    onChange={(v) => { clearFieldError('product_name'); setForm((curr) => ({ ...curr, productName: v })); }}
                    placeholder="Enter Product Name"
                    error={fieldErrors.product_name}
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Loan Type <span className="text-red-500">*</span>
                    </label>
                    <LoanTypeDropdown
                      selectedTypes={selectedCategoryTermIds}
                      options={categoryOptions}
                      placeholder="Select Loan Type"
                      singleSelect={true}
                      hideCheckbox={true}
                      onChange={setSelectedCategoryTermIds}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Tags <span className="text-red-500">*</span>
                    </label>
                    <LoanTypeDropdown
                      selectedTypes={selectedTagTermIds}
                      options={tagOptions}
                      placeholder="Select Tags"
                      onChange={setSelectedTagTermIds}
                    />
                  </div>

                  <ProductTextField
                    variant="add"
                    label="Tenure (months)"
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.tenureMonths}
                    onChange={(v) => { clearFieldError('tenure_months'); setForm((curr) => ({ ...curr, tenureMonths: v })); }}
                    placeholder="Enter Tenure (months)"
                    error={fieldErrors.tenure_months}
                  />

                  <ProductTextField
                    variant="add"
                    label="Minimum Interest Rate (%)"
                    required
                    type="number"
                    min="0"
                    max="99.99"
                    step="0.01"
                    maxIntegerDigits={2}
                    maxDecimalDigits={2}
                    value={form.minInterestRate}
                    onChange={(v) => { clearFieldError('min_interest_rate'); setForm((curr) => ({ ...curr, minInterestRate: v })); }}
                    placeholder="e.g. 5"
                    error={fieldErrors.min_interest_rate}
                  />

                  <ProductTextField
                    variant="add"
                    label="Maximum Interest Rate (%)"
                    type="number"
                    min="0"
                    max="99.99"
                    step="0.01"
                    maxIntegerDigits={2}
                    maxDecimalDigits={2}
                    value={form.maxInterestRate}
                    onChange={(v) => { clearFieldError('max_interest_rate'); setForm((curr) => ({ ...curr, maxInterestRate: v })); }}
                    placeholder="e.g. 20"
                    error={fieldErrors.max_interest_rate}
                  />

                  <ProductTextField
                    variant="add"
                    label="Min amount (ETB)"
                    type="number"
                    min="0"
                    max="999999"
                    step="1"
                    maxDigits={6}
                    value={form.minAmount}
                    onChange={(v) => { clearFieldError('min_amount'); setForm((curr) => ({ ...curr, minAmount: v })); }}
                    placeholder="Enter Min amount (ETB)"
                    error={fieldErrors.min_amount}
                  />

                  <ProductTextField
                    variant="add"
                    label="Max amount (ETB)"
                    required
                    type="number"
                    min="0"
                    max="999999"
                    step="1"
                    maxDigits={6}
                    value={form.maxAmount}
                    onChange={(v) => { clearFieldError('max_amount'); setForm((curr) => ({ ...curr, maxAmount: v })); }}
                    placeholder="Enter Max amount (ETB)"
                    error={fieldErrors.max_amount}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((curr) => ({ ...curr, description: e.target.value }))}
                    placeholder="Provide a brief description of this product for farmers."
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
                  />
                </div>

                <ProductAttributesGrid
                  variant="add"
                  heading="Eligibility Criteria — Auto-applied to consented profiles"
                  attributes={realAttributes}
                  selectedAttributeTermIds={selectedAttributeTermIds}
                  onToggle={toggleAttribute}
                  emptyMessage="No eligibility criteria attributes configured."
                />

                {localError || mutationError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                    {localError ?? mutationError}
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-6 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-300 px-6 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreatePublish}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={2.5} />}
                  <span>{isSubmitting ? 'Publishing...' : 'Create & Publish'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}
