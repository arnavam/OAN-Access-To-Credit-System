'use client';
import { Portal } from '@/components/Portal';
import { clearMutationError, selectProductsMutationError, selectProductsMutationStatus, setProductStatus } from '@/features/seller/store/loanProductsSlice';
import { useModalA11y } from '@/hooks/useModalA11y';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useId } from 'react';

interface ApproveProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: LoanProductSummary | null;
}

export function ApproveProductModal({ isOpen, onClose, product }: ApproveProductModalProps) {
  const dispatch = useAppDispatch();
  const mutationStatus = useAppSelector(selectProductsMutationStatus);
  const mutationError = useAppSelector(selectProductsMutationError);
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      dispatch(clearMutationError());
    }
  }, [dispatch, isOpen]);

  const handleApprove = async () => {
    if (!product) {
      return;
    }

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

  if (!isOpen) return null;

  const isApproving = mutationStatus === 'loading';

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="flex w-full max-w-[570px] flex-col rounded-[24px] bg-white p-8 text-center shadow-xl animate-in zoom-in-95 duration-200"
        >
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#D1FAE5] opacity-50" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full border-[6px] border-[#D1FAE5] bg-[#ECFDF5] shadow-sm transition-transform duration-300 hover:scale-110">
              <CheckCircle2 className="h-10 w-10 text-[#10B981] animate-pulse" />
            </div>
          </div>

          <h2 id={titleId} className="mb-3 text-[22px] font-bold text-[#111827]">
            Approve Loan Product?
          </h2>
          <p className="mb-8 px-2 text-[15px] leading-relaxed text-[#6B7280]">
            Are you sure you want to approve <span className="font-bold text-[#374151]">&quot;{product?.product_name}&quot;</span>?<br />
            This will publish the product as active for farmers.
          </p>

          {mutationError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left text-[14px] text-red-700">
              {mutationError}
            </div>
          ) : null}

          <div className="flex w-full items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isApproving}
              className="flex-1 rounded-xl border border-[#E5E7EB] py-3.5 text-[15px] font-bold text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-[#16A34A] py-3.5 text-[15px] font-bold text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isApproving ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>{isApproving ? 'Approving...' : 'Yes, Approve'}</span>
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
