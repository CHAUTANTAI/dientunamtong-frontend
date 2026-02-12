/**
 * API Constants
 * Central place for base URLs and common API paths
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Auth endpoints
export const API_AUTH_LOGIN = '/auth/login';
export const API_AUTH_LOGOUT = '/auth/logout';
export const API_AUTH_ME = '/auth/me';

// Category endpoints
export const API_CATEGORY = '/admin/category';
export const API_CATEGORY_DETAIL = (id: string) => `/admin/category/${id}`;

// Product endpoints
export const API_PRODUCTS = '/admin/product';
export const API_PRODUCT_DETAIL = (id: string) => `/admin/product/${id}`;
export const API_PRODUCT_IMAGES = (productId: string) =>
  `/admin/product/${productId}/images`;
export const API_PRODUCT_IMAGE = `/admin/product-image`;
export const API_PRODUCT_IMAGE_DELETE = (imageId: string) =>
  `/admin/product-image/${imageId}`;

// Profile endpoints
export const API_PROFILE = '/admin/profile';
export const API_PROFILE_UPDATE = '/admin/profile';

// Media endpoints
export const API_MEDIA = '/admin/media';
export const API_MEDIA_DETAIL = (id: string) => `/admin/media/${id}`;

// Category tree endpoints
export const API_CATEGORY_TREE = '/admin/category/tree';
export const API_CATEGORY_ROOTS = '/admin/category/roots';
export const API_CATEGORY_CHILDREN = (id: string) => `/admin/category/${id}/children`;
export const API_CATEGORY_BREADCRUMB = (id: string) => `/admin/category/${id}/breadcrumb`;
export const API_CATEGORY_SEARCH = '/admin/category/search';