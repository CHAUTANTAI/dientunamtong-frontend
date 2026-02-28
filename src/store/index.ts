/**
 * Redux Store Configuration
 * Central store setup with all slices and APIs
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { authApi } from './api/authApi';
import { productApi } from './api/productApi';
import { categoryApi } from './api/categoryApi';
import { profileApi } from './api/profileApi';
import { mediaApi } from './api/mediaApi';
import { bannerApi } from './api/bannerApi';
import { contactApi as adminContactApi } from './api/contactApi';
import { publicBannerApi } from './services/publicBannerApi';
import { publicCategoryApi } from './services/publicCategoryApi';
import { publicProductApi } from './services/publicProductApi';
import { publicSystemInfoApi } from './services/publicSystemInfoApi';
import { contactApi } from './services/contactApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [bannerApi.reducerPath]: bannerApi.reducer,
    [adminContactApi.reducerPath]: adminContactApi.reducer,
    [publicBannerApi.reducerPath]: publicBannerApi.reducer,
    [publicCategoryApi.reducerPath]: publicCategoryApi.reducer,
    [publicProductApi.reducerPath]: publicProductApi.reducer,
    [publicSystemInfoApi.reducerPath]: publicSystemInfoApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(productApi.middleware)
      .concat(categoryApi.middleware)
      .concat(profileApi.middleware)
      .concat(mediaApi.middleware)
      .concat(bannerApi.middleware)
      .concat(adminContactApi.middleware)
      .concat(publicBannerApi.middleware)
      .concat(publicCategoryApi.middleware)
      .concat(publicProductApi.middleware)
      .concat(publicSystemInfoApi.middleware)
      .concat(contactApi.middleware),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks for usage in components
// Note: Client-only hooks are exported from src/store/hooks.ts to avoid importing
// react-redux hooks into server components.
