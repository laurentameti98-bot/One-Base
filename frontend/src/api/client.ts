const API_BASE = '/api';

export interface ApiError {
  error: string;
  details?: Array<{ path: string; message: string }>;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public details: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

function buildQueryParams(
  base: { page: number; pageSize: number },
  filters: Record<string, string | undefined>
): string {
  const params = new URLSearchParams({
    page: base.page.toString(),
    pageSize: base.pageSize.toString(),
  });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });
  return params.toString();
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' })) as ApiError;
    if (error.details && error.details.length > 0) {
      throw new ValidationError(error.error, error.details);
    }
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  accounts: {
    list: (page = 1, pageSize = 20, search?: string) => {
      const queryString = buildQueryParams({ page, pageSize }, { q: search });
      return request(`/accounts?${queryString}`);
    },
    get: (id: string) => request(`/accounts/${id}`),
    create: (data: any) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/accounts/${id}`, { method: 'DELETE' }),
  },
  contacts: {
    list: (page = 1, pageSize = 20, search?: string, accountId?: string) => {
      const queryString = buildQueryParams({ page, pageSize }, { q: search, accountId });
      return request(`/contacts?${queryString}`);
    },
    get: (id: string) => request(`/contacts/${id}`),
    create: (data: any) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/contacts/${id}`, { method: 'DELETE' }),
  },
  deals: {
    list: (page = 1, pageSize = 20, search?: string, accountId?: string, stage?: string) => {
      const queryString = buildQueryParams({ page, pageSize }, { q: search, accountId, stage });
      return request(`/deals?${queryString}`);
    },
    get: (id: string) => request(`/deals/${id}`),
    create: (data: any) => request('/deals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/deals/${id}`, { method: 'DELETE' }),
  },
  activities: {
    list: (page = 1, pageSize = 20, search?: string, accountId?: string, contactId?: string, dealId?: string, type?: string) => {
      const queryString = buildQueryParams({ page, pageSize }, { q: search, accountId, contactId, dealId, type });
      return request(`/activities?${queryString}`);
    },
    get: (id: string) => request(`/activities/${id}`),
    create: (data: any) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/activities/${id}`, { method: 'DELETE' }),
  },
};
