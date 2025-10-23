'use client';

import { type ReactNode, createContext, useEffect, useState } from 'react';

import { apiClient } from '~/lib/api-client';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  // Add other user fields from your Django User model
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Define the shape of API responses from Django
interface AuthResponse {
  access: string;
  user: User;
}

// Create context with undefined as initial value - we'll check for this in the hook
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
    apiClient
      .get<User>('/auth/users/me/')
      .then((response) => setUser(response.data))
      .catch((_) => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', {
        email,
        password,
      });

      // The axios interceptor will automatically store the access token
      setUser(response.data.user);
    } catch (error) {
      // Re-throw the error so the login component can handle it
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string): Promise<void> => {
    try {
      const response = await apiClient.post<AuthResponse>('/accounts/google/', {
        token: credential,
      });

      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name?: string,
  ): Promise<void> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register/', {
        email,
        password,
        name,
      });

      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/token/logout/');
    } catch (error) {
      // Log the error but continue with logout anyway
      console.error('Logout error:', error);
    } finally {
      // Always clear user state and token, even if API call fails
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
