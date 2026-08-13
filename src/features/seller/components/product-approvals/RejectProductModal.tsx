'use client';
import { Portal } from '@/components/Portal';
import { clearMutationError, selectProductsMutationError, selectProductsMutationStatus, setProductStatus } from '@/features/seller/store/loanProductsSlice';
import { useModalA11y } from '@/hooks/useModalA11y';
import type { LoanProductSummary } from '@/lib/api/api.schemas';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Loader2, XCircle } from 'lucide-react';
import { useEffect, useId } from 'react';

interface RejectProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: LoanProductSummary | null;
}

export function RejectProductModal({ isOpen, onClose, product }: RejectProductModalProps) {
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

  const handleReject = async () => {
    if (!product) {
      return;
    }

    const result = await dispatch(
      setProductStatus({
        productId: product.name,
        status: 'Archived',
        refetchParams: { status: 'Draft' },
      })
    );

    if (setProductStatus.fulfilled.match(result)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isRejecting = mutationStatus === 'loading';

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
            <div className="absolute inset-0 animate-ping rounded-full bg-[#FEE2E2] opacity-50" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full border-[6px] border-[#FEE2E2] bg-[#FEF2F2] shadow-sm transition-transform duration-300 hover:scale-110">
              <XCircle className="h-10 w-10 text-[#EF4444] animate-pulse" />
            </div>
          </div>

          <h2 id={titleId} className="mb-3 text-[22px] font-bold text-[#111827]">
            Reject Loan Product?
          </h2>
          <p className="mb-8 px-2 text-[15px] leading-relaxed text-[#6B7280]">
            Are you sure you want to reject <span className="font-bold text-[#374151]">&quot;{product?.product_name}&quot;</span>?<br />
            This archives the submission and removes it from the approval queue.
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
              disabled={isRejecting}
              className="flex-1 rounded-xl border border-[#E5E7EB] py-3.5 text-[15px] font-bold text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isRejecting}
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-[#EF4444] py-3.5 text-[15px] font-bold text-white shadow-sm shadow-red-200 transition-colors hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isRejecting ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>{isRejecting ? 'Rejecting...' : 'Yes, Reject'}</span>
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
