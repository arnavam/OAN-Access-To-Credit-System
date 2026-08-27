'use client';

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff, Lock, User
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { LanguageSelector } from '@/app/(portal-account)/components/LanguageSelector';
import { ForgotPasswordModal } from '@/features/auth/components/ForgotPasswordModal';
import { HavingTroubleModal } from '@/features/auth/components/HavingTroubleModal';
import { clearSession } from '@/features/auth/logout';
import { clearAuthError, loginThunk, selectAuthError, selectAuthStatus } from '@/features/auth/store/authSlice';
import { useAutofillGuard } from '@/hooks/useAutofillGuard';
import { AUTH_MESSAGES } from '@/lib/authMessages';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const activeAgents = [
  { src: '/bb4a5b79fae40c0a468fa967443678ee9eb31bee.jpg', alt: 'Red-haired agent' },
  { src: '/15546d74033e37b4f05979285cbde9b0d8a08256.jpg', alt: 'Black male agent' },
  { src: '/c08326dd4541f98026723b0901e8ecaa33f73c17.jpg', alt: 'White male agent' },
];



export function LoginClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isLoading = authStatus === 'loading';

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isTroubleModalOpen, setIsTroubleModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameReadOnly, unlockUsername] = useAutofillGuard();
  const [passwordReadOnly, unlockPassword] = useAutofillGuard();
  // Sent to /api/auth/login, which uses it to pick the session lifetime (30 days
  // vs 24 hours). Until it was wired up the box rendered but was never read, so
  // every session got the same treatment whatever the person chose.
  const [rememberMe, setRememberMe] = useState(false);
  const portalSubtitle = 'Coordinate field-level agricultural credit access across regions';

  const [deniedError, setDeniedError] = useState<string | null>(null);

  const handleSignInSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setDeniedError(null);
    dispatch(clearAuthError());
    const result = await dispatch(loginThunk({ usr: username, pwd: password, rememberMe }));
    if (loginThunk.fulfilled.match(result)) {
      if (result.payload.outcome === 'password_change_required') {
        // Development Agents self-register, so they never hold an admin-issued
        // password. Handled anyway: the outcome is reachable if an A2C
        // Administrator ever resets one, and silently doing nothing here would
        // look like a dead login button.
        setDeniedError(
          'Your password was set by an administrator and must be changed before you can sign in. Please contact support.'
        );
        return;
      }
      const user = result.payload.user;
      if (user.kind === 'dev_agent') {
        router.push('/leads');
      } else {
        // Valid credentials, wrong portal: clear the session so the user
        // isn't left silently authenticated, then show a generic message.
        // Clears without redirecting — they stay on this form.
        await clearSession(dispatch);
        setDeniedError(AUTH_MESSAGES.wrongPortal);
      }
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-100px)] flex-col items-center justify-start md:justify-center bg-[linear-gradient(0deg,#F9FAFB,#F9FAFB),#FFFFFF] font-sans py-4 sm:py-8 px-4 sm:px-8">
      <main className="w-full max-w-2xl lg:max-w-[1152px] mx-auto flex flex-col">
        <div className="w-full mb-4 flex justify-start shrink-0">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#4B5563] hover:text-[#111827] font-semibold text-sm transition-colors">
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back
          </button>
        </div>
        <div className="flex overflow-hidden bg-white w-full rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex-col lg:flex-row min-h-[600px] lg:min-h-[660px] shrink-0 mb-8">
          <div className="flex flex-col justify-between isolate relative w-full lg:w-1/2 p-8 sm:p-10 lg:p-16 bg-[linear-gradient(180deg,var(--panel-bg)_0%,var(--panel-bg-deep)_100%)]">
            <div className="relative z-10">
              <div className="flex items-center gap-0 mb-10">
                <Image
                  src="/logo.png"
                  alt="Ethiopia OpenAgriNet Logo"
                  width={220}
                  height={72}
                  className="h-[56px] sm:h-[72px] object-left shrink-0"
                  style={{ width: 'auto' }}
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-white text-[16px] sm:text-[20px] leading-tight tracking-wide">Ethiopia OpenAgriNet</span>
                  <span className="text-[#E5E7EB] text-[12px] sm:text-[14px] font-normal leading-tight mt-0 tracking-widest">Access to Credit</span>
                </div>
              </div>

              <span className="inline-flex items-center rounded-full border px-3 py-1 font-semibold uppercase bg-[#6d9f6c]/20 border-[#6d9f6c]/30 text-[#6D9F6C] text-[12px] tracking-[0.6px] w-fit">Field Agent Portal</span>

              <h1 className="mt-8 font-bold text-white text-[32px] sm:text-[40px] lg:text-[48px] leading-tight lg:leading-[1.15]">
                Empowering
                <br />
                Ethiopian
                <br />
                Agriculture
              </h1>

              <p className="mt-6 max-w-[448px] text-[#D1D5DB] text-[16px] sm:text-[18px] leading-relaxed">
                Facilitating seamless credit access for millions of farmers through
                data-driven financial infrastructure. Secure, transparent, and resilient.
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
              <div className="flex items-center" aria-hidden="true">
                {activeAgents.map((agent, index) => (
                  <div
                    key={agent.src}
                    className="flex items-center justify-center rounded-full border-2 border-[#16335A] font-bold text-white w-[40px] h-[40px] text-[12px] relative overflow-hidden"
                    style={{
                      marginLeft: index === 0 ? 0 : '-12px',
                      zIndex: index + 1,
                    }}
                  >
                    <Image
                      src={agent.src}
                      alt={agent.alt}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ))}
                <span
                  className="flex items-center justify-center rounded-full border-2 border-[#16335A] font-bold text-white w-[40px] h-[40px] text-[12px] -ml-[12px] bg-[#1F2937] z-0"
                  style={{ zIndex: activeAgents.length + 1 }}
                >
                  +2k
                </span>
              </div>

              <p className="text-[#D1D5DB] text-[14px]">
                <span>Active agents in the field today</span>
              </p>
            </div>
          </div>

          <div className="flex w-full lg:w-1/2 p-6 sm:p-8 md:p-16 flex-col bg-white justify-center relative">
            <div className="flex justify-end mb-8 w-full relative z-50">
              <LanguageSelector />
            </div>

            <div className="flex flex-col items-center text-center w-full mx-auto max-w-[448px] relative z-10 mb-8">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1F2937] mb-2 tracking-tight">
                Welcome to the Portal
              </h2>
              <p className="text-[#6B7280] text-[14px] sm:text-[15px] font-medium px-2 sm:px-0 w-full sm:w-auto sm:whitespace-nowrap md:whitespace-normal md:max-w-[320px] mx-auto">
                {portalSubtitle}
              </p>
            </div>

            <div className="flex w-full mx-auto max-w-[448px] flex-col flex-1">
              {(deniedError || authError) && (
                <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  {deniedError || authError}
                </div>
              )}
              
              <form onSubmit={handleSignInSubmit} className="w-full flex flex-col gap-6" autoComplete="off">
                <div className="flex flex-col gap-5">
                  <label className="flex flex-col gap-2.5">
                    <span className="text-[14px] font-semibold text-[#374151]">Phone Number or Email</span>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                        <User size={18} strokeWidth={2} />
                      </div>
                      <input
                        type="text"
                        autoComplete="off"
                        readOnly={usernameReadOnly}
                        onFocus={unlockUsername}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="+251 911 234 567"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                      />
                    </div>
                  </label>

                  <label className="flex flex-col gap-2.5">
                    <span className="text-[14px] font-semibold text-[#374151]">Password</span>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                        <Lock size={18} strokeWidth={2} />
                      </div>
                      <input
                        type={isPasswordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        readOnly={passwordReadOnly}
                        onFocus={unlockPassword}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-12 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                      />
                      <button
                        type="button"
                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsPasswordVisible(!isPasswordVisible);
                        }}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
                      >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-[#D1D5DB] rounded-[6px] bg-white checked:bg-[#16A34A] checked:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-300 cursor-pointer hover:border-[#16A34A]/50 active:scale-90 checked:scale-110"
                      />
                      <svg
                        className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[14px] font-medium text-[#4B5563] group-hover:text-[#1F2937] transition-colors">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[14px] font-bold text-[#1F2937] hover:text-[#16A34A] transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    <span className='text-[#16A34A] font-bold text-[14px]'>Forgot Password?</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-4 rounded-xl font-bold text-[14px] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-sm disabled:opacity-70"
                >
                  <span className='font-semibold'>{isLoading ? 'Signing in…' : 'Continue to Sign In'}</span>
                  {!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
                </button>
              </form>

              <div className="mt-8 pt-4 w-full flex flex-col items-center mt-auto">
                <span className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">
                  Partner Banks
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {['CBE', 'Dashen', 'Awash', 'CBO', 'Abyssinia', 'OIB'].map(bank => (
                    <div
                      key={bank}
                      className="px-4 py-1.5 rounded-full border border-[#16A34A]/30 text-[11px] font-bold text-[#16A34A] cursor-default bg-[#F7FFFB]"
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HavingTroubleModal
        isOpen={isTroubleModalOpen}
        onClose={() => setIsTroubleModalOpen(false)}
      />
      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div >
  );
}
