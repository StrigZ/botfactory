'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Circle } from 'lucide-react';

import { Button } from '~/components/ui/button';
import type { Bot } from '~/lib/bot-api-client';
import { cn } from '~/lib/utils';

import BotTableActions from './BotTableActions';

export const columns: ColumnDef<Bot>[] = [
  {
    accessorKey: 'name',
    header: '',
  },
  {
    accessorKey: 'is_deployed',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => {
      const status = info.renderValue() as boolean;
      const getDisplayText = () => {
        return status ? 'Deployed' : 'Paused';
      };

      return (
        <div className="flex items-center gap-1 text-center">
          <Circle
            className={cn({
              'animate-pulse fill-green-300': status,
              'fill-orange-300': !status,
            })}
            size={16}
          />
          {getDisplayText()}
        </div>
      );
    },
  },
  {
    id: 'messages sent',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Messages sent
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: () => <div className="text-center">9999</div>,
  },
  {
    id: 'messages received',

    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Messages received
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: () => <div className="text-center">6999</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <BotTableActions botData={row.original} />,
  },
];
