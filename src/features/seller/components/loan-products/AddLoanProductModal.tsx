'use client';
import { Portal } from '@/components/Portal';
import { LoanProductCreatedSuccess } from '@/features/seller/components/dashboard/LoanProductCreatedSuccess';
import { LoanTypeDropdown } from '@/features/seller/components/dashboard/LoanTypeDropdown';
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
import { onboardingService } from '@/features/seller/api/onboarding.service';
import { toast } from '@/lib/toast';
import { NumericInput } from '@/components/ui/NumericInput';
import type { CreateLoanProductCompoundInput, CreateLoanProductPayload } from '@/features/seller/types/loan-products.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CheckCircle2, Image as ImageIcon, Loader2, Package, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AddLoanProductModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const initialFormState: ProductFormState = {
  productName: '',
  minInterestRate: '',
  maxInterestRate: '',
  minAmount: '',
  maxAmount: '',
  tenureMonths: '',
  description: '',
};

function toNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

  useEffect(() => {
    if (isOpen) {
      void dispatch(fetchTaxonomy());
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
      setFieldErrors(backendFieldErrors);
    }
  }, [backendFieldErrors]);

  const clearFieldError = (key: string) =>
    setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });

  const toggleAttribute = (termId: string) => {
    if (selectedAttributeTermIds.includes(termId)) {
      setSelectedAttributeTermIds((prev) => prev.filter((id) => id !== termId));
    } else {
      setSelectedAttributeTermIds((prev) => [...prev, termId]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setLocalError('Image size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!form.productName.trim()) errors.product_name = 'Product name is required.';
    if (!form.minInterestRate.trim()) errors.min_interest_rate = 'Required.';
    if (!form.maxAmount.trim()) errors.max_amount = 'Required.';
    if (!form.tenureMonths.trim()) errors.tenure_months = 'Required.';
    const minRate = toNumber(form.minInterestRate);
    const maxRate = form.maxInterestRate.trim() ? toNumber(form.maxInterestRate) : null;
    const minAmt = form.minAmount.trim() ? toNumber(form.minAmount) : null;
    const maxAmt = toNumber(form.maxAmount);
    if (maxRate !== null && minRate !== null && maxRate < minRate)
      errors.max_interest_rate = 'Must be ≥ minimum interest rate.';
    if (minAmt !== null && maxAmt !== null && minAmt > maxAmt)
      errors.min_amount = 'Must be ≤ maximum amount.';
    return errors;
  };

  const handleCreatePublish = async () => {
    const errors = validate();
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
    if (imagePreview) {
      try {
        const base64Content = imagePreview.split(',')[1] ?? '';
        const uploadRes = await onboardingService.uploadImage({ filename: 'product-image.jpg', filedata: base64Content });
        imageUrl = uploadRes.data?.file_url;
      } catch {
        setLocalError('Failed to upload product image. Please try again.');
        return;
      }
    }

    // Dynamic grouping of selected attributes by taxonomy key/slug
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
        <div className="flex max-h-[92vh] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
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
                    <h2 className="text-lg font-bold text-gray-900">New Loan Product</h2>
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
                
                {/* Product Image Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5">
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden">
                        <img src={imagePreview} alt="Product Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(null);
                          }}
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
                        <p className="text-xs font-semibold text-gray-700">
                          Drag and drop an image, or click to upload
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* 2-Column Fields Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.productName}
                      onChange={(e) => { clearFieldError('product_name'); setForm((curr) => ({ ...curr, productName: e.target.value })); }}
                      placeholder="Enter Product Name"
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 ${fieldErrors.product_name ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-[#16A34A]'}`}
                    />
                    {fieldErrors.product_name && <p className="mt-1 text-[11px] text-red-600">{fieldErrors.product_name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
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

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Tenure (months) <span className="text-red-500">*</span>
                    </label>
                    <NumericInput
                      
                      min="1"
                      step="1"
                      value={form.tenureMonths}
                                            onChange={(e) => {
                        
                        clearFieldError('tenure_months');
                        setForm((curr) => ({ ...curr, tenureMonths: e.target.value }));
                      }}
                      placeholder="Enter Tenure (months)"
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 ${fieldErrors.tenure_months ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-[#16A34A]'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Minimum Interest Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <NumericInput
                      min="0"
                      max="99.99"
                      step="0.01"
                      maxIntegerDigits={2}
                      maxDecimalDigits={2}
                      value={form.minInterestRate}
                      onChange={(e) => {
                        clearFieldError('min_interest_rate');
                        setForm((curr) => ({ ...curr, minInterestRate: e.target.value }));
                      }}
                      placeholder="e.g. 5"
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 ${fieldErrors.min_interest_rate ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-[#16A34A]'}`}
                    />
                    {fieldErrors.min_interest_rate && <p className="mt-1 text-[11px] text-red-600">{fieldErrors.min_interest_rate}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Maximum Interest Rate (%)
                    </label>
                    <NumericInput
                      min="0"
                      max="99.99"
                      step="0.01"
                      maxIntegerDigits={2}
                      maxDecimalDigits={2}
                      value={form.maxInterestRate}
                      onChange={(e) => {
                        clearFieldError('max_interest_rate');
                        setForm((curr) => ({ ...curr, maxInterestRate: e.target.value }));
                      }}
                      placeholder="e.g. 20"
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 ${fieldErrors.max_interest_rate ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-[#16A34A]'}`}
                    />
                    {fieldErrors.max_interest_rate && <p className="mt-1 text-[11px] text-red-600">{fieldErrors.max_interest_rate}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Min amount (ETB)
                    </label>
                    <NumericInput
                      min="0"
                      max="999999"
                      step="1"
                      maxDigits={6}
                      value={form.minAmount}
                      onChange={(e) => {
                        clearFieldError('min_amount');
                        setForm((curr) => ({ ...curr, minAmount: e.target.value }));
                      }}
                      placeholder="Enter Min amount (ETB)"
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 ${fieldErrors.min_amount ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-[#16A34A]'}`}
                    />
                    {fieldErrors.min_amount && <p className="mt-1 text-[11px] text-red-600">{fieldErrors.min_amount}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Max amount (ETB) <span className="text-red-500">*</span>
                    </label>
                    <NumericInput
                      min="0"
                      max="999999"
                      step="1"
                      maxDigits={6}
                      value={form.maxAmount}
                      onChange={(e) => {
                        clearFieldError('max_amount');
                        setForm((curr) => ({ ...curr, maxAmount: e.target.value }));
                      }}
                      placeholder="Enter Max amount (ETB)"
                      className={`w-full rounded-xl border px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 ${fieldErrors.max_amount ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-[#16A34A]'}`}
                    />
                    {fieldErrors.max_amount && <p className="mt-1 text-[11px] text-red-600">{fieldErrors.max_amount}</p>}
                  </div>
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

                {/* Dynamic Eligibility Attributes Section */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-3">
                    Eligibility Criteria &mdash; Auto-applied to consented profiles
                  </h3>
                  {realAttributes && realAttributes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {realAttributes.map((attr, idx) => {
                        const isSelected = selectedAttributeTermIds.includes(attr.term_id);
                        // Dynamic color themes for attributes
                        const theme = idx % 3 === 0
                          ? 'bg-[#FEFCE8] border-[#FEF08A] text-[#854D0E] subtext-[#A16207]'
                          : idx % 3 === 1
                          ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534] subtext-[#15803D]'
                          : 'bg-[#FAF5FF] border-[#E9D5FF] text-[#6B21A8] subtext-[#7E22CE]';

                        const bgClass = isSelected ? `${theme.split(' ')[0]} ${theme.split(' ')[1]}` : 'bg-white border-gray-200 opacity-70 hover:opacity-100';

                        return (
                          <div
                            key={attr.term_id}
                            onClick={() => toggleAttribute(attr.term_id)}
                            className={`cursor-pointer rounded-xl border-2 p-3.5 transition-all duration-200 ${bgClass}`}
                          >
                            <div className="flex items-center justify-between">
                              <p className={`text-xs font-bold ${isSelected ? theme.split(' ')[2] : 'text-gray-700'}`}>
                                {attr.term_name}
                              </p>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />}
                            </div>
                            {attr.slug && (
                              <p className={`text-xs font-mono mt-1 ${isSelected ? theme.split(' ')[3] : 'text-gray-400'}`}>
                                {attr.slug}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No eligibility criteria attributes configured.</p>
                  )}
                </div>

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
