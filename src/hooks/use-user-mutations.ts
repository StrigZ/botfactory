'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getQueryClient } from '~/lib/query-client';
import { userKeys } from '~/lib/query-keys';
import {
  type LoginWithGoogleInput,
  type UpdateUserInput,
  userApiClient,
} from '~/lib/user-api-client';

export function useUserMutations() {
  const queryClient = getQueryClient();
  const router = useRouter();
  const loginWithGoogleMutation = useMutation({
    mutationFn: (data: LoginWithGoogleInput) =>
      userApiClient.loginWithGoogle(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      await queryClient.setQueryData(userKeys.me(), data);

      toast.success('Successfully logged in');
      router.replace(`/dashboard`);
    },
    onError: ({ message }) => toast.error(message),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => userApiClient.update(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      await queryClient.setQueryData(userKeys.me(), data);
      toast.success('User updated successfully');
    },
    onError: ({ message }) => toast.error(message),
  });

  const logoutMutation = useMutation({
    mutationFn: () => userApiClient.logout(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('Successfully logged out');
      router.replace(`/login`);
    },
    onError: ({ message }) => toast.error(message),
  });

  return {
    loginWithGoogle: loginWithGoogleMutation.mutate,
    updateUser: updateUserMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginWithGoogleMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
