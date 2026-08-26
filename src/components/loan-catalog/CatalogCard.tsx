'use client';
import { formatAmount, formatRate, formatTenure } from '@/lib/format/loanTerms';
import { toast } from '@/lib/toast';
import { toProxiedFileUrl } from '@/lib/utils';
import { resolveCategory, type CatalogProduct } from '@/types/loan-catalog';
import { Landmark, Star, Tag } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface CatalogCardProps {
  product: CatalogProduct;
  /**
   * The card footer. Required rather than defaulted: what a card lets you do is
   * the one thing the two portals genuinely disagree about — a farmer applies,
   * a bank edits its own product — and a default would silently give one of
   * them the other's button.
   */
  actions: ReactNode;
  /** Extra pill beside the category, e.g. the bank's approval status. */
  badge?: ReactNode;
  /** A line under the title, e.g. how many farmers have applied. */
  meta?: ReactNode;
  /**
   * Bookmarking is farmer-only. Omitted, no star renders at all.
   * Rejects if the write failed, so the card can undo its optimistic update.
   */
  onBookmarkToggle?: (product: CatalogProduct, currentlyBookmarked: boolean) => Promise<void>;
}

export default function CatalogCard({
  product,
  actions,
  badge,
  meta,
  onBookmarkToggle,
}: CatalogCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(product.is_saved ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const rawImage = product.image_url || product.image;
  const proxiedImage = toProxiedFileUrl(rawImage);
  const proxiedBankLogo = toProxiedFileUrl(product.bank_logo);
  const displayBank = product.bank_name || product.bank;
  const category = resolveCategory(product);

  // No prop-sync effect needed: the grid keys each card by product.name, so a
  // different product arrives as a fresh mount and re-seeds this from is_saved.
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onBookmarkToggle || isSaving) return;
    const previous = isBookmarked;
    setIsBookmarked(!previous);
    setIsSaving(true);
    try {
      await onBookmarkToggle(product, previous);
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
            alt={product.product_name}
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
        {onBookmarkToggle && (
          <div className="absolute top-3.5 right-3.5 z-20">
            <button
              type="button"
              onClick={handleBookmark}
              disabled={isSaving}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this loan'}
              className={`w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center transition-all hover:scale-110 disabled:opacity-60 ${
                isBookmarked ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Star className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        )}

        {/* Floating Bottom Left: Category Pill */}
        {category && (
          <div className="absolute bottom-3 left-3.5 z-20">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold rounded-md">
              <Tag className="w-3 h-3" />
              {category}
            </span>
          </div>
        )}

        {/* Floating Bottom Right: caller-supplied badge (bank status) */}
        {badge && <div className="absolute bottom-3 right-3.5 z-20">{badge}</div>}
      </div>

      {/* Bottom Half: Content & Financial Terms */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-gray-900 group-hover:text-[#16A34A] transition-colors line-clamp-1">
            {product.product_name}
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">{displayBank}</p>
          {meta && <div className="text-xs text-gray-600 font-semibold mt-1.5">{meta}</div>}
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-3 gap-2 bg-[#F9FAFB] border border-gray-100 rounded-xl p-3 text-center">
          <div>
            <div className="text-sm sm:text-base font-bold text-gray-900 truncate">{formatAmount(product.max_amount)}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Max Amount</div>
          </div>
          <div className="border-l border-r border-gray-200/60 px-1">
            <div className="text-sm sm:text-base font-bold text-gray-900">{formatRate(product.min_interest_rate)}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Interest p.a</div>
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-gray-900">{formatTenure(product.tenure_months)}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Tenure</div>
          </div>
        </div>

        {/* Action */}
        <div className="pt-1 mt-auto">{actions}</div>
      </div>
    </div>
  );
}
