'use client';
import { useEffect, useState } from 'react';

const loanOffers = [
  {
    id: 1,
    bank: 'Commercial Bank of Ethiopia',
    bankShort: 'cbe',
    title: 'Agricultural Loan',
    match: '8.5% High',
    matchStyle: 'text-green-700 bg-green-50',
    amount: 'ETB 200,000',
    interest: '11%',
    tenure: '2 mo'
  },
  {
    id: 2,
    bank: 'Awash Bank',
    bankShort: 'awash',
    title: 'Fertilizer Credit',
    match: '9.0% High',
    matchStyle: 'text-green-700 bg-green-50',
    amount: 'ETB 150,000',
    interest: '10.5%',
    tenure: '3 mo'
  },
  {
    id: 3,
    bank: 'Dashen Bank',
    bankShort: 'dashen',
    title: 'Equipment Financing',
    match: '7.8% Med',
    matchStyle: 'text-yellow-700 bg-yellow-50',
    amount: 'ETB 300,000',
    interest: '12%',
    tenure: '6 mo'
  }
];

export default function TopLoanOffersCard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatic scrolling
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loanOffers.length);
    }, 4000); // changes every 4 seconds
    return () => clearInterval(timer);
  }, []);

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
          {loanOffers.map((offer) => (
            <div key={offer.id} className="w-full shrink-0 flex flex-col justify-between p-4 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element -- external host already blocked by CSP img-src 'self' (see src/proxy.ts); not converting to next/image since that wouldn't fix the actual issue */}
                    <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${offer.bankShort}`} alt={offer.bankShort} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{offer.bank}</div>
                    <div className="text-sm font-bold text-gray-900">{offer.title}</div>
                  </div>
                </div>
                <span className={`text-[12px] font-bold px-2 py-1 rounded-full ${offer.matchStyle}`}>
                  {offer.match}
                </span>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <div>
                  <div className="text-lg font-bold text-gray-900">{offer.amount}</div>
                  <div className="text-[12px] font-medium text-gray-400">Max Amount</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{offer.interest}</div>
                  <div className="text-[12px] font-medium text-gray-400">Interest</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{offer.tenure}</div>
                  <div className="text-[12px] font-medium text-gray-400">Tenure</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {loanOffers.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-[#16A34A] scale-125' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
