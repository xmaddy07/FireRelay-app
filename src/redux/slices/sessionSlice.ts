import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type SessionState = {
  activeSessionId?: string;
  status: 'idle' | 'waiting' | 'active' | 'ended';
};

const initialState: SessionState = {
  activeSessionId: undefined,
  status: 'idle',
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
      state.status = 'active';
    },
    endSession: (state) => {
      state.activeSessionId = undefined;
      state.status = 'ended';
    },
    setStatus: (state, action: PayloadAction<SessionState['status']>) => {
      state.status = action.payload;
    }
  },
});

export const sessionActions = sessionSlice.actions;
export default sessionSlice.reducer;
