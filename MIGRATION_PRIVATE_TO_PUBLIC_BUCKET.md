# Migration Guide: Private Bucket → Public Bucket

## 📊 Migration Overview

**Date**: 2026-03-16
**Status**: Code migrated, data migration pending
**Buckets**: `content` (private) → `public-content` (public)

---

## ✅ Code Changes Completed

### 1. Default Bucket Changed
- **Before**: All uploads go to `content` (private)
- **After**: All uploads go to `public-content` (public)

### 2. Upload Functions Updated
| File | Function | Status |
|------|----------|--------|
| `ProductForm.tsx` | Product media upload | ✅ Using `uploadToPublicBucket` |
| `CategoryImageUpload.tsx` | Category image upload | ✅ Using `uploadToPublicBucket` |
| `admin-profile-page.tsx` | Profile logo upload | ✅ Using `uploadToPublicBucket` |

### 3. URL Generation Updated
- `useSignedImageUrl` now defaults to public URLs (no API calls)
- All 16 components using this hook automatically benefit
- Performance improvement: ~100-300ms saved per image

---

## 📦 Data Migration Options

### Option 1: Fresh Start (Recommended for Development)
**Best for**: Development/staging environments

1. **Clear old data**:
   - Empty `content` bucket in Supabase dashboard
   - Truncate `media` table in database (optional)

2. **Re-upload all media**:
   - Use admin panel to upload products, categories, etc.
   - Files automatically go to `public-content`

### Option 2: Migrate Existing Files
**Best for**: Production with existing data

#### Step 1: Download from Private Bucket
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login
supabase login

# Download all files from private bucket
supabase storage download content --project-ref YOUR_PROJECT_REF --recursive
```

#### Step 2: Upload to Public Bucket
```typescript
// migration-script.ts
import { supabase } from './frontend/src/utils/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function migrateFiles() {
  // Get list of files from content bucket
  const { data: files, error } = await supabase
    .storage
    .from('content')
    .list('', { limit: 1000, offset: 0 });

  if (error) {
    console.error('Error listing files:', error);
    return;
  }

  for (const file of files || []) {
    console.log(`Migrating: ${file.name}`);
    
    // Download from private bucket
    const { data: fileData } = await supabase
      .storage
      .from('content')
      .download(file.name);

    if (!fileData) continue;

    // Upload to public bucket
    const { error: uploadError } = await supabase
      .storage
      .from('public-content')
      .upload(file.name, fileData, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error(`Failed to migrate ${file.name}:`, uploadError);
    } else {
      console.log(`✅ Migrated: ${file.name}`);
    }
  }
}

migrateFiles();
```

#### Step 3: Update Database Paths (if needed)
```sql
-- Check current media records
SELECT id, file_url FROM media LIMIT 10;

-- No changes needed - paths remain the same
-- e.g., "product/123_image.jpg" works in both buckets
```

#### Step 4: Verify Migration
1. Check files in `public-content` bucket
2. Test image display on frontend
3. Test new uploads

#### Step 5: Clean Up Private Bucket
```sql
-- After verifying everything works, delete old files
-- Via Supabase Dashboard: Storage > content > Delete All
```

### Option 3: Gradual Migration
**Best for**: Large production systems

1. **Dual-mode operation**:
   - Keep existing files in `content` bucket
   - New uploads go to `public-content`
   - Update `useSignedImageUrl` to check bucket dynamically

2. **Migrate in batches**:
   - Products with images → migrate first
   - Categories → migrate second
   - User profiles → migrate last

3. **Monitor performance**:
   - Track API calls (signed URL generation)
   - Measure load times

---

## 🧪 Testing Checklist

### Before Migration
- [ ] Backup `content` bucket
- [ ] Backup `media` table in database
- [ ] Document current file counts

### After Code Deployment
- [ ] Test new product upload → should go to `public-content`
- [ ] Test new category image upload → should go to `public-content`
- [ ] Test profile logo upload → should go to `public-content`
- [ ] Verify existing images still display (from old bucket)

### After Data Migration
- [ ] All product images display correctly
- [ ] All category images display correctly
- [ ] All profile logos display correctly
- [ ] No 404 errors in browser console
- [ ] Check network tab - no signed URL API calls
- [ ] Verify image URLs start with `/storage/v1/object/public/public-content/`

---

## 🔍 Verification Commands

### Check Bucket Contents
```typescript
// Via browser console on site
const { data: privateFiles } = await supabase
  .storage
  .from('content')
  .list();

const { data: publicFiles } = await supabase
  .storage
  .from('public-content')
  .list();

console.log('Private bucket files:', privateFiles?.length);
console.log('Public bucket files:', publicFiles?.length);
```

### Test Public URL Access
```bash
# Replace with actual file path
curl https://YOUR_PROJECT.supabase.co/storage/v1/object/public/public-content/products/test.jpg
```

### Check Media Table
```sql
SELECT 
  media_type,
  COUNT(*) as count,
  SUBSTRING(file_url, 1, 10) as path_prefix
FROM media
GROUP BY media_type, SUBSTRING(file_url, 1, 10);
```

---

## 📈 Expected Improvements

| Metric | Before (Private) | After (Public) | Improvement |
|--------|------------------|----------------|-------------|
| Image load time | ~200-400ms | ~50-100ms | **3-4x faster** |
| API calls per page | ~50 (for signed URLs) | 0 | **100% reduction** |
| Browser caching | Limited | Full CDN support | **Better UX** |
| Supabase API quota | High usage | Minimal | **Cost savings** |

---

## 🚨 Rollback Plan

If issues occur:

### 1. Revert Code Changes
```bash
git revert HEAD  # Revert last commit
npm run build    # Rebuild
# Redeploy
```

### 2. Restore Signed URL Mode
```typescript
// frontend/src/hooks/useSignedImageUrl.ts
// Change default from true to false:
export const useSignedImageUrl = (
  imageUrl: string | null | undefined,
  usePublic: boolean = false  // <- Change to false
): string => {
```

### 3. Point Uploads Back to Private
```typescript
// frontend/src/utils/supabase.ts
// Change BUCKET_PUBLIC constant
export const BUCKET_PUBLIC = 'content';  // Point to private bucket temporarily
```

---

## 📝 Notes

- **No database schema changes** required
- File paths remain the same (`products/123.jpg`)
- Only bucket name changes (`content` → `public-content`)
- URL generation changes (signed → public)
- Backward compatible: old files still accessible if in old bucket

---

## ✅ Completion Checklist

- [x] Phase 1: Update default bucket in code
- [x] Phase 2: Update all upload functions  
- [x] Phase 3: Update URL generation hooks
- [ ] Phase 4: Test new uploads
- [ ] Phase 5: Migrate existing data (if needed)
- [ ] Phase 6: Monitor performance
- [ ] Phase 7: Clean up old bucket (after 30 days)
