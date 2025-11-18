'use client';

import { withAuth } from '~/hooks/use-auth';

import CreateOrUpdateForm from '../CreateOrUpdateForm';

function BotCreatePage() {
  return (
    <div className="flex h-full overflow-hidden p-0">
      <div className="min-w-xs p-8">
        <CreateOrUpdateForm isEditableByDefault />
      </div>

      <div className="relative flex-1">
        <span className="absolute inset-0 z-10 flex items-center justify-center">
          Verify the token to unlock the workflow!
        </span>
        <div className="font-heavy pointer-events-none relative flex h-full cursor-default items-center justify-center border border-black text-xl blur-md backdrop-blur-md" />
      </div>
    </div>
  );
}

export default withAuth(BotCreatePage);
