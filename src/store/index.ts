/**
 * Redux Store Configuration
 * Central store setup with all slices and APIs
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { authApi } from './api/authApi';
import { productApi } from './api/productApi';
import { categoryApi } from './api/categoryApi';
import { contactApi } from './api/contactApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(productApi.middleware)
      .concat(categoryApi.middleware)
      .concat(contactApi.middleware),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks for usage in components
// Note: Client-only hooks are exported from src/store/hooks.ts to avoid importing
// react-redux hooks into server components.
