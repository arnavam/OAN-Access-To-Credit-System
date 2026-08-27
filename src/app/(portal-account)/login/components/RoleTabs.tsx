'use client';

import { Landmark, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

export function RoleTabs() {
  const pathname = usePathname();
  const isAdmin = pathname.includes('/bank-admin');

  return (
    <div className="flex w-full max-w-lg mx-auto mb-8 flex-col sm:flex-row relative">
      <Link
        href="/login/bank-admin"
        className={`relative flex items-start gap-2.5 w-full sm:w-1/2 p-3 transition-colors border-2 rounded-t-xl rounded-b-none sm:rounded-none sm:rounded-l-xl ${isAdmin
          ? 'z-10 border-transparent'
          : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
      >
        {isAdmin && (
          <motion.div
            layoutId="active-role-tab"
            className="absolute inset-0 bg-[#F4FDF7] border-2 border-[#16A34A] rounded-t-xl sm:rounded-none sm:rounded-l-xl"
            style={{ zIndex: -1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Landmark className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] sm:text-[15px] font-bold text-gray-900 leading-tight mb-1">Bank Admin</span>
          <span className="text-[12px] sm:text-[12.5px] text-gray-500 leading-snug font-medium tracking-tight">
            Manage products, <br className="hidden sm:block" />approvals &amp; KYC
          </span>
        </div>
      </Link>

      <Link
        href="/login/bank-agent"
        className={`relative flex items-start gap-2.5 w-full sm:w-1/2 p-3 transition-colors border-2 rounded-b-xl rounded-t-none sm:rounded-none sm:rounded-r-xl -mt-[2px] sm:-mt-0 sm:-ml-[2px] ${!isAdmin
          ? 'z-10 border-transparent'
          : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
      >
        {!isAdmin && (
          <motion.div
            layoutId="active-role-tab"
            className="absolute inset-0 bg-[#F4FDF7] border-2 border-[#16A34A] rounded-b-xl sm:rounded-none sm:rounded-r-xl"
            style={{ zIndex: -1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <UserCog className="w-5 h-5 text-[#16A34A]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] sm:text-[15px] font-bold text-gray-900 leading-tight mb-1">Bank Agent</span>
          <span className="text-[12px] sm:text-[12.5px] text-gray-500 leading-snug font-medium tracking-tight">
            Create loan products <br className="hidden sm:block" />for approval
          </span>
        </div>
      </Link>
    </div>
  );
}
