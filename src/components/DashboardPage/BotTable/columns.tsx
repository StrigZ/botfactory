'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Circle, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';

import { Button, buttonVariants } from '~/components/ui/button';
import { useBotMutations } from '~/hooks/use-bot-mutations';
import { cn } from '~/lib/utils';
import type { Bot, BotStatus } from '~/server/db/schema';

export const columns: ColumnDef<Bot>[] = [
  {
    accessorKey: 'name',
    header: '',
  },
  {
    accessorKey: 'status',
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
      const status = info.renderValue() as BotStatus;

      const getDisplayText = () => {
        switch (status) {
          case 'published':
            return 'Active';
          case 'paused':
            return 'Paused';
          case 'draft':
            return 'Draft';
          default:
            break;
        }
      };

      return (
        <div className="flex items-center gap-1 text-center">
          <Circle
            className={cn({
              'animate-pulse fill-green-300': status === 'published',
              'fill-orange-300': status === 'paused',
              'fill-gray-300': status === 'draft',
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
      const isPublished = bot.status === 'published';

      const isLoading = isDeploying || isPausing;

      const getDisplayText = () => {
        if (isPausing) {
          return 'Pausing...';
        } else if (isDeploying) {
          return 'Deploying...';
        } else if (isPublished) {
          return 'Pause';
        } else if (!isPublished) {
          return 'Deploy';
        }
      };

      return (
        <div className="ml-auto flex items-center justify-end gap-1">
          <Button
            className={cn('cursor-pointer', { 'cursor-none': isLoading })}
            onClick={() =>
              isPublished ? pauseBot({ id: bot.id }) : deployBot({ id: bot.id })
            }
            disabled={isLoading}
            variant={isPublished ? 'destructive' : 'default'}
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
