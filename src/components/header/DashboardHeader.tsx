'use client';
import { LanguageSelector } from '@/app/(portal-account)/components/LanguageSelector';
import { logoutUser } from '@/features/auth/api/authApi';
import { logout, selectBankName, selectOfficerName } from '@/features/auth/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Bell, Building2, ChevronDown, LogOut, Menu, UserRound, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { fetchNotifications } from '@/features/notifications/store/notificationSlice';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileModal } from './ProfileModal';

export type DashboardRole = 'bank-admin' | 'bank-agent' | 'farmer' | 'officer';

interface RoleConfig {
  /** Fallback display name when the store has none. */
  fallbackName: string;
  /** Where to send the user after logout. */
  loginPath: string;
}

const ROLE_CONFIG: Record<DashboardRole, RoleConfig> = {
  'bank-admin': { fallbackName: 'Bank Admin', loginPath: '/login/bank-admin' },
  'bank-agent': { fallbackName: 'Bank Agent', loginPath: '/login/bank-agent' },
  farmer: { fallbackName: 'Farmer', loginPath: '/' },
  officer: { fallbackName: 'Guest User', loginPath: '/login' },
};

interface DashboardHeaderProps {
  role: DashboardRole;
  onMenuClick?: () => void;
  title?: string;
  /**
   * Secondary line under the name in the profile dropdown. Defaults to the
   * bank name from the store (falling back to "<Fallback> Portal"). Pass a
   * literal string for roles that show something else (e.g. a farmer ID).
   */
  subtitle?: string;
}

export function DashboardHeader({ role, onMenuClick, title = 'Dashboard', subtitle }: DashboardHeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const officerName = useAppSelector(selectOfficerName);
  const bankName = useAppSelector(selectBankName);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);

  const config = ROLE_CONFIG[role];

  // Initial fetch of unread count on header mount
  useEffect(() => {
    dispatch(fetchNotifications({ read_status: 'all', limit: 20, start: 0 }));
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      await logoutUser();
    } finally {
      dispatch(logout());
      router.push(config.loginPath);
    }
  };

  const userName = officerName ?? config.fallbackName;
  const institutionName = subtitle ?? bankName ?? `${config.fallbackName} Portal`;

  return (
    <>
      <header className="bg-white border-b border-gray-100 shadow-md h-20 shrink-0 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">

      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-all active:scale-95 group">
          <Menu className="w-6 h-6 group-hover:scale-110 group-hover:-rotate-90 group-hover:text-green-600 transition-all duration-300 ease-in-out" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all active:scale-95 group"
          >
            <Bell className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 group-hover:text-orange-500 transition-all duration-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full border-2 border-white animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        <div className="hidden sm:block">
          <LanguageSelector />
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-[#16A34A] flex items-center justify-center border-2 border-emerald-100 shadow-sm shrink-0 group-hover:scale-105 transition-all duration-300">
              <span className="text-white text-xs font-bold leading-none select-none">
                {(() => {
                  const parts = userName.trim().split(/\s+/).filter(Boolean);
                  if (parts.length === 0) return '?';
                  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase();
                  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
                })()}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">{userName}</p>
              <p className="text-xs font-medium text-gray-500 leading-tight mt-0.5">{institutionName}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-700 shrink-0 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left whitespace-nowrap"
              >
                <UserRound className="w-5 h-5 text-[#16A34A] shrink-0" />
                <span>My Profile</span>
              </button>

              <Link
                href="/profile?tab=organization"
                onClick={() => setIsProfileOpen(false)}
                className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left whitespace-nowrap"
              >
                <Building2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                <span>Organization Settings</span>
              </Link>

              <Link
                href="/profile?tab=team"
                onClick={() => setIsProfileOpen(false)}
                className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left whitespace-nowrap"
              >
                <UsersRound className="w-5 h-5 text-[#16A34A] shrink-0" />
                <span>Team Management</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-bold text-[#FF4D4D] hover:bg-red-50/60 transition-colors text-left whitespace-nowrap"
              >
                <LogOut className="w-5 h-5 text-[#FF4D4D] shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        role={config.fallbackName}
      />
    </>
  );
}
