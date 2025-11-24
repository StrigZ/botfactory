'use client';

import { getApiUrl } from './utils';

const ENDPOINT = '/api/workflows';

export type Workflow = {
  id: string;
  owner_id: string;
  bot_id: string;
  name: string;
  created_at: string;
};
export type WorkflowWithNodes = {
  workflow: Workflow;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};
export type WorkflowNode = {
  id: string;
  workflow_id: string;
  node_type: string;
  name: string;
  position: { x: number; y: number };
  data: Record<string, unknown> & { name?: never };
};
export type WorkflowEdge = {
  id: string;
  workflow_id: string;
  source_id: string;
  target_id: string;
};
export type UpdateWorkflowInput = {
  id: string;
  nodes: Omit<WorkflowNode, 'workflow_id'>[];
  edges: Omit<WorkflowEdge, 'workflow_id'>[];
};

class WorkflowApiClient {
  // TODO: make separate api client class
  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const errorBody = (await res.json()) as { message: string };
      const message = errorBody.message;
      throw new Error(`${res.status}: ${message}`);
    }
    return res.json() as Promise<T>;
  }

  async getByIdWithNodes(id: string) {
    const res = await fetch(getApiUrl(`${ENDPOINT}/${id}`));
    return this.handleResponse<WorkflowWithNodes>(res);
  }
  async update(data: UpdateWorkflowInput) {
    const fetchProps: RequestInit = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
    const res = await fetch(getApiUrl(`${ENDPOINT}/${data.id}`), fetchProps);
    return this.handleResponse<Workflow>(res);
  }
}

export const workflowApiClient = new WorkflowApiClient();
