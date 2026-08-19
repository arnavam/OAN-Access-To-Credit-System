'use client';

import { fetchApi, ApiError } from '@/lib/api/fetchApi';
import {
  ArrowLeft,
  Lock,
  Mail,
  User
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { LanguageSelector } from '../../components/LanguageSelector';
import { PasswordRequirements } from '@/components/ui/PasswordRequirements';
import { strongPasswordSchema } from '@/lib/api/api.schemas';

const activeAgents = [
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', alt: 'Agent 1' },
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', alt: 'Agent 2' },
  { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper', alt: 'Agent 3' },
];

export default function FarmerSignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+251');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignUpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const parsed = strongPasswordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'That password is not strong enough.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // The phone number is kept — the consent webhook matches a farmer profile to
      // this account by mobile_no — but the email is the credential. Registering
      // without one is rejected by the backend: there is nothing to sign in with.
      const fullPhone = `${countryCode}${phoneNumber.replace(/^0+/, '')}`;
      const response = await fetchApi('oan_a2c.api.v1.auth.register_user', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          email: email.trim(),
          phone_number: fullPhone,
          password: password,
          role: 'A2C Farmer'
        }),
      });

      if (response.data && response.data.already_exists) {
        setError(response.data.message || 'Account already exists. Please log in.');
      } else {
        setIsSuccess(true);
      }
    } catch (e) {
      if (e instanceof ApiError || e instanceof Error) {
        setError(e.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              FARMER PORTAL
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Empowering<br />Ethiopian<br />Agriculture
            </h1>
            <p className="text-white/80 text-sm md:text-[15px] leading-relaxed max-w-sm font-medium pr-4">
              Join thousands of farmers gaining seamless access to financial credit.
            </p>
          </div>

          <div className="mt-auto relative z-10 flex items-center gap-3">
            <div className="flex -space-x-3">
              {activeAgents.map((agent, index) => (
                <div key={index} className="w-10 h-10 rounded-full border-2 border-[#0B6C43] overflow-hidden flex items-center justify-center bg-white z-[3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agent.src} alt={agent.alt} className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-[#1F2937] border-2 border-[#0B6C43] flex items-center justify-center text-[10px] font-bold text-white z-[0]">
                +2k
              </div>
            </div>
            <span className="text-xs text-white/70 font-medium">Farmers enrolled</span>
          </div>

        </div>

        {/* Right Side (White) */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 md:p-16 flex flex-col bg-white">

          <div className="flex justify-end mb-4 relative">
            <LanguageSelector />
          </div>

          <div className="max-w-[460px] mx-auto w-full flex-grow flex flex-col justify-center">

            <div className="text-center mb-8">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Create Account</h2>
              <p className="text-gray-500 text-lg font-medium leading-relaxed px-4">Register as a farmer to apply for loans.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm border border-green-200 mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h3>
                  <p className="text-gray-500 font-medium">Your farmer account has been created successfully. You can now log in using your email and password.</p>
                </div>
                <Link 
                  href="/login/farmer"
                  className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-4 rounded-2xl font-extrabold text-[15px] transition-all transform active:scale-[0.98] shadow-sm flex items-center justify-center"
                >
                  Proceed to Login
                </Link>
              </div>
            ) : (
              /* Signup Form */
              <form className="space-y-5 mb-8" onSubmit={handleSignUpSubmit}>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-gray-700 flex items-center">
                    Full Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-5 h-5" /></span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-gray-700 flex items-center">
                    Email <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="w-5 h-5" /></span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                    />
                  </div>
                  <p className="text-[12px] text-gray-500 font-medium">
                    You will sign in with this address.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-gray-700 flex items-center">
                    Phone Number <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex shadow-sm">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-3 bg-gray-50 border border-r-0 border-[#D1D5DB] rounded-l-xl text-[14px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] font-medium cursor-pointer"
                    >
                      <option value="+251">🇪🇹 +251</option>
                      <option value="+254">🇰🇪 +254</option>
                      <option value="+256">🇺🇬 +256</option>
                      <option value="+250">🇷🇼 +250</option>
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="912 345 678"
                      required
                      className="w-full px-4 py-3 bg-white border border-[#D1D5DB] rounded-r-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-gray-700 flex items-center">
                    Password <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="w-5 h-5" /></span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-gray-700 flex items-center">
                    Confirm Password <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="w-5 h-5" /></span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#D1D5DB] rounded-xl text-[14px] text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#9CA3AF] font-medium shadow-sm"
                    />
                  </div>
                </div>

                <PasswordRequirements password={password} />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-4 rounded-2xl font-extrabold text-[15px] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center mt-4 shadow-sm"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}

            {!isSuccess && (
              <p className="text-center text-gray-600 font-medium">
                Already have an account?{' '}
                <Link href="/login/farmer" className="text-[#16A34A] hover:text-[#15803d] font-bold">
                  Log in
                </Link>
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
