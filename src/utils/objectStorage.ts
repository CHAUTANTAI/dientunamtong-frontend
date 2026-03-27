/**
 * Cloudflare R2 object storage (via backend API for writes; public URL for reads).
 */

import { getAuthToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const PUBLIC_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/+$/, '');

/**
 * When `storage_public_base_url` is missing from system-info and env has no R2 URL,
 * derive the same proxy base the backend uses: `{API origin}/api/public/storage`.
 */
export function getDefaultStoragePublicBaseFromApiUrl(): string {
  try {
    const u = new URL(API_BASE_URL);
    return `${u.origin}/api/public/storage`;
  } catch {
    return 'http://localhost:4000/api/public/storage';
  }
}

export interface StorageUploadResult {
  path: string;
  fullPath: string;
}

/** Legacy alias — single public bucket on R2 */
export const BUCKET_PUBLIC = 'public-content';
export const BUCKET_PRIVATE = 'content';

/**
 * Build absolute URL for a stored key using a known public base (R2 r2.dev or custom domain).
 * Prefer passing base from GET /public/system-info `storage_public_base_url` when env is empty.
 */
export function resolveStoragePublicUrl(imageUrl: string, baseUrl: string): string {
  if (!imageUrl) return '';

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  const base = (baseUrl || '').replace(/\/+$/, '');
  if (!base) {
    return '';
  }

  const path = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  return `${base}/${path}`;
}

/**
 * Public URL: env R2 URL, else proxy base from `NEXT_PUBLIC_API_URL` (same as backend fallback).
 */
export function getStoragePublicUrl(imageUrl: string): string {
  const base = PUBLIC_BASE || getDefaultStoragePublicBaseFromApiUrl();
  return resolveStoragePublicUrl(imageUrl, base);
}

/**
 * True if the value is safe to pass to next/image `src` (absolute http(s) or same-origin path).
 */
export function isValidNextImageSrc(src: string): boolean {
  if (!src?.trim()) return false;
  const s = src.trim();
  if (s.startsWith('/')) return true;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @deprecated Second argument ignored; use getStoragePublicUrl(imageUrl)
 */
export function getStoragePublicUrlLegacy(imageUrl: string): string {
  return getStoragePublicUrl(imageUrl);
}

/**
 * Signed URLs are not used for the public R2 bucket; private paths still resolve via public base.
 */
export async function getStorageSignedUrl(imageUrl: string): Promise<string> {
  return getStoragePublicUrl(imageUrl);
}

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export async function getStorageImageUrl(
  imageUrl: string,
  isPublic: boolean = true,
  expiresIn: number = 3600
): Promise<string> {
  if (!imageUrl) return '';

  if (isPublic) {
    return getStoragePublicUrl(imageUrl);
  }

  const cached = signedUrlCache.get(imageUrl);
  const now = Date.now();
  if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
    return cached.url;
  }

  const url = await getStorageSignedUrl(imageUrl);
  if (url) {
    signedUrlCache.set(imageUrl, {
      url,
      expiresAt: now + expiresIn * 1000,
    });
  }
  return url;
}

export async function uploadToPublicBucket(
  file: File,
  folder: string,
  options?: {
    fileName?: string;
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<StorageUploadResult> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required to upload');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (options?.fileName) {
    formData.append('fileName', options.fileName);
  }

  const res = await fetch(`${API_BASE_URL}/admin/storage/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = (await res.json()) as {
    success?: boolean;
    data?: { path: string; fullPath?: string };
    error?: string;
    message?: string;
  };

  if (!res.ok || !json.success || !json.data?.path) {
    throw new Error(json.error || json.message || `Upload failed (${res.status})`);
  }

  return {
    path: json.data.path,
    fullPath: json.data.fullPath ?? json.data.path,
  };
}

export async function uploadToPrivateBucket(
  file: File,
  folder: string,
  options?: {
    fileName?: string;
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<StorageUploadResult> {
  return uploadToPublicBucket(file, folder, options);
}

export async function deleteFromPublicBucket(path: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const q = new URLSearchParams({ key: cleanPath });

  const res = await fetch(`${API_BASE_URL}/admin/storage/object?${q}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = (await res.json()) as {
    success?: boolean;
    error?: string;
    message?: string;
  };

  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.message || `Delete failed (${res.status})`);
  }
}

export async function deleteFromPrivateBucket(path: string): Promise<void> {
  return deleteFromPublicBucket(path);
}
