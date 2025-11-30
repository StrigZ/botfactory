import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '~/env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTokensFromCookies(cookies: string[]) {
  let access = '';
  let refresh = '';

  cookies.forEach((cookie) => {
    const accessMatch = /(?:access_token|access)=([^;]+)/.exec(cookie);
    if (accessMatch) {
      access = accessMatch[1]!;
    }

    const refreshMatch = /(?:refresh_token|refresh)=([^;]+)/.exec(cookie);
    if (refreshMatch) {
      refresh = refreshMatch[1]!;
    }
  });
  if (!access || !refresh) return null;

  return { access, refresh };
}

export function getApiUrl(endpoint: string): string {
  // If we already have an absolute URL, return it as-is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // Server-side: Use proper environment variable
  if (typeof window === 'undefined') {
    const baseUrl = env.VERCEL_URL ?? 'http://localhost:3000';
    const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    return `${url}${endpoint}`;
  }

  // Client-side: Use window.location.origin
  return `${window.location.origin}${endpoint}`;
}
