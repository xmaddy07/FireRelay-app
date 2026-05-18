import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type UserState = {
  id?: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
};

const initialState: UserState = {
  id: undefined,
  name: undefined,
  email: undefined,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
    },
    clearUser: (state) => {
      state.id = undefined;
      state.name = undefined;
      state.email = undefined;
      state.role = undefined;
    }
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
