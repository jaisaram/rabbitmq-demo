'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TenantSettings {
  primaryColor?: string;
  sidebarTheme?: 'dark' | 'glass';
  siteName?: string;
  logoUrl?: string;
  googleAnalyticsId?: string;
  features?: {
    enableLogs?: boolean;
    enableNotifications?: boolean;
  };
}

interface SettingsContextType {
  settings: TenantSettings;
  updateSettings: (newSettings: TenantSettings) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<TenantSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const tenantToken = localStorage.getItem('tenant_token');
      const tenantUserStr = localStorage.getItem('tenant_user');

      let token = tenantToken;
      let tenantId = '';
      let slug = '';

      if (tenantUserStr) {
        const tenantUser = JSON.parse(tenantUserStr);
        tenantId = tenantUser.tenantId;
        slug = tenantUser.slug;
      }

      let path = slug ? `http://localhost:5001/${slug}/settings` : 'http://localhost:5001/tenant/settings';

      if (!token) {
        setIsLoading(false);
        return;
      }

      if (token === tenantToken && !tenantId) {
        // Don't fetch tenant settings if we have a tenant token but no tenant id yet
        setIsLoading(false);
        return;
      }

      const res = await fetch(path, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId || 'system'
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        applySettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySettings = (data: TenantSettings) => {
    if (data.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', data.primaryColor);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: TenantSettings) => {
    try {
      const tenantToken = localStorage.getItem('tenant_token');
      const tenantUserStr = localStorage.getItem('tenant_user');
      const token = tenantToken || localStorage.getItem('super_admin_token');

      if (!token) return;

      const tenantId = tenantUserStr ? JSON.parse(tenantUserStr).tenantId : 'system';
      const slug = tenantUserStr ? JSON.parse(tenantUserStr).slug : '';
      const path = slug ? `http://localhost:5001/${slug}/settings` : 'http://localhost:5001/tenant/settings';

      const res = await fetch(path, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId
        },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        applySettings(data);
      }
    } catch (e) {
      console.error('Failed to update settings:', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
