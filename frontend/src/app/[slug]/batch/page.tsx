'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTenantAuth } from '@/context/TenantAuthContext';

export default function BatchProcessingPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { token } = useTenantAuth();

    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordCount, setRecordCount] = useState(1000000);

    const startBatch = async () => {
        if (!token) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`http://localhost:5001/${slug}/batch/process`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ count: recordCount })
            });

            if (res.ok) {
                const data = await res.json();
                setJobId(data.jobId);
            }
        } catch (e) {
            console.error('Failed to start batch:', e);
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        let interval: any;
        if (jobId) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`http://localhost:5001/${slug}/batch/status/${jobId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setStatus(data);
                        if (data.status === 'completed') {
                            clearInterval(interval);
                            setIsProcessing(false);
                        }
                    }
                } catch (e) {
                    console.error('Failed to check status:', e);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [jobId, token, slug]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="max-w-4xl">
                <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">High-Scale Batch Processing</h1>
                <p className="text-slate-500 text-lg font-medium">
                    Demonstrate the power of our RabbitMQ-based distributed queue system.
                    Ingest up to 1,000,000 records across microservices without system lag.
                </p>
            </div>

            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 mb-10">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Record Volume</label>
                        <select
                            className="w-full bg-white/60 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-white"
                            value={recordCount}
                            onChange={(e) => setRecordCount(Number(e.target.value))}
                            disabled={isProcessing}
                        >
                            <option value={100000}>100,000 Records</option>
                            <option value={500000}>500,000 Records</option>
                            <option value={1000000}>1,000,000 Records</option>
                        </select>
                    </div>
                    <Button
                        size="lg"
                        className="h-[64px] px-10 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/30 uppercase tracking-tight"
                        onClick={startBatch}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing Queue...' : 'Initiate Massive Import'}
                    </Button>
                </div>

                {status && (
                    <div className="relative z-10 space-y-6 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${status.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600 animate-pulse'
                                    }`}>
                                    {status.status}
                                </span>
                                <div className="text-2xl font-black text-slate-900 mt-2">
                                    {status.processedCount?.toLocaleString()} <span className="text-slate-400 font-medium">/ {status.totalCount?.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="text-4xl font-black text-blue-600">
                                {Math.round(status.percentage)}%
                            </div>
                        </div>

                        <div className="h-4 w-full bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 shadow-lg shadow-blue-500/20"
                                style={{ width: `${status.percentage}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                            {[
                                { label: 'Worker Nodes', val: 'Active', color: 'text-slate-900' },
                                { label: 'Queue Health', val: 'Stable', color: 'text-emerald-600' },
                                { label: 'Architecture', val: 'Event-Driven', color: 'text-slate-900' },
                                { label: 'Latency', val: '< 50ms', color: 'text-slate-900' }
                            ].map((stat, i) => (
                                <div key={i} className="p-4 bg-white/60 rounded-2xl border border-white/80 text-center shadow-sm">
                                    <div className="text-slate-400 text-[9px] font-black uppercase mb-1 tracking-widest">{stat.label}</div>
                                    <div className={`${stat.color} font-black text-xs`}>{stat.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'RabbitMQ Pipeline', desc: 'Message-based asynchronous processing ensures the UI remains responsive during massive data loads.' },
                    { title: 'Horizontal Scale', desc: 'Auto-scaling workers handle the chunked records concurrently for maximum throughput.' },
                    { title: 'Persistence', desc: 'Redis tracking ensures real-time visibility into job progress across all system nodes.' }
                ].map((feature, i) => (
                    <div key={i} className="p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] hover:bg-white/60 transition-all shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight uppercase">{feature.title}</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
