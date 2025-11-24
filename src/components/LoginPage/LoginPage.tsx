'use client';

import type { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';

import { useAuth } from '~/hooks/use-auth';

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => Promise<void>;
    }) => void;
    renderButton: (
      element: HTMLElement | null,
      config: {
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        width?: number;
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      },
    ) => void;
  };
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts) {
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;

      if (!clientId) {
        console.error('Google Client ID not found in environment variables');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
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
    };

    // Give the script a moment to load
    const timer = setTimeout(initializeGoogleSignIn, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleCallback = async (response: GoogleCredentialResponse) => {
    setError('');
    setLoading(true);

    try {
      loginWithGoogle({ credentials: response.credential });
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        detail?: string;
      }>;
      const errorMessage =
        axiosError.response?.data?.message ??
        axiosError.response?.data?.detail ??
        'Google sign-in failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Google Sign-In Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

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

          {/* Google Sign-In Button */}
          <div>
            <div id="googleSignInButton" className="flex justify-center"></div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm"></div>
          </div>

          {/* Email/Password Form */}
        </div>
      </div>
    </>
  );
}
