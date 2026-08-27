'use client';
import { toProxiedFileUrl } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface TopOffer {
  id: string;
  bank: string;
  bank_logo?: string | null | undefined;
  loan_product_name: string;
  max_loan_amount: number;
  interest_rate: number;
  max_tenure_months: number;
}

const FALLBACK_COLOR_PALETTES = [
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-orange-100 text-orange-800 border-orange-200',
];

function getBankColorClass(bankName: string): string {
  let hash = 0;
  for (let i = 0; i < bankName.length; i++) {
    hash = (hash << 5) - hash + bankName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_COLOR_PALETTES.length;
  return FALLBACK_COLOR_PALETTES[index] ?? 'bg-emerald-100 text-emerald-800 border-emerald-200';
}

function getBankInitials(bankName: string): string {
  const words = bankName.trim().split(/\s+/).filter(Boolean);
  const firstWord = words[0];
  if (!firstWord) return 'BK';
  const secondWord = words[1];
  if (!secondWord) return firstWord.slice(0, 2).toUpperCase();
  const firstChar = firstWord[0] ?? '';
  const secondChar = secondWord[0] ?? '';
  return (firstChar + secondChar).toUpperCase() || 'BK';
}

export default function TopLoanOffersCard({ offers = [] }: { offers?: TopOffer[] | undefined }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Automatic scrolling
  useEffect(() => {
    if (offers.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 4000); // changes every 4 seconds
    return () => clearInterval(timer);
  }, [offers.length]);

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#F1F3F4] p-6 flex flex-col h-full items-center justify-center">
        <p className="text-gray-400 font-medium">No loan offers available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] border border-[#F1F3F4] p-6 flex flex-col h-full hover:-translate-y-1 hover:shadow-lg transition-all">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Top Loan Offers</h3>

      {/* Carousel Container */}
      <div className="border border-gray-100 rounded-xl relative flex-1 flex flex-col overflow-hidden bg-gray-50/30">

        {/* Sliding Track */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {offers.map((offer) => {
            const proxiedBankLogo = toProxiedFileUrl(offer.bank_logo);
            const colorClass = getBankColorClass(offer.bank);
            const initials = getBankInitials(offer.bank);
            const hasValidImage = Boolean(proxiedBankLogo && !imgErrors[offer.id]);

            return (
              <div key={offer.id} className="w-full shrink-0 flex flex-col justify-between p-4 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border ${
                        hasValidImage ? 'bg-white border-gray-100' : colorClass
                      }`}
                    >
                      {hasValidImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proxiedBankLogo}
                          alt={offer.bank}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImgErrors((prev) => ({ ...prev, [offer.id]: true }));
                          }}
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider truncate max-w-[150px]">
                        {offer.bank}
                      </div>
                      <div className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                        {offer.loan_product_name}
                      </div>
                    </div>
                  </div>
                  <span className="text-[12px] font-bold px-2 py-1 rounded-full text-green-700 bg-green-50">
                    Top
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      ETB {offer.max_loan_amount?.toLocaleString() || 0}
                    </div>
                    <div className="text-[12px] font-medium text-gray-400">Max Amount</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{offer.interest_rate}%</div>
                    <div className="text-[12px] font-medium text-gray-400">Interest</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{offer.max_tenure_months} mo</div>
                    <div className="text-[12px] font-medium text-gray-400">Tenure</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots */}
        {offers.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {offers.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentIndex === i ? 'bg-green-500 w-3' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
