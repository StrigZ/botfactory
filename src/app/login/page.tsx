import { AuthError } from 'next-auth';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { signIn } from '~/server/auth';
import { authConfig } from '~/server/auth/config';
import { HydrateClient } from '~/trpc/server';

const SIGNIN_ERROR_URL = '/error';

export default async function LoginPage() {
  return (
    <HydrateClient>
      <main className="flex h-screen items-center justify-center bg-gradient-to-b from-white to-purple-300 text-center">
        <Card className="bg-gradient-to-br from-white to-gray-100">
          <CardHeader>
            <CardTitle>Sign in with</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.values(authConfig.providers).map((provider) => (
              <form
                key={provider.id}
                className="grid grid-cols-2 gap-4"
                action={async () => {
                  'use server';
                  try {
                    await signIn(provider.id, {
                      redirectTo: '/dashboard',
                    });
                  } catch (error) {
                    // Signin can fail for a number of reasons, such as the user
                    // not existing, or the user not having the correct role.
                    // In some cases, you may want to redirect to a custom error
                    if (error instanceof AuthError) {
                      return redirect(
                        `${SIGNIN_ERROR_URL}?error=${error.type}`,
                      );
                    }

                    // Otherwise if a redirects happens Next.js can handle it
                    // so you can just re-thrown the error and let Next.js handle it.
                    // Docs:
                    // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                    throw error;
                  }
                }}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  className="flex cursor-pointer items-center gap-2 rounded bg-white p-6 shadow"
                >
                  <Image
                    src={`/${provider.id}.svg`}
                    alt={`sign in with ${provider.id}`}
                    width={20}
                    height={20}
                  />
                  {provider.id[0]?.toUpperCase() + provider.id.slice(1)}
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  className="flex cursor-pointer items-center gap-2 rounded bg-white p-6 shadow"
                >
                  <Image
                    src={`/${provider.id}.svg`}
                    alt={`sign in with ${provider.id}`}
                    width={20}
                    height={20}
                  />
                  {provider.id[0]?.toUpperCase() + provider.id.slice(1)}
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  className="flex cursor-pointer items-center gap-2 rounded bg-white p-6 shadow"
                >
                  <Image
                    src={`/${provider.id}.svg`}
                    alt={`sign in with ${provider.id}`}
                    width={20}
                    height={20}
                  />
                  {provider.id[0]?.toUpperCase() + provider.id.slice(1)}
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  className="flex cursor-pointer items-center gap-2 rounded bg-white p-6 shadow"
                >
                  <Image
                    src={`/${provider.id}.svg`}
                    alt={`sign in with ${provider.id}`}
                    width={20}
                    height={20}
                  />
                  {provider.id[0]?.toUpperCase() + provider.id.slice(1)}
                </Button>
              </form>
            ))}
          </CardContent>
          <CardFooter className="text-muted-foreground px-12 text-xs">
            <p>
              By signing in, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </CardFooter>
        </Card>
      </main>
    </HydrateClient>
  );
}
