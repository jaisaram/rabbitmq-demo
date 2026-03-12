'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/20">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-emerald-400/5 blur-[120px] rounded-full animate-pulse delay-700"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-purple-400/5 blur-[120px] rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen">
        {/* Hero Section */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 animate-bounce">
            Next-Gen Infrastructure
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-500 uppercase">
              Scale System
            </span>
            <br />
            <span className="text-blue-600 underline decoration-blue-500/30 underline-offset-8 uppercase">Microservices</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            High-performance infrastructure for distributed workloads.
            Handle millions of records with horizontal scalability and precision.
          </p>
        </div>

        {/* Portal Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Super Admin - Focus on System Integrity */}
          <Link href="/auth/super-admin/login" className="group">
            <div className="relative h-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 flex flex-col items-start transition-all hover:border-blue-500/40 hover:bg-white/60 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-blue-500/5 group-hover:text-blue-500/10 transition-colors">
                <span className="text-9xl font-black">SA</span>
              </div>

              <div className="w-16 h-16 bg-blue-600/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all duration-500 scale-110 group-hover:rotate-12">
                <span className="text-3xl">🛡️</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">Infrastructure Control</h2>
              <p className="text-slate-500 text-lg leading-snug mb-8">
                Access the system core. Manage global tenants, monitor real-time node logs, and oversee entire infrastructure health.
              </p>

              <div className="mt-auto flex items-center text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                Enter Command Center <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          {/* Tenant Portal - Focus on Organization Management */}
          <Link href="/auth/login" className="group">
            <div className="relative h-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 flex flex-col items-start transition-all hover:border-emerald-500/40 hover:bg-white/60 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors">
                <span className="text-9xl font-black">TP</span>
              </div>

              <div className="w-16 h-16 bg-emerald-600/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all duration-500 scale-110 group-hover:-rotate-12">
                <span className="text-3xl">🏢</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">Tenant Dashboard</h2>
              <p className="text-slate-500 text-lg leading-snug mb-8">
                Empower your organization. Manage your dedicated workspace, configure custom settings, and engage with your users.
              </p>

              <div className="mt-auto flex items-center text-emerald-400 font-bold group-hover:translate-x-2 transition-transform">
                Launch Workspace <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-12 border-t border-slate-800/50 w-full text-center">
          <div className="flex justify-center space-x-8 mb-8 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <span className="text-sm font-bold tracking-widest uppercase">Kubernetes Ready</span>
            <span className="text-sm font-bold tracking-widest uppercase">OAuth 2.0 Secure</span>
            <span className="text-sm font-bold tracking-widest uppercase">Edge Optimized</span>
          </div>
          <p className="text-slate-600 text-sm">
            &copy; 2026 Scale System Architecture. High-Concurrency Distributed Infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}
