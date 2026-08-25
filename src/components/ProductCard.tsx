'use client';

import { toProxiedFileUrl } from '@/lib/utils';
import { Landmark, Tag } from 'lucide-react';
import type { ReactNode } from 'react';

/** One cell of the three-up terms strip. */
export interface ProductCardTerm {
  /** Already formatted — the card does no number work of its own. */
  value: string;
  label: string;
}

/** A status pill, in the shape `getLoanProductStatusPresentation` returns. */
export interface ProductCardStatus {
  label: string;
  badgeClasses: string;
  dotClasses: string;
}

export interface ProductCardProps {
  productName: string;
  /** Sub-line beneath the title — the lending bank, in both portals. */
  subtitle?: string | null | undefined;
  imageUrl?: string | null | undefined;
  /** Floating pill, top-left of the banner. */
  bankName?: string | null | undefined;
  bankLogoUrl?: string | null | undefined;
  /** Floating pill, bottom-left of the banner. */
  category?: string | null | undefined;
  /**
   * Floating control, top-right of the banner — the farmer's bookmark toggle.
   * The bank portal passes nothing and shows a status pill instead, so the two
   * never compete for the corner.
   */
  overlay?: ReactNode | undefined;
  /** Bottom-right of the banner. Bank portal only; farmers only ever see live products. */
  status?: ProductCardStatus | null | undefined;
  terms: ProductCardTerm[];
  /** Optional line between the terms strip and the footer (applicant counts, IDs). */
  meta?: ReactNode | undefined;
  /** Primary call to action. Fills the footer width unless `secondaryAction` is set. */
  action?: ReactNode | undefined;
  /** Sits to the right of the primary action — the bank's Archive control. */
  secondaryAction?: ReactNode | undefined;
}

/**
 * The single loan-product card, shared by the farmer/development-agent catalogue
 * and the bank's own product management screens.
 *
 * These were two unrelated components — an image-banner card for Discover Loans
 * and a dense text row for the bank — which drifted apart in wording, spacing and
 * colour for the same underlying product. The visual shell lives here now; each
 * portal maps its own record shape onto these props and supplies its own actions
 * (Apply for a farmer, Edit or View for a bank).
 *
 * Purely presentational: no data fetching, no store access, and every value
 * arrives pre-formatted, so it stays usable from either feature.
 */
export function ProductCard({
  productName,
  subtitle,
  imageUrl,
  bankName,
  bankLogoUrl,
  category,
  overlay,
  status,
  terms,
  meta,
  action,
  secondaryAction,
}: ProductCardProps) {
  const proxiedImage = toProxiedFileUrl(imageUrl);
  const proxiedBankLogo = toProxiedFileUrl(bankLogoUrl);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      {/* Top half: product image banner */}
      <div className="relative w-full h-44 sm:h-48 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 overflow-hidden shrink-0 flex items-center justify-center">
        {proxiedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proxiedImage}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-10"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : null}

        {/* Fallback graphic — shown when there is no image, and left underneath
            the <img> so it also covers the case where the image fails to load. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-600/30 select-none pointer-events-none z-0">
          <Landmark className="w-14 h-14 mb-1 stroke-1" />
          {bankName ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700/40">
              {bankName}
            </span>
          ) : null}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-10 pointer-events-none" />

        {/* Top-left: bank badge */}
        {bankName ? (
          <div className="absolute top-3.5 left-3.5 z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md border border-white/40 shadow-sm rounded-full text-xs font-bold text-gray-800">
              {proxiedBankLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proxiedBankLogo}
                  alt={bankName}
                  className="w-4 h-4 rounded-full object-contain shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Landmark className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className="truncate max-w-[180px]">{bankName}</span>
            </span>
          </div>
        ) : null}

        {/* Top-right: caller-supplied control (the farmer's bookmark toggle). */}
        {overlay ? <div className="absolute top-3.5 right-3.5 z-20">{overlay}</div> : null}

        {/* Bottom-left: category pill */}
        {category ? (
          <div className="absolute bottom-3 left-3.5 z-20">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold rounded-md">
              <Tag className="w-3 h-3" />
              {category}
            </span>
          </div>
        ) : null}

        {/* Bottom-right: status pill. Opposite the category so the two never
            overlap on a narrow card. */}
        {status ? (
          <div className="absolute bottom-3 right-3.5 z-20">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-sm ${status.badgeClasses}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dotClasses}`} />
              {status.label}
            </span>
          </div>
        ) : null}
      </div>

      {/* Bottom half: content and terms */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 group-hover:text-[#16A34A] transition-colors line-clamp-1">
            {productName}
          </h3>
          {subtitle ? (
            <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">{subtitle}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2 bg-[#F9FAFB] border border-gray-100 rounded-xl p-3 text-center">
          {terms.map((term, index) => (
            <div
              key={term.label}
              // Dividers between cells rather than around them, so the strip reads
              // as one block however many terms a caller passes.
              className={index > 0 && index < terms.length - 1 ? 'border-l border-r border-gray-200/60 px-1' : ''}
            >
              <div className="text-sm sm:text-base font-bold text-gray-900 truncate">{term.value}</div>
              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                {term.label}
              </div>
            </div>
          ))}
        </div>

        {meta ? <div className="text-[12px] text-gray-500">{meta}</div> : null}

        {action || secondaryAction ? (
          <div className="pt-1 mt-auto flex items-center gap-2">
            {action ? <div className="flex-1 min-w-0">{action}</div> : null}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}
