export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'user' | string;
  [key: string]: unknown;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken?: string;
};

export type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};
