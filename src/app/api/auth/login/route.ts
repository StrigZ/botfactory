'use server';

import { type NextRequest } from 'next/server';

import { login } from '~/lib/auth';

export async function POST(request: NextRequest) {
  return await login(request);
}
