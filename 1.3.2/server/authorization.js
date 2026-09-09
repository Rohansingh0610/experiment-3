/**
 * Centralized Role-Based Access Control (RBAC) Configuration & Middlewares
 *
 * Roles:
 * 1. Admin   - Full system access (create, edit, delete, users, reports, admin panel)
 * 2. Editor  - Content and reporting access (cannot delete content, cannot manage users)
 * 3. Viewer  - Read-only access (view dashboard, view content)
 */

export const ROLE_PERMISSIONS = {
  Admin: [
    'view_dashboard',
    'view_users',
    'create_content',
    'edit_content',
    'delete_content',
    'manage_users',
    'view_reports',
  ],
  Editor: [
    'view_dashboard',
    'create_content',
    'edit_content',
    'view_reports',
  ],
  Viewer: [
    'view_dashboard',
    'view_content',
  ],
};

/**
 * In-Memory Server-Side Session Map: Map<sessionToken, user>
 *
 * CRITICAL SECURITY PRINCIPLE:
 * The user's role is stored HERE on the server upon valid login.
 * The server never trusts arbitrary role values provided in request bodies or query params.
 */
export const sessions = new Map();

/**
 * Authentication Middleware: authenticateSession
 * Verifies that the request carries a valid session token issued by this server.
 * Attaches the trusted, server-stored user object to `req.user`.
 * Rejects missing or invalid sessions with HTTP 401 Unauthorized.
 */
export function authenticateSession(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Authorization header is missing.',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid Authorization header format. Expected: Bearer <sessionToken>',
    });
  }

  const token = parts[1];
  const user = sessions.get(token);

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired session. Please log in again.',
    });
  }

  // Attach server-verified user identity
  req.user = user;
  req.sessionToken = token;
  next();
}

/**
 * Role Authorization Middleware: authorizeRoles
 * Checks if the authenticated user's role is in the list of allowed roles.
 * Rejects unauthorized users with HTTP 403 Forbidden.
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication could not be verified.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
      });
    }

    next();
  };
}

/**
 * Permission Authorization Middleware: authorizePermissions
 * Checks if the authenticated user possesses all required permissions defined in ROLE_PERMISSIONS.
 * Rejects unauthorized users with HTTP 403 Forbidden.
 */
export function authorizePermissions(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication could not be verified.',
      });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const missingPermissions = requiredPermissions.filter(
      (perm) => !userPermissions.includes(perm)
    );

    if (missingPermissions.length > 0) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Role '${req.user.role}' lacks permission: ${missingPermissions.join(', ')}`,
        missingPermissions,
        currentRole: req.user.role,
      });
    }

    next();
  };
}
