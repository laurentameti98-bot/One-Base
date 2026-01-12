const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  accounts: {
    list: (page = 1, pageSize = 20) =>
      request(`/accounts?page=${page}&pageSize=${pageSize}`),
    get: (id: string) => request(`/accounts/${id}`),
    create: (data: any) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/accounts/${id}`, { method: 'DELETE' }),
  },
  contacts: {
    list: (page = 1, pageSize = 20) =>
      request(`/contacts?page=${page}&pageSize=${pageSize}`),
    get: (id: string) => request(`/contacts/${id}`),
    create: (data: any) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/contacts/${id}`, { method: 'DELETE' }),
  },
};
