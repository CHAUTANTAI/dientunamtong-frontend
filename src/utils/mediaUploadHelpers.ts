import { uploadToPublicBucket } from '@/utils/objectStorage';
import type { PendingUpload, MediaValue } from '@/components/common/MediaUpload';

/**
 * Helper to process media values and upload pending files
 * Returns the final path (uploaded path or existing path)
 */
export async function processMediaValue(
  value: MediaValue,
  folder: string
): Promise<string | undefined> {
  if (!value) return undefined;

  // If it's already a path, return as-is
  if (typeof value === 'string') {
    return value;
  }

  // If it's a pending upload, upload now
  if (typeof value === 'object' && 'file' in value) {
    const pendingUpload = value as PendingUpload;
    const fileName = `${Date.now()}_${pendingUpload.file.name}`;
    
    const result = await uploadToPublicBucket(pendingUpload.file, folder, {
      fileName,
    });

    return result.path;
  }

  return undefined;
}

/**
 * Process an array of items with media_id fields
 * Returns new array with uploaded paths
 */
export async function processMediaArray<T extends { media_id: MediaValue }>(
  items: T[],
  folder: string
): Promise<Array<Omit<T, 'media_id'> & { media_id: string }>> {
  const processed = await Promise.all(
    items.map(async (item) => {
      const media_id = await processMediaValue(item.media_id, folder);
      return {
        ...item,
        media_id: media_id || '',
      };
    })
  );

  return processed;
}
