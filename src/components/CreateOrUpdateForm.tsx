'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import type { Bot } from '~/server/db/schema';
import { api } from '~/trpc/react';

import LoadingSpinner from './LoadingSpinner';

type Props = {
  botData?: Bot;
  isEditableByDefault?: boolean;
};
export default function CreateOrUpdateForm({
  botData,
  isEditableByDefault = false,
}: Props) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditable, setIsEditable] = useState(isEditableByDefault);

  const doesBotExist = !!botData;

  const router = useRouter();

  const utils = api.useUtils();
  const createBot = api.bot.create.useMutation({
    onMutate: () => {
      setIsPending(true);
      showCheckmark();
    },
    onSuccess: async (data) => {
      await utils.bot.getAll.invalidate();

      setIsPending(false);
      router.push(`/dashboard/bots/${data?.id}`);
    },
  });
  const updateBot = api.bot.update.useMutation({
    onMutate: () => {
      setIsPending(true);
    },
    onSuccess: async () => {
      await utils.bot.getAll.invalidate();
      await utils.bot.getById.invalidate({ id: botData?.id });
      setIsPending(false);
      showCheckmark();
    },
  });

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Name is required!' }),
    token: z.string().min(1, { message: 'Token is required!' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: botData?.name, token: botData?.token },
  });

  function onSubmit({ name, token }: z.infer<typeof formSchema>) {
    if (!isEditable || isPending || isSuccess) {
      return;
    }

    if (doesBotExist) {
      updateBot.mutate({
        name,
        token,
        id: botData.id,
      });
    } else {
      createBot.mutate({ name, token });
    }
  }

  const getSubmitButtonDisplayText = () => {
    if (isSuccess) {
      return (
        <>
          Success! <Check />
        </>
      );
    } else if (isPending) {
      return <LoadingSpinner />;
    } else if (botData) {
      return 'Update';
    } else if (!botData) {
      return 'Create';
    }
  };

  const getEditButtonDisplayText = () => {
    if (isEditable) {
      return 'Cancel';
    } else if (!isEditable) {
      return 'Edit';
    }
  };

  const showCheckmark = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="AI finance agent"
                  {...field}
                  disabled={!isEditable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token</FormLabel>
              <FormControl>
                <Input
                  placeholder="0123456789:ASkD8FzC8DFt8DXdS8-AcD8FAbSDF"
                  {...field}
                  disabled={!isEditable}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {isEditable && (
            <Button
              type="submit"
              className={cn('cursor-pointer', { 'bg-green-500': isSuccess })}
              disabled={!isEditable}
            >
              {getSubmitButtonDisplayText()}
            </Button>
          )}
          {doesBotExist && (
            <Button
              className="cursor-pointer"
              type="button"
              variant={!isEditable ? 'default' : 'destructive'}
              onClick={() => setIsEditable((pv) => !pv)}
              disabled={isPending}
            >
              {getEditButtonDisplayText()}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
