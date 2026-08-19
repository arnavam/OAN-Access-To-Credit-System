'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCatalog } from '../../api/farmerApi';
import ApplicationHeader from './ApplicationHeader';
import ConsentManagement from './ConsentManagement';
import CreditInformation from './CreditInformation';
import type { FarmerLoanProduct } from '../../types';

interface ApplyLoanClientProps {
  productId: string;
}

export default function ApplyLoanClient({ productId }: ApplyLoanClientProps) {
  // Loan product state
  const [loanProduct, setLoanProduct] = useState<FarmerLoanProduct | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const res = await getCatalog({ loan_product: productId });
        // Read the element once and narrow it: under noUncheckedIndexedAccess a
        // length check does not tell the compiler that [0] is present.
        const product = res.data?.products?.[0];
        if (isMounted && product) {
          setLoanProduct(product);
        }
      } catch (e) {
        console.error('Failed to load loan product details', e);
      } finally {
        if (isMounted) setIsLoadingProduct(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [productId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="w-full max-w-4xl mx-auto">
        <Link href="/discover-loans" className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {isLoadingProduct ? (
          <div className="mb-6 p-6 bg-white rounded-2xl animate-pulse flex items-center justify-center min-h-[160px] border border-[#F1F3F4]">
            <div className="text-gray-400 font-medium">Loading loan details...</div>
          </div>
        ) : loanProduct ? (
          <ApplicationHeader loan={loanProduct} />
        ) : null}

        <div className="flex flex-col gap-6 mt-6">
          <ConsentManagement />
          <CreditInformation />
        </div>
      </div>
    </div>
  );
}
