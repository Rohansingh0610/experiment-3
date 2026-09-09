import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import PermissionGate from '../components/PermissionGate.jsx';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../config/permissions.js';

export default function Users() {
  const { sessionToken, role } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/users', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUsersList(data.users || []);
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

    fetchUsers();
  }, [sessionToken]);

  const handleSimulateAction = (userName, actionName) => {
    setNotification({
      type: 'info',
      message: `Admin Action Executed: "${actionName}" on user "${userName}".`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="users-page-container">
      <div className="page-header-row">
        <div>
          <h2>User Administration Directory</h2>
          <p className="page-sub">
            Restricted resource requiring the <strong>Admin</strong> role (<code>view_users</code> and <code>manage_users</code> permissions).
          </p>
        </div>
        <div className="header-badge-box">
          <RoleBadge role={role} size="medium" />
        </div>
      </div>

      {notification && (
        <div className="alert alert-info">
          <span className="alert-icon">ℹ️</span>
          <span>{notification.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading user database securely...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <span className="alert-icon">🚫</span>
          <div>
            <strong>Access Denied (HTTP {error.status}):</strong> {error.message}
          </div>
        </div>
      ) : (
        <div className="users-content">
          <div className="card-box">
            <div className="card-box-header">
              <h3>Registered User Accounts ({usersList.length})</h3>
              <span className="badge badge-primary">Admin Access Verified</span>
            </div>

            <table className="rbac-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Granted Permissions</th>
                  <th>Account Status</th>
                  <th>Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => {
                  const permCount = ROLE_PERMISSIONS[u.role]?.length || 0;
                  return (
                    <tr key={u.id}>
                      <td><code>#{u.id}</code></td>
                      <td><strong>{u.email}</strong></td>
                      <td>
                        <RoleBadge role={u.role} size="small" />
                      </td>
                      <td>
                        <span className="badge badge-secondary">{permCount} permissions</span>
                      </td>
                      <td>
                        <span className="tag-granted">Active</span>
                      </td>
                      <td>
                        <PermissionGate
                          permission={PERMISSIONS.MANAGE_USERS}
                          fallback={<span className="text-muted">No Permissions</span>}
                        >
                          <div className="user-action-buttons">
                            <button
                              onClick={() => handleSimulateAction(u.email, 'Edit Permissions')}
                              className="btn btn-sm btn-outline"
                            >
                              Edit Role
                            </button>
                            <button
                              onClick={() => handleSimulateAction(u.email, 'Reset Credentials')}
                              className="btn btn-sm btn-secondary"
                            >
                              Reset
                            </button>
                          </div>
                        </PermissionGate>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-privilege-note">
            <h4>🔒 Security Boundary Verification</h4>
            <p>
              Only requests bearing an authenticated <code>Admin</code> session token can retrieve data from
              <code>GET /api/users</code>. Editors and Viewers navigating to <code>/users</code> are redirected to
              <code>/unauthorized</code> by the React Router guard, and if called directly, the backend returns <code>403 Forbidden</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
