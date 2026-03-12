'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTenantAuth } from '@/context/TenantAuthContext';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const params = useParams();
    const slug = params?.slug as string;
    const { logout, token, isLoading } = useTenantAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !token) {
            router.push('/auth/login');
        }
    }, [token, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 selection:bg-blue-100">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 mb-6 animate-bounce">
                    <span className="font-black italic text-2xl">S</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Identity</span>
                </div>
            </div>
        );
    }

    if (!token) return null;

    const navItems = [
        { label: 'Dashboard', href: `/${slug}/dashboard`, icon: '🏠' },
        { label: 'Users', href: `/${slug}/users`, icon: '👥' },
        { label: 'Batch Tasks', href: `/${slug}/batch`, icon: '📊' },
        { label: 'Profile', href: `/${slug}/profile`, icon: '👤' },
        { label: 'Settings', href: `/${slug}/settings`, icon: '⚙️' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 relative overflow-hidden">
            {/* Background blur elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.08] blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/[0.08] blur-[100px] rounded-full"></div>
            </div>

            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 bg-white/40 backdrop-blur-xl flex flex-col z-20">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-blue-600 uppercase tracking-tight">Scale System</h2>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${pathname === item.href
                                ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]'
                                : 'text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-10 relative z-10 w-full">
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {children}
                </div>
            </main>
        </div>
    );
}
