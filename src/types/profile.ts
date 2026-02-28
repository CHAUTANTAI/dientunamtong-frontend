/**
 * Profile (table: profile)
 */

export interface Profile {
  id: string;
  company_name: string;
  phone?: string | null;
  address?: string | null;
  email?: string | null;
  username: string;
  // password stored in DB, but exclude from most responses
  password?: string;
  is_active?: boolean;
  logo?: string | null;
  about_us?: string | null;
  map_latitude?: number | null;
  map_longitude?: number | null;
  created_at?: string;
  updated_at?: string;
}
