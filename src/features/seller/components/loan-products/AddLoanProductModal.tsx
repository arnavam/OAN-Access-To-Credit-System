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
    selectProductsMutationError,
    selectProductsMutationStatus,
    selectTags
} from '@/features/seller/store/loanProductsSlice';
import type { CreateLoanProductCompoundInput, CreateLoanProductPayload } from '@/features/seller/types/loan-products.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Loader2, Package, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const fetchedCategories = useAppSelector(selectCategories);
  const fetchedTags = useAppSelector(selectTags);
  const fetchedAttributes = useAppSelector(selectAttributes);

  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [selectedCategoryTermIds, setSelectedCategoryTermIds] = useState<string[]>([]);
  const [selectedTagTermIds, setSelectedTagTermIds] = useState<string[]>([]);
  const [selectedAttributeTermIds, setSelectedAttributeTermIds] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      void dispatch(fetchTaxonomy());
      setForm(initialFormState);
      setSelectedCategoryTermIds([]);
      setSelectedTagTermIds([]);
      setSelectedAttributeTermIds([]);
      setIsSuccess(false);
      setLocalError(null);
      dispatch(clearMutationError());
    }
  }, [dispatch, isOpen]);

  const toggleAttribute = (termId: string) => {
    if (selectedAttributeTermIds.includes(termId)) {
      setSelectedAttributeTermIds((prev) => prev.filter((id) => id !== termId));
    } else {
      setSelectedAttributeTermIds((prev) => [...prev, termId]);
    }
  };

  const handleCreatePublish = async () => {
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

    // Group selected attributes by their backend slug/taxonomy key
    const attributesPayload: Record<string, string[]> = {};
    selectedAttributeTermIds.forEach((termId) => {
      const matched = fetchedAttributes.find((attr) => attr.term_id === termId);
      if (matched) {
        // Fallback to term_id if slug is not defined
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

    if (maxInterestRate !== null) {
      createPayload.max_interest_rate = maxInterestRate;
    }
    if (minAmount !== null) {
      createPayload.min_amount = minAmount;
    }
    if (form.description.trim() !== '') {
      createPayload.description = form.description.trim();
    }

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

  // Filter out terms prefixed with Category_ or Tag_ just in case mock backend terms bleed over
  const realAttributes = fetchedAttributes?.filter(
    (attr) => !attr.term_name.startsWith('Tag_') && !attr.term_name.startsWith('Category_')
  );

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-xl bg-white shadow-xl animate-in zoom-in-95 duration-200">
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
                    <h2 className="text-[18px] font-bold text-[#1F2937]">New Loan Product</h2>
                    <p className="text-[14px] text-[#6B7280]">
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
                  <X size={24} />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 space-y-6 overflow-y-auto p-6">
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
                    <label className="text-[14px] font-bold text-[#1F2937]">
                      Loan Tags
                    </label>
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
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minInterestRate}
                      onChange={(event) => setForm((current) => ({ ...current, minInterestRate: event.target.value }))}
                      placeholder="Enter Interest rate (% p.a.)"
                      className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-bold text-[#1F2937]">Max interest rate (% p.a.)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.maxInterestRate}
                      onChange={(event) => setForm((current) => ({ ...current, maxInterestRate: event.target.value }))}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-bold text-[#1F2937]">Min amount (ETB)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.minAmount}
                      onChange={(event) => setForm((current) => ({ ...current, minAmount: event.target.value }))}
                      placeholder="Enter Min amount (ETB)"
                      className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-bold text-[#1F2937]">
                      Max amount (ETB) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.maxAmount}
                      onChange={(event) => setForm((current) => ({ ...current, maxAmount: event.target.value }))}
                      placeholder="Enter Max amount (ETB)"
                      className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-[14px] focus:border-[#00C48C] focus:outline-none focus:ring-2 focus:ring-[#00C48C]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-[#1F2937]">
                    Tenure (months) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.tenureMonths}
                    onChange={(event) => setForm((current) => ({ ...current, tenureMonths: event.target.value }))}
                    placeholder="Enter Tenure (months)"
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

              {/* Footer */}
              <div className="flex items-center justify-end gap-4 border-t border-[#E5E7EB] p-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-lg border border-[#D1D5DB] px-6 py-2.5 text-[14px] font-bold text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreatePublish}
                  disabled={isSubmitting}
                  className="flex min-w-[170px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-6 py-2.5 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
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
