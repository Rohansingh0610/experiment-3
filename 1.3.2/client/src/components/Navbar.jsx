import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from './RoleBadge.jsx';
import { PERMISSIONS } from '../config/permissions.js';

export default function Navbar() {
  const { isAuthenticated, user, role, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to={isAuthenticated ? '/dashboard' : '/login'} className="brand-link">
            <span className="brand-badge">EXP 1.3.2</span>
            <span className="brand-title">RBAC Security Gateway</span>
          </NavLink>
        </div>

        <nav className="navbar-links">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/content"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                Content
              </NavLink>

              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  isActive
                    ? 'nav-item active'
                    : hasPermission(PERMISSIONS.VIEW_REPORTS)
                    ? 'nav-item'
                    : 'nav-item restricted'
                }
                title={hasPermission(PERMISSIONS.VIEW_REPORTS) ? 'Reports' : 'Requires view_reports (403 for Viewer)'}
              >
                Reports {!hasPermission(PERMISSIONS.VIEW_REPORTS) && <span className="nav-lock">🔒</span>}
              </NavLink>

              <NavLink
                to="/users"
                className={({ isActive }) =>
                  isActive
                    ? 'nav-item active'
                    : hasPermission(PERMISSIONS.VIEW_USERS)
                    ? 'nav-item'
                    : 'nav-item restricted'
                }
                title={hasPermission(PERMISSIONS.VIEW_USERS) ? 'Users' : 'Requires Admin role (403 for Editor/Viewer)'}
              >
                Users {!hasPermission(PERMISSIONS.VIEW_USERS) && <span className="nav-lock">🔒</span>}
              </NavLink>

              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? 'nav-item active'
                    : role === 'Admin'
                    ? 'nav-item'
                    : 'nav-item restricted'
                }
                title={role === 'Admin' ? 'Admin Panel' : 'Admin Only (403 for Editor/Viewer)'}
              >
                Admin {!hasPermission(PERMISSIONS.MANAGE_USERS) && <span className="nav-lock">🔒</span>}
              </NavLink>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              Login
            </NavLink>
          )}
        </nav>

        <div className="navbar-auth">
          {isAuthenticated && user ? (
            <div className="user-profile-strip">
              <RoleBadge role={role} size="small" />
              <span className="user-email">{user.email}</span>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm logout-btn"
                title="Log out and invalidate session"
              >
                Logout
              </button>
            </div>
          ) : (
            <span className="unauth-indicator">Unauthenticated</span>
          )}
        </div>
      </div>
    </header>
  );
}
