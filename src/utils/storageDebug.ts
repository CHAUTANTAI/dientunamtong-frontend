/**
 * Verbose per-image logs (opt-in). In development you also get a one-time summary
 * from `useStorageDevLog` in ClientLayout without setting this.
 *
 * Enable in `.env`:
 *   NEXT_PUBLIC_DEBUG_STORAGE=1
 *
 * In DevTools Console, filter by: `[storage]`
 */

function isEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_DEBUG_STORAGE;
  return v === '1' || v === 'true';
}

export function isStorageDebugEnabled(): boolean {
  return isEnabled();
}

/**
 * Log storage-related debug info (no-op unless NEXT_PUBLIC_DEBUG_STORAGE is set).
 */
export function storageDebug(
  scope: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (!isEnabled()) return;
  const prefix = `[storage:${scope}]`;
  if (data && Object.keys(data).length > 0) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}
