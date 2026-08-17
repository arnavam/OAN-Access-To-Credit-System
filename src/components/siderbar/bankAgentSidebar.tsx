'use client';
import { LayoutDashboard, Package, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function BankAgentSidebar({ isExpanded, setIsExpanded: _setIsExpanded }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`bg-[#074728] min-h-screen hidden md:flex flex-col text-white sticky top-0 h-screen shadow-xl transition-all duration-300 ease-in-out ${isExpanded ? 'w-[280px]' : 'w-20'}`}>

      {/* Logo Area */}
      <div className={`h-20 border-b border-white/10 flex items-center overflow-hidden transition-all duration-300 ${isExpanded ? 'px-6' : 'px-0 justify-center'}`}>
        <div className={`flex items-center ${isExpanded ? 'gap-1' : 'gap-0'} min-w-max`}>
          <Image src="/logo.png" alt="OARI Logo" width={1536} height={1024} className={`w-auto shrink-0 transition-all duration-300 ${isExpanded ? 'h-[38px]' : 'h-[28px]'}`} />
          <div className={`flex flex-col transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <span className="text-[15px] font-bold leading-tight tracking-wide text-white/90">Ethiopia OpenAgriNet</span>
            <span className="text-[11px] text-white/70 font-medium leading-tight tracking-wider mt-0.5">Access to Credit</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-hidden">
        {/* Dashboard */}
        <Link href="/agent-dashboard" className={`flex items-center ${isExpanded ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-medium text-[15px] transition-all group ${pathname === '/agent-dashboard' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Dashboard</span>
        </Link>

        {/* Loan Products */}
        <Link href="/agent-loan-products" className={`flex items-center ${isExpanded ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-medium text-[15px] transition-all group ${pathname === '/agent-loan-products' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
          <Package className="w-5 h-5 shrink-0" />
          <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Loan Products</span>
        </Link>

        {/* Applications Lists */}
        <Link href="/agent-application-lists" className={`flex items-center ${isExpanded ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-medium text-[15px] transition-all group ${pathname === '/agent-application-lists' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}>
          <FileText className="w-5 h-5 shrink-0" />
          <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>Application Lists</span>
        </Link>

      </nav>
    </aside>
  );
}
