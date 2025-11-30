'use client';

import { type ReactNode, createContext, useContext, useMemo } from 'react';

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
  isUserQueryFinished: boolean;
  loginWithGoogle: (credentials: LoginWithGoogleInput) => void;
  logout: () => void;
  updateUser: (data: UpdateUserInput) => void;
};

export const AuthContext = createContext<AuthContext>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isUserQueryFinished: false,
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
  children: ReactNode;
};

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading, isSuccess } = useUser();
  const { loginWithGoogle, logout, updateUser } = useUserMutations();

  const value: AuthContext = useMemo(
    () => ({
      user,
      isLoading,
      loginWithGoogle,
      logout,
      updateUser,
      isAuthenticated: !!user,
      isUserQueryFinished: isSuccess,
    }),
    [isLoading, isSuccess, loginWithGoogle, logout, updateUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
