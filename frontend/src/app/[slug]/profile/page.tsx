'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTenantAuth } from '@/context/TenantAuthContext';

export default function TenantProfilePage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { user, token } = useTenantAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        avatarUrl: '',
    });
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user || !token) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch(`http://localhost:5001/${slug}/user/${user.userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-tenant-id': user.tenantId
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setFormData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        avatarUrl: data.avatarUrl || '',
                    });
                }
            } catch (e) {
                console.error('Failed to fetch profile:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user, token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');

        try {
            const res = await fetch(`http://localhost:5001/${slug}/profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-tenant-id': user?.tenantId
                },
                body: JSON.stringify({ ...formData, userId: user?.userId }),
            });

            if (res.ok) {
                setMessage('Profile updated successfully!');
            } else {
                setMessage('Failed to update profile.');
            }
        } catch (e) {
            setMessage('Network error.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-slate-500">Loading profile...</div>;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-slate-400">Manage your personal organizational account.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center p-8 h-fit">
                    <div className="relative inline-block mb-6">
                        <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-900 shadow-xl overflow-hidden mx-auto flex items-center justify-center text-4xl">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>👤</span>
                            )}
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                        {formData.firstName || 'User'} {formData.lastName || ''}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
                    <div className="mt-4 inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full font-bold uppercase tracking-wider">
                        {user?.role}
                    </div>
                </Card>

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader title="Account Details" />
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="First Name"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="John"
                                    />
                                    <Input
                                        label="Last Name"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                                <Input
                                    label="Avatar URL"
                                    value={formData.avatarUrl}
                                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                />

                                {message && (
                                    <div className={`p-3 rounded-lg text-xs text-center border ${message.includes('successfully') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                        }`}>
                                        {message}
                                    </div>
                                )}

                                <Button type="submit" isLoading={isSaving} className="w-full md:w-auto px-12" variant="primary">
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
