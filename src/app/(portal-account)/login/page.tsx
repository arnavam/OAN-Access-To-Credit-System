import { LanguageSelector } from '@/app/(portal-account)/components/LanguageSelector';
import { LeftSidebar } from '@/app/(portal-account)/components/leftSidebar';
import { LoginForm } from '@/app/(portal-account)/login/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-start md:items-center justify-center py-4 sm:py-8 px-4 sm:px-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row md:min-h-[750px] shrink-0 mb-8">
        <LeftSidebar />
        <div className="w-full md:w-[55%] p-6 sm:p-12 md:p-16 flex flex-col bg-white">
          <div className="flex justify-end mb-8 relative">
            <LanguageSelector />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
