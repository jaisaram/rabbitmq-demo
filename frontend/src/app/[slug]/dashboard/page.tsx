'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useTenantAuth } from '@/context/TenantAuthContext';
import { Button } from '@/components/ui/Button';
import { useParams } from 'next/navigation';

export default function TenantDashboard() {
    const { user, token } = useTenantAuth();
    const params = useParams();
    const [activeJob, setActiveJob] = useState<any>(null);
    const [isTriggering, setIsTriggering] = useState(false);

    // Poll for job status if one is active
    useEffect(() => {
        if (!activeJob || activeJob.status === 'completed') return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:5001/${params.slug}/batch/status/${activeJob.jobId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setActiveJob(data);

                if (data.status === 'completed') {
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Error polling job status:', error);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeJob, token, params.slug]);

    const handleTriggerImport = async () => {
        setIsTriggering(true);
        try {
            const res = await fetch(`http://localhost:5001/${params.slug}/batch/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ count: 1000000 })
            });
            const data = await res.json();
            setActiveJob(data);
        } catch (error) {
            console.error('Error triggering import:', error);
        } finally {
            setIsTriggering(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome Back!</h1>
                    <p className="text-slate-500 font-medium">Manage your organization's presence and communications.</p>
                </div>
                <div className="flex space-x-4">
                    <Button
                        variant="primary"
                        onClick={handleTriggerImport}
                        isLoading={isTriggering}
                        className="px-8 shadow-xl shadow-blue-500/20"
                    >
                        🚀 1M Records Sim
                    </Button>
                </div>
            </header>

            {activeJob && (
                <Card className="bg-blue-600 border-none shadow-2xl shadow-blue-500/20 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-800 opacity-90"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <CardContent className="p-8 relative z-10 text-white">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Ingestion Engine Active</h3>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Processing 1,000,000 Records via RabbitMQ Cluster</p>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-black tracking-tighter">{Math.round(activeJob.percentage || 0)}%</span>
                            </div>
                        </div>

                        <div className="h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/10">
                            <div
                                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all duration-500"
                                style={{ width: `${activeJob.percentage || 0}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">
                            <span>Status: {activeJob.status}</span>
                            <span>{activeJob.processedCount?.toLocaleString()} / {activeJob.totalCount?.toLocaleString()} Records</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50/50 border-emerald-100/50 shadow-xl shadow-emerald-500/5 hover:translate-y-[-4px] transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="text-4xl mb-6">📧</div>
                        <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
                        <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">Check your organization's communication broadcasts and alert history.</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50/50 border-blue-100/50 shadow-xl shadow-blue-500/5 hover:translate-y-[-4px] transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="text-4xl mb-6">⚙️</div>
                        <h3 className="text-xl font-bold text-slate-900">Theme & Settings</h3>
                        <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">Customize the platform to match your brand identity perfectly.</p>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50/50 border-purple-100/50 shadow-xl shadow-purple-500/5 hover:translate-y-[-4px] transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="text-4xl mb-6">🛡️</div>
                        <h3 className="text-xl font-bold text-slate-900">Access Control</h3>
                        <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">Manage your current role: <span className="text-purple-600 font-bold uppercase tracking-wider">{user?.role}</span></p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-white/60 shadow-2xl shadow-slate-200/50">
                <CardHeader title="Organization Overview" subtitle={`Tenant ID: ${user?.tenantId}`} />
                <CardContent className="p-8">
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 group hover:border-blue-200 transition-colors">
                        <div className="text-center">
                            <div className="text-3xl mb-3 opacity-20 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">📈</div>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Analytics arriving soon</p>
                            <p className="text-slate-500 text-xs mt-1 font-medium italic">Your organization's usage metrics are being aggregated.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
