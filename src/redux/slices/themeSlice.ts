import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {ThemeMode} from '../../config/theme/types';

export type ThemeState = {
  mode: ThemeMode;
};

const initialState: ThemeState = {
  mode: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    },
    toggleMode: state => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
  },
});

export const themeActions = themeSlice.actions;
export default themeSlice.reducer;
