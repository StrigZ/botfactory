'use client';

import { useRouter } from 'next/navigation';

import { api } from '~/trpc/react';

import CreateOrUpdateForm from './CreateOrUpdateForm';
import { Button } from './ui/button';

type Props = { botId: string };
export default function BotPage({ botId }: Props) {
  const router = useRouter();
  const [bot] = api.bot.getById.useSuspenseQuery({
    id: botId,
    withComponents: true,
  });
  const utils = api.useUtils();
  const deleteBot = api.bot.delete.useMutation({
    onSuccess: async () => {
      await utils.bot.getAll.invalidate();
      router.push('/dashboard');
    },
  });

  if (!bot) {
    return <p>Not found</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1>Bot Name: {bot?.name}</h1>
      <div className="flex flex-col gap-4">
        <h2>Edit Bot</h2>
        <CreateOrUpdateForm
          botData={{ id: bot.id, name: bot.name, token: bot.token }}
        />
      </div>
      <Button
        onClick={() => deleteBot.mutate({ id: botId })}
        className="cursor-pointer"
      >
        Delete bot
      </Button>
    </div>
  );
}
