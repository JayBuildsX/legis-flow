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
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import SearchBox from '@/components/molecules/SearchBox';

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
      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium shadow-sm border-l-4 border-blue-600'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-blue-600'
      }`}
    >
      <div className={`text-lg ${active ? 'text-blue-600' : 'text-neutral-500'}`}>{icon}</div>
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-neutral-50 font-sans">
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* User menu overlay to prevent dropdown overlap */}
        {userMenuOpen && (
          <div 
            className="fixed inset-0 bg-transparent z-40"
            onClick={(e) => {
              e.stopPropagation();
              setUserMenuOpen(false);
            }}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 w-64 border-r border-neutral-200 bg-white shadow-lg z-40 
            transition-transform duration-300 ease-in-out md:translate-x-0 md:relative
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="rounded-lg bg-white p-2 text-blue-700 font-bold text-sm shadow-sm">LF</div>
              <span className="text-lg font-semibold text-white">LEGIS-FLOW</span>
            </Link>
            <button 
              className="rounded-full p-2 text-white md:hidden hover:bg-blue-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LucideX size={20} />
            </button>
          </div>
          
          <div className="px-4 py-4 border-b border-neutral-200">
            <SearchBox 
              placeholder="Rechercher documents, templates..."
              className="w-full"
            />
          </div>
          
          <nav className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-1">
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
          
          <div className="mt-auto border-t border-neutral-200 p-4">
            <div 
              className="relative group flex items-center gap-3 rounded-lg px-3 py-3 bg-neutral-50 cursor-pointer hover:bg-neutral-100 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
              }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-center text-sm font-medium text-blue-700 border-2 border-blue-200">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'UN'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{user?.name || 'Utilisateur'}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email || 'email@example.com'}</p>
              </div>
              <LucideChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              
              {/* User dropdown menu with proper background and z-index */}
              {userMenuOpen && (
                <div 
                  className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-xl border border-neutral-200 overflow-hidden z-50"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(10px)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-2">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
                      <div className="p-1 rounded bg-neutral-100 group-hover:bg-blue-100">
                        <LucideSettings size={16} />
                      </div>
                      <span className="font-medium">Mon profil</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left transition-colors duration-200"
                    >
                      <div className="p-1 rounded bg-red-100">
                        <LucideLogOut size={16} />
                      </div>
                      <span className="font-medium">Déconnexion</span>
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
          <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6 shadow-sm z-10">
            <div className="flex items-center">
              <button 
                className="mr-4 rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <LucideMenu size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-neutral-800">
                  {pathname === '/dashboard' && 'Tableau de bord'}
                  {pathname.startsWith('/documents') && 'Documents'}
                  {pathname.startsWith('/templates') && 'Modèles'}
                  {pathname.startsWith('/workflows') && 'Workflows'}
                  {pathname.startsWith('/admin') && 'Administration'}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-neutral-500">En ligne</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <Link href="/profile">
                <button className="rounded-lg bg-neutral-100 p-2.5 text-neutral-600 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200">
                  <LucideSettings size={18} />
                </button>
              </Link>
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