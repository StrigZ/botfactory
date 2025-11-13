import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { env } from '~/env';
import type { WorkflowWithNodes } from '~/lib/workflow-api-client';

const API_URL = env.API_URL;

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;

  const requestOption: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: (await cookies()).toString(),
      credentials: 'include',
    },
  };

  try {
    const res = await fetch(`${API_URL}/workflows/${id}/full`, requestOption);

    if (!res.ok) {
      throw new Error(
        'Error during /api/workflows/id/full api call: ' + res.statusText,
      );
    }

    const data = (await res.json()) as WorkflowWithNodes;

    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json(
      {
        message: 'Unexpected error occurred during workflow fetching.',
        e,
      },
      { status: 500 },
    );
  }
}
