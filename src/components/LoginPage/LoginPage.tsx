'use client';

import { type CredentialResponse } from 'google-one-tap';
import { useEffect, useState } from 'react';

import { env } from '~/env';
import { useAuth } from '~/hooks/use-auth';

export default function LoginPage() {
  const [error, setError] = useState('');
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    if (!window.google?.accounts) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      callback: handleGoogleCallback,
    });

    const buttonElement = document.getElementById('googleSignInButton');
    if (!buttonElement) {
      return;
    }

    window.google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      width: 400,
      text: 'continue_with',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleCallback = async (response: CredentialResponse) => {
    setError('');
    try {
      loginWithGoogle({ credentials: response.credential });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Google sign-in failed. Please try again.',
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in</h2>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div>
          <div id="googleSignInButton"></div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm"></div>
        </div>
      </div>
    </div>
  );
}
