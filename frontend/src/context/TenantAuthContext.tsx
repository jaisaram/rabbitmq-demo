'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TenantAuthContextType {
    token: string | null;
    user: any | null;
    login: (token: string, user: any) => void;
    logout: () => void;
    isLoading: boolean;
}

const TenantAuthContext = createContext<TenantAuthContextType | undefined>(undefined);

export const TenantAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem('tenant_token');
        const savedUser = localStorage.getItem('tenant_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: any) => {
        localStorage.setItem('tenant_token', newToken);
        localStorage.setItem('tenant_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        // Redirect to slug-scoped dashboard
        router.push(`/${newUser.slug}/dashboard`);
    };

    const logout = async () => {
        try {
            if (token && user) {
                await fetch(`http://localhost:5001/${user.slug}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: user.userId })
                });
            }
        } catch (e) {
            console.error('Logout sync failed:', e);
        } finally {
            localStorage.removeItem('tenant_token');
            localStorage.removeItem('tenant_user');
            setToken(null);
            setUser(null);
            router.push('/auth/login');
        }
    };

    return (
        <TenantAuthContext.Provider value={{ token, user, login, logout, isLoading }}>
            {children}
        </TenantAuthContext.Provider>
    );
};

export const useTenantAuth = () => {
    const context = useContext(TenantAuthContext);
    if (!context) throw new Error('useTenantAuth must be used within a TenantAuthProvider');
    return context;
};
