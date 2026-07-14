import {combineReducers, configureStore} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import {storageKeys} from '../config/constants/storageKeys';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';
import feedReducer from './slices/feedSlice';
import audioCacheReducer from './slices/audioCacheSlice';
import messageReducer from './slices/messageSlice';

const persistConfig = {
  key: storageKeys.reduxPersistRoot,
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'theme'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  theme: themeReducer,
  feed: feedReducer,
  audioCache: audioCacheReducer,
  messages: messageReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type {AuthState} from './slices/authSlice';
export type {UserState} from './slices/userSlice';
export type {ThemeState} from './slices/themeSlice';
