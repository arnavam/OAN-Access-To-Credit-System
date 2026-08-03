import { LanguageSelector } from '../components/LanguageSelector';
import { LeftSidebar } from '@/app/(portal-account)/components/leftSidebar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ResetPasswordForm } from './components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Back button */}
      <div className="w-full max-w-5xl mb-4">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-[#4B5563] hover:text-[#111827] font-medium text-sm transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span>Back to Login</span>
        </Link>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        <LeftSidebar />
        <div className="w-full md:w-[55%] p-8 sm:p-12 md:p-16 flex flex-col bg-white">
          <div className="flex justify-end mb-8 relative">
            <LanguageSelector />
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
