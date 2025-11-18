'use client';

import { SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';

import { Button, buttonVariants } from '~/components/ui/button';
import { useBotMutations } from '~/hooks/use-bot-mutations';
import type { Bot } from '~/lib/bot-api-client';
import { cn } from '~/lib/utils';

type Props = { botData: Bot };
export default function BotTableActions({ botData }: Props) {
  const { deployBot, pauseBot, isDeploying, isPausing } = useBotMutations();

  const isLoading = isDeploying || isPausing;

  const getDisplayText = () => {
    if (isPausing) return 'Pausing...';
    if (isDeploying) return 'Deploying...';

    return botData.is_deployed ? 'Pause' : 'Deploy';
  };

  const handleDeployButtonClick = () =>
    botData.is_deployed
      ? pauseBot({ id: botData.id })
      : deployBot({ id: botData.id });

  return (
    <div className="ml-auto flex items-center justify-end gap-1">
      <Button
        className={cn('cursor-pointer', { 'cursor-none': isLoading })}
        onClick={handleDeployButtonClick}
        disabled={isLoading}
        variant={botData.is_deployed ? 'destructive' : 'default'}
      >
        {getDisplayText()}
      </Button>
      <Link
        href={`/dashboard/bots/${botData.id}`}
        className={buttonVariants({ variant: 'link' })}
      >
        <SquareArrowOutUpRight />
      </Link>
    </div>
  );
}
