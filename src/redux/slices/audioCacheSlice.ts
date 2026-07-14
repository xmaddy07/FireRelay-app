import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

export type AudioCacheStatus = 'idle' | 'loading' | 'ready' | 'error';

export type AudioCacheEntry = {
  status: AudioCacheStatus;
  durationSec?: number;
  error?: string;
};

export type AudioCacheState = {
  byId: Record<string, AudioCacheEntry>;
};

const initialState: AudioCacheState = {
  byId: {},
};

const audioCacheSlice = createSlice({
  name: 'audioCache',
  initialState,
  reducers: {
    setAudioLoading(state, action: PayloadAction<string>) {
      state.byId[action.payload] = {status: 'loading'};
    },
    setAudioReady(
      state,
      action: PayloadAction<{id: string; durationSec: number}>,
    ) {
      state.byId[action.payload.id] = {
        status: 'ready',
        durationSec: action.payload.durationSec,
      };
    },
    setAudioError(
      state,
      action: PayloadAction<{id: string; error: string}>,
    ) {
      state.byId[action.payload.id] = {
        status: 'error',
        error: action.payload.error,
      };
    },
    clearAudioCacheEntry(state, action: PayloadAction<string>) {
      delete state.byId[action.payload];
    },
    clearAudioCache(state) {
      state.byId = {};
    },
  },
});

export const {
  setAudioLoading,
  setAudioReady,
  setAudioError,
  clearAudioCacheEntry,
  clearAudioCache,
} = audioCacheSlice.actions;

export default audioCacheSlice.reducer;
