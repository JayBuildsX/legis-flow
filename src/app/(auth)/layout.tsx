'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LucideFileText, 
  LucideHome, 
  LucideSettings, 
  LucideUsers, 
  LucideWorkflow, 
  LucideBell, 
  LucideSearch, 
  LucideChevronDown,
  LucideMenu,
  LucideX,
  LucideLogOut,
  LucideBookTemplate
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ href, icon, label, active }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-200 ${
        active
          ? 'bg-primary-100 text-primary-700 font-medium shadow-sm border-l-2 border-primary-500'
          : 'text-slate-600 hover:bg-slate-100 hover:text-primary-600'
      }`}
    >
      <div className={`text-lg ${active ? 'text-primary-600' : 'text-slate-500'}`}>{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    // Redirect is handled in the AuthContext
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white shadow-md z-40 
            transition-transform duration-300 ease-in-out md:translate-x-0 md:relative
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 bg-gradient-to-r from-primary-600 to-primary-700">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="rounded-md bg-white p-1.5 text-primary-700 font-bold">LF</div>
              <span className="text-lg font-semibold text-white">LEGIS-FLOW</span>
            </Link>
            <button 
              className="rounded-full p-1.5 text-white md:hidden hover:bg-primary-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LucideX size={20} />
            </button>
          </div>
          
          <div className="px-3 py-3 border-b border-slate-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LucideSearch className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="search" 
                className="w-full py-2 pl-10 pr-3 text-sm rounded-md border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Rechercher..." 
              />
            </div>
          </div>
          
          <nav className="p-3 flex-1 overflow-y-auto">
            <div className="space-y-0.5">
              <SidebarItem 
                href="/dashboard" 
                icon={<LucideHome size={18} />} 
                label="Tableau de bord" 
                active={pathname === '/dashboard'} 
              />
              <SidebarItem 
                href="/documents" 
                icon={<LucideFileText size={18} />} 
                label="Documents" 
                active={pathname.startsWith('/documents')} 
              />
              <SidebarItem 
                href="/templates" 
                icon={<LucideBookTemplate size={18} />} 
                label="Modèles" 
                active={pathname.startsWith('/templates')} 
              />
              <SidebarItem 
                href="/workflows" 
                icon={<LucideWorkflow size={18} />} 
                label="Workflows" 
                active={pathname.startsWith('/workflows')} 
              />
              <SidebarItem 
                href="/admin" 
                icon={<LucideUsers size={18} />} 
                label="Administration" 
                active={pathname.startsWith('/admin')} 
              />
            </div>
          </nav>
          
          <div className="mt-auto border-t border-slate-200 p-3">
            <div 
              className="relative group flex items-center gap-3 rounded-md px-3 py-2 bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-center text-sm font-medium text-primary-700 border border-primary-200">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'UN'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'email@example.com'}</p>
              </div>
              <LucideChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 w-full mb-1 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="py-1">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <LucideSettings size={16} />
                      <span>Profil</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-100 w-full text-left"
                    >
                      <LucideLogOut size={16} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm z-10">
            <div className="flex items-center">
              <button 
                className="mr-4 rounded-full p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <LucideMenu size={20} />
              </button>
              <h1 className="text-xl font-semibold text-slate-800">
                {pathname === '/dashboard' && 'Tableau de bord'}
                {pathname.startsWith('/documents') && 'Documents'}
                {pathname.startsWith('/templates') && 'Modèles'}
                {pathname.startsWith('/workflows') && 'Workflows'}
                {pathname.startsWith('/admin') && 'Administration'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors">
                  <LucideBell size={18} />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent-red-500 ring-2 ring-white"></span>
                </button>
              </div>
              <button className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors">
                <LucideSettings size={18} />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main 
            className={`flex-1 overflow-auto p-4 md:p-6 ${pageTransition ? 'animate-fade' : ''}`}
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 