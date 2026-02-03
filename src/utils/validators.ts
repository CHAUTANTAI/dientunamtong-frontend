/**
 * Form Validators
 * Centralized validation rules for forms
 */

export const validateUsername = (username: string): string | undefined => {
  if (!username) {
    return 'Username is required';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 50) {
    return 'Username must not exceed 50 characters';
  }
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length > 128) {
    return 'Password must not exceed 128 characters';
  }
  return undefined;
};

export const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return undefined;
};
