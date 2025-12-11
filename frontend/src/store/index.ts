import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createNoopStorage } from './noopStorage';

import chatReducer from './slices/chatSlice';
import emotionReducer from './slices/emotionSlice';
import memoryReducer from './slices/memorySlice';
import reflectionReducer from './slices/reflectionSlice';
import uiReducer from './slices/uiSlice';

// Create a storage that works in any environment
const createSafeStorage = () => {
  // Check if window is defined (client-side)
  if (typeof window !== 'undefined') {
    return storage;
  }
  // Return a no-op storage for server-side rendering
  return createNoopStorage();
};

// Configure persisted reducers
const persistConfig = {
  key: 'Aura-state',
  storage: createSafeStorage(),
  whitelist: ['chat', 'ui'], // Only persist chat and ui state
  blacklist: ['emotion', 'memory', 'reflection'], // Don't persist these states as they're fetched from backend
};

const rootReducer = combineReducers({
  chat: chatReducer,
  emotion: emotionReducer,
  memory: memoryReducer,
  reflection: reflectionReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore these fields from the state when checking serializability
        ignoredPaths: ['chat.streamingResponse'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 