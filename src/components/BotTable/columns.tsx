'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Circle, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';

import { cn } from '~/lib/utils';
import type { Bot, BotStatus } from '~/server/db/schema';
import { api } from '~/trpc/react';

import { Button, buttonVariants } from '../ui/button';

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
          default:
            break;
        }
      };

      return (
        <div className="flex items-center gap-1 text-center">
          <Circle
            className={cn({
              'animate-pulse fill-green-300': status === 'published',
              'fill-gray-300': status === 'paused',
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
      const bot = row.original;
      const isPublished = bot.status === 'published';
      const utils = api.useUtils();
      const deployBot = api.bot.deploy.useMutation({
        onSuccess: async () => {
          await utils.bot.getAll.invalidate();
        },
      });
      const undeployBot = api.bot.undeploy.useMutation({
        onSuccess: async () => {
          await utils.bot.getAll.invalidate();
        },
      });
      const isLoading = deployBot.isPending || undeployBot.isPending;

      const getDisplayText = () => {
        if (undeployBot.isPending) {
          return 'Pausing...';
        } else if (deployBot.isPending) {
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
              isPublished
                ? undeployBot.mutate({ id: bot.id })
                : deployBot.mutate({ id: bot.id })
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
