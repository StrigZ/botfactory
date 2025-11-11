'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  type CreateBotInput,
  type DeleteBotInput,
  type DeployBotInput,
  type PauseBotInput,
  type UpdateBotInput,
  botApiClient,
} from '~/lib/bot-api-client';
import { getQueryClient } from '~/lib/query-client';

import { botKeys } from './use-bots';

export function useBotMutations() {
  const queryClient = getQueryClient();
  const router = useRouter();
  const createBotMutation = useMutation({
    mutationFn: (data: CreateBotInput) => botApiClient.create(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: botKeys.lists() });
      await queryClient.setQueryData(botKeys.detail(data.id), data);
      toast.success('Bot created successfully');
      router.push(`/dashboard/bots/${data?.id}`);
    },
    onError: ({ message }) => toast.error(message),
  });

  const updateBotMutation = useMutation({
    mutationFn: ({ id, data }: UpdateBotInput) =>
      botApiClient.update({ id, data }),
    onSuccess: async (data, variables) => {
      await queryClient.setQueryData(botKeys.detail(variables.id), data);
      await queryClient.invalidateQueries({ queryKey: botKeys.lists() });
      toast.success('Bot updated successfully');
    },
    onError: ({ message }) => toast.error(message),
  });

  const deleteBotMutation = useMutation({
    mutationFn: ({ id }: DeleteBotInput) => botApiClient.delete({ id }),
    onSuccess: async (_, { id }) => {
      queryClient.removeQueries({ queryKey: botKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: botKeys.lists() });
      toast.success('Bot deleted successfully');
      router.push('/dashboard');
    },
    onError: ({ message }) => toast.error(message),
  });

  const deployBotMutation = useMutation({
    mutationFn: ({ id }: DeployBotInput) => botApiClient.deploy({ id }),
    onSuccess: async (data, variables) => {
      await queryClient.setQueryData(botKeys.detail(variables.id), data);
      await queryClient.invalidateQueries({ queryKey: botKeys.lists() });
      toast.success('Bot deployed successfully');
    },
    onError: ({ message }) => toast.error(message),
  });

  const pauseBotMutation = useMutation({
    mutationFn: ({ id }: PauseBotInput) => botApiClient.pause({ id }),
    onSuccess: async (data, variables) => {
      await queryClient.setQueryData(botKeys.detail(variables.id), data);
      await queryClient.invalidateQueries({ queryKey: botKeys.lists() });
      toast.success('Bot paused successfully');
    },
    onError: ({ message }) => toast.error(message),
  });
  return {
    createBot: createBotMutation.mutate,
    updateBot: updateBotMutation.mutate,
    deleteBot: deleteBotMutation.mutate,
    deployBot: deployBotMutation.mutate,
    pauseBot: pauseBotMutation.mutate,
    isCreating: createBotMutation.isPending,
    isUpdating: updateBotMutation.isPending,
    isDeleting: deleteBotMutation.isPending,
    isDeploying: deployBotMutation.isPending,
    isPausing: pauseBotMutation.isPending,
  };
}
