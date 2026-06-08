import type {NotificationPreferences} from './severity';

export type LoginDeviceInfo = {
  platform: 'ios' | 'android';
  deviceName: string;
  osVersion: string;
  appVersion: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  device?: LoginDeviceInfo;
};

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'user' | string;
  notificationPreferences?: NotificationPreferences;
  [key: string]: unknown;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken?: string;
  sessionId?: string;
  session_id?: string;
};

export type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeEmailRequest = {
  newEmail: string;
};

export type ConfirmEmailChangeRequest = {
  token: string;
};

export type UpdateProfileRequest = Record<string, unknown>;
