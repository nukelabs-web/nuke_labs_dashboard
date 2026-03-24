'use client';

import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { LogOut, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Header({ user }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    const item = NAV_ITEMS.find((i) => i.href !== '/' && pathname.startsWith(i.href));
    return item?.name || 'Dashboard';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-white border-b border-nuke-border flex items-center justify-between px-6 sticky top-0 z-40">
      <h2 className="font-heading font-semibold text-lg text-nuke-dark tracking-wide">
        {getPageTitle()}
      </h2>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-nuke-muted hover:text-nuke-dark transition-colors rounded-lg hover:bg-nuke-bg">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-nuke-orange rounded-full"></span>
        </button>
        <div className="h-6 w-px bg-nuke-border"></div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-nuke-orange/10 flex items-center justify-center">
            <span className="text-nuke-orange font-semibold text-xs">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-nuke-dark hidden md:block">
            {user?.email?.split('@')[0] || 'User'}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 text-nuke-muted hover:text-status-red transition-colors rounded-lg hover:bg-red-50"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
