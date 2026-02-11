/**
 * Authentication Types
 * Synchronized with backend auth system
 */

/**
 * User roles from backend
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Backend login response structure
 * Response: { success: true, data: AuthResponseDto, statusCode: 200 }
 */
export interface AuthResponseDto {
  success: true;
  token: string;
  user: {
    id: string;
    username: string;
    company_name?: string | null;
    email?: string | null;
    role: UserRole;
  };
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  username: string;
  company_name?: string | null;
  email?: string | null;
  role: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
