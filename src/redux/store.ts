import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';
import socketReducer from './slices/socketSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    socket: socketReducer,
    user: userReducer,
  },
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type {AuthState} from './slices/authSlice';
export type {SessionState} from './slices/sessionSlice';
export type {SocketState} from './slices/socketSlice';
export type {UserState} from './slices/userSlice';
