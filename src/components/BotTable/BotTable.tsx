'use client';

import { api } from '~/trpc/react';

import { columns } from './columns';
import { DataTable } from './data-table';

type Props = {};
export default function BotTable({}: Props) {
  const [data] = api.bot.getAll.useSuspenseQuery();

  return (
    <div className="py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
