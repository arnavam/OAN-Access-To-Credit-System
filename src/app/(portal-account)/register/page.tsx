'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterHeaderCard } from './components/RegisterHeaderCard';
import { OrganisationSection } from './components/OrganisationSection';
import { RegisteredAddressSection } from './components/RegisteredAddressSection';
import { ContactDetailsSection } from './components/ContactDetailsSection';
import { RegisterFooterCard } from './components/RegisterFooterCard';
import { OrganizationRegisteredPopup } from './components/OrganizationRegisteredPopup';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccessPopupOpen(true);
    }, 1500);
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto w-full pb-12 pt-8 px-4 sm:px-6">
        <Link
          href="/login/bank-admin"
          className="inline-flex items-center text-[14px] font-semibold text-[#4B5563] hover:text-[#1F2937] transition-colors mb-4"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Sign In
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RegisterHeaderCard />
          <OrganisationSection />
          <RegisteredAddressSection />
          <ContactDetailsSection isAgreed={isAgreed} setIsAgreed={setIsAgreed} />
          <RegisterFooterCard
            isLoading={isLoading}
            isAgreed={isAgreed}
            onBack={() => router.back()}
          />
        </form>

        <OrganizationRegisteredPopup 
          isOpen={isSuccessPopupOpen}
          onClose={() => setIsSuccessPopupOpen(false)}
        />
      </div>
    </div>
  );
}
