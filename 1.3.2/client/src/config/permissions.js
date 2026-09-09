/**
 * Centralized Permission Definitions & Role Mappings
 * Strictly synchronized with server/authorization.js
 */

export const ROLES = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_USERS: 'view_users',
  CREATE_CONTENT: 'create_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  VIEW_CONTENT: 'view_content',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CONTENT,
  ],
};

export const PERMISSION_LABELS = {
  [PERMISSIONS.VIEW_DASHBOARD]: 'View Dashboard',
  [PERMISSIONS.VIEW_USERS]: 'View Users Directory',
  [PERMISSIONS.CREATE_CONTENT]: 'Create Content',
  [PERMISSIONS.EDIT_CONTENT]: 'Edit Content',
  [PERMISSIONS.DELETE_CONTENT]: 'Delete Content',
  [PERMISSIONS.MANAGE_USERS]: 'Manage Users',
  [PERMISSIONS.VIEW_REPORTS]: 'View Reports & Analytics',
  [PERMISSIONS.VIEW_CONTENT]: 'View Published Content',
};

/**
 * Check if a role possesses a specific permission
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
export function checkPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role possesses any of the required permissions
 * @param {string} role
 * @param {string[]} permissions
 * @returns {boolean}
 */
export function checkAnyPermission(role, permissions = []) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return permissions.some((p) => ROLE_PERMISSIONS[role].includes(p));
}

/**
 * Check if a role possesses all of the required permissions
 * @param {string} role
 * @param {string[]} permissions
 * @returns {boolean}
 */
export function checkAllPermissions(role, permissions = []) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return permissions.every((p) => ROLE_PERMISSIONS[role].includes(p));
}
