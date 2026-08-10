'use client';
import { selectBankStatus } from '@/features/auth/store/authSlice';
import { fetchDashboardStats, selectSellerStats } from '@/features/seller/store/loanProductsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ClipboardCheck, LayoutDashboard, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function FarmerSidebar({ isExpanded, setIsExpanded: _setIsExpanded }: SidebarProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const bankStatus = useAppSelector(selectBankStatus);
  const sellerStats = useAppSelector(selectSellerStats);

  useEffect(() => {
    if (!sellerStats) {
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, sellerStats]);

  const pendingApprovalsCount = sellerStats
    ? Math.max(0, (sellerStats.total_products ?? 0) - (sellerStats.active_products ?? 0))
    : 0;

  const shouldShowKycCompliance = bankStatus === 'In Review';

  return (
    <aside className={`bg-[#074728] min-h-screen hidden md:flex flex-col text-white sticky top-0 h-screen shadow-xl transition-all duration-300 ease-in-out ${isExpanded ? 'w-[280px]' : 'w-20'}`}>

      {/* Logo Area */}
      <div className={`h-20 border-b border-white/10 flex items-center overflow-hidden transition-all duration-300 ${isExpanded ? 'px-6' : 'px-0 justify-center'}`}>
        <div className={`flex items-center ${isExpanded ? 'gap-1' : 'gap-0'} min-w-max`}>
          <img src="/logo.png" alt="OARI Logo" className={`w-auto shrink-0 transition-all duration-300 ${isExpanded ? 'h-[38px]' : 'h-[28px]'}`} />
          <div className={`flex flex-col transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <span className="text-[15px] font-bold leading-tight tracking-wide text-white/90">Ethiopia OpenAgriNet</span>
            <span className="text-[11px] text-white/70 font-medium leading-tight tracking-wider mt-0.5">Access to Credit</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-hidden">
        {/* Dashboard */}
        <Link href="/dashboard" className={`flex items-center ${isExpanded ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-medium text-[15px] transition-all group ${pathname === '/dashboard' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Dashboard</span>
        </Link>

        {/* Loan Products */}
        <Link href="/loan-products" className={`flex items-center ${isExpanded ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-medium text-[15px] transition-all group ${pathname === '/loan-products' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
          <Package className="w-5 h-5 shrink-0" />
          <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Loan Products</span>
        </Link>

        {/* Product Approvals */}
        <Link href="/product-approvals" className={`flex items-center justify-between ${isExpanded ? 'px-4' : 'justify-center px-0'} py-3 rounded-xl font-medium text-[15px] transition-all group ${pathname === '/product-approvals' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
          <div className="flex items-center gap-4">
            <ClipboardCheck className="w-5 h-5 shrink-0" />
            <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Product Approvals</span>
          </div>
          {isExpanded && pendingApprovalsCount > 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA580C] text-[11px] font-bold text-white shadow-sm shrink-0">
              {pendingApprovalsCount}
            </span>
          ) : null}
        </Link>

        {shouldShowKycCompliance ? (
          <Link href="/kyc-compliance" className={`flex items-center justify-between ${isExpanded ? 'px-4' : 'justify-center px-0'} py-3 rounded-xl font-medium text-[15px] transition-all group ${pathname === '/kyc-compliance' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>KYC & Compliance</span>
            </div>
            {isExpanded && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EA580C] text-[11px] font-bold text-white shadow-sm shrink-0">
                1
              </span>
            )}
          </Link>
        ) : null}
      </nav>
    </aside>
  );
}
