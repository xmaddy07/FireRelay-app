import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type SocketState = {
  connected: boolean;
  lastEvent?: string;
};

const initialState: SocketState = {
  connected: false,
  lastEvent: undefined,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    connect: (state) => {
      state.connected = true;
    },
    disconnect: (state) => {
      state.connected = false;
    },
    setLastEvent: (state, action: PayloadAction<string>) => {
      state.lastEvent = action.payload;
    }
  },
});

export const socketActions = socketSlice.actions;
export default socketSlice.reducer;
