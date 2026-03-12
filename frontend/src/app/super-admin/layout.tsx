'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('super_admin_token');
    localStorage.removeItem('super_admin_user');
    router.push('/auth/super-admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/super-admin/dashboard', icon: '📊' },
    { label: 'Tenants', href: '/super-admin/tenants', icon: '🏢' },
    { label: 'Settings', href: '/super-admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/60 bg-white/40 backdrop-blur-2xl flex flex-col z-10 sticky top-0 h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 border-b border-white/60">
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <span className="font-black text-xs">S</span>
            </div>
            <h2 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter uppercase">Scale System</h2>
          </div>
          <div className="flex items-center space-x-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Super Console</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${pathname === item.href
                ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-blue-600 border border-white translate-x-1'
                : 'text-slate-500 hover:text-blue-600 hover:bg-white/60'
                }`}
            >
              <span className={`text-xl transition-transform duration-300 ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/60">
          <Button
            variant="ghost"
            className="w-full justify-start text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-2xl h-12 px-5 transition-colors"
            onClick={handleLogout}
          >
            <span className="mr-3 text-lg opacity-70">🚪</span>
            <span className="uppercase tracking-widest">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-10 relative z-10 w-full">
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {children}
        </div>
      </main>
    </div>
  );
}
