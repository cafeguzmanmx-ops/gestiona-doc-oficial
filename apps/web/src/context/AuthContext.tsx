import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string | null;
  areaId: string | null;
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
} | null;

type AuthResponse = {
  accessToken: string;
  user: User;
  tenant: Tenant;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterMunicipioPayload = {
  municipioName: string;
  state: string;
  adminName: string;
  email: string;
  phone?: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  tenant: Tenant;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  registerMunicipio: (payload: RegisterMunicipioPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const token = localStorage.getItem('gestiona_doc_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser({
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role,
          tenantId: response.data.tenantId,
          areaId: response.data.areaId,
        });
        setTenant(response.data.tenant ?? null);
      } catch {
        localStorage.removeItem('gestiona_doc_token');
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, []);

  const applyAuth = (data: AuthResponse) => {
    localStorage.setItem('gestiona_doc_token', data.accessToken);
    setUser(data.user);
    setTenant(data.tenant);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    tenant,
    loading,
    isAuthenticated: Boolean(user),
    login: async (payload) => {
      const response = await api.post<AuthResponse>('/auth/login', payload);
      applyAuth(response.data);
      return response.data;
    },
    registerMunicipio: async (payload) => {
      const response = await api.post<AuthResponse>('/auth/register-municipio', payload);
      applyAuth(response.data);
    },
    logout: () => {
      localStorage.removeItem('gestiona_doc_token');
      setUser(null);
      setTenant(null);
    },
  }), [user, tenant, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
