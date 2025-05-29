'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Circle } from 'lucide-react';
import Link from 'next/link';

import { cn } from '~/lib/utils';
import type { Bot } from '~/server/db/schema';
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
      const status = info.renderValue();
      return (
        <div className="flex items-center gap-1 text-center">
          <Circle
            className={cn({
              'animate-pulse fill-green-300': status === 'published',
              'fill-gray-300': status === 'paused',
            })}
            size={16}
          />
          {status === 'published' ? 'Active' : 'Paused'}
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

      return (
        <div className="ml-auto flex items-center justify-end gap-1">
          <Button
            onClick={() =>
              isPublished
                ? undeployBot.mutate({ id: bot.id })
                : deployBot.mutate({ id: bot.id })
            }
          >
            {!isPublished ? 'Deploy' : 'Pause'}
          </Button>
          <Link
            href={`/dashboard/bots/${bot.id}`}
            className={buttonVariants({ variant: 'default' })}
          >
            Edit
          </Link>
        </div>
      );
    },
  },
];
