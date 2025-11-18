'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
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
import { useBotMutations } from '~/hooks/use-bot-mutations';
import type { Bot } from '~/lib/bot-api-client';
import { cn } from '~/lib/utils';

import LoadingSpinner from './LoadingSpinner';

// TODO: Split into two forms
type Props = {
  botData: Bot;
};
export default function UpdateBotForm({ botData }: Props) {
  const [isCheckmarkVisible, setIsCheckMarkVisible] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const { updateBot, isUpdating } = useBotMutations();

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Name is required!' }),
    token: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: botData.name },
  });

  function onSubmit({ name, token }: z.infer<typeof formSchema>) {
    if (isUpdating) {
      return;
    }

    updateBot({ id: botData.id, data: { name, token } });
    showCheckmark();
  }

  const getSubmitButtonDisplayText = () => {
    if (isCheckmarkVisible)
      return (
        <>
          Success! <Check />
        </>
      );
    if (isUpdating) return <LoadingSpinner />;

    return 'Update';
  };

  const getEditButtonDisplayText = () => {
    return isUpdatingName ? 'Cancel' : 'Edit';
  };

  const showCheckmark = () => {
    setIsCheckMarkVisible(true);
    setTimeout(() => {
      setIsCheckMarkVisible(false);
    }, 2000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                  disabled={!isUpdatingName}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {isUpdatingName && (
            <Button
              type="submit"
              className={cn('cursor-pointer', {
                'bg-green-500': isCheckmarkVisible,
              })}
              disabled={!isUpdatingName}
            >
              {getSubmitButtonDisplayText()}
            </Button>
          )}
          <Button
            className="cursor-pointer"
            type="button"
            variant={!isUpdatingName ? 'default' : 'destructive'}
            onClick={() => setIsUpdatingName((pv) => !pv)}
            disabled={isUpdating}
          >
            {getEditButtonDisplayText()}
          </Button>
        </div>
        {isUpdatingToken && (
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New token</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0123456789:ASkD8FzC8DFt8DXdS8-AcD8FAbSDF"
                    {...field}
                    disabled={!isUpdatingToken}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2">
          {isUpdatingToken && (
            <Button
              type="submit"
              className={cn('cursor-pointer', {
                'bg-green-500': isCheckmarkVisible,
              })}
              disabled={!isUpdatingToken}
            >
              {getSubmitButtonDisplayText()}
            </Button>
          )}
          <Button
            className="cursor-pointer"
            type="button"
            variant={!isUpdatingToken ? 'default' : 'destructive'}
            onClick={() => setIsUpdatingToken((pv) => !pv)}
            disabled={isUpdating}
          >
            {isUpdatingToken ? 'Cancel' : 'Update token'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
