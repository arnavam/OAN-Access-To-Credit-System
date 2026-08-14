'use client';
import { Portal } from '@/components/Portal';
import { LoanProductCreatedSuccess } from '@/features/seller/components/dashboard/LoanProductCreatedSuccess';
import { LoanTypeDropdown } from '@/features/seller/components/dashboard/LoanTypeDropdown';
import { ProductAttributesGrid, ProductImageDropzone, ProductTextField } from '@/features/seller/components/loan-products/ProductFormFields';
import {
    clearMutationError,
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
    updateProductCompound
} from '@/features/seller/store/loanProductsSlice';
import { useModalA11y } from '@/hooks/useModalA11y';
import { toast } from '@/lib/toast';
import type { UpdateLoanProductCompoundInput, UpdateLoanProductPayload } from '@/features/seller/types/loan-products.types';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import {
    buildAttributesPayload,
    filterEligibilityAttributes,
    initialProductFormState,
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
import { Loader2, Package, Save, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

type EditableProduct = LoanProductSummary | { id?: string; name?: string; title?: string; product_name?: string };

interface EditLoanProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EditableProduct | null;
}

function getProductId(product: EditableProduct): string {
  if ('name' in product && typeof product.name === 'string' && product.name) {
    return product.name;
  }
  if ('id' in product && typeof product.id === 'string' && product.id) {
    return product.id;
  }
  return '';
}

export function EditLoanProductModal({ isOpen, onClose, product }: EditLoanProductModalProps) {
  const dispatch = useAppDispatch();
  const mutationStatus = useAppSelector(selectProductsMutationStatus);
  const mutationError = useAppSelector(selectProductsMutationError);
  const detail = useAppSelector(selectSelectedProductDetail);
  const detailStatus = useAppSelector(selectDetailStatus);
  const detailError = useAppSelector(selectDetailError);
  const fetchedCategories = useAppSelector(selectCategories);
  const fetchedTags = useAppSelector(selectTags);
  const fetchedAttributes = useAppSelector(selectAttributes);

  const [form, setForm] = useState<ProductFormState>(initialProductFormState);
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
    if (isOpen && product) {
      void dispatch(fetchTaxonomy());
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSuccess(false);
      setLocalError(null);
      setFieldErrors({});
      setImagePreview(null);
      dispatch(clearMutationError());
      const pId = getProductId(product);
      if (pId) {
        dispatch(fetchProductDetail(pId));
      }
    }
  }, [dispatch, isOpen, product]);

  useEffect(() => {
    // Populates the form once the fetched product detail arrives — can't be
    // computed during render since detail is loaded asynchronously.
    if (detail && detailStatus === 'succeeded') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        productName: detail.product_name ?? '',
        minInterestRate: detail.min_interest_rate?.toString() ?? '',
        maxInterestRate: detail.max_interest_rate?.toString() ?? '',
        minAmount: detail.min_amount?.toString() ?? '',
        maxAmount: detail.max_amount?.toString() ?? '',
        tenureMonths: detail.tenure_months?.toString() ?? '',
        description: detail.description ?? '',
      });

      if (detail.image) setImagePreview(detail.image);

      if (detail.categories && detail.categories.length > 0) {
        setSelectedCategoryTermIds(detail.categories);
      }
      if (detail.tags && detail.tags.length > 0) {
        setSelectedTagTermIds(detail.tags);
      }
      if (detail.attributes && Object.keys(detail.attributes).length > 0) {
        const flatAttrKeys = Object.values(detail.attributes).flat();
        setSelectedAttributeTermIds(flatAttrKeys);
      }
    }
  }, [detail, detailStatus]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) { setLocalError('Image size must be less than 5MB.'); return; }
    readImageFileAsDataUrl(file, setImagePreview);
  };

  const toggleAttribute = (termId: string) => {
    setSelectedAttributeTermIds((prev) => toggleSelectedId(prev, termId));
  };

  const isProductActive =
    detail?.status === 'Active' ||
    (Boolean(product) && 'status' in (product as Record<string, unknown>) && (product as Record<string, unknown>).status === 'Active');

  const clearFieldError = (key: string) =>
    setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });

  const handleSaveData = async () => {
    if (!product) {
      setLocalError('No loan product selected.');
      return;
    }
    const productId = getProductId(product);
    if (!productId) {
      setLocalError('Invalid loan product ID.');
      return;
    }

    if (isProductActive) {
      setLocalError('Active loan products cannot be edited.');
      return;
    }

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

    // Upload image if user selected a new one (base64 = new selection; URL = existing)
    let imageUrl: string | undefined;
    try {
      imageUrl = await resolveProductImageUrl(imagePreview);
    } catch {
      setLocalError('Failed to upload product image. Please try again.');
      return;
    }

    // Group selected attributes by their backend slug/taxonomy key
    const attributesPayload = buildAttributesPayload(selectedAttributeTermIds, fetchedAttributes);

    const updatePayload: UpdateLoanProductPayload = {
      product_id: productId,
      product_name: productName,
      min_interest_rate: minInterestRate,
      max_amount: maxAmount,
      tenure_months: tenureMonths,
    };

    if (maxInterestRate !== null) {
      updatePayload.max_interest_rate = maxInterestRate;
    }
    if (minAmount !== null) {
      updatePayload.min_amount = minAmount;
    }
    if (form.description.trim() !== '') updatePayload.description = form.description.trim();
    if (imageUrl) updatePayload.image = imageUrl;

    const compoundInput: UpdateLoanProductCompoundInput = {
      payload: updatePayload,
      categoryTermIds: selectedCategoryTermIds,
      tagTermIds: selectedTagTermIds,
      attributes: attributesPayload,
    };

    const result = await dispatch(updateProductCompound(compoundInput));

    if (updateProductCompound.fulfilled.match(result)) {
      setIsSuccess(true);
    } else {
      // Surface the server error (e.g. duplicate product name) as a toast — the
      // inline error box is easy to miss at the bottom of the form.
      const errMsg =
        (result.payload as { message?: string } | undefined)?.message ??
        'Failed to update loan product.';
      toast.error(errMsg);
    }
  };

  if (!isOpen) return null;

  const isSubmitting = mutationStatus === 'loading';
  const isLoadingDetail = detailStatus === 'loading' || detailStatus === 'idle';

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
          className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl animate-in zoom-in-95 duration-200 ${
            isSuccess ? 'max-w-[520px]' : 'max-w-[700px]'
          }`}
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
              <div className="flex items-center justify-between border-b border-[#E5E7EB] p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E6F9F3]">
                    <Package className="h-6 w-6 text-[#00C48C]" />
                  </div>
                  <div>
                    <h2 id={titleId} className="text-[18px] font-bold text-[#1F2937]">Edit Loan Product</h2>
                    <p className="text-[14px] text-[#6B7280]">Changes are saved to the bank product catalog.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close edit loan product modal"
                >
                  <X size={24} />
                </button>
              </div>

              {isLoadingDetail ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 size={32} className="animate-spin text-[#00C48C]" />
                </div>
              ) : detailError ? (
                <div className="p-6">
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                    {detailError}
                  </div>
                </div>
              ) : (
                <div className="flex-1 space-y-6 overflow-y-auto p-6">
                  <ProductImageDropzone
                    variant="edit"
                    imagePreview={imagePreview}
                    onPick={() => fileInputRef.current?.click()}
                    onRemove={() => setImagePreview(null)}
                    fileInputRef={fileInputRef}
                    onFileSelect={handleImageSelect}
                    altText="Product"
                    placeholderText="Click to upload product image"
                  />

                  <ProductTextField
                    variant="edit"
                    label="Product Name"
                    required
                    value={form.productName}
                    onChange={(v) => { clearFieldError('product_name'); setForm((current) => ({ ...current, productName: v })); }}
                    placeholder="Enter Product Name"
                    error={fieldErrors.product_name}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-[#1F2937]">
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
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-[#1F2937]">Loan Tags</label>
                      <LoanTypeDropdown
                        selectedTypes={selectedTagTermIds}
                        options={tagOptions}
                        placeholder="Select Loan Tags"
                        onChange={setSelectedTagTermIds}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ProductTextField
                      variant="edit"
                      label="Interest rate (% p.a.)"
                      required
                      type="number"
                      min="0"
                      max="99.99"
                      step="0.01"
                      maxIntegerDigits={2}
                      maxDecimalDigits={2}
                      value={form.minInterestRate}
                      onChange={(v) => { clearFieldError('min_interest_rate'); setForm((current) => ({ ...current, minInterestRate: v })); }}
                      placeholder="Enter minimum interest rate"
                      error={fieldErrors.min_interest_rate}
                    />
                    <ProductTextField
                      variant="edit"
                      label="Max interest rate (% p.a.)"
                      type="number"
                      min="0"
                      max="99.99"
                      step="0.01"
                      maxIntegerDigits={2}
                      maxDecimalDigits={2}
                      value={form.maxInterestRate}
                      onChange={(v) => { clearFieldError('max_interest_rate'); setForm((current) => ({ ...current, maxInterestRate: v })); }}
                      placeholder="Optional"
                      error={fieldErrors.max_interest_rate}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ProductTextField
                      variant="edit"
                      label="Min amount (ETB)"
                      type="number"
                      min="0"
                      max="999999"
                      step="1"
                      maxDigits={6}
                      value={form.minAmount}
                      onChange={(v) => { clearFieldError('min_amount'); setForm((current) => ({ ...current, minAmount: v })); }}
                      placeholder="Optional"
                      error={fieldErrors.min_amount}
                    />
                    <ProductTextField
                      variant="edit"
                      label="Max amount (ETB)"
                      required
                      type="number"
                      min="0"
                      max="999999"
                      step="1"
                      maxDigits={6}
                      value={form.maxAmount}
                      onChange={(v) => { clearFieldError('max_amount'); setForm((current) => ({ ...current, maxAmount: v })); }}
                      placeholder="Enter maximum amount"
                      error={fieldErrors.max_amount}
                    />
                  </div>

                  <ProductTextField
                    variant="edit"
                    label="Tenure (months)"
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.tenureMonths}
                    onChange={(v) => { clearFieldError('tenure_months'); setForm((current) => ({ ...current, tenureMonths: v })); }}
                    placeholder="Enter tenure in months"
                    error={fieldErrors.tenure_months}
                  />

                  <ProductAttributesGrid
                    variant="edit"
                    heading="Eligibility Attributes"
                    attributes={realAttributes}
                    selectedAttributeTermIds={selectedAttributeTermIds}
                    onToggle={toggleAttribute}
                    emptyMessage="No eligibility attributes configured."
                  />

                  <div className="space-y-1.5">
                    <label className="text-[14px] font-bold text-[#1F2937]">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Optional product description"
                      rows={3}
                      className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                    />
                  </div>

                  {localError || mutationError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                      {localError ?? mutationError}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex items-center justify-end gap-4 border-t border-[#E5E7EB] p-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-lg border border-[#D1D5DB] bg-white px-6 py-2.5 text-[14px] font-bold text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveData}
                  disabled={isSubmitting || isLoadingDetail || isProductActive}
                  className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}
