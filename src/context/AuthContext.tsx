'use client';

import { type ReactNode, createContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  // register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface AuthResponse {
  user: User;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount to restore session
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

  // const login = async (email: string, password: string): Promise<void> => {
  //   try {
  //     const response = await apiClient.post<AuthResponse>('/auth/login/', {
  //       email,
  //       password,
  //     });

  //     // The axios interceptor will automatically store the access token
  //     setUser(response.data.user);
  //   } catch (error) {
  //     // Re-throw the error so the login component can handle it
  //     throw error;
  //   }
  // };

  const loginWithGoogle = async (credential: string): Promise<void> => {
    try {
      const requestOption: RequestInit = {
        method: 'POST',
        body: JSON.stringify({ token: credential }),
      };

      const res = await fetch('api/auth/login', requestOption);

      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = (await res.json()) as AuthResponse;
      setUser(data.user);
    } catch (error) {
      console.error('Error during google auth:', error);
      throw error;
    }
  };

  // const register = async (
  //   email: string,
  //   password: string,
  //   name?: string,
  // ): Promise<void> => {
  //   try {
  //     const response = await apiClient.post<AuthResponse>('/auth/register/', {
  //       email,
  //       password,
  //       name,
  //     });

  //     setUser(response.data.user);
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  const logout = async (): Promise<void> => {
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        // login,
        loginWithGoogle,
        // register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
