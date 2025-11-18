'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useBotMutations } from '~/hooks/use-bot-mutations';
import { cn } from '~/lib/utils';

import { Button } from './ui/button';

export default function CreateBotForm() {
  const { createBot, isCreating } = useBotMutations();

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Name is required!' }),
    token: z.string().min(1, { message: 'Token is required!' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', token: '' },
  });

  function onSubmit({ name, token }: z.infer<typeof formSchema>) {
    if (isCreating) {
      return;
    }

    createBot({ name, token });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="AI finance agent" {...field} />
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={cn('cursor-pointer')}
          disabled={isCreating}
        >
          {isCreating ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </Form>
  );
}
