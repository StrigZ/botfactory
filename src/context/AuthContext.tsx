'use client';

import { type ReactNode, createContext, useMemo } from 'react';

import { useUser } from '~/hooks/use-user';
import { useUserMutations } from '~/hooks/use-user-mutations';
import type {
  LoginWithGoogleInput,
  UpdateUserInput,
} from '~/lib/user-api-client';

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

type AuthContext = {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (credentials: LoginWithGoogleInput) => void;
  logout: () => void;
  updateUser: (data: UpdateUserInput) => void;
};

export const AuthContext = createContext<AuthContext>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  loginWithGoogle(_credentials) {
    //
  },
  logout() {
    //
  },
  updateUser(_data) {
    //
  },
});

type AuthProviderProps = {
  initialUser?: User | null;
  children: ReactNode;
};

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const { data: user, isLoading } = useUser({ initialUser });
  const { loginWithGoogle, logout, updateUser } = useUserMutations();

  const value: AuthContext = useMemo(
    () => ({
      user,
      isLoading,
      loginWithGoogle,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }),
    [isLoading, loginWithGoogle, logout, updateUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
