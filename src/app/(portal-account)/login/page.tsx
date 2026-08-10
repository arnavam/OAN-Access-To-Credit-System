import { LanguageSelector } from '@/app/(portal-account)/components/LanguageSelector';
import { LeftSidebar } from '@/app/(portal-account)/components/leftSidebar';
import { LoginForm } from '@/app/(portal-account)/login/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        <LeftSidebar />
        <div className="w-full md:w-[55%] p-8 sm:p-12 md:p-16 flex flex-col bg-white">
          <div className="flex justify-end mb-8 relative">
            <LanguageSelector />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
