import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { buttonVariants } from '~/components/ui/button';

export default function AuthButton() {
  const { data: session } = useSession();

  return (
    <Link
      href={!session ? '/login' : '/dashboard'}
      className={buttonVariants({
        variant: 'secondary',
        className:
          'scale-95 cursor-pointer hover:scale-100 hover:shadow active:scale-105',
      })}
    >
      {!session ? 'Sign Up' : 'Go to Dashboard'}
    </Link>
  );
}
