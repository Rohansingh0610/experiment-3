import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkPermission, checkAnyPermission, checkAllPermissions, ROLE_PERMISSIONS } from '../config/permissions.js';

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = 'rbac_session_token';
const STORAGE_USER_KEY = 'rbac_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore & verify session on page load/refresh
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = sessionStorage.getItem(STORAGE_TOKEN_KEY);
      const storedUser = sessionStorage.getItem(STORAGE_USER_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // SECURITY: Do not blindly trust stored role in sessionStorage.
        // Verify with backend via authenticated endpoint.
        const res = await fetch('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Use verified user data from the server
          setUser(data.user);
          setSessionToken(storedToken);
          // Sync safe verified user back to storage
          sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
        } else {
          // Token is invalid, expired, or backend restarted
          sessionStorage.removeItem(STORAGE_TOKEN_KEY);
          sessionStorage.removeItem(STORAGE_USER_KEY);
          setUser(null);
          setSessionToken(null);
        }
      } catch (err) {
        console.warn('Backend verification failed, falling back to local session state:', err);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setSessionToken(storedToken);
          } catch {
            sessionStorage.removeItem(STORAGE_USER_KEY);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store server-issued session token and user info
      sessionStorage.setItem(STORAGE_TOKEN_KEY, data.token);
      sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));

      setSessionToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout and invalidate session on server
   */
  const logout = useCallback(async () => {
    if (sessionToken) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
      } catch (err) {
        console.error('Server logout error:', err);
      }
    }

    sessionStorage.removeItem(STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_USER_KEY);
    setSessionToken(null);
    setUser(null);
    setAuthError(null);
  }, [sessionToken]);

  /**
   * Check if the authenticated user has a specific role or matches one of allowed roles
   */
  const hasRole = useCallback(
    (...allowedRoles) => {
      if (!user || !user.role) return false;
      const flatRoles = allowedRoles.flat();
      return flatRoles.includes(user.role);
    },
    [user]
  );

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = useCallback(
    (permission) => {
      if (!user || !user.role) return false;
      return checkPermission(user.role, permission);
    },
    [user]
  );

  /**
   * Check if current user has any of the listed permissions
   */
  const hasAnyPermission = useCallback(
    (permissions = []) => {
      if (!user || !user.role) return false;
      return checkAnyPermission(user.role, permissions);
    },
    [user]
  );

  /**
   * Check if current user has all of the listed permissions
   */
  const hasAllPermissions = useCallback(
    (permissions = []) => {
      if (!user || !user.role) return false;
      return checkAllPermissions(user.role, permissions);
    },
    [user]
  );

  const value = {
    user,
    role: user?.role || null,
    sessionToken,
    isAuthenticated: !!user && !!sessionToken,
    isLoading,
    authError,
    login,
    logout,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.role ? ROLE_PERMISSIONS[user.role] || [] : [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
