"use client";
import { ProductCard } from '@/components/ProductCard';
import { toast } from '@/lib/toast';
import { ArrowRight, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatAmount, formatRate, formatTenure } from '../../format';
import type { FarmerLoanProduct } from '../../types';

interface LoanCardProps {
  loan: FarmerLoanProduct;
  /** Rejects if the write failed, so the card can undo its optimistic update. */
  onBookmarkToggle?: (loan: FarmerLoanProduct, currentlyBookmarked: boolean) => Promise<void>;
}

/**
 * The catalogue card a farmer (or a development agent browsing on their behalf)
 * sees in Discover Loans.
 *
 * The shell is the shared `ProductCard`, so this stays the same card the bank
 * sees in its own product management screens; what differs is what it can do —
 * a bookmark toggle over the banner and an Apply call to action, where the bank
 * gets a status pill and Edit/View.
 */
export default function LoanCard({ loan, onBookmarkToggle }: LoanCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(loan.is_saved ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const displayBank = loan.bank_name || loan.bank;

  // No prop-sync effect needed: the grid keys each card by loan.name, so a
  // different product arrives as a fresh mount and re-seeds this from is_saved.
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onBookmarkToggle || isSaving) return;
    const previous = isBookmarked;
    setIsBookmarked(!previous);
    setIsSaving(true);
    try {
      await onBookmarkToggle(loan, previous);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update bookmark');
      setIsBookmarked(previous);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProductCard
      productName={loan.product_name}
      subtitle={displayBank}
      imageUrl={loan.image_url || loan.image}
      bankName={displayBank}
      bankLogoUrl={loan.bank_logo}
      category={loan.categories && loan.categories.length > 0 ? loan.categories[0] : null}
      terms={[
        { value: formatAmount(loan.max_amount), label: 'Max Amount' },
        { value: formatRate(loan.min_interest_rate), label: 'Interest p.a' },
        { value: formatTenure(loan.tenure_months), label: 'Tenure' },
      ]}
      overlay={
        /* A bookmark icon, not a star — a star reads as a rating or a favourite,
           and this is the same saved list the sidebar filters on and the
           aria-label already calls a bookmark. Brand green for the set state,
           matching every other active control on the page. */
        <button
          type="button"
          onClick={handleBookmark}
          disabled={isSaving}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this loan'}
          className={`w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center transition-all hover:scale-110 disabled:opacity-60 ${
            isBookmarked ? 'text-[#16A34A]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      }
      action={
        <Link
          href={`/discover-loans/apply/${loan.name}`}
          className="w-full bg-[#16A34A] hover:bg-green-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
        >
          Apply Now <ArrowRight className="w-4 h-4" />
        </Link>
      }
    />
  );
}
