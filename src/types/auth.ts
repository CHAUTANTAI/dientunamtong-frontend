/**
 * Authentication Types
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  user?: AuthUser;
  success?: number;
}

export interface AuthUser {
  id: string;
  username: string;
  company_name?: string;
  email?: string;
  logo?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
