import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getTokensFromCookies(cookies: string[]) {
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
