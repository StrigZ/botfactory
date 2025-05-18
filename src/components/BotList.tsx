'use client';

import Link from 'next/link';

import { api } from '~/trpc/react';

type Props = {};
export default function BotList({}: Props) {
  const [data] = api.bot.getAll.useSuspenseQuery();

  if (!data) {
    return <p>loading</p>;
  }

  return (
    <div>
      BOTS
      <ul>
        {data.map((bot) => (
          <li key={bot.id}>
            <Link href={`/dashboard/bots/${bot.id}`}>{bot.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
