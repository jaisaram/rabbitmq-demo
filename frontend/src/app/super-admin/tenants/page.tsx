'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'deactivated';
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantUsers, setTenantUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleNameChange = (name: string) => {
    setNewTenantName(name);
    setNewTenantSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('super_admin_token');
      const res = await fetch('http://localhost:5001/admin/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      if (res.ok) {
        setTenants(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch tenants:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTenantUsers = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsUsersModalOpen(true);
    setIsLoadingUsers(true);
    try {
      const token = localStorage.getItem('super_admin_token');
      const res = await fetch(`http://localhost:5001/${tenant.slug}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      if (res.ok) {
        setTenantUsers(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch tenant users:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim() || !newTenantSlug.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem('super_admin_token');
      const res = await fetch('http://localhost:5001/admin/tenants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newTenantName,
          slug: newTenantSlug,
          adminEmail,
          adminPassword
        }),
      });
      if (res.ok) {
        await fetchTenants();
        setIsCreateModalOpen(false);
        setNewTenantName('');
        setNewTenantSlug('');
        setAdminEmail('');
        setAdminPassword('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create tenant');
      }
    } catch (e) {
      setError('Connection failed');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !newTenantName.trim()) return;

    setIsUpdating(selectedTenant.id);
    try {
      const token = localStorage.getItem('super_admin_token');
      const res = await fetch(`http://localhost:5001/admin/tenants/${selectedTenant.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newTenantName }),
      });
      if (res.ok) {
        setTenants(tenants.map(t => t.id === selectedTenant.id ? { ...t, name: newTenantName } : t));
        setIsEditModalOpen(false);
      }
    } catch (e) {
      console.error('Failed to update tenant:', e);
    } finally {
      setIsUpdating(null);
    }
  };

  const toggleStatus = async (tenant: Tenant) => {
    setIsUpdating(tenant.id);
    try {
      const token = localStorage.getItem('super_admin_token');
      const newStatus = tenant.status === 'active' ? 'deactivated' : 'active';
      const res = await fetch(`http://localhost:5001/admin/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTenants(tenants.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t));
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setIsUpdating(null);
    }
  };

  const openEditModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setNewTenantName(tenant.name);
    setIsEditModalOpen(true);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tenant Management</h1>
          <p className="text-slate-500 mt-1">Manage global organizations and their user access.</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-blue-500/20">
          Create Tenant
        </Button>
      </header>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <Card className="w-full max-w-md shadow-2xl bg-white border-white">
            <CardHeader title="Create New Tenant" subtitle="Register a fresh organization" />
            <CardContent>
              <form onSubmit={handleCreateTenant} className="space-y-4 pt-4">
                <div className="space-y-4">
                  <Input
                    label="Tenant Name"
                    placeholder="e.g. Acme Corp"
                    value={newTenantName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                  <Input
                    label="URL Slug"
                    placeholder="acme-corp"
                    value={newTenantSlug}
                    onChange={(e) => setNewTenantSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    required
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Admin Email"
                      type="email"
                      placeholder="admin@tenant.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                    <Input
                      label="Admin Password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</p>}
                <div className="flex space-x-3 mt-8">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsCreateModalOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1" type="submit" isLoading={isCreating}>
                    Register Tenant
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <Card className="w-full max-w-md shadow-2xl bg-white border-white">
            <CardHeader title="Edit Tenant" subtitle={`Updating ${selectedTenant?.name}`} />
            <CardContent>
              <form onSubmit={handleUpdateTenant} className="space-y-4 pt-4">
                <Input
                  label="Tenant Name"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  required
                  autoFocus
                />
                <div className="flex space-x-3 mt-8">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsEditModalOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1" type="submit" isLoading={!!isUpdating}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Modal */}
      {isUsersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <Card className="w-full max-w-2xl shadow-2xl bg-white border-white max-h-[80vh] flex flex-col">
            <CardHeader title={`${selectedTenant?.name} Users`} subtitle="List of all registered users for this tenant" />
            <CardContent className="overflow-auto flex-1 p-6">
              {isLoadingUsers ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : tenantUsers.length === 0 ? (
                <div className="text-center p-12 text-slate-400">No users found for this tenant.</div>
              ) : (
                <div className="space-y-3">
                  {tenantUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.email}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{user.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{user.id}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-8">
                <Button variant="ghost" className="w-full" onClick={() => setIsUsersModalOpen(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="group hover:border-blue-400/50 transition-all duration-500 border-white/60 bg-white/40 backdrop-blur-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <CardContent className="flex items-center justify-between py-8 px-10">
              <div className="flex items-center space-x-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] font-black text-white transform group-hover:scale-110 transition-transform duration-500">
                  {tenant.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {tenant.name}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[10px] text-slate-400 font-mono">{tenant.id}</span>
                    <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded">/{tenant.slug}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tenant.status === 'active'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                  {tenant.status}
                </span>

                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    className="h-10 px-4 text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-semibold text-sm"
                    onClick={() => fetchTenantUsers(tenant)}
                  >
                    View Users
                  </Button>
                  <Button
                    variant="ghost"
                    className="p-2 h-10 w-10 text-slate-400 hover:text-slate-900"
                    onClick={() => openEditModal(tenant)}
                  >
                    ✎
                  </Button>
                  <Button
                    variant={tenant.status === 'active' ? 'ghost' : 'primary'}
                    className={`text-xs px-4 h-10 font-bold ${tenant.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'shadow-md shadow-blue-500/10'}`}
                    onClick={() => toggleStatus(tenant)}
                    isLoading={isUpdating === tenant.id}
                  >
                    {tenant.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
