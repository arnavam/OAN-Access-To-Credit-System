'use client';
import { Portal } from '@/components/Portal';
import { LoanProductCreatedSuccess } from '@/features/seller/components/dashboard/LoanProductCreatedSuccess';
import { LoanTypeDropdown } from '@/features/seller/components/dashboard/LoanTypeDropdown';
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
import { onboardingService } from '@/features/seller/api/onboarding.service';
import { toast } from '@/lib/toast';
import { NumericInput } from '@/components/ui/NumericInput';
import type { UpdateLoanProductCompoundInput, UpdateLoanProductPayload } from '@/features/seller/types/loan-products.types';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Image as ImageIcon, Loader2, Package, Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type EditableProduct = LoanProductSummary | { id?: string; name?: string; title?: string; product_name?: string };

interface EditLoanProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EditableProduct | null;
}

interface ProductFormState {
  productName: string;
  minInterestRate: string;
  maxInterestRate: string;
  minAmount: string;
  maxAmount: string;
  tenureMonths: string;
  description: string;
}

function toNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

  const [form, setForm] = useState<ProductFormState>({
    productName: '',
    minInterestRate: '',
    maxInterestRate: '',
    minAmount: '',
    maxAmount: '',
    tenureMonths: '',
    description: '',
  });
  const [selectedCategoryTermIds, setSelectedCategoryTermIds] = useState<string[]>([]);
  const [selectedTagTermIds, setSelectedTagTermIds] = useState<string[]>([]);
  const [selectedAttributeTermIds, setSelectedAttributeTermIds] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && product) {
      void dispatch(fetchTaxonomy());
      setIsSuccess(false);
      setLocalError(null);
      setImagePreview(null);
      dispatch(clearMutationError());
      const pId = getProductId(product);
      if (pId) {
        dispatch(fetchProductDetail(pId));
      }
    }
  }, [dispatch, isOpen, product]);

  useEffect(() => {
    if (detail && detailStatus === 'succeeded') {
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
    if (file.size > 5 * 1024 * 1024) { setLocalError('Image size must be less than 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleAttribute = (termId: string) => {
    if (selectedAttributeTermIds.includes(termId)) {
      setSelectedAttributeTermIds((prev) => prev.filter((id) => id !== termId));
    } else {
      setSelectedAttributeTermIds((prev) => [...prev, termId]);
    }
  };

  const isProductActive =
    detail?.status === 'Active' ||
    (Boolean(product) && 'status' in (product as Record<string, unknown>) && (product as Record<string, unknown>).status === 'Active');

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

    const productName = form.productName.trim();
    const minInterestRate = toNumber(form.minInterestRate);
    const maxInterestRate = form.maxInterestRate.trim() ? toNumber(form.maxInterestRate) : null;
    const minAmount = form.minAmount.trim() ? toNumber(form.minAmount) : null;
    const maxAmount = toNumber(form.maxAmount);
    const tenureMonths = toNumber(form.tenureMonths);

    if (!productName || minInterestRate === null || maxAmount === null || tenureMonths === null) {
      setLocalError('Fill in product name, minimum interest rate, maximum amount, and tenure.');
      return;
    }

    setLocalError(null);
    setIsSuccess(false);

    // Upload image if user selected a new one (base64 = new selection; URL = existing)
    let imageUrl: string | undefined = imagePreview?.startsWith('http') ? imagePreview : undefined;
    if (imagePreview && imagePreview.startsWith('data:')) {
      try {
        const base64Content = imagePreview.split(',')[1] ?? '';
        const uploadRes = await onboardingService.uploadImage({ filename: 'product-image.jpg', filedata: base64Content });
        imageUrl = uploadRes.data?.file_url;
      } catch {
        setLocalError('Failed to upload product image. Please try again.');
        return;
      }
    }

    // Group selected attributes by their backend slug/taxonomy key
    const attributesPayload: Record<string, string[]> = {};
    selectedAttributeTermIds.forEach((termId) => {
      const matched = fetchedAttributes.find((attr) => attr.term_id === termId);
      if (matched) {
        const taxonomyKey = matched.slug || matched.term_id;
        if (!attributesPayload[taxonomyKey]) {
          attributesPayload[taxonomyKey] = [];
        }
        attributesPayload[taxonomyKey].push(matched.term_id);
      }
    });

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

  const categoryOptions =
    fetchedCategories && fetchedCategories.length > 0
      ? fetchedCategories.map((c) => ({ term_id: c.term_id, term_name: c.term_name }))
      : undefined;

  const tagOptions =
    fetchedTags && fetchedTags.length > 0
      ? fetchedTags.map((t) => ({ term_id: t.term_id, term_name: t.term_name }))
      : undefined;

  const realAttributes = fetchedAttributes?.filter(
    (attr) => !attr.term_name.startsWith('Tag_') && !attr.term_name.startsWith('Category_')
  );

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div
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
                    <h2 className="text-[18px] font-bold text-[#1F2937]">Edit Loan Product</h2>
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
                  {/* Product Image */}
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-bold text-[#1F2937]">Product Image</label>
                    <input type="file" ref={fileInputRef} accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleImageSelect} />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center transition-colors hover:bg-gray-50 cursor-pointer"
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden">
                          <img src={imagePreview} alt="Product" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                            className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-400">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-semibold text-gray-700">Click to upload product image</p>
                          <p className="text-[11px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[14px] font-bold text-[#1F2937]">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.productName}
                      onChange={(event) => setForm((current) => ({ ...current, productName: event.target.value }))}
                      placeholder="Enter Product Name"
                      className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                    />
                  </div>

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
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-[#1F2937]">
                        Interest rate (% p.a.) <span className="text-red-500">*</span>
                      </label>
                      <NumericInput
                        min="0"
                        max="99.99"
                        step="0.01"
                        maxIntegerDigits={2}
                        maxDecimalDigits={2}
                        value={form.minInterestRate}
                        onChange={(event) => {
                          setForm((current) => ({ ...current, minInterestRate: event.target.value }));
                        }}
                        placeholder="Enter minimum interest rate"
                        className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-[#1F2937]">Max interest rate (% p.a.)</label>
                      <NumericInput
                        min="0"
                        max="99.99"
                        step="0.01"
                        maxIntegerDigits={2}
                        maxDecimalDigits={2}
                        value={form.maxInterestRate}
                        onChange={(event) => {
                          setForm((current) => ({ ...current, maxInterestRate: event.target.value }));
                        }}
                        placeholder="Optional"
                        className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-[#1F2937]">Min amount (ETB)</label>
                      <NumericInput
                        min="0"
                        max="999999"
                        step="1"
                        maxDigits={6}
                        value={form.minAmount}
                        onChange={(event) => {
                          setForm((current) => ({ ...current, minAmount: event.target.value }));
                        }}
                        placeholder="Optional"
                        className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-[#1F2937]">
                        Max amount (ETB) <span className="text-red-500">*</span>
                      </label>
                      <NumericInput
                        min="0"
                        max="999999"
                        step="1"
                        maxDigits={6}
                        value={form.maxAmount}
                        onChange={(event) => {
                          setForm((current) => ({ ...current, maxAmount: event.target.value }));
                        }}
                        placeholder="Enter maximum amount"
                        className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[14px] font-bold text-[#1F2937]">
                      Tenure (months) <span className="text-red-500">*</span>
                    </label>
                    <NumericInput
                      
                      min="1"
                      step="1"
                      value={form.tenureMonths}
                                            onChange={(event) => {
                        
                        setForm((current) => ({ ...current, tenureMonths: event.target.value }));
                      }}
                      placeholder="Enter tenure in months"
                      className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                    />
                  </div>

                  {/* Attributes Selection */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-[15px] font-bold text-[#1F2937]">
                      Eligibility Attributes
                    </h3>
                    {realAttributes && realAttributes.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {realAttributes.map((attr) => {
                          const isSelected = selectedAttributeTermIds.includes(attr.term_id);
                          return (
                            <div
                              key={attr.term_id}
                              className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                                isSelected
                                  ? 'scale-[1.02] border-[#00C48C] bg-[#E6F9F3] shadow-sm'
                                  : 'border-gray-200 bg-white opacity-70 hover:border-gray-300 hover:opacity-100'
                              }`}
                              onClick={() => toggleAttribute(attr.term_id)}
                            >
                              <div className={`text-[14px] font-bold ${isSelected ? 'text-[#00C48C]' : 'text-gray-700'}`}>
                                {attr.term_name}
                              </div>
                              {attr.slug ? (
                                <div className="mt-1 font-mono text-[12px] text-gray-500 opacity-80">
                                  {attr.slug}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[13px] text-gray-500 italic">No eligibility attributes configured.</p>
                    )}
                  </div>

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
