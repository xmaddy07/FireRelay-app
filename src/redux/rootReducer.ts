export type AuthState = {
  token?: string;
  isAuthenticated: boolean;
};

export type UserState = {
  id?: string;
  name?: string;
  email?: string;
};

export type SessionState = {
  activeSessionId?: string;
  status: 'idle' | 'waiting' | 'active' | 'ended';
};

export type SocketState = {
  connected: boolean;
  lastEvent?: string;
};

export const rootReducer = {};
