import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PERMISSION_LABELS,
  checkPermission,
} from '../config/permissions.js';

export default function Dashboard() {
  const { user, role, sessionToken, hasPermission, hasRole } = useAuth();
  const navigate = useNavigate();

  const [apiTestResult, setApiTestResult] = useState(null);
  const [testingEndpoint, setTestingEndpoint] = useState(false);

  // Helper to test backend protected endpoints directly
  const testBackendEndpoint = async (endpoint, method = 'GET', body = null) => {
    setTestingEndpoint(true);
    setApiTestResult(null);

    try {
      const options = {
        method,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(endpoint, options);
      const data = await res.json();

      setApiTestResult({
        endpoint,
        method,
        status: res.status,
        ok: res.ok,
        message: data.message || JSON.stringify(data),
        data,
      });
    } catch (err) {
      setApiTestResult({
        endpoint,
        method,
        status: 'Error',
        ok: false,
        message: err.message,
      });
    } finally {
      setTestingEndpoint(false);
    }
  };

  const allPermissionsList = Object.values(PERMISSIONS);

  return (
    <div className="dashboard-container">
      {/* 1. Header & Identity Section */}
      <section className="dashboard-header-card">
        <div className="user-profile-header">
          <div className="user-avatar-circle">
            {role === 'Admin' ? '🛡️' : role === 'Editor' ? '✏️' : '👁️'}
          </div>
          <div className="user-info-text">
            <h2>Welcome back, <span className="highlight-name">{user?.email}</span></h2>
            <div className="user-badges-row">
              <RoleBadge role={role} size="large" />
              <span className="badge badge-success">● Session Active &amp; Authenticated</span>
              <span className="badge badge-info">ID: #{user?.id}</span>
            </div>
          </div>
        </div>

        <div className="session-security-box">
          <div className="session-token-view">
            <span className="token-label">Active Bearer Session Token:</span>
            <code className="token-value">
              {sessionToken
                ? `${sessionToken.slice(0, 10)}...${sessionToken.slice(-10)}`
                : 'No Token'}
            </code>
          </div>
          <span className="token-note">
            🛡️ Server-side mapped session. Role verified independently on each request via req.user.role.
          </span>
        </div>
      </section>

      {/* 2. Authentication vs Authorization Educational Card */}
      <section className="edu-card-grid">
        <div className="edu-card auth-card">
          <div className="edu-icon">🔑</div>
          <div className="edu-content">
            <h3>Authentication (AuthN)</h3>
            <p className="edu-tagline">"Who are you?"</p>
            <p className="edu-desc">
              Identifies and verifies the user’s identity through credentials (e.g. email &amp; password).
              Upon validation, the backend generates and stores a secure session token.
            </p>
            <div className="edu-step">Step 1: Happens first before any resource request.</div>
          </div>
        </div>

        <div className="edu-card authz-card">
          <div className="edu-icon">🛡️</div>
          <div className="edu-content">
            <h3>Authorization (AuthZ)</h3>
            <p className="edu-tagline">"What are you allowed to do?"</p>
            <p className="edu-desc">
              Determines if the authenticated user has permission to access a specific route,
              perform an action (create, edit, delete), or view restricted data based on their role.
            </p>
            <div className="edu-step">Step 2: Follows authentication on every protected endpoint.</div>
          </div>
        </div>
      </section>

      {/* 3. Try Unauthorized Access Switchboard */}
      <section className="switchboard-section">
        <div className="section-heading">
          <h3>⚡ Try Unauthorized Access (RBAC Security Testbed)</h3>
          <p className="section-sub">
            Test how client route guards and backend authorization middleware react to your current role (<strong className={`role-text-${role?.toLowerCase()}`}>{role}</strong>).
          </p>
        </div>

        <div className="testbed-grid">
          {/* Test 1: Admin Panel */}
          <div className="testbed-card">
            <div className="testbed-title">
              <span>Admin Panel Route</span>
              <span className="pill pill-warning">Admin Only</span>
            </div>
            <p className="testbed-desc">Attempts to navigate to client route <code>/admin</code></p>
            <div className="testbed-actions">
              <button
                onClick={() => navigate('/admin')}
                className="btn btn-outline btn-sm"
              >
                Go to /admin
              </button>
              <button
                onClick={() => testBackendEndpoint('/api/admin/system')}
                className="btn btn-secondary btn-sm"
                disabled={testingEndpoint}
              >
                Call API: /api/admin/system
              </button>
            </div>
            <div className="testbed-expected">
              Expected for {role}: {role === 'Admin' ? '✅ Allowed (200)' : '❌ Redirect /unauthorized (403)'}
            </div>
          </div>

          {/* Test 2: Users Directory */}
          <div className="testbed-card">
            <div className="testbed-title">
              <span>Users Directory Route</span>
              <span className="pill pill-warning">Admin Only</span>
            </div>
            <p className="testbed-desc">Attempts to navigate to client route <code>/users</code></p>
            <div className="testbed-actions">
              <button
                onClick={() => navigate('/users')}
                className="btn btn-outline btn-sm"
              >
                Go to /users
              </button>
              <button
                onClick={() => testBackendEndpoint('/api/users')}
                className="btn btn-secondary btn-sm"
                disabled={testingEndpoint}
              >
                Call API: /api/users
              </button>
            </div>
            <div className="testbed-expected">
              Expected for {role}: {role === 'Admin' ? '✅ Allowed (200)' : '❌ Redirect /unauthorized (403)'}
            </div>
          </div>

          {/* Test 3: Reports & Analytics */}
          <div className="testbed-card">
            <div className="testbed-title">
              <span>Reports &amp; Analytics</span>
              <span className="pill pill-info">Admin &amp; Editor</span>
            </div>
            <p className="testbed-desc">Attempts to access reports page and <code>GET /api/reports</code></p>
            <div className="testbed-actions">
              <button
                onClick={() => navigate('/reports')}
                className="btn btn-outline btn-sm"
              >
                Go to /reports
              </button>
              <button
                onClick={() => testBackendEndpoint('/api/reports')}
                className="btn btn-secondary btn-sm"
                disabled={testingEndpoint}
              >
                Call API: /api/reports
              </button>
            </div>
            <div className="testbed-expected">
              Expected for {role}: {role === 'Viewer' ? '❌ Denied (403 Forbidden)' : '✅ Allowed (200)'}
            </div>
          </div>

          {/* Test 4: Delete Content */}
          <div className="testbed-card">
            <div className="testbed-title">
              <span>Delete Content Action</span>
              <span className="pill pill-danger">Admin Only</span>
            </div>
            <p className="testbed-desc">Sends <code>DELETE /api/content/1</code> with Bearer session token</p>
            <div className="testbed-actions">
              <button
                onClick={() => testBackendEndpoint('/api/content/1', 'DELETE')}
                className="btn btn-danger-outline btn-sm"
                disabled={testingEndpoint}
              >
                Call DELETE /api/content/1
              </button>
            </div>
            <div className="testbed-expected">
              Expected for {role}: {role === 'Admin' ? '✅ Allowed (200)' : '❌ 403 Forbidden (Blocked)'}
            </div>
          </div>
        </div>

        {/* Live Test Output Display */}
        {apiTestResult && (
          <div className={`api-result-box ${apiTestResult.ok ? 'result-success' : 'result-denied'}`}>
            <div className="result-header">
              <span className="result-badge">
                {apiTestResult.ok ? '✓ 200 OK (Allowed)' : `❌ ${apiTestResult.status} (Access Denied / 403)`}
              </span>
              <span className="result-endpoint">
                {apiTestResult.method} {apiTestResult.endpoint}
              </span>
            </div>
            <pre className="result-json">
              {JSON.stringify(apiTestResult.data || apiTestResult.message, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* 4. RBAC Flow Visualization & Architecture */}
      <section className="visualization-section">
        <div className="section-heading">
          <h3>📊 RBAC Architectural Flow &amp; Hierarchy</h3>
          <p className="section-sub">
            How requests are authenticated, mapped to roles, and authorized through permissions
          </p>
        </div>

        <div className="flow-diagram-wrapper">
          <div className="diagram-card flow-steps">
            <h4>Request Authorization Pipeline</h4>
            <div className="pipeline-steps">
              <div className="step-node">User Request</div>
              <div className="step-arrow">↓</div>
              <div className="step-node">Authentication (Bearer Session Token)</div>
              <div className="step-arrow">↓</div>
              <div className="step-node">Identify User (Server Session Map)</div>
              <div className="step-arrow">↓</div>
              <div className="step-node">Determine Role (req.user.role)</div>
              <div className="step-arrow">↓</div>
              <div className="step-node">Check Required Permission(s)</div>
              <div className="step-arrow">↓</div>
              <div className="decision-node">
                <span>Authorized?</span>
                <div className="branch-container">
                  <div className="branch branch-yes">
                    <span className="branch-label">Yes</span>
                    <span className="branch-action allow">Allow Request (HTTP 200/201)</span>
                  </div>
                  <div className="branch branch-no">
                    <span className="branch-label">No</span>
                    <span className="branch-action deny">403 Access Denied (Forbidden)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="diagram-card role-trees">
            <h4>Role Hierarchy &amp; Granted Permissions</h4>
            <div className="tree-columns">
              {/* Admin Tree */}
              <div className="role-tree-box admin-tree">
                <div className="tree-role-title">
                  <RoleBadge role="Admin" size="small" />
                </div>
                <ul className="tree-items">
                  <li>├── View Dashboard</li>
                  <li>├── View Content</li>
                  <li>├── Create Content</li>
                  <li>├── Edit Content</li>
                  <li>├── Delete Content</li>
                  <li>├── View Reports</li>
                  <li>└── Manage Users</li>
                </ul>
              </div>

              {/* Editor Tree */}
              <div className="role-tree-box editor-tree">
                <div className="tree-role-title">
                  <RoleBadge role="Editor" size="small" />
                </div>
                <ul className="tree-items">
                  <li>├── View Dashboard</li>
                  <li>├── View Content</li>
                  <li>├── Create Content</li>
                  <li>├── Edit Content</li>
                  <li>├── View Reports</li>
                  <li>├── <s>Delete Content</s> (Denied)</li>
                  <li>└── <s>Manage Users</s> (Denied)</li>
                </ul>
              </div>

              {/* Viewer Tree */}
              <div className="role-tree-box viewer-tree">
                <div className="tree-role-title">
                  <RoleBadge role="Viewer" size="small" />
                </div>
                <ul className="tree-items">
                  <li>├── View Dashboard</li>
                  <li>├── View Content (Read-Only)</li>
                  <li>├── <s>Create Content</s> (Denied)</li>
                  <li>├── <s>Edit Content</s> (Denied)</li>
                  <li>├── <s>Delete Content</s> (Denied)</li>
                  <li>├── <s>View Reports</s> (Denied)</li>
                  <li>└── <s>Manage Users</s> (Denied)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Role-Permission Matrix Table */}
      <section className="matrix-section">
        <div className="section-heading">
          <h3>📋 Role &amp; Permission Access Control Matrix</h3>
          <p className="section-sub">
            Centralized permissions and current role granting status
          </p>
        </div>

        <div className="matrix-table-card">
          <table className="rbac-table">
            <thead>
              <tr>
                <th>Permission Key</th>
                <th>Operation Name</th>
                <th>Admin</th>
                <th>Editor</th>
                <th>Viewer</th>
                <th>Your Status ({role})</th>
              </tr>
            </thead>
            <tbody>
              {allPermissionsList.map((permKey) => {
                const adminHas = checkPermission(ROLES.ADMIN, permKey);
                const editorHas = checkPermission(ROLES.EDITOR, permKey);
                const viewerHas = checkPermission(ROLES.VIEWER, permKey);
                const currentHas = hasPermission(permKey);

                return (
                  <tr key={permKey} className={currentHas ? 'row-granted' : 'row-denied'}>
                    <td><code>{permKey}</code></td>
                    <td className="perm-label">{PERMISSION_LABELS[permKey] || permKey}</td>
                    <td className="center-cell">{adminHas ? '✅' : '❌'}</td>
                    <td className="center-cell">{editorHas ? '✅' : '❌'}</td>
                    <td className="center-cell">{viewerHas ? '✅' : '❌'}</td>
                    <td className="center-cell current-status">
                      {currentHas ? (
                        <span className="tag-granted">Granted ✓</span>
                      ) : (
                        <span className="tag-denied">Restricted ✗</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
