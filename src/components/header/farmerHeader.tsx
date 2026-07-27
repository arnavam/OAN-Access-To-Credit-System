'use client';
import { LanguageSelector } from '@/app/(portal-account)/components/LanguageSelector';
import { Bell, ChevronDown, LogOut, Menu, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function FarmerHeader({ onMenuClick }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = "Almaz Tadesse";

  let headerTitle = "Dashboard";
  if (pathname.startsWith('/discover-loans/apply')) {
    headerTitle = "New Loan Application";
  } else if (pathname.startsWith('/discover-loans')) {
    headerTitle = "Discover Loans";
  } else if (pathname.startsWith('/my-applications') || pathname.startsWith('/farmer-dashboard/applications')) {
    headerTitle = "My Applications";
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-md h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">

      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 -ml-2 rounded-xl hover:bg-gray-50 text-gray-700 transition-all active:scale-95 group">
          <Menu className="w-6 h-6 group-hover:scale-110 group-hover:-rotate-90 group-hover:text-green-600 transition-all duration-300 ease-in-out" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">{headerTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-50 text-gray-500 transition-all active:scale-95 group">
          <Bell className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>


        <div className="hidden sm:block">
          <LanguageSelector />
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-lg"
          >
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border border-green-200 shadow-sm shrink-0">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=16A34A&textColor=ffffff`} alt={`${userName} Profile`} className="w-full h-full object-cover" />
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-sm font-bold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">Farmer ID: ETH-2847</p>
              </div>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
              </button>

              <Link href="/" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-gray-50 pt-3">
                <LogOut className="w-4 h-4 text-red-500" />
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
