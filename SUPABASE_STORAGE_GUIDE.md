# Supabase Storage Integration Guide

## 📦 Bucket Structure

### 1. **public-content** (Public Bucket) ✅ Recommended for media
- **Access**: Public URLs, no authentication required
- **Performance**: Fastest (no API calls for URL generation)
- **Caching**: CDN-friendly
- **Use cases**: Images, videos, public assets
- **Example**: Product images, banners, logos, thumbnails

### 2. **content** (Private Bucket) 🔒
- **Access**: Signed URLs with expiration
- **Performance**: Slower (requires API call + caching)
- **Security**: Access control, expiring URLs
- **Use cases**: Sensitive files, user-uploaded private documents
- **Example**: User documents, private media

---

## 🚀 Usage Examples

### Upload Functions

#### Upload to Public Bucket (Default)
```typescript
import { uploadToSupabase, uploadToPublicBucket } from '@/utils/supabase';

// Method 1: Default (uses public bucket)
const result = await uploadToSupabase(file, 'product');
// Returns: { path: 'product/123_image.jpg', fullPath: 'public-content/product/123_image.jpg' }

// Method 2: Explicit
const result = await uploadToPublicBucket(file, 'banner');
```

#### Upload to Private Bucket
```typescript
import { uploadToPrivateBucket } from '@/utils/supabase';

const result = await uploadToPrivateBucket(file, 'documents');
// Returns: { path: 'documents/123_doc.pdf', fullPath: 'content/documents/123_doc.pdf' }
```

#### Upload with Options
```typescript
const result = await uploadToPublicBucket(file, 'product', {
  fileName: 'custom-name.jpg',
  cacheControl: '3600',
  upsert: true, // Overwrite if exists
});
```

---

### Get URL Functions

#### Get Public URL (Synchronous, Fast)
```typescript
import { getSupabasePublicUrl } from '@/utils/supabase';

// Direct URL generation (no async)
const url = getSupabasePublicUrl('product/123_image.jpg');
// Returns: https://[project].supabase.co/storage/v1/object/public/public-content/product/123_image.jpg
```

#### Get Signed URL (Async, for private files)
```typescript
import { getSupabaseSignedUrl } from '@/utils/supabase';

// Generate signed URL with expiration
const url = await getSupabaseSignedUrl('documents/private.pdf', 3600); // 1 hour
// Returns: https://[project].supabase.co/storage/v1/object/sign/content/documents/private.pdf?token=...
```

#### Get URL with Auto-detection
```typescript
import { getSupabaseImageUrl } from '@/utils/supabase';

// Public bucket (fast)
const publicUrl = await getSupabaseImageUrl('product/image.jpg', true);

// Private bucket (signed URL with caching)
const signedUrl = await getSupabaseImageUrl('documents/file.pdf', false);
```

---

### React Hooks

#### useImageUrl Hook (Flexible)
```typescript
import { useImageUrl } from '@/hooks/useImageUrl';

function MyComponent() {
  // Public bucket (default, recommended for images)
  const imageUrl = useImageUrl(product.media?.file_url, true);
  
  // Private bucket
  const privateUrl = useImageUrl(user.avatar, false);
  
  return <img src={imageUrl} alt="Product" />;
}
```

#### usePublicImageUrl Hook (Synchronous)
```typescript
import { usePublicImageUrl } from '@/hooks/useImageUrl';

function FastImageComponent() {
  // No loading state, instant URL
  const imageUrl = usePublicImageUrl(product.image);
  
  return <img src={imageUrl} alt="Product" />;
}
```

#### Legacy Hook (Still works, defaults to private)
```typescript
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

function LegacyComponent() {
  // Uses private bucket with signed URLs
  const url = useSignedImageUrl(product.image);
  
  return <img src={url} alt="Product" />;
}
```

---

### Delete Functions

#### Delete from Public Bucket
```typescript
import { deleteFromSupabase, deleteFromPublicBucket } from '@/utils/supabase';

// Method 1: Default (public bucket)
await deleteFromSupabase('product/123_image.jpg');

// Method 2: Explicit
await deleteFromPublicBucket('banner/old.jpg');
```

#### Delete from Private Bucket
```typescript
import { deleteFromPrivateBucket } from '@/utils/supabase';

await deleteFromPrivateBucket('documents/old_doc.pdf');
```

---

## 🎯 Best Practices

### ✅ DO
- Use **public bucket** for all public media (images, videos, banners)
- Use **private bucket** only for sensitive files
- Use `usePublicImageUrl` hook for better performance (no loading state)
- Upload to `public-content` by default
- Cache signed URLs (already implemented)

### ❌ DON'T
- Don't use signed URLs for public images (unnecessary overhead)
- Don't store sensitive files in public bucket
- Don't generate signed URLs on every render (use hooks)
- Don't hardcode bucket names (use constants)

---

## 📊 Performance Comparison

| Feature | Public Bucket | Private Bucket |
|---------|--------------|----------------|
| URL Generation | Instant (synchronous) | ~100-300ms (API call) |
| Caching | Browser + CDN | Custom cache (5min refresh) |
| API Calls | 0 | 1 per unique URL |
| Expiration | Never | 1 hour (configurable) |
| Best for | Images, videos, public assets | Documents, private files |

---

## 🔄 Migration Guide

### From Private to Public Bucket

1. **Upload new files to public bucket**:
```typescript
// Old (private)
await uploadToSupabase(file, 'product', { bucketName: 'content' });

// New (public)
await uploadToPublicBucket(file, 'product');
```

2. **Update components to use public URL**:
```typescript
// Old
const url = useSignedImageUrl(imageUrl);

// New
const url = usePublicImageUrl(imageUrl);
```

3. **Migrate existing files** (optional):
   - Download from private bucket
   - Re-upload to public bucket
   - Update database paths
   - Delete from private bucket

---

## 🛠️ Constants

```typescript
import { BUCKET_PUBLIC, BUCKET_PRIVATE } from '@/utils/supabase';

console.log(BUCKET_PUBLIC);  // 'public-content'
console.log(BUCKET_PRIVATE); // 'content'
```

---

## 📝 Summary

**For new implementations:**
- Default to **public bucket** for media files
- Use `uploadToPublicBucket()` for uploads
- Use `usePublicImageUrl()` for displaying images
- Only use private bucket when security is required
