import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type AuthState = {
  token?: string;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  token: undefined,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = undefined;
      state.isAuthenticated = false;
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
