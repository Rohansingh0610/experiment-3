import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from '../components/RoleBadge.jsx';

export default function Unauthorized() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, user } = useAuth();

  const state = location.state || {};
  const requestedPath = state.requestedPath || 'Protected Resource';
  const currentRole = state.currentRole || role || 'Unknown';
  const requiredRoles = state.requiredRoles
    ? Array.isArray(state.requiredRoles)
      ? state.requiredRoles.join(' or ')
      : state.requiredRoles
    : null;
  const requiredPermission = state.requiredPermission
    ? Array.isArray(state.requiredPermission)
      ? state.requiredPermission.join(', ')
      : state.requiredPermission
    : null;

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-badge-header">
          <span className="unauth-icon">🚫</span>
          <h1 className="error-code">403</h1>
          <h2 className="error-title">Access Denied (Forbidden)</h2>
        </div>

        <p className="unauthorized-desc">
          You are successfully <strong>authenticated</strong> as <strong>{user?.email || 'User'}</strong>,
          but your assigned role does not have the required permissions to view this resource.
        </p>

        <div className="rbac-denial-details">
          <div className="detail-row">
            <span className="detail-label">Requested Resource:</span>
            <code className="detail-value text-danger">{requestedPath}</code>
          </div>

          <div className="detail-row">
            <span className="detail-label">Your Current Role:</span>
            <div className="detail-value">
              <RoleBadge role={currentRole} size="medium" />
            </div>
          </div>

          {requiredRoles && (
            <div className="detail-row">
              <span className="detail-label">Required Role(s):</span>
              <span className="detail-value highlight-role">{requiredRoles}</span>
            </div>
          )}

          {requiredPermission && (
            <div className="detail-row">
              <span className="detail-label">Required Permission(s):</span>
              <code className="detail-value highlight-perm">{requiredPermission}</code>
            </div>
          )}
        </div>

        <div className="educational-note-box">
          <h4>💡 Educational Concept: 401 vs 403</h4>
          <ul>
            <li>
              <strong>401 Unauthorized:</strong> The client is <em>not authenticated</em> (missing,
              expired, or invalid session token).
            </li>
            <li>
              <strong>403 Forbidden:</strong> The client is <em>authenticated</em> (we know who you
              are), but your role lacks authorization to access this specific endpoint or page.
            </li>
          </ul>
        </div>

        <div className="unauthorized-actions">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            ← Return to Dashboard
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-outline"
          >
            Switch Account / Role
          </button>
        </div>
      </div>
    </div>
  );
}
