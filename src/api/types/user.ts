export type ApiUser = {
  id: string;
  email?: string;
  role?: string;
  createdAt?: string;
  created_at?: string;
  counties?: unknown;
  [key: string]: unknown;
};

export type ApiCounty = {
  id: string;
  name?: string;
  code?: string;
  state?: string;
  established?: string;
  est?: string;
  [key: string]: unknown;
};

export type UserSearchParams = {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  email?: string;
  role?: string;
};

export type CreateUserPayload = {
  email: string;
  role?: string;
  password?: string;
};

export type UpdateUserPayload = {
  email?: string;
  role?: string;
  password?: string;
};

export type AssignCountiesPayload = {
  countyIds: string[];
};
