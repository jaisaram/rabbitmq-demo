'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTenantAuth } from '@/context/TenantAuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useTenantAuth();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:5001/auth/validate-slug/${slug}`);
      const data = await res.json();

      if (res.ok && data.valid) {
        setStep(2);
      } else {
        setError('Invalid tenant identifier. Please try again.');
      }
    } catch (e) {
      setError('Connection failed. Please ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5001/auth/tenant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        login(data.accessToken, {
          userId: data.userId,
          tenantId: data.tenantId,
          slug: data.slug,
          email: email,
          role: data.role
        });
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (e) {
      setError('Connection failed. Please ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-700">
      {/* Background dynamic elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/[0.04] blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/[0.04] blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20 mb-6">
            <span className="text-white text-3xl font-black italic">S</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Scale System</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Organization Gateway</p>
        </div>

        <Card className="backdrop-blur-3xl bg-white/40 border-white/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
          <CardHeader
            title="Welcome Back"
            subtitle={step === 1 ? "Identify your organization" : "Verify access credentials"}
          />
          <CardContent className="p-8">
            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-6">
                <Input
                  label="Organization Identifier"
                  type="text"
                  placeholder="e.g. acme-corp"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  autoFocus
                  className="bg-white/50"
                />
                {error && (
                  <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl text-[11px] font-bold text-red-500 text-center uppercase tracking-wider">
                    {error}
                  </div>
                )}
                <Button variant="primary" className="w-full py-7 shadow-2xl shadow-blue-500/30 font-black uppercase tracking-widest text-xs" isLoading={isLoading}>
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 mb-8 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/[0.02] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2 px-1">Organization</p>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-blue-600 font-black text-xl tracking-tight uppercase">{slug}</p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] font-black text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest underline decoration-blue-200 underline-offset-8"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <Input
                  label="User Email"
                  type="email"
                  placeholder="admin@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/50"
                />
                <Input
                  label="Access Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50"
                />
                {error && (
                  <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl text-[11px] font-bold text-red-500 text-center uppercase tracking-wider">
                    {error}
                  </div>
                )}
                <Button variant="primary" className="w-full py-7 shadow-2xl shadow-blue-500/30 font-black uppercase tracking-widest text-xs" isLoading={isLoading}>
                  Secure Login
                </Button>
              </form>
            )}
            <div className="text-center mt-10">
              <Link href="/auth/register" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">
                Don't have an account? <span className="text-blue-600 underline decoration-blue-200 underline-offset-4">Register Now</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
