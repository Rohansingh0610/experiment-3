import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from '../components/RoleBadge.jsx';

export default function AdminPanel() {
  const { sessionToken, role } = useAuth();
  const [systemData, setSystemData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/admin/system', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setSystemData(data);
        } else {
          setError({
            status: res.status,
            message: data.message || 'Access Denied',
          });
        }
      } catch (err) {
        setError({
          status: 'Error',
          message: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemStatus();
  }, [sessionToken]);

  return (
    <div className="admin-panel-container">
      <div className="page-header-row">
        <div>
          <h2>Master Admin Control Panel</h2>
          <p className="page-sub">
            High-privilege route restricted strictly to <strong>Admin</strong> users.
          </p>
        </div>
        <div className="header-badge-box">
          <RoleBadge role={role} size="medium" />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading master administration controls...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <span className="alert-icon">🚫</span>
          <div>
            <strong>Access Blocked (HTTP {error.status}):</strong> {error.message}
          </div>
        </div>
      ) : (
        <div className="admin-content">
          <div className="admin-overview-grid">
            <div className="admin-stat-card">
              <span className="admin-stat-label">RBAC Engine Status</span>
              <span className="admin-stat-val text-success">Active &amp; Enforced</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Active In-Memory Sessions</span>
              <span className="admin-stat-val text-primary">{systemData?.activeSessionsCount || 1}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Security Architecture</span>
              <span className="admin-stat-val">Server-Side Map</span>
            </div>
          </div>

          <div className="card-box mt-4">
            <div className="card-box-header">
              <h3>Backend Authorization Middleware Specifications</h3>
              <span className="badge badge-success">Verified</span>
            </div>
            <div className="specs-list">
              <div className="spec-item">
                <strong>1. authenticateSession:</strong> Extracts Bearer token, checks server-side session Map. Rejects missing or fake tokens with <code>401 Unauthorized</code>.
              </div>
              <div className="spec-item">
                <strong>2. authorizeRoles('Admin'):</strong> Verifies <code>req.user.role === 'Admin'</code> from the trusted session. Blocks others with <code>403 Forbidden</code>.
              </div>
              <div className="spec-item">
                <strong>3. Anti-Spoofing:</strong> Even if a client modifies its local role or injects headers, the server looks up the role from the cryptographically random session token.
              </div>
            </div>
          </div>

          <div className="card-box mt-4">
            <div className="card-box-header">
              <h3>System Security Information</h3>
              <span className="badge badge-info">Internal Mock Store</span>
            </div>
            <pre className="admin-system-json">
              {JSON.stringify(systemData?.system || systemData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
