'use client';

import {
  Home,
  FileText,
  Users,
  Settings,
  BarChart,
  BookOpen,
  Book,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  History
} from 'lucide-react';
import clsx from 'clsx';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggleAction: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'Progetti', href: '/progetti' },
  { icon: Users, label: 'Clienti', href: '/clients' },
  { icon: BarChart, label: 'Analytics', href: '/analytics' },
  { icon: BookOpen, label: 'Istruzioni', href: '/istruzioni' },
  { icon: Book, label: 'Flipbook', href: '/flipbook' },
  { icon: History, label: 'Changelog', href: '/changelog' },
  { icon: Settings, label: 'Impostazioni', href: '/settings' },
];

export default function Sidebar({ collapsed, onToggleAction, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  // Funzione per verificare se il link è attivo
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  // Chiudi il menu mobile quando si ridimensiona lo schermo
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && onMobileClose) {
        onMobileClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onMobileClose]);

  // Previeni lo scroll del body quando il menu mobile è aperto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Overlay per mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'bg-gray-900 text-white transition-all duration-300 flex flex-col',
          'fixed inset-y-0 left-0 z-50 h-screen',
          // Desktop
          'lg:translate-x-0',
          collapsed ? 'lg:w-16' : 'lg:w-64',
          // Mobile
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {!collapsed && (
            <h1 className="text-xl font-bold">Ghost Writing</h1>
          )}
          {/* Desktop toggle button */}
          <button
            onClick={onToggleAction}
            className="hidden lg:block p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={20} />
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className={clsx(
            'flex items-center gap-3',
            collapsed && 'justify-center'
          )}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">MP</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Marco LP</p>
                <p className="text-xs text-gray-400 truncate">marco.lp@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
