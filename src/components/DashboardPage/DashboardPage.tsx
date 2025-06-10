'use client';

import Link from 'next/link';

import { api } from '~/trpc/react';

import Summary from '../Summary';
import { buttonVariants } from '../ui/button';
import BotTable from './BotTable/BotTable';

type Props = {};
export default function DashboardPage({}: Props) {
  const [data] = api.bot.getAll.useSuspenseQuery();

  return (
    <div className="px-3xl pt-xl">
      {0 ? (
        <>
          <Summary />
          <BotTable bots={data} />
        </>
      ) : (
        <div className="gap-base flex items-center justify-center">
          <h2>Create your first bot</h2>
          <Link
            href="/dashboard/bots/create"
            className={buttonVariants({ variant: 'default' })}
          >
            Create
          </Link>
        </div>
      )}
    </div>
  );
}
