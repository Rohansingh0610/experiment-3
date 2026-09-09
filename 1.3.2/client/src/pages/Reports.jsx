import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from '../components/RoleBadge.jsx';

export default function Reports() {
  const { sessionToken, role } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/reports', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setReportData(data);
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

    fetchReports();
  }, [sessionToken]);

  return (
    <div className="reports-page-container">
      <div className="page-header-row">
        <div>
          <h2>Analytics &amp; Operational Reports</h2>
          <p className="page-sub">
            Accessible exclusively to <strong>Admin</strong> and <strong>Editor</strong> roles
            possessing the <code>view_reports</code> permission.
          </p>
        </div>
        <div className="header-badge-box">
          <RoleBadge role={role} size="medium" />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Retrieving secure reports from server...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <span className="alert-icon">❌</span>
          <div>
            <strong>Access Blocked (HTTP {error.status}):</strong> {error.message}
          </div>
        </div>
      ) : (
        <div className="reports-content">
          {/* Top KPI Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-icon">👥</span>
              <div className="metric-info">
                <span className="metric-title">Total Registered Users</span>
                <span className="metric-value">{reportData?.summary?.totalUsers || 3}</span>
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-icon">📄</span>
              <div className="metric-info">
                <span className="metric-title">Published Articles</span>
                <span className="metric-value">{reportData?.summary?.totalPosts || 3}</span>
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-icon">⚡</span>
              <div className="metric-info">
                <span className="metric-title">Active Server Sessions</span>
                <span className="metric-value">{reportData?.summary?.activeSessions || 1}</span>
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-icon">🛡️</span>
              <div className="metric-info">
                <span className="metric-title">Enforcement Policy</span>
                <span className="metric-value">Strict RBAC</span>
              </div>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="card-box mt-4">
            <div className="card-box-header">
              <h3>System Activity Audit Log</h3>
              <span className="badge badge-info">Realtime</span>
            </div>
            <table className="rbac-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor Role</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.recentActivity?.map((activity, idx) => (
                  <tr key={idx}>
                    <td>{new Date(activity.timestamp).toLocaleTimeString()}</td>
                    <td><strong>{activity.action}</strong></td>
                    <td><RoleBadge role={activity.user} size="small" /></td>
                    <td><span className="tag-granted">Success (200)</span></td>
                  </tr>
                )) || (
                  <>
                    <tr>
                      <td>10:00:15 AM</td>
                      <td>Admin Session Login</td>
                      <td><RoleBadge role="Admin" size="small" /></td>
                      <td><span className="tag-granted">Allowed (200)</span></td>
                    </tr>
                    <tr>
                      <td>10:01:22 AM</td>
                      <td>Content Published</td>
                      <td><RoleBadge role="Editor" size="small" /></td>
                      <td><span className="tag-granted">Allowed (201)</span></td>
                    </tr>
                    <tr>
                      <td>10:02:05 AM</td>
                      <td>Viewer Tried Delete Route</td>
                      <td><RoleBadge role="Viewer" size="small" /></td>
                      <td><span className="tag-denied">Blocked (403)</span></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="report-note-box">
            <h4>💡 RBAC Security Note</h4>
            <p>
              When a user logged in as <strong>Viewer</strong> attempts to navigate here or call <code>/api/reports</code>,
              the server middleware <code>authorizePermissions('view_reports')</code> immediately halts the pipeline
              and returns <code>HTTP 403 Forbidden</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
