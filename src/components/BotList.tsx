'use client';

import Link from 'next/link';

import { api } from '~/trpc/react';

import { Button } from './ui/button';

type Props = {};
export default function BotList({}: Props) {
  const [data] = api.bot.getAll.useSuspenseQuery();

  const deployBot = api.bot.deploy.useMutation();
  const undeployBot = api.bot.undeploy.useMutation();

  if (!data) {
    return <p>loading</p>;
  }

  return (
    <div>
      BOTS
      <ul>
        {data.map((bot) => (
          <li key={bot.id}>
            {/* <Link href={`/dashboard/bots/${bot.id}`}>
              {bot.name}
            </Link> */}
            {bot.name}
            <Button onClick={() => deployBot.mutate({ id: bot.id })}>
              Deploy
            </Button>
            <Button onClick={() => undeployBot.mutate({ id: bot.id })}>
              Pause
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
