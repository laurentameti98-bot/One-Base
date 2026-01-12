export interface Account {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  contacts?: Contact[];
}

export interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  account?: Account;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
