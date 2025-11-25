'use server';

import { NextRequest, NextResponse } from 'next/server';

import { env } from '~/env';
import { setTokens } from '~/lib/auth';
import { getTokensFromCookies } from '~/lib/utils';

const API_URL = env.API_URL;

export async function POST(req: NextRequest) {
  const { refresh } = (await req.json()) as { refresh: string };
  const res = await fetch(`${API_URL}/auth/jwt/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      //   Cookies: req.headers.getSetCookie().toString(),
    },
    body: JSON.stringify({ refresh }),
  });
  const setCookies = res.headers.getSetCookie();
  const tokens = getTokensFromCookies(setCookies);

  //   if (!res.ok) {
  //     const errorText = await res.text();
  //     return Response.json(
  //       {
  //         message: `Token refresh failed: ${res.statusText} - ${errorText}`,
  //       },
  //       { status: res.status ?? 500 },
  //     );
  //   }

  //   const resCookies = res.headers.getSetCookie();

  if (!tokens) {
    const errorText = await res.text();
    return Response.json(
      {
        message: `Couldn't find new tokens in response cookies: ${res.statusText} - ${errorText}`,
      },
      { status: res.status ?? 500 },
    );
  }

  await setTokens(tokens);
  return NextResponse.json(tokens);

  return new NextResponse(JSON.stringify(tokens), {
    headers: { 'Set-Cookie': setCookies.toString() },
  });
}
