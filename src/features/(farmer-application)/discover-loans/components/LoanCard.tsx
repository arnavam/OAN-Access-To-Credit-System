"use client";
import { ArrowRight, Star, Landmark, Tag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from '@/lib/toast';
import { toProxiedFileUrl } from '@/lib/utils';
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

  const rawImage = loan.image_url || loan.image;
  const proxiedImage = toProxiedFileUrl(rawImage);
  const proxiedBankLogo = toProxiedFileUrl(loan.bank_logo);
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
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
      setIsBookmarked(previous);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      {/* Top Half: Product Image Banner */}
      <div className="relative w-full h-44 sm:h-48 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 overflow-hidden shrink-0 flex items-center justify-center">
        {proxiedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proxiedImage}
            alt={loan.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-10"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : null}

        {/* Fallback Graphic (shows when no image or image is loading) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-600/30 select-none pointer-events-none z-0">
          <Landmark className="w-14 h-14 mb-1 stroke-1" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700/40">
            {displayBank}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-10 pointer-events-none" />

        {/* Floating Top Left: Bank Badge */}
        <div className="absolute top-3.5 left-3.5 z-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md border border-white/40 shadow-sm rounded-full text-xs font-bold text-gray-800">
            {proxiedBankLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proxiedBankLogo}
                alt={displayBank}
                className="w-4 h-4 rounded-full object-contain shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Landmark className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span className="truncate max-w-[180px]">{displayBank}</span>
          </span>
        </div>

        {/* Floating Top Right: Bookmark Button */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <button
            type="button"
            onClick={handleBookmark}
            disabled={isSaving}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this loan'}
            className={`w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center transition-all hover:scale-110 disabled:opacity-60 ${isBookmarked ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <Star className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Floating Bottom Left: Category Pill */}
        {loan.categories && loan.categories.length > 0 && (
          <div className="absolute bottom-3 left-3.5 z-20">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold rounded-md">
              <Tag className="w-3 h-3" />
              {loan.categories[0]}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Half: Content & Financial Terms */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-gray-900 group-hover:text-[#16A34A] transition-colors line-clamp-1">
            {loan.product_name}
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">{displayBank}</p>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-3 gap-2 bg-[#F9FAFB] border border-gray-100 rounded-xl p-3 text-center">
          <div>
            <div className="text-sm sm:text-base font-bold text-gray-900 truncate">{formatAmount(loan.max_amount)}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Max Amount</div>
          </div>
          <div className="border-l border-r border-gray-200/60 px-1">
            <div className="text-sm sm:text-base font-bold text-gray-900">{formatRate(loan.min_interest_rate)}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Interest p.a</div>
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-gray-900">{formatTenure(loan.tenure_months)}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Tenure</div>
          </div>
        </div>

        {/* Action */}
        <div className="pt-1 mt-auto">
          <Link
            href={`/discover-loans/apply/${loan.name}`}
            className="w-full bg-[#16A34A] hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-md"
          >
            <span className='text-white flex justify-between items-center gap-2'> Apply Now <ArrowRight className="w-4 h-4" /></span>

          </Link>
        </div>
      </div>
    </div>
  );
}
