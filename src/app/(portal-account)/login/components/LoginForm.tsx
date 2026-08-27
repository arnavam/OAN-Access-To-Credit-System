'use client';

import { PartnerBanks } from '@/app/(portal-account)/components/PartnerBanks';
import { SessionEndedNotice } from '@/components/SessionEndedNotice';
import { MotionEffects } from '@/components/motion/MotionEffect';
import { ArrowRight, CheckCircle, Landmark, Settings, Users, Tractor } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ROLE_ROUTES: Record<string, string> = {
  farmer: '/login/farmer',
  bank: '/login/bank-admin',
  agent: '/login/bank-agent',
  'dev-agent': '/login/development-agent',
  admin: '/login/administrator',
};

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState('farmer');

  const handleSignInSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(ROLE_ROUTES[role] ?? '/');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full px-0 sm:px-0 max-w-lg mx-auto w-full">
      {/* Every sign-out in the app lands here now, not on a per-role portal, so
          this is where an idle timeout or an expired session gets explained. */}
      <SessionEndedNotice />

      <div className="w-full flex flex-col items-center text-center mb-8">
        <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1F2937] mb-2 tracking-tight">Welcome to the Portal</h2>
        <p className="text-[#6B7280] text-[14px] sm:text-[15px] font-medium px-2 sm:px-0 w-full sm:w-auto sm:whitespace-nowrap md:whitespace-normal mx-auto">Select your role to access the agricultural credit system network.</p>
      </div>

      {/* Role Selectors */}
      <div className="w-full space-y-4 mb-8">
        <MotionEffects fade zoom={{ initialScale: 0.98 }} stagger={40} transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}>
          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:border-[#16A34A] focus-within:ring-1 focus-within:ring-[#16A34A] ${role === 'farmer' ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
            <div className="w-12 h-12 rounded-full bg-[#E8F8EE] flex items-center justify-center mr-4 shrink-0 overflow-hidden">
              <Tractor className="w-6 h-6 text-[#16A34A]" />
            </div>
            <div className="flex-grow">
              <div className="font-bold text-gray-900 text-[15px]">Farmer Applicant</div>
              <div className="text-[14px] text-gray-500 font-medium mt-0.5">Ethiopia OAN Farmer Portal</div>
            </div>
            <input type="radio" name="role" value="farmer" checked={role === 'farmer'} onChange={() => setRole('farmer')} className="sr-only" />
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <AnimatePresence initial={false}>
                {role === 'farmer' ? (
                  <motion.div key="checked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <CheckCircle className="w-6 h-6 text-[#16A34A]" />
                  </motion.div>
                ) : (
                  <motion.div key="unchecked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </label>

          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:border-[#16A34A] focus-within:ring-1 focus-within:ring-[#16A34A] ${role === 'bank' ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4 shrink-0 overflow-hidden">
              <Landmark className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-grow">
              <div className="font-bold text-gray-900 text-[15px]">Bank </div>
              <div className="text-[14px] text-gray-500 font-medium mt-0.5">Manage system setting and user access</div>
            </div>
            <input type="radio" name="role" value="bank" checked={role === 'bank'} onChange={() => setRole('bank')} className="sr-only" />
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <AnimatePresence initial={false}>
                {role === 'bank' ? (
                  <motion.div key="checked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <CheckCircle className="w-6 h-6 text-[#16A34A]" />
                  </motion.div>
                ) : (
                  <motion.div key="unchecked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </label>

          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:border-[#16A34A] focus-within:ring-1 focus-within:ring-[#16A34A] ${role === 'dev-agent' ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
            <div className="w-12 h-12 rounded-full bg-[#FFF4E5] flex items-center justify-center mr-4 shrink-0 overflow-hidden">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-grow">
              <div className="font-bold text-gray-900 text-[15px]">Development Agent</div>
              <div className="text-[14px] text-gray-500 font-medium mt-0.5">Support farmer outreach and data collection</div>
            </div>
            <input type="radio" name="role" value="dev-agent" checked={role === 'dev-agent'} onChange={() => setRole('dev-agent')} className="sr-only" />
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <AnimatePresence initial={false}>
                {role === 'dev-agent' ? (
                  <motion.div key="checked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <CheckCircle className="w-6 h-6 text-[#16A34A]" />
                  </motion.div>
                ) : (
                  <motion.div key="unchecked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </label>

          <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all group focus-within:border-[#16A34A] focus-within:ring-1 focus-within:ring-[#16A34A] ${role === 'admin' ? 'border-[#16A34A] bg-white ring-1 ring-[#16A34A]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
            <div className="w-12 h-12 rounded-full bg-[#F5F3FF] flex items-center justify-center mr-4 shrink-0 overflow-hidden">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-grow">
              <div className="font-bold text-gray-900 text-[15px]">Administrator</div>
              <div className="text-[14px] text-gray-500 font-medium mt-0.5">Monitor activity and manage system access</div>
            </div>
            <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="sr-only" />
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <AnimatePresence initial={false}>
                {role === 'admin' ? (
                  <motion.div key="checked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <CheckCircle className="w-6 h-6 text-[#16A34A]" />
                  </motion.div>
                ) : (
                  <motion.div key="unchecked" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </label>
        </MotionEffects>
      </div>

      <form className="w-full mb-10" onSubmit={handleSignInSubmit}>
        <button
          type="submit"
          className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-4 rounded-xl font-bold text-[14px] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <span className='font-semibold'>Next Step</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </form>

      <PartnerBanks />
    </div>
  );
}
