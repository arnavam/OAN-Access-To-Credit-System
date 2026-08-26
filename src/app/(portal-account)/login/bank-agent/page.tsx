import { LanguageSelector } from '../../components/LanguageSelector';

import { LeftSidebar } from '@/app/(portal-account)/components/leftSidebar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BankAgentLoginForm } from './components/BankAgentLoginForm';

export default function BankAgentLoginPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-start md:justify-center py-4 sm:py-8 px-4 sm:px-8">
      {/* Back button */}
      <div className="w-full max-w-5xl mb-4 shrink-0">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-[#4B5563] hover:text-[#111827] font-medium text-sm transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span>Back</span>
        </Link>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row md:min-h-[660px] shrink-0 mb-8">
        <LeftSidebar />
        <div className="w-full md:w-[55%] p-5 sm:p-8 md:p-16 flex flex-col bg-white justify-center">
          <div className="flex justify-end mb-8 relative">
            <LanguageSelector />
          </div>
          <BankAgentLoginForm />
        </div>
      </div>
    </div>
  );
}
