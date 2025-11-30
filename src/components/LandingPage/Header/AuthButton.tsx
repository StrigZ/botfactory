import Link from 'next/link';

import { buttonVariants } from '~/components/ui/button';
import { useAuth } from '~/context/AuthContext';

export default function AuthButton() {
  const { isAuthenticated } = useAuth();

  return (
    <Link
      href={!isAuthenticated ? '/login' : '/dashboard'}
      className={buttonVariants({
        variant: 'secondary',
        className:
          'scale-95 cursor-pointer hover:scale-100 hover:shadow active:scale-105',
      })}
    >
      {!isAuthenticated ? 'Sign Up' : 'Go to Dashboard'}
    </Link>
  );
}
