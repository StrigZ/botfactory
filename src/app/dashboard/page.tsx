import { redirect } from 'next/navigation';

import { Button } from '~/components/ui/button';
import { auth, signOut } from '~/server/auth';

type Props = {};
export default async function DashboardPage({}: Props) {
  const session = await auth();
  if (!session) {
    redirect('/');
  }
  return (
    <main className="flex h-screen items-center justify-center">
      <form
        action={async () => {
          'use server';
          try {
            await signOut({
              redirect: true,
              redirectTo: '/',
            });
          } catch (error) {
            // Signin can fail for a number of reasons, such as the user
            // not existing, or the user not having the correct role.
            // In some cases, you may want to redirect to a custom error
            // if (error instanceof AuthError) {
            //   return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`);
            // }

            // Otherwise if a redirects happens Next.js can handle it
            // so you can just re-thrown the error and let Next.js handle it.
            // Docs:
            // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
            throw error;
          }
        }}
      >
        <Button type="submit" className="cursor-pointer">
          LOGOUT
        </Button>
      </form>
    </main>
  );
}
