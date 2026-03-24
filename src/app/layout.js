import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { SidebarProvider } from '@/context/SidebarContext';
import DashboardShell from '@/components/DashboardShell';

export const metadata = {
  title: 'NukeLabs Dashboard',
  description: 'Internal Operations Dashboard for NukeLabs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-body">
        <AuthProvider>
          <SidebarProvider>
            <DashboardShell>
              {children}
            </DashboardShell>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
