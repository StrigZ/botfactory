'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { withAuth } from '~/hooks/use-auth';
import { useBots } from '~/hooks/use-bots';

import Summary from '../Summary';
import { buttonVariants } from '../ui/button';
import BotTable from './BotTable/BotTable';

function DashboardPage() {
  const { data } = useBots();

  return (
    <div className="px-3xl pt-xl">
      {data?.results?.length ? (
        <>
          <Summary />
          <BotTable bots={data.results} />
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

export default withAuth(DashboardPage);
