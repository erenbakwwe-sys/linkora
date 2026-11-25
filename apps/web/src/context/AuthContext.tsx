'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  role: string;
  mode: 'MANAGER' | 'AGENT';
  language: string;
  tenantId: string;
  callerIdNumber?: string | null;
  team?: string;
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

function clearStoredSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('linkora_token');
  localStorage.removeItem('linkora_refresh_token');
  localStorage.removeItem('linkora_user');
  localStorage.removeItem('linkora_tenant');
}

function isApiRequest(url: string): boolean {
  if (url.startsWith('/api/')) return true;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin && parsed.pathname.startsWith('/api/');
  } catch {
    return false;
  }
}

function isAuthEndpoint(url: string): boolean {
  return /\/api\/(v1\/)?auth\/(login|refresh)/.test(url);
}

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Attaches the access token to every same-origin `/api/` request, transparently refreshes an
 * expired access token once, and ends the session if the backend rejects the credentials.
 */
function installAuthFetch() {
  if (typeof window === 'undefined' || (window as any).__linkoraAuthFetch) return;
  (window as any).__linkoraAuthFetch = true;
  const originalFetch = window.fetch.bind(window);

  const withAuth = (input: RequestInfo | URL, init: RequestInit | undefined, token: string | null) => {
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return originalFetch(input, { ...init, headers });
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('linkora_refresh_token');
    if (!refreshToken) return null;
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        try {
          const res = await originalFetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          if (data?.accessToken) {
            localStorage.setItem('linkora_token', data.accessToken);
            return data.accessToken as string;
          }
          return null;
        } catch {
          return null;
        } finally {
          setTimeout(() => {
            refreshInFlight = null;
          }, 0);
        }
      })();
    }
    return refreshInFlight;
  };

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (!isApiRequest(url) || isAuthEndpoint(url)) {
      return originalFetch(input, init);
    }

    const token = localStorage.getItem('linkora_token');
    const res = await withAuth(input, init, token);
    if (res.status !== 401 || !token) return res;

    const newToken = await refreshAccessToken();
    if (newToken) {
      return withAuth(input, init, newToken);
    }

    clearStoredSession();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    return res;
  };
}

if (typeof window !== 'undefined') {
  installAuthFetch();
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

  // Initialize user from saved session
  useEffect(() => {
    const savedToken = localStorage.getItem('linkora_token');
    const savedUser = localStorage.getItem('linkora_user');
    const savedTenant = localStorage.getItem('linkora_tenant');

    if (savedToken && savedUser && savedTenant) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setTenant(JSON.parse(savedTenant));
      } catch {
        // Corrupted localStorage fallback
        setUser(null);
        setTenant(null);
        setToken(null);
      }
    } else {
      setUser(null);
      setTenant(null);
      setToken(null);
    }

    setAccessibleTenants([
      { id: '11111111-1111-1111-1111-111111111111', name: 'Linkora', slug: 'linkora' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Call-Center Izmir', slug: 'cc-izmir' },
    ]);

    setIsLoading(false);
  }, []);

  const persistSession = (data: { accessToken: string; refreshToken?: string; user: User; tenant: Tenant }) => {
    setToken(data.accessToken);
    setUser(data.user);
    setTenant(data.tenant);
    localStorage.setItem('linkora_token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('linkora_refresh_token', data.refreshToken);
    }
    localStorage.setItem('linkora_user', JSON.stringify(data.user));
    localStorage.setItem('linkora_tenant', JSON.stringify(data.tenant));
  };

  const login = async (email: string, password: string, tenantSlug?: string) => {
    const cleanEmail = (email || '').trim();
    const cleanPassword = (password || '').trim();
    const cleanSlug = (tenantSlug || '').trim();

    if (!cleanEmail) {
      throw new Error('Bitte geben Sie Ihre E-Mail-Adresse oder Ihren Benutzernamen ein.');
    }
    if (!cleanPassword) {
      throw new Error('Bitte geben Sie Ihr Passwort ein.');
    }

    // Authentication is performed exclusively by the backend.
    // (A former client-side fallback accepted hardcoded passwords and issued fake tokens.)
    let res: Response;
    try {
      res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          ...(cleanSlug ? { tenantSlug: cleanSlug } : {}),
        }),
      });
    } catch {
      throw new Error('Server nicht erreichbar. Bitte versuchen Sie es später erneut.');
    }

    if (res.ok) {
      persistSession(await res.json());
      return;
    }

    const errJson = await res.json().catch(() => null);
    const backendError = errJson?.message
      ? Array.isArray(errJson.message)
        ? errJson.message[0]
        : errJson.message
      : null;
    throw new Error(backendError || 'Ungültige Anmeldedaten.');
  };

  const switchMode = async () => {
    if (!user) return;
    const newMode: 'MANAGER' | 'AGENT' = user.mode === 'MANAGER' ? 'AGENT' : 'MANAGER';
    if (newMode === 'MANAGER' && user.role === 'AGENT') return; // agents have no manager view
    try {
      const res = await fetch('/api/v1/auth/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.accessToken) {
          setToken(data.accessToken);
          localStorage.setItem('linkora_token', data.accessToken);
        }
      }
    } catch {
      // view mode is a UI preference; authorization is enforced by the backend role
    }
    const updated: User = { ...user, mode: newMode };
    setUser(updated);
    localStorage.setItem('linkora_user', JSON.stringify(updated));
  };

  const switchTenant = async (tenantId: string) => {
    try {
      const res = await fetch('/api/v1/auth/switch-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      if (res.ok) {
        persistSession(await res.json());
      }
    } catch {
      // keep current tenant on failure
    }
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    setToken(null);
    clearStoredSession();
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
