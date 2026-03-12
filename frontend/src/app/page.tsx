'use client';

import { useState } from 'react';

export default function Home() {
  const [tenantId, setTenantId] = useState('tenant-a');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTenantId, setRegTenantId] = useState('tenant-a');
  const [newTenantName, setNewTenantName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchWithAuth = async (url: string, options: any = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };

  const testApi = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`http://localhost:3000/users/${userId}`, {
        headers: {
          'x-tenant-id': tenantId,
        },
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to fetch from API Gateway' });
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, tenantId: regTenantId }),
      });
      const data = await res.json();
      setResult({ message: 'User registered successfully!', ...data });
    } catch (error) {
      setResult({ error: 'Failed to register user' });
    } finally {
      setLoading(false);
    }
  };

  const createTenant = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/users/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTenantName }),
      });
      const data = await res.json();
      setResult({ message: 'Tenant created successfully!', ...data });
    } catch (error) {
      setResult({ error: 'Failed to create tenant' });
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.accessToken) {
        setToken(data.accessToken);
        setResult({ message: 'Logged in successfully!', ...data });
      } else {
        setResult({ error: 'Login failed', ...data });
      }
    } catch (error) {
      setResult({ error: 'Failed to login' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Microservices Dashboard
          </h1>
          <p className="text-gray-400">RabbitMQ + gRPC + NestJS + Multi-tenant</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Authentication</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={loginUser}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login to Dashboard'}
              </button>
              {token && (
                <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-xs truncate">
                  Token: {token}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Request Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tenant ID (Multi-tenancy)</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="tenant-a">Tenant A (Retail)</option>
                  <option value="tenant-b">Tenant B (Enterprise)</option>
                  <option value="tenant-c">Tenant C (Public)</option>
                </select>
              </div>
              <button
                onClick={testApi}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Microservices Flow'}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Register New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Assign to Tenant</label>
                <select
                  value={regTenantId}
                  onChange={(e) => setRegTenantId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="tenant-a">Tenant A (Retail)</option>
                  <option value="tenant-b">Tenant B (Enterprise)</option>
                  <option value="tenant-c">Tenant C (Public)</option>
                </select>
              </div>
              <button
                onClick={registerUser}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register User'}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Create New Tenant</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tenant Name</label>
                <input
                  type="text"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              <button
                onClick={createTenant}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Tenant'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 min-h-[200px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Response Explorer</h2>
            <div className="flex-1 bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-auto">
              {result ? (
                <pre className="text-green-400">{JSON.stringify(result, null, 2)}</pre>
              ) : (
                <p className="text-gray-600 italic">No request sent yet. Results will appear here...</p>
              )}
            </div>
          </div>
        </div>

        <section className="mt-12 text-sm text-gray-500 border-t border-gray-800 pt-8">
          <h3 className="uppercase tracking-wider font-bold mb-4">System Architecture Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>API Gateway (NestJS)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Auth Service (gRPC)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Users Service (gRPC)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>RabbitMQ (Queued)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
