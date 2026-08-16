'use client';

import { OtpVerificationPopup } from '@/components/ui/OtpVerificationPopup';
import { ForgotPasswordModal } from '@/features/auth/components/ForgotPasswordModal';
import {
    ArrowLeft,
    ArrowRight, User
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LanguageSelector } from '../../components/LanguageSelector';

// TODO: these external dicebear.com avatars are already blocked in production
// by the CSP's `img-src 'self' data: blob:` (see src/proxy.ts) — replace with
// local static assets, same as leftSidebar.tsx's activeAgents.
const activeAgents = [
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', alt: 'Agent 1' },
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', alt: 'Agent 2' },
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper', alt: 'Agent 3' },
];



export default function FarmerLoginPage() {
  const router = useRouter();
  const [farmerId, setFarmerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSignInSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      setIsOtpModalOpen(true);
    }, 1000);
  };

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">

        {/* Back Button */}
        <div className="w-full max-w-5xl mx-auto mb-4">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>

        {/* Main Container */}
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row min-h-[750px]">

          {/* Left Side (Dark Green) */}
          <div className="w-full md:w-[45%] bg-[#0f6b45] p-10 md:p-14 flex flex-col relative overflow-hidden">

            <div className="flex items-center space-x-2 mb-16 relative z-10">
              <Image src="/logo.png" alt="OARI Logo" width={1536} height={1024} className="h-[40px] sm:h-[48px] w-auto shrink-0" />
              <div className="flex flex-col border-l border-white/30 pl-2">
                <span className="text-xs font-bold text-white leading-tight tracking-wide">Ethiopia OpenAgriNet</span>
                <span className="text-[10px] text-white/80 font-medium leading-tight tracking-wide">Access to Credit</span>
              </div>
            </div>

            <div className="relative z-10 mb-8">
              <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-[10px] font-bold tracking-wider rounded-full uppercase mb-8 backdrop-blur-sm border border-white/10">
                FIELD AGENT PORTAL
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                Empowering<br />Ethiopian<br />Agriculture
              </h1>
              <p className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-sm font-medium pr-4">
                Facilitating seamless credit access for millions of farmers through data-driven financial infrastructure. Secure, transparent, and resilient.
              </p>
            </div>

            <div className="mt-auto relative z-10 flex items-center gap-3">
              <div className="flex -space-x-3">
                {activeAgents.map((agent, index) => (
                  <div key={index} className="w-10 h-10 rounded-full border-2 border-[#0B6C43] overflow-hidden flex items-center justify-center bg-white z-[3]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- external host already blocked by CSP img-src (see TODO above); not converting to next/image since that wouldn't fix the actual issue */}
                    <img src={agent.src} alt={agent.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-[#1F2937] border-2 border-[#0B6C43] flex items-center justify-center text-[10px] font-bold text-white z-[0]">
                  +2k
                </div>
              </div>
              <span className="text-xs text-white/70 font-medium">Active agents in the field today</span>
            </div>

          </div>

          {/* Right Side (White) */}
          <div className="w-full md:w-[55%] p-8 sm:p-12 md:p-16 flex flex-col bg-white">

            {/* Top Nav (Language) */}
            <div className="flex justify-end mb-10 relative">
              <LanguageSelector />
            </div>

            <div className="max-w-[460px] mx-auto w-full flex-grow flex flex-col justify-center">

              <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Farmer Authentication</h2>
                <p className="text-gray-500 text-lg font-medium leading-relaxed px-4">Please enter your Farmer ID to proceed.</p>
              </div>

              {/* Login Form */}
              <form className="space-y-6 mb-8" onSubmit={handleSignInSubmit}>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-gray-700 flex items-center">
                    Farmer ID <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-5 h-5" /></span>
                    <input
                      type="text"
                      value={farmerId}
                      onChange={(e) => setFarmerId(e.target.value)}
                      placeholder="Search by Farmer ID or National ID"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 pb-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border-2 border-[#D1D5DB] rounded-[6px] bg-white checked:bg-[#16A34A] checked:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-300 cursor-pointer hover:border-[#16A34A]/50 active:scale-90 checked:scale-110"
                      />
                      <svg
                        className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
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
                    onClick={() => setIsForgotOpen(true)}
                    className="text-[14px] font-bold text-[#1F2937] hover:text-[#16A34A] transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#16A34A] hover:bg-[#158e41] text-white text-lg font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 group shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-4 cursor-pointer"
                >
                  {isLoading ? 'Signing In...' : 'Continue to Sign In'}
                  {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              {/* Partner Banks */}
              <div className="text-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Partner Banks</div>
                <div className="flex items-center justify-center flex-wrap gap-1.5">
                  {['CBE', 'Dashen', 'Awash', 'CBO', 'Abyssinia', 'OIB'].map((bank) => (
                    <span key={bank} className="px-4 py-1.5 rounded-full border border-[#16A34A]/30 text-[11px] font-bold text-[#16A34A] cursor-default bg-[#F7FFFB]">
                      {bank}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <OtpVerificationPopup
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSubmit={(_otp) => {
          setIsOtpModalOpen(false);
          router.push('/farmer-dashboard');
        }}
      />
      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </>
  );
}
