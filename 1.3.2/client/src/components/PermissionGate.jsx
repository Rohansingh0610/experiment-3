import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PermissionGate: Conditionally renders UI elements based on current user permissions/roles.
 *
 * NOTE: Frontend hiding is purely for user experience (UX) and clean visual hierarchy.
 * Backend APIs and event handlers independently enforce authorization!
 *
 * @param {string|string[]} permission - Required permission(s)
 * @param {string|string[]} roles - Optional role requirement
 * @param {boolean} requireAll - Require all listed permissions (default true)
 * @param {React.ReactNode} fallback - Element to show if not authorized (default null)
 * @param {React.ReactNode} children - Elements to render if authorized
 */
export default function PermissionGate({
  permission,
  roles,
  requireAll = true,
  fallback = null,
  children,
}) {
  const { hasRole, hasPermission, hasAllPermissions, hasAnyPermission } = useAuth();

  // If specific roles are specified
  if (roles) {
    const roleList = Array.isArray(roles) ? roles : [roles];
    if (!hasRole(roleList)) {
      return fallback;
    }
  }

  // If permissions are specified
  if (permission) {
    if (Array.isArray(permission)) {
      const isAllowed = requireAll
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission);
      if (!isAllowed) return fallback;
    } else {
      if (!hasPermission(permission)) {
        return fallback;
      }
    }
  }

  return <>{children}</>;
}
