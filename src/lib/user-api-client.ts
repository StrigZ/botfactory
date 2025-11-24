'use client';

import type { User } from '~/context/AuthContext';

import { getApiUrl } from './utils';

const ENDPOINT = '/api/auth';

export type LoginWithGoogleInput = {
  credentials: string;
};
export type UpdateUserInput = { id: string; data: Partial<User> };

class UserApiClient {
  // TODO: make separate api client class
  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const errorBody = (await res.json()) as { message: string };
      const message = errorBody.message;
      throw new Error(`${res.status}: ${message}`);
    }
    return res.json() as Promise<T>;
  }

  async getMe() {
    const res = await fetch(getApiUrl(`${ENDPOINT}/me`));
    return this.handleResponse<User>(res);
  }
  async loginWithGoogle(credential: LoginWithGoogleInput) {
    const fetchProps: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credential),
    };
    const res = await fetch(getApiUrl(`${ENDPOINT}/login`), fetchProps);
    return this.handleResponse<User>(res);
  }
  async update({ id, data }: UpdateUserInput) {
    const fetchProps: RequestInit = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
    const res = await fetch(getApiUrl(`${ENDPOINT}/users/${id}`), fetchProps);
    return this.handleResponse<User>(res);
  }
  async logout() {
    const fetchProps: RequestInit = {
      method: 'POST',
    };
    const res = await fetch(getApiUrl(`${ENDPOINT}/logout`), fetchProps);
    return this.handleResponse(res);
  }
}

export const userApiClient = new UserApiClient();
