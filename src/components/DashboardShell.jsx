'use client';

import { useAuth } from '@/components/AuthProvider';
import { useSidebar } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardShell({ children }) {
  const { user, loading } = useAuth();
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/login');
    }
  }, [user, loading, isLoginPage, router]);

  // Login page - no shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-nuke-bg text-nuke-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-nuke-orange animate-pulse"></div>
          <p className="text-sm font-medium animate-pulse">Loading NukeLabs...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-nuke-bg">
      <Sidebar />
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'ml-20' : 'ml-60'
        }`}
      >
        <Header user={user} />
        <main className="p-6 flex-1">
          {children}
        </main>
        <footer className="p-6 border-t border-nuke-border text-center text-xs text-nuke-muted italic">
          NukeLabs Operations Dashboard — Internal Tooling v1.1
        </footer>
      </div>
    </div>
  );
}
