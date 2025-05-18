'use client';

import { api } from '~/trpc/react';

import { Button } from './ui/button';

type Props = {};
export default function CreateBotButton({}: Props) {
  const utils = api.useUtils();
  const createBot = api.bot.create.useMutation({
    onSuccess: async () => {
      await utils.bot.invalidate();
    },
  });

  return (
    <Button
      onClick={() => createBot.mutate({ name: 'test bot', token: 'test' })}
    >
      Create
    </Button>
  );
}
