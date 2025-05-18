'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { api } from '~/trpc/react';

type Props = { botData?: { id: string; name: string; token: string } };
export default function CreateOrUpdateForm({ botData }: Props) {
  const utils = api.useUtils();
  const createBot = api.bot.create.useMutation({
    onSuccess: async () => {
      await utils.bot.getAll.invalidate();
    },
  });
  const updateBot = api.bot.update.useMutation({
    onSuccess: async () => {
      await utils.bot.getAll.invalidate();
      await utils.bot.getById.invalidate({ id: botData?.id });
    },
  });

  const formSchema = z.object({
    name: z.string().min(1),
    token: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: botData?.name ?? '',
      token: botData?.token ?? '',
    },
  });

  function onSubmit({ name, token }: z.infer<typeof formSchema>) {
    if (botData) {
      updateBot.mutate({
        name,
        token,
        id: botData.id,
      });
    } else {
      createBot.mutate({ name, token });
    }
  }

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
                <Input placeholder="Juan" {...field} />
              </FormControl>
              <FormDescription>The display name of the bot.</FormDescription>
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
                <Input placeholder="123456" {...field} />
              </FormControl>
              <FormDescription>The token of the bot.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="cursor-pointer">
          {botData ? 'Update' : 'Create'}
        </Button>
      </form>
    </Form>
  );
}
