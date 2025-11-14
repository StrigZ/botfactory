'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Circle, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';

import { Button, buttonVariants } from '~/components/ui/button';
import { useBotMutations } from '~/hooks/use-bot-mutations';
import type { Bot } from '~/lib/bot-api-client';
import { cn } from '~/lib/utils';

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
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { deployBot, pauseBot, isDeploying, isPausing } = useBotMutations();
      const bot = row.original;

      const isLoading = isDeploying || isPausing;

      const getDisplayText = () => {
        if (isPausing) {
          return 'Pausing...';
        } else if (isDeploying) {
          return 'Deploying...';
        } else if (bot.is_deployed) {
          return 'Pause';
        } else if (!bot.is_deployed) {
          return 'Deploy';
        }
      };

      return (
        <div className="ml-auto flex items-center justify-end gap-1">
          <Button
            className={cn('cursor-pointer', { 'cursor-none': isLoading })}
            onClick={() =>
              bot.is_deployed
                ? pauseBot({ id: bot.id })
                : deployBot({ id: bot.id })
            }
            disabled={isLoading}
            variant={bot.is_deployed ? 'destructive' : 'default'}
          >
            {getDisplayText()}
          </Button>
          <Link
            href={`/dashboard/bots/${bot.id}`}
            className={buttonVariants({ variant: 'link' })}
          >
            <SquareArrowOutUpRight />
          </Link>
        </div>
      );
    },
  },
];
