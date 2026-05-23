import {createSlice} from '@reduxjs/toolkit';

type MessageState = {
  threads: unknown[];
};

const initialState: MessageState = {
  threads: [],
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {},
});

export default messageSlice.reducer;
