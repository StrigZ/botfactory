const API_URL = '/api/bots';

export type Bot = {
  id: string;
  owner_id: string;
  name: string;
  token: string;
  username: string;
  is_deployed: boolean;
  created_at: string;
};

export type CreateBotInput = {
  name: string;
  token: string;
};

export type UpdateBotInput = {
  id: string;
  data: {
    name?: string;
    token?: string;
  };
};

export type DeleteBotInput = {
  id: string;
};

export type DeployBotInput = {
  id: string;
};

export type PauseBotInput = {
  id: string;
};

class BotApiClient {
  // TODO: make separate api client class
  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const errorBody = (await res.json()) as { message: string };
      const message = errorBody.message;
      throw new Error(`${res.status}: ${message}`);
    }
    return res.json() as Promise<T>;
  }

  async getAll() {
    const res = await fetch(`${API_URL}`);
    return this.handleResponse<Bot[]>(res);
  }
  async getById(id: string) {
    const res = await fetch(`${API_URL}/${id}`);
    return this.handleResponse<Bot>(res);
  }
  async create({ name, token }: CreateBotInput) {
    const fetchProps: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, token }),
    };
    const res = await fetch(`${API_URL}`, fetchProps);
    return this.handleResponse<Bot>(res);
  }
  async update({ id, data: { token, name } }: UpdateBotInput) {
    const fetchProps: RequestInit = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, token }),
    };
    const res = await fetch(`${API_URL}/${id}`, fetchProps);
    return this.handleResponse<Bot>(res);
  }
  async delete({ id }: DeleteBotInput) {
    const fetchProps: RequestInit = {
      method: 'DELETE',
    };
    const res = await fetch(`${API_URL}/${id}`, fetchProps);
    return this.handleResponse<{ success: boolean }>(res);
  }
  async deploy({ id }: DeployBotInput) {
    const fetchProps: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    const res = await fetch(`${API_URL}/${id}/deploy`, fetchProps);
    return this.handleResponse<{ success: boolean }>(res);
  }
  async pause({ id }: PauseBotInput) {
    const fetchProps: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    const res = await fetch(`${API_URL}/${id}/pause`, fetchProps);
    return this.handleResponse<{ success: boolean }>(res);
  }
}

export const botApiClient = new BotApiClient();
