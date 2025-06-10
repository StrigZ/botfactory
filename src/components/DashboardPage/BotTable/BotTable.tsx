'use client';

import type { Bot } from '~/server/db/schema';

import { columns } from './columns';
import { DataTable } from './data-table';

type Props = {
  bots: Bot[];
};
export default function BotTable({ bots }: Props) {
  return (
    <div className="py-10">
      <DataTable columns={columns} data={bots} />
    </div>
  );
}
