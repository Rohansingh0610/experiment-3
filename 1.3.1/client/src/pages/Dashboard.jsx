import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import JwtInspector from '../components/JwtInspector.jsx';

export default function Dashboard() {
  const { token, user, logout, decodedPayload } = useAuth();
  const navigate = useNavigate();

  const [protectedData, setProtectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch protected data from Express backend using Bearer token
  const handleFetchProtectedData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        // Token invalid or expired: log out and redirect to login
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch protected data');
      }

      setProtectedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const expDate = decodedPayload?.exp
    ? new Date(decodedPayload.exp * 1000).toLocaleString()
    : 'Active Session';

  return (
    <div className="dashboard-page">
      {/* Top Banner */}
      <div className="card dashboard-header-card">
        <div className="dash-title-row">
          <div>
            <h2>🛡️ Authenticated Dashboard</h2>
            <p className="section-desc">
              Protected frontend view accessible only with a verified JWT session.
            </p>
          </div>
          <div className="status-pill status-active">
            ● Active JWT Session
          </div>
        </div>

        {/* User Info Overview Grid */}
        <div className="user-info-grid">
          <div className="info-item">
            <span className="info-label">User Email</span>
            <strong className="info-value">{user?.email || 'N/A'}</strong>
          </div>
          <div className="info-item">
            <span className="info-label">User ID</span>
            <strong className="info-value">#{user?.id || 'N/A'}</strong>
          </div>
          <div className="info-item">
            <span className="info-label">Assigned Role</span>
            <span className="role-tag">{user?.role || 'student'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Token Expiration</span>
            <span className="exp-value">{expDate}</span>
          </div>
        </div>
      </div>

      {/* Protected API Test Card */}
      <div className="card protected-api-card">
        <div className="card-header">
          <div>
            <h3>🔒 Protected API Endpoint: <code>GET /api/dashboard</code></h3>
            <p className="section-desc">
              Tests sending <code>Authorization: Bearer &lt;token&gt;</code> to Express.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFetchProtectedData}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Verifying with Server...' : 'Fetch Protected Data'}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {protectedData && (
          <div className="api-response-box">
            <div className="response-badge-row">
              <span className="badge-http-ok">HTTP 200 OK</span>
              <span className="badge-verified">✓ JWT Verified by Backend</span>
              <span className="response-time">Timestamp: {protectedData.serverTimestamp}</span>
            </div>

            <pre className="code-display">
              {JSON.stringify(protectedData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Educational JWT Token Inspector */}
      <JwtInspector />
    </div>
  );
}
