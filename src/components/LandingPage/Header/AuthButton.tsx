import Link from 'next/link';

import { Button, buttonVariants } from '~/components/ui/button';

export default function AuthButton() {
  return (
    // <Button className="scale-95 cursor-pointer hover:scale-100 hover:shadow active:scale-105">
    //   Sign Up
    // </Button>
    <Link
      href="/login"
      className={buttonVariants({
        variant: 'secondary',
        className:
          'scale-95 cursor-pointer hover:scale-100 hover:shadow active:scale-105',
      })}
    >
      Sign Up
    </Link>
  );
}
