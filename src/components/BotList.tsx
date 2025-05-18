'use client';

import { api } from '~/trpc/react';

import CreateBotButton from './CreateBotButton';
import { Button } from './ui/button';

type Props = {};
export default function BotList({}: Props) {
  const [data] = api.bot.getAll.useSuspenseQuery();
  const utils = api.useUtils();
  const deleteBot = api.bot.delete.useMutation({
    onSuccess: async () => {
      await utils.bot.invalidate();
    },
  });
  const updateBot = api.bot.update.useMutation({
    onSuccess: async () => {
      await utils.bot.invalidate();
    },
  });
  if (!data) {
    return <p>loading</p>;
  }

  return (
    <div>
      BOTS
      <ul>
        {data.map((bot) => (
          <li key={bot.id}>
            {bot.name}
            <Button onClick={() => deleteBot.mutate({ id: bot.id })}>
              Delete
            </Button>
            <Button
              onClick={() =>
                updateBot.mutate({
                  id: bot.id,
                  name: 'updated',
                  token: bot.token,
                })
              }
            >
              update
            </Button>
          </li>
        ))}
      </ul>
      <CreateBotButton />
    </div>
  );
}
