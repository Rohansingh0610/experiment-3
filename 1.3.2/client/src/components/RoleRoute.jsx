import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Route guard that ensures the authenticated user possesses the required role or permission.
 * If unauthenticated -> redirects to /login.
 * If authenticated but lacks role/permission -> redirects to /unauthorized (403).
 */
export default function RoleRoute({ allowedRoles, requiredPermission, children }) {
  const { isAuthenticated, isLoading, role, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Checking authorization permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role requirement if specified
  let isAuthorized = true;
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!hasRole(roles)) {
      isAuthorized = false;
    }
  }

  // Check permission requirement if specified
  if (isAuthorized && requiredPermission) {
    if (Array.isArray(requiredPermission)) {
      isAuthorized = requiredPermission.every((p) => hasPermission(p));
    } else {
      isAuthorized = hasPermission(requiredPermission);
    }
  }

  if (!isAuthorized) {
    return (
      <Navigate
        to="/unauthorized"
        state={{
          requestedPath: location.pathname,
          currentRole: role,
          requiredRoles: allowedRoles,
          requiredPermission: requiredPermission,
        }}
        replace
      />
    );
  }

  return children;
}
