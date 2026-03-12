'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTenantAuth } from '@/context/TenantAuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function TenantSettingsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { user, token } = useTenantAuth();
    const { settings: globalSettings, isLoading: isContextLoading, updateSettings } = useSettings();

    // Internal state for the form, initialized from global context
    const [settings, setSettings] = useState<any>({
        siteName: '',
        primaryColor: '',
        logoUrl: '',
        googleAnalyticsId: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Sync local form state when global settings are loaded
    useEffect(() => {
        if (globalSettings && !isContextLoading) {
            setSettings({
                siteName: globalSettings.siteName ?? '',
                primaryColor: globalSettings.primaryColor ?? '',
                logoUrl: globalSettings.logoUrl ?? '',
                googleAnalyticsId: globalSettings.googleAnalyticsId ?? '',
            });
        }
    }, [globalSettings, isContextLoading]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        try {
            await updateSettings(settings);
            setMessage('Settings saved successfully!');
        } catch (e) {
            setMessage('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isContextLoading) return <div className="text-slate-500">Loading settings...</div>;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
                <p className="text-slate-400">Configure your organization's custom branding and analytics.</p>
            </header>

            <Card>
                <CardHeader title="General Configuration" />
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Site Name"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                placeholder="My Awesome Platform"
                            />
                            <Input
                                label="Logo URL"
                                value={settings.logoUrl}
                                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Primary Brand Color"
                                type="color"
                                value={settings.primaryColor || '#10b981'}
                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                className="h-12"
                            />
                            <Input
                                label="Google Analytics ID"
                                value={settings.googleAnalyticsId}
                                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                                placeholder="G-XXXXXXXXXX"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-xs text-center border ${message.includes('successfully') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                {message}
                            </div>
                        )}

                        <Button type="submit" isLoading={isSaving} variant="primary" className="px-8">
                            Save Infrastructure Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="bg-red-500/5 border-red-500/20">
                <CardHeader title="Danger Zone" />
                <CardContent>
                    <p className="text-slate-400 text-sm mb-4">Once you delete your tenant data, there is no going back. Please be certain.</p>
                    <Button variant="ghost" className="text-red-400 hover:bg-red-500/10">Delete Tenant Organization</Button>
                </CardContent>
            </Card>
        </div>
    );
}
