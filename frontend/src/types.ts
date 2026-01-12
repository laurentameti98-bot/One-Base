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
  deals?: Deal[];
  activities?: Activity[];
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
  activities?: Activity[];
}

export interface Deal {
  id: string;
  accountId: string;
  name: string;
  stage: string;
  amount?: number | null;
  closeDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  account?: Account;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  subject: string;
  body?: string | null;
  status?: string | null;
  dueDate?: string | null;
  accountId?: string | null;
  contactId?: string | null;
  dealId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  account?: Account | null;
  contact?: Contact | null;
  deal?: Deal | null;
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
