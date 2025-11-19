'use client';

import {
  type ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

type AuthContext = {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

type LoginResponse = {
  user: User;
};

export const AuthContext = createContext<AuthContext | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthContext['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('api/auth/me')
      .then((res) => {
        if (!res.ok) {
          return;
        }
        return res.json();
      })
      .then((data) => setUser(data as User))
      .catch((_) => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const loginWithGoogle: AuthContext['loginWithGoogle'] = useCallback(
    async (credential) => {
      try {
        const requestOption: RequestInit = {
          method: 'POST',
          body: JSON.stringify({ token: credential }),
        };

        const res = await fetch('api/auth/login', requestOption);

        if (!res.ok) {
          throw new Error(res.statusText);
        }
        const data = (await res.json()) as LoginResponse;
        setUser(data.user);
      } catch (error) {
        console.error('Error during google auth:', error);
        throw error;
      }
    },
    [],
  );

  const logout: AuthContext['logout'] = useCallback(async () => {
    try {
      const requestOption: RequestInit = {
        method: 'POST',
      };

      const res = await fetch('api/auth/logout', requestOption);

      if (!res.ok) {
        throw new Error(res.statusText);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  }, []);

  const value: AuthContext = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      logout,
      isAuthenticated: !!user,
    }),
    [loading, loginWithGoogle, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
