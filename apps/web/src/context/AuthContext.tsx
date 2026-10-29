'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  mode: 'MANAGER' | 'AGENT';
  language: string;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  branding: {
    brand_name: string;
    primary_color: string;
    logo_url: string | null;
  };
  walletBalance: number;
  lowBalanceWarning: boolean;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  accessibleTenants: { id: string; name: string; slug: string }[];
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, tenantSlug?: string) => Promise<void>;
  switchMode: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  logout: () => void;
  dismissBanner: () => void;
  isBannerDismissed: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenant: null,
  accessibleTenants: [],
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  switchMode: async () => {},
  switchTenant: async () => {},
  logout: () => {},
  dismissBanner: () => {},
  isBannerDismissed: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [accessibleTenants, setAccessibleTenants] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Initialize demo / persistent user
  useEffect(() => {
    const savedToken = localStorage.getItem('linkora_token');
    const savedUser = localStorage.getItem('linkora_user');
    const savedTenant = localStorage.getItem('linkora_tenant');

    if (savedToken && savedUser && savedTenant) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setTenant(JSON.parse(savedTenant));
    } else {
      // Default initial mock session matching screenshot: "Erensamsun" on "Lead-Kontackt"
      const defaultUser: User = {
        id: '99999999-0000-0000-0000-000000000006',
        email: 'eren@cc-izmir.com',
        firstName: 'Erensamsun',
        lastName: 'Aydin',
        role: 'COMPANY_ADMIN',
        mode: 'MANAGER',
        language: 'de',
        tenantId: '11111111-1111-1111-1111-111111111111',
      };
      const defaultTenant: Tenant = {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Lead-Kontackt',
        slug: 'lead-kontackt',
        branding: {
          brand_name: 'Lead-Kontackt',
          primary_color: '#0b1220',
          logo_url: null,
        },
        walletBalance: 10.0,
        lowBalanceWarning: true,
      };
      setUser(defaultUser);
      setTenant(defaultTenant);
      setToken('mock-jwt-token-phase-0');
    }

    setAccessibleTenants([
      { id: '11111111-1111-1111-1111-111111111111', name: 'Lead-Kontackt', slug: 'lead-kontackt' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Call-Center Izmir', slug: 'cc-izmir' },
    ]);

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, tenantSlug?: string) => {
    const res = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tenantSlug }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.accessToken);
      setUser(data.user);
      setTenant(data.tenant);
      localStorage.setItem('linkora_token', data.accessToken);
      localStorage.setItem('linkora_user', JSON.stringify(data.user));
      localStorage.setItem('linkora_tenant', JSON.stringify(data.tenant));
    } else {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Ungültige Anmeldedaten (E-Mail oder Passwort falsch).');
    }
  };

  const switchMode = async () => {
    if (!user) return;
    const newMode = user.mode === 'MANAGER' ? 'AGENT' : 'MANAGER';
    setUser({ ...user, mode: newMode });
  };

  const switchTenant = async (tenantId: string) => {
    const found = accessibleTenants.find((t) => t.id === tenantId);
    if (found && tenant) {
      setTenant({
        ...tenant,
        id: found.id,
        name: found.name,
        slug: found.slug,
      });
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setToken(null);
    localStorage.removeItem('linkora_token');
    localStorage.removeItem('linkora_user');
    localStorage.removeItem('linkora_tenant');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const dismissBanner = () => {
    setIsBannerDismissed(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        accessibleTenants,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        switchMode,
        switchTenant,
        logout,
        dismissBanner,
        isBannerDismissed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
