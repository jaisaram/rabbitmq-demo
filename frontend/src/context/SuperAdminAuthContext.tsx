'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SuperAdminAuthContextType {
    token: string | null;
    user: any | null;
    login: (token: string, user: any) => void;
    logout: () => void;
    isLoading: boolean;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined);

export const SuperAdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem('super_admin_token');
        const savedUser = localStorage.getItem('super_admin_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: any) => {
        localStorage.setItem('super_admin_token', newToken);
        localStorage.setItem('super_admin_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        router.push('/super-admin/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('super_admin_token');
        localStorage.removeItem('super_admin_user');
        setToken(null);
        setUser(null);
        router.push('/auth/super-admin/login');
    };

    return (
        <SuperAdminAuthContext.Provider value={{ token, user, login, logout, isLoading }}>
            {children}
        </SuperAdminAuthContext.Provider>
    );
};

export const useSuperAdminAuth = () => {
    const context = useContext(SuperAdminAuthContext);
    if (!context) throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider');
    return context;
};
