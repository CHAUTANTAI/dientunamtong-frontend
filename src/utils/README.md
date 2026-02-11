# Utils Directory

Common utility functions used across the application.

## 📁 Files

### `error.ts` - Error Handling

Common utilities for handling API errors consistently.

**Main function:**
```typescript
getErrorMessage(error: unknown, fallbackMessage?: string): string
```

Extracts user-friendly error messages from various error types (RTK Query, Axios, generic errors).

**Usage:**
```typescript
import { getErrorMessage } from '@/utils/error';

try {
  await apiCall();
} catch (error) {
  message.error(getErrorMessage(error, 'Operation failed'));
}
```

**Helper functions:**
- `isApiError(error, statusCode?)` - Check if error is API error
- `isValidationError(error)` - Check for 400 errors
- `isAuthError(error)` - Check for 401 errors
- `isForbiddenError(error)` - Check for 403 errors
- `isNotFoundError(error)` - Check for 404 errors
- `getErrorStatusCode(error)` - Extract status code
- `formatErrorForLog(error)` - Format for console.error

---

### `slug.ts` - Slug Generation

Vietnamese-friendly URL slug generation utilities.

**Main function:**
```typescript
generateSlug(text: string): string
```

Converts Vietnamese text to URL-friendly slugs.

**Examples:**
```typescript
generateSlug('Điện Tử Máy Tính') // → 'dien-tu-may-tinh'
generateSlug('Laptop Gaming')     // → 'laptop-gaming'
```

**Helper functions:**
- `isValidSlug(slug)` - Validate slug format
- `ensureUniqueSlug(baseSlug, existingSlugs)` - Make slug unique
- `generateUniqueSlug(text, existingSlugs)` - Generate + ensure unique

---

### `supabase.ts` - Supabase Client

Supabase client and storage utilities.

**Functions:**
- `supabase` - Supabase client instance
- `getSupabaseSignedUrl(imageUrl, expiresIn)` - Get signed URL for private files
- `getSupabaseImageUrl(imageUrl, expiresIn)` - Get signed URL with caching

---

### `validators.ts` - Form Validation

Validation utilities for forms (to be expanded).

---

## 🎯 Best Practices

1. **Error Handling:**
   - Always use `getErrorMessage()` for user-facing errors
   - Use `formatErrorForLog()` for console.error
   - Check specific error types when needed

2. **Slug Generation:**
   - Use auto-generation with manual override option
   - Always validate slugs before submission
   - Let backend handle uniqueness check

3. **Supabase:**
   - Use signed URLs for private buckets
   - Cache URLs to avoid regeneration
   - Handle upload errors gracefully

---

## 📦 Adding New Utils

When adding new utilities:

1. Create descriptive file name (e.g., `date.ts`, `format.ts`)
2. Export named functions (avoid default exports)
3. Add JSDoc comments with examples
4. Update this README
5. Write unit tests (future)

---

**Last Updated:** February 2026

