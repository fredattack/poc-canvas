import React, { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Input } from './UI/Input';
import { Button } from './UI/Button';
import { isValidEmail, isValidPassword } from '../api/auth';

/**
 * Header component with authentication form
 * Displays login form when not authenticated, user info when authenticated
 */
export const Header: React.FC = () => {
  const { isAuthenticated, user, login, logout, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('financer_super_admin.user@hexeko.com');
  const [password, setPassword] = useState('WxswriLs74ZZUx6p8Pvg!');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle login form submission
   */
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password);
      // Clear form on success
      setEmail('');
      setPassword('');
      setValidationErrors({});
    } catch (err) {
      // Error is handled by context
      console.error('Login failed:', err);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    setEmail('');
    setPassword('');
    setValidationErrors({});
  };

  /**
   * Handle input changes and clear validation errors
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (error) {
      clearError();
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (error) {
      clearError();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Chat Canvas App v2</h1>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4 flex-wrap">
            {isAuthenticated ? (
              // Authenticated state
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Logged in as:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  Logout
                </Button>
              </>
            ) : (
              // Login form
              <form
                onSubmit={handleLogin}
                className="flex items-center gap-3 flex-wrap"
                aria-label="Login form"
              >
                <div className="w-48">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading}
                    error={validationErrors.email}
                    aria-label="Email"
                    autoComplete="email"
                  />
                </div>
                <div className="w-40">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    error={validationErrors.password}
                    aria-label="Password"
                    autoComplete="current-password"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isLoading}
                  disabled={isLoading}
                  aria-label="Login"
                >
                  Login
                </Button>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Disconnected
                </span>
              </form>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                type="button"
                className="ml-3 flex-shrink-0 text-red-400 hover:text-red-500"
                onClick={clearError}
                aria-label="Dismiss error"
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
