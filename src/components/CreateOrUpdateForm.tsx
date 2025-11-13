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

type Props = {
  botData?: Bot;
  isEditableByDefault?: boolean;
};
export default function CreateOrUpdateForm({
  botData,
  isEditableByDefault = false,
}: Props) {
  const [isCheckmarkVisible, setIsCheckMarkVisible] = useState(false);
  const [isEditable, setIsEditable] = useState(isEditableByDefault);
  const { createBot, updateBot, isCreating, isUpdating } = useBotMutations();
  const doesBotExist = !!botData;

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Name is required!' }),
    token: z.string().min(1, { message: 'Token is required!' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: botData?.name, token: botData?.token },
  });

  function onSubmit({ name, token }: z.infer<typeof formSchema>) {
    if (!isEditable || isCreating || isUpdating || isCheckmarkVisible) {
      return;
    }

    if (doesBotExist) {
      updateBot({ id: botData.id.toString(), data: { name, token } });
      showCheckmark();
    } else {
      createBot({ name, token });
    }
  }

  const getSubmitButtonDisplayText = () => {
    if (isCheckmarkVisible) {
      return (
        <>
          Success! <Check />
        </>
      );
    } else if (isCreating || isUpdating) {
      return <LoadingSpinner />;
    } else if (botData) {
      return 'Update';
    } else if (!botData) {
      return 'Verify';
    }
  };

  const getEditButtonDisplayText = () => {
    return isEditable ? 'Cancel' : 'Edit';
  };

  const showCheckmark = () => {
    setIsCheckMarkVisible(true);
    setTimeout(() => {
      setIsCheckMarkVisible(false);
    }, 2000);
  };

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
              className={cn('cursor-pointer', {
                'bg-green-500': isCheckmarkVisible,
              })}
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
              disabled={isCreating || isUpdating}
            >
              {getEditButtonDisplayText()}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
