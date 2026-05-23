import {createSlice} from '@reduxjs/toolkit';

type FeedState = {
  items: unknown[];
};

const initialState: FeedState = {
  items: [],
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
});

export default feedSlice.reducer;
