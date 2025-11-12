const API_URL = '/api/workflows';

export type Workflow = {
  id: number;
  owner: number;
  bot: number;
  name: string;
  created_at: string;
};
export type WorkflowWithNodes = Workflow & {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};
export type WorkflowNode = {
  id: number;
  workflow: number;
  node_type: string;
  name: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
};
export type WorkflowEdge = {
  id: number;
  workflow: number;
  source: number;
  target: number;
};
export type UpdateWorkflowInput = {
  id: string;
  data: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
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

  async getById(id: string) {
    const res = await fetch(`${API_URL}/${id}`);
    return this.handleResponse<Workflow>(res);
  }
  async getByIdWithNodes(id: string) {
    const res = await fetch(`${API_URL}/${id}`);
    return this.handleResponse<WorkflowWithNodes>(res);
  }
  async update({ id, data: { nodes, edges } }: UpdateWorkflowInput) {
    const fetchProps: RequestInit = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ edges, nodes }),
    };
    const res = await fetch(`${API_URL}/${id}`, fetchProps);
    return this.handleResponse<Workflow>(res);
  }
}

export const workflowApiClient = new WorkflowApiClient();
