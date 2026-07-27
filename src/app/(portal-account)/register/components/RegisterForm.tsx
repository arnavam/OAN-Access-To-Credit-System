'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ContactDetailsSection } from './ContactDetailsSection';
import { FormCard } from './FormCard';
import { OrganisationSection } from './OrganisationSection';
import { RegisteredAddressSection } from './RegisteredAddressSection';

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      // Redirect or show success
      router.push('/login/bank-admin');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-12 pt-8 px-4 sm:px-6">
      <Link
        href="/login/bank-admin"
        className="inline-flex items-center text-[14px] font-semibold text-[#4B5563] hover:text-[#1F2937] transition-colors mb-4"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Back to Sign In
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Card */}
        <FormCard>
          <p className="text-[12px] font-bold text-[#6B7280] mb-1">Organisation Onboarding.</p>
          <h1 className="text-[24px] font-bold text-[#1F2937] mb-2">Register your organisation</h1>
          <p className="text-[#6B7280] text-[14px]">
            A few details to confirm your organisation on the OAN Access to Credit network. KYC documents are collected after registration.
          </p>
        </FormCard>

        <OrganisationSection />
        <RegisteredAddressSection />
        <ContactDetailsSection isAgreed={isAgreed} setIsAgreed={setIsAgreed} />

        {/* Footer Actions */}
        <FormCard bodyClassName="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-[#D1D5DB] text-[#374151] rounded-lg font-bold text-[14px] hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !isAgreed}
            className="px-6 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-lg font-bold text-[14px] transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#16A34A] shadow-sm"
          >
            <span>Register Organization</span>
            <ArrowRight size={16} />
          </button>
        </FormCard>
      </form>
    </div>
  );
}
