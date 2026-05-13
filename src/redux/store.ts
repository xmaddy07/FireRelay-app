import type {AuthState, UserState, SessionState, SocketState} from './rootReducer';

export type AppState = {
  auth: AuthState;
  user: UserState;
  session: SessionState;
  socket: SocketState;
};

export const store = {} as AppState;

export type {AuthState, UserState, SessionState, SocketState} from './rootReducer';
