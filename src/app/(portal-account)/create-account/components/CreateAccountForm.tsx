'use client';

import { useState } from 'react';
import { User, Lock, Eye, EyeOff, ChevronDown, Info, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function CreateAccountForm() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 1000);
  };

  return (
    <div className="max-w-[420px] mx-auto w-full flex-grow flex flex-col justify-center">
      <div className="text-center mb-8">
        <h2 className="text-[32px] font-extrabold text-gray-900 mb-3 tracking-tight">Create Account</h2>
        <p className="text-gray-500 text-[15px] font-medium leading-relaxed px-4">Select your role to access the agricultural credit system network.</p>
      </div>

      {/* Form Fields */}
      <form className="space-y-4 mb-6" onSubmit={handleRegisterSubmit}>

        {/* Full name */}
        <div>
          <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Full name</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="First and last name"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-sm text-gray-900 transition-colors"
              required
            />
          </div>
        </div>

        {/* Mobile number */}
        <div>
          <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Mobile number <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <div className="relative w-[100px] shrink-0">
              <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] transition-colors cursor-pointer">
                <option value="+255">+255</option>
                <option value="+251">+251</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <input
              type="tel"
              placeholder="Enter mobile Number"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-sm text-gray-900 transition-colors"
              required
            />
          </div>
        </div>

        {/* Email ID */}
        <div>
          <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Email ID</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="Enter email id"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-sm text-gray-900 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[14px] font-bold text-gray-700 mb-1.5">Password</label>
          <div className="relative flex items-center mb-1.5">
            <div className="absolute left-3 text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] text-sm text-gray-900 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            Passwords must be at least 6 characters.
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#16A34A] hover:bg-[#158e41] text-white text-base font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 group shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-6"
        >
          {isLoading ? 'Processing...' : 'Continue to Sign In'}
          {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

    </div>
  );
}
