'use client';

import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#3b82f6');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateSettings({ ...settings, primaryColor });
    setIsSaving(false);
  };

  if (isLoading) return <div className="text-slate-500">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">System Settings</h1>
        <p className="text-slate-500">Customise your global workspace appearance and behavior.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white/40 backdrop-blur-xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
          <CardHeader title="Appearance" subtitle="Manage your system-wide brand identity" />
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Primary Brand Color</label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-14 h-14 rounded-2xl cursor-pointer bg-white border-2 border-slate-100 p-1 shadow-sm"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">This color will be applied to buttons, links, and active states across the portal.</p>
            </div>

            <Button onClick={handleSave} isLoading={isSaving} className="w-full shadow-lg shadow-blue-500/20 py-4">
              Save Appearance
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/40 backdrop-blur-xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
          <CardHeader title="Feature Toggles" subtitle="Enable or disable microservice modules" />
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Notification Service</p>
                <p className="text-[10px] text-slate-500 font-medium">Allow system to send email/SMS alerts</p>
              </div>
              <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Centralized Logging</p>
                <p className="text-[10px] text-slate-500 font-medium">Stream logs to the Logs service</p>
              </div>
              <div className={`w-10 h-5 bg-blue-600 rounded-full relative`}>
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
