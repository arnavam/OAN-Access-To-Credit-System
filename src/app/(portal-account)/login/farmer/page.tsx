import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LanguageSelector } from '../../components/LanguageSelector';
import { FarmerLoginForm } from './components/FarmerLoginForm';

export const metadata: Metadata = {
  title: 'Farmer Login | Ethiopia OpenAgriNet Access to Credit',
  description: 'Sign in to the Farmer Portal to browse loan offers and apply for credit.',
  robots: {
    index: false,
    follow: false,
  },
};

// TODO: these external dicebear.com avatars are already blocked in production
// by the CSP's `img-src 'self' data: blob:` (see src/proxy.ts) — replace with
// local static assets, same as leftSidebar.tsx's activeAgents.
const activeAgents = [
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', alt: 'Agent 1' },
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', alt: 'Agent 2' },
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper', alt: 'Agent 3' },
];

const PARTNER_BANKS = ['CBE', 'Dashen', 'Awash', 'CBO', 'Abyssinia', 'OIB'];

export default function FarmerLoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Back Button */}
      <div className="w-full max-w-5xl mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        {/* Left Side (Dark Green) */}
        <div className="w-full md:w-[45%] bg-[#0f6b45] p-10 md:p-14 flex flex-col relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-16 relative z-10">
            <Image
              src="/logo.png"
              alt="OARI Logo"
              width={1536}
              height={1024}
              className="h-[40px] sm:h-[48px] w-auto shrink-0"
            />
            <div className="flex flex-col border-l border-white/30 pl-2">
              <span className="text-xs font-bold text-white leading-tight tracking-wide">
                Ethiopia OpenAgriNet
              </span>
              <span className="text-[10px] text-white/80 font-medium leading-tight tracking-wide">
                Access to Credit
              </span>
            </div>
          </div>

          <div className="relative z-10 mb-8">
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-[10px] font-bold tracking-wider rounded-full uppercase mb-8 backdrop-blur-sm border border-white/10">
              FARMER PORTAL
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Empowering
              <br />
              Ethiopian
              <br />
              Agriculture
            </h1>
            <p className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-sm font-medium pr-4">
              Facilitating seamless credit access for millions of farmers through data-driven financial
              infrastructure. Secure, transparent, and resilient.
            </p>
          </div>

          <div className="mt-auto relative z-10 flex items-center gap-3">
            <div className="flex -space-x-3">
              {activeAgents.map((agent, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded-full border-2 border-[#0B6C43] overflow-hidden flex items-center justify-center bg-white z-[3]"
                >
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
          <div className="flex justify-end mb-10 relative">
            <LanguageSelector />
          </div>

          <div className="max-w-[460px] mx-auto w-full flex-grow flex flex-col justify-center">
            <FarmerLoginForm />

            <div className="text-center mt-6">
              <p className="text-sm font-medium text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup/farmer" className="text-[#16A34A] hover:text-[#158e41] transition-colors">
                  Register here
                </Link>
              </p>
            </div>

            {/* Partner Banks */}
            <div className="text-center mt-8">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Partner Banks
              </div>
              <div className="flex items-center justify-center flex-wrap gap-1.5">
                {PARTNER_BANKS.map((bank) => (
                  <span
                    key={bank}
                    className="px-4 py-1.5 rounded-full border border-[#16A34A]/30 text-[11px] font-bold text-[#16A34A] cursor-default bg-[#F7FFFB]"
                  >
                    {bank}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
