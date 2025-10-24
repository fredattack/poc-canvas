import { apiClient } from './axios';
import type { LoginRequest, LoginResponse } from '../types';

/**
 * Authenticate user with email and password
 * @param email - User email address
 * @param password - User password
 * @returns Promise with login response containing token and user data
 * @throws AxiosError with error response data
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const payload: LoginRequest = {
    email,
    password,
  };

  const response = await apiClient.post<LoginResponse>('/login', payload);
  return response.data;
};

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password (minimum requirements)
 * @param password - Password to validate
 * @returns True if password meets minimum requirements
 */
export const isValidPassword = (password: string): boolean => {
  // Minimum 6 characters for demo purposes
  return password.length >= 6;
};
