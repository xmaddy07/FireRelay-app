import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type AuthState = {
  token?: string;
  sessionId?: string;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  token: undefined,
  sessionId: undefined,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{token: string; sessionId?: string}>,
    ) => {
      state.token = action.payload.token;
      state.sessionId = action.payload.sessionId;
      state.isAuthenticated = true;
    },
    loginWithSession: (state, action: PayloadAction<{sessionId?: string}>) => {
      state.token = undefined;
      state.sessionId = action.payload.sessionId;
      state.isAuthenticated = true;
    },
    logout: state => {
      state.token = undefined;
      state.sessionId = undefined;
      state.isAuthenticated = false;
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
