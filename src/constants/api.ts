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

// Contact endpoints
export const API_CONTACTS = '/admin/contact';
export const API_CONTACT_DETAIL = (id: string) => `/admin/contact/${id}`;

