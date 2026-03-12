'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTenantAuth } from '@/context/TenantAuthContext';

export default function TenantUserManagementPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { token, user: currentUser } = useTenantAuth();

    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'USER' });
    const [message, setMessage] = useState('');

    const fetchUsers = async () => {
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:5001/${slug}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error('Failed to fetch users:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token, slug]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await fetch(`http://localhost:5001/${slug}/users/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                setMessage('User created successfully');
                setShowCreateModal(false);
                setNewUser({ email: '', password: '', role: 'USER' });
                fetchUsers();
            } else {
                const err = await res.json();
                setMessage(err.message || 'Failed to create user');
            }
        } catch (e) {
            setMessage('Network error');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`http://localhost:5001/${slug}/users/delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                fetchUsers();
            } else {
                alert('Failed to delete user');
            }
        } catch (e) {
            alert('Network error');
        }
    };

    if (isLoading) return <div className="text-slate-400">Loading users...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">User Management</h1>
                    <p className="text-slate-500 font-medium">Manage your team members and their roles.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="rounded-xl shadow-lg shadow-blue-500/20">
                    Add New User
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${message.includes('success') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    {message}
                </div>
            )}

            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg overflow-hidden border border-slate-200">
                                            {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : '👤'}
                                        </div>
                                        <div>
                                            <div className="text-slate-900 font-bold">
                                                {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : 'No Name Set'}
                                            </div>
                                            <div className="text-slate-400 text-xs font-medium">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${user.role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button
                                            variant="ghost"
                                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 px-3 text-xs font-bold"
                                            onClick={() => alert('Edit functionality to be implemented in next phase')}
                                        >
                                            Edit
                                        </Button>

                                        {currentUser?.userId !== user.id && !user.isDefaultAdmin && (
                                            <Button
                                                variant="ghost"
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 px-2 text-xs font-bold"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                Delete
                                            </Button>
                                        )}

                                        {(currentUser?.userId === user.id || user.isDefaultAdmin) && (
                                            <span className="text-[10px] text-slate-300 italic px-2 font-medium">Protected</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <Input
                                label="Email Address"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="name@company.com"
                                className="bg-slate-50 border-slate-200"
                                required
                            />
                            <Input
                                label="Temporary Password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                className="bg-slate-50 border-slate-200"
                                required
                            />
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex space-x-3 pt-6">
                                <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-blue-500/20">Create User</Button>
                                <Button type="button" variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
