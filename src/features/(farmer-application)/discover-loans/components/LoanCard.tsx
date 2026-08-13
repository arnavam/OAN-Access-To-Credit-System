"use client";
import { ArrowRight, Bookmark, Landmark, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Loan } from '../data/mockLoans';

interface LoanCardProps {
  loan: Loan;
}

export default function LoanCard({ loan }: LoanCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(loan.isBookmarked || false);
  const [isStarred, setIsStarred] = useState(false);

  const getMatchColor = (type: string) => {
    switch (type) {
      case 'High Match':
        return 'bg-green-100 text-green-700';
      case 'Partial Match':
        return 'bg-orange-100 text-orange-700';
      case 'Farm Match':
        return 'bg-orange-100 text-orange-700';
      case 'Live Match':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5 hover:-translate-y-1 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 relative">
            {loan.bankLogo ? (
              <Image
                src={loan.bankLogo}
                alt={`${loan.bankName} logo`}
                fill
                sizes="40px"
                className="object-cover z-10 bg-white"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-blue-50 text-blue-400 flex items-center justify-center z-0">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">{loan.bankName}</div>
            <h3 className="text-base font-bold text-gray-900">{loan.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getMatchColor(loan.matchType)}`}>
            {loan.matchPercentage}% {loan.matchType}
          </span>
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`transition-colors ${isBookmarked ? 'text-[#16A34A]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div>
          <div className="text-lg font-bold text-gray-900">ETB {loan.amount.toLocaleString('en-US')}</div>
          <div className="text-xs text-gray-400 font-medium">Max Amount</div>
        </div>
        <div className="text-center border-l border-r border-gray-100">
          <div className="text-lg font-bold text-gray-900">{loan.interestRate}%</div>
          <div className="text-xs text-gray-400 font-medium">Interest</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{loan.tenureMonths} mo</div>
          <div className="text-xs text-gray-400 font-medium">Tenure</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {loan.tags.map((tag, idx) => (
          <span key={idx} className="bg-gray-50 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-100">
            {tag}
          </span>
        ))}
      </div>

      {/* Action */}
      <div className="flex items-center gap-2 pt-1 mt-auto">
        <Link href={`/discover-loans/apply/${loan.id}`} className="flex-1 bg-[#16A34A] hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
          Apply Now <ArrowRight className="w-4 h-4" />
        </Link>
        <button 
          onClick={() => setIsStarred(!isStarred)}
          className={`w-11 h-11 border rounded-xl flex items-center justify-center transition-colors shrink-0 ${isStarred ? 'bg-yellow-50 border-yellow-200 text-yellow-500' : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-yellow-500'}`}
        >
          <Star className="w-5 h-5" fill={isStarred ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
