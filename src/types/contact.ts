/**
 * Contact (table: contact)
 */

export interface Contact {
  id: string;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  message?: string | null;
  status?: string | null; // 'new', 'read', etc.
  created_at?: string;
  updated_at?: string;
}
