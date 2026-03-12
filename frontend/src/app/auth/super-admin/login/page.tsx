'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSuperAdminAuth } from '@/context/SuperAdminAuthContext';

export default function SuperAdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useSuperAdminAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:5001/auth/system-admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.accessToken) {
                login(data.accessToken, {
                    userId: data.adminId,
                    email: email,
                    role: 'SUPER_ADMIN',
                    isSuper: data.isSuper
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
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/[0.03] blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/[0.03] blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20 mb-6 group hover:scale-110 transition-transform duration-500">
                        <span className="text-white text-3xl font-black italic">S</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Scale System</h1>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Super Console Access</p>
                </div>

                <Card className="backdrop-blur-3xl bg-white/40 border-white/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                    <CardHeader
                        title="Administrator Login"
                        subtitle="Authorize with system-level credentials"
                    />
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Admin Email"
                                type="email"
                                placeholder="e.g. admin@scalesystem.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/50"
                            />
                            <Input
                                label="System Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white/50"
                            />
                            {error && (
                                <div className="text-xs font-bold text-red-500 bg-red-50/80 backdrop-blur-sm p-4 rounded-2xl border border-red-100 animate-in shake duration-500">
                                    <span className="mr-2">⚠️</span> {error}
                                </div>
                            )}
                            <Button variant="primary" className="w-full py-7 shadow-2xl shadow-blue-500/30 font-black uppercase tracking-widest text-xs" isLoading={isLoading}>
                                Initialize Console
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    &copy; 2026 Scale Microservices Infrastructure
                </p>
            </div>
        </div>
    );
}
