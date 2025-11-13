import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { env } from '~/env';
import type {
  UpdateWorkflowInput,
  Workflow,
  WorkflowWithNodes,
} from '~/lib/workflow-api-client';

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
    const res = await fetch(`${API_URL}/workflows/${id}/`, requestOption);

    if (!res.ok) {
      throw new Error(
        'Error during /api/workflows/id api call: ' + res.statusText,
      );
    }

    const data = (await res.json()) as Workflow;

    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({
      status: 500,
      message: 'Unexpected error occurred during workflow fetching.',
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const { id } = await params;
  const requestData = (await request.json()) as UpdateWorkflowInput;
  const requestOption: RequestInit = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',

      Cookie: (await cookies()).toString(),
      credentials: 'include',
    },
    body: JSON.stringify({ ...requestData, id: +id }),
  };

  try {
    const res = await fetch(`${API_URL}/workflows/sync/`, requestOption);

    if (!res.ok) {
      throw new Error(
        'Error during /api/workflows/id api call: ' + res.statusText,
      );
    }

    const data = (await res.json()) as WorkflowWithNodes;

    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json(
      {
        message: 'Unexpected error occurred during workflows updating.',
        e,
      },
      { status: 500 },
    );
  }
}
