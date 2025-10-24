import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin } from '../api/auth';
import { getStoredToken, setStoredToken, removeStoredToken } from '../api/axios';
import type { User } from '../types';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider component that manages authentication state
 * Handles login, logout, token persistence, and user session
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you might validate the token or fetch user data here
      // For now, we'll just set a basic user state
      setUser({
        id: 'stored_user',
        email: 'user@example.com', // This should come from token or API
      });
    }
  }, []);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiLogin(email, password);

      // Store token in memory and localStorage
      setToken(response.token);
      setUser(response.user);
      setStoredToken(response.token);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user and clear all auth data
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    removeStoredToken();
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
