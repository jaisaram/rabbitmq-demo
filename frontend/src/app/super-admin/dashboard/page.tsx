'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'loading';
  port: number;
}

export default function DashboardPage() {
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'Gateway', port: 3000, status: 'loading' },
    { name: 'Auth', port: 3001, status: 'loading' },
    { name: 'Users', port: 3002, status: 'loading' },
    { name: 'Notifications', port: 3003, status: 'loading' },
    { name: 'Logs', port: 3004, status: 'loading' },
  ]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:5001/health');
        const data = await res.json();

        const statusMap: Record<string, 'up' | 'down'> = {
          'database': data.status === 'ok' ? 'up' : 'down',
          'auth-service': data.info?.['auth-service']?.status === 'up' ? 'up' : 'down',
          'users-service': data.info?.['users-service']?.status === 'up' ? 'up' : 'down',
          'notifications-service': data.info?.['notifications-service']?.status === 'up' ? 'up' : 'down',
          'logs-service': data.info?.['logs-service']?.status === 'up' ? 'up' : 'down',
        };

        const updatedServices = services.map(s => {
          const key = s.name.toLowerCase().replace(' ', '-');
          return { ...s, status: statusMap[key] || (data.status === 'ok' ? 'up' : 'down') as any };
        });

        setServices(updatedServices);
      } catch (e) {
        setServices(services.map(s => ({ ...s, status: 'down' as any })));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">System Dashboard</h1>
        <p className="text-slate-500">Real-time monitoring of your microservices network.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {services.map((service) => (
          <Card key={service.name} className="relative overflow-hidden group bg-white/60 backdrop-blur-2xl border-white/80 transition-all duration-500 hover:translate-y-[-6px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${service.status === 'up' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10' :
                service.status === 'down' ? 'bg-red-50 text-red-600 shadow-red-500/10' :
                  'bg-slate-50 text-slate-400'
                }`}>
                <span className="text-2xl">{service.status === 'up' ? '⚡' : service.status === 'down' ? '❌' : '⏳'}</span>
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tighter">{service.name}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-[0.2em]">Port {service.port}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${service.status === 'up' ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200/50' :
                service.status === 'down' ? 'bg-red-100/50 text-red-700 border border-red-200/50' :
                  'bg-slate-100 text-slate-500'
                }`}>
                {service.status}
              </div>
            </CardContent>
            {service.status === 'up' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-50"></div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
        <Card className="bg-white/60 backdrop-blur-2xl border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden">
          <CardHeader title="Quick Actions" subtitle="Platform maintenance utilities" />
          <CardContent className="grid grid-cols-2 gap-6 p-8">
            <button className="p-6 bg-white border border-slate-100 rounded-2xl hover:bg-blue-50/50 hover:border-blue-100 transition-all text-left group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📦</div>
              <span className="block font-black text-sm text-slate-900 uppercase tracking-tight">Refresh Cache</span>
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Purge Redis objects</span>
            </button>
            <button className="p-6 bg-white border border-slate-100 rounded-2xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-all text-left group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📜</div>
              <span className="block font-black text-sm text-slate-900 uppercase tracking-tight">Export Logs</span>
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">JSON aggregation</span>
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-2xl border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden">
          <CardHeader title="Recent System Events" subtitle="Sub-system activity stream" />
          <CardContent className="p-8">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4 text-xs group">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  <div className="flex-1 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                    <p className="text-slate-800 font-bold text-sm tracking-tight">Correlation ID generated: <span className="text-blue-600 font-mono bg-blue-50 px-2 rounded-md">f41b...3cc1</span></p>
                    <p className="text-slate-400 mt-1 font-bold uppercase tracking-widest text-[9px]">User Service • {i * 2} minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
