'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { useBots } from '~/hooks/use-bots';

import Summary from '../Summary';
import { buttonVariants } from '../ui/button';
import BotTable from './BotTable/BotTable';

export default function DashboardMain() {
  const { data } = useBots();

  return (
    <div className="px-3xl pt-xl">
      {data?.length ? (
        <>
          <Summary />
          <BotTable bots={data} />
          <Link
            href="/dashboard/bots/create"
            className={buttonVariants({
              variant: 'default',
              className: 'ml-auto flex!',
            })}
          >
            New <Plus />
          </Link>
        </>
      ) : (
        <div className="gap-base flex items-center justify-center">
          <Link
            href="/dashboard/bots/create"
            className={buttonVariants({ variant: 'default' })}
          >
            Create your first bot!
          </Link>
        </div>
      )}
    </div>
  );
}
