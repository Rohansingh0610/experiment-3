import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthFlowDiagram from '../components/AuthFlowDiagram.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Pre-fill mock credentials for quick lab demonstration
  const handleFillCredentials = () => {
    setEmail('student@example.com');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store JWT token and user info in sessionStorage via AuthContext
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Cannot connect to backend server. Make sure the Express server is running on port 5000.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        {/* Left Column: Login Form Card */}
        <div className="card login-card">
          <div className="card-header">
            <h3>🔐 User Login</h3>
            <span className="badge-pill">JWT Authenticated</span>
          </div>

          <p className="section-desc">
            Submit your credentials to the Express backend to receive a signed JWT session token.
          </p>

          {/* Quick Lab Credentials Helper */}
          <div className="mock-credentials-box">
            <div className="mock-header">
              <span className="mock-title">College Lab Mock Credentials:</span>
              <button
                type="button"
                onClick={handleFillCredentials}
                className="btn btn-sm btn-outline"
                title="Auto-fill sample credentials"
              >
                Auto-Fill
              </button>
            </div>
            <div className="mock-details">
              <div>Email: <code>student@example.com</code></div>
              <div>Password: <code>password123</code></div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="e.g. student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Authenticating...' : 'Sign In with JWT'}
            </button>
          </form>

          {isAuthenticated && (
            <div className="already-logged-in-box">
              <p>You already have an active session.</p>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-outline btn-sm"
              >
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Theory Card */}
        <div className="card theory-card">
          <div className="card-header">
            <h3>📖 Theory: Stateless JWT Authentication</h3>
          </div>
          <div className="theory-points">
            <div className="theory-point">
              <strong>1. Stateless Session</strong>
              <p>
                Unlike traditional cookie-session architectures, the server does not retain session
                records in memory or database. Every request carries all required authorization claims
                inside the signed JWT.
              </p>
            </div>
            <div className="theory-point">
              <strong>2. Cryptographic Integrity</strong>
              <p>
                The token is signed with a secret HMAC key (<code>process.env.JWT_SECRET</code>).
                Tampering with claims invalidates the signature, causing the server to reject the
                request with HTTP 401.
              </p>
            </div>
            <div className="theory-point">
              <strong>3. Client Token Storage</strong>
              <p>
                In this lab, tokens are stored in <code>sessionStorage</code> for educational scoping
                (wiped on tab close). In production, secure HTTP-only cookies are recommended to guard
                against XSS attacks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Flow Diagram */}
      <AuthFlowDiagram />
    </div>
  );
}
