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

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

export type ChangeEmailRequest = {
  newEmail: string;
};

export type ConfirmEmailChangeRequest = {
  token: string;
};

export type UpdateProfileRequest = Record<string, unknown>;
