"use client";
import { ArrowRight, Star, Landmark } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from '@/lib/toast';
import { formatAmount, formatRate, formatTenure } from '../../format';
import type { FarmerLoanProduct } from '../../types';

interface LoanCardProps {
  loan: FarmerLoanProduct;
  /** Rejects if the write failed, so the card can undo its optimistic update. */
  onBookmarkToggle?: (loan: FarmerLoanProduct, currentlyBookmarked: boolean) => Promise<void>;
}

export default function LoanCard({ loan, onBookmarkToggle }: LoanCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(loan.is_saved ?? false);
  const [isSaving, setIsSaving] = useState(false);

  // No prop-sync effect needed: the grid keys each card by loan.name, so a
  // different product arrives as a fresh mount and re-seeds this from is_saved.
  const handleBookmark = async () => {
    if (!onBookmarkToggle || isSaving) return;
    const previous = isBookmarked;
    setIsBookmarked(!previous);
    setIsSaving(true);
    try {
      await onBookmarkToggle(loan, previous);
    } catch (err) {
      // The write failed; showing it as saved would be a lie the next reload
      // silently corrects.
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
      setIsBookmarked(previous);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5 hover:-translate-y-1 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 relative">
            <div className="absolute inset-0 bg-blue-50 text-blue-400 flex items-center justify-center z-0">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">{loan.bank}</div>
            <h3 className="text-base font-bold text-gray-900">{loan.product_name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmark}
            disabled={isSaving}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this loan'}
            className={`transition-colors disabled:opacity-60 ${isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Star className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Details.

          Every number here is shown only when the product actually carries it.
          `|| 0` rendered a missing rate as "0%" and a missing tenure as "0 mo",
          which is not an absence — it reads as an interest-free loan repayable
          whenever, and it is the most attractive card in the list. A dash says
          the bank has not published that term. */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div>
          <div className="text-lg font-bold text-gray-900">{formatAmount(loan.max_amount)}</div>
          <div className="text-xs text-gray-400 font-medium">Max Amount</div>
        </div>
        <div className="text-center border-l border-r border-gray-100">
          <div className="text-lg font-bold text-gray-900">{formatRate(loan.min_interest_rate)}</div>
          <div className="text-xs text-gray-400 font-medium">Interest</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{formatTenure(loan.tenure_months)}</div>
          <div className="text-xs text-gray-400 font-medium">Tenure</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-100">
          {loan.bank}
        </span>
      </div>

      {/* Action */}
      <div className="flex items-center pt-1 mt-auto">
        <Link href={`/discover-loans/apply/${loan.name}`} className="flex-1 bg-[#16A34A] hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
          Apply Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
