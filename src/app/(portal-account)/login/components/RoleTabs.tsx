'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function RoleTabs() {
  const pathname = usePathname();
  const isAdmin = pathname.includes('/bank-admin');

  return (
    <div className="flex w-full max-w-lg mx-auto mb-8 flex-col sm:flex-row">
      <Link
        href="/login/bank-admin"
        className={`flex items-start gap-2.5 w-full sm:w-1/2 p-3 rounded-t-xl rounded-b-none sm:rounded-none sm:rounded-l-xl border-2 transition-colors ${isAdmin
          ? 'border-[#16A34A] bg-[#F4FDF7] z-10'
          : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
      >
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Image src="/images/icons/bank-admin.png" alt="Bank Admin" width={40} height={40} className="w-10 h-10 object-contain" />
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
        className={`flex items-start gap-2.5 w-full sm:w-1/2 p-3 rounded-b-xl rounded-t-none sm:rounded-none sm:rounded-r-xl border-2 transition-colors -mt-[2px] sm:-mt-0 sm:-ml-[2px] ${!isAdmin
          ? 'border-[#16A34A] bg-[#F4FDF7] z-10'
          : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
      >
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <Image src="/images/icons/bank-agent.png" alt="Bank Agent" width={40} height={40} className="w-10 h-10 object-contain" />
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
