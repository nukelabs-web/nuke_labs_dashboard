'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useSidebar } from '@/context/SidebarContext';
import { NAV_ITEMS } from '@/lib/constants';
import {
  LayoutDashboard,
  GraduationCap,
  Presentation,
  Users,
  CheckSquare,
  Package,
  BarChart3,
  UserCog,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  GraduationCap,
  Presentation,
  Users,
  CheckSquare,
  Package,
  BarChart3,
  UserCog,
  Shield,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.href === '/roles') return hasPermission('editRoles');
    return true;
  });

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out bg-nuke-sidebar flex flex-col z-50 border-r border-white/5 ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`px-5 py-6 border-b border-white/10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-lg bg-nuke-orange flex items-center justify-center shadow-lg shadow-nuke-orange/20">
              <span className="text-white font-heading font-bold text-sm text-[16px]">N</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-white text-sm tracking-wide">NukeLabs</h1>
              <p className="text-[11px] text-white/50 font-body">Operations</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-9 h-9 rounded-lg bg-nuke-orange flex items-center justify-center shadow-lg shadow-nuke-orange/20 animate-scale-in">
            <span className="text-white font-heading font-bold text-sm text-[16px]">N</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-nuke-orange text-white rounded-full flex items-center justify-center shadow-md hover:bg-nuke-orange-hover transition-colors z-50 border border-white/10"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => {
          const Icon = iconMap[item.icon];
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? 'bg-nuke-orange text-white shadow-lg shadow-nuke-orange/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : ''}
            >
              {Icon && (
                <Icon 
                  size={isCollapsed ? 22 : 18} 
                  strokeWidth={active ? 2.2 : 1.8} 
                  className={`transition-transform duration-200 ${!active && 'group-hover:scale-110'}`} 
                />
              )}
              {!isCollapsed && <span className="animate-fade-in whitespace-nowrap overflow-hidden">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-5 border-t border-white/10 ${isCollapsed ? 'flex justify-center' : ''}`}>
        {!isCollapsed ? (
          <p className="text-[10px] text-white/30 font-body animate-fade-in">© 2026 NukeLabs v1.1</p>
        ) : (
          <div className="w-2 h-2 rounded-full bg-nuke-orange/30 animate-pulse"></div>
        )}
      </div>
    </aside>
  );
}
