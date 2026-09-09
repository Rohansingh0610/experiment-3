import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from '../components/RoleBadge.jsx';

export default function Login() {
  const { login, isLoading, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please provide both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate(destination, { replace: true });
    } else {
      setLocalError(res.error || 'Authentication failed.');
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLocalError('');
    const res = await login(demoEmail, demoPassword);
    if (res.success) {
      navigate(destination, { replace: true });
    } else {
      setLocalError(res.error || 'Authentication failed.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h2>Authentication Portal</h2>
          <p className="subtitle">
            Role-Based Access Control (RBAC) &amp; Session Management Demo
          </p>
        </div>

        {(localError || authError) && (
          <div className="alert alert-danger">
            <span className="alert-icon">⚠️</span>
            <span>{localError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter demo password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-accounts-divider">
          <span>OR SELECT A DEMO ROLE</span>
        </div>

        <div className="demo-accounts-grid">
          <div
            className="demo-account-card admin-border"
            onClick={() => handleQuickLogin('admin@example.com', 'admin123')}
          >
            <div className="demo-card-header">
              <RoleBadge role="Admin" size="small" />
              <span className="demo-badge">Full Access</span>
            </div>
            <p className="demo-credentials">admin@example.com / admin123</p>
            <span className="demo-hint">Dashboard, Users, Content (All CRUD), Reports, Admin Panel</span>
          </div>

          <div
            className="demo-account-card editor-border"
            onClick={() => handleQuickLogin('editor@example.com', 'editor123')}
          >
            <div className="demo-card-header">
              <RoleBadge role="Editor" size="small" />
              <span className="demo-badge">Content Ops</span>
            </div>
            <p className="demo-credentials">editor@example.com / editor123</p>
            <span className="demo-hint">Dashboard, Content (Create/Edit), Reports (No Delete/Users)</span>
          </div>

          <div
            className="demo-account-card viewer-border"
            onClick={() => handleQuickLogin('viewer@example.com', 'viewer123')}
          >
            <div className="demo-card-header">
              <RoleBadge role="Viewer" size="small" />
              <span className="demo-badge">Read-Only</span>
            </div>
            <p className="demo-credentials">viewer@example.com / viewer123</p>
            <span className="demo-hint">Dashboard &amp; Read-only Content (All modifications 403)</span>
          </div>
        </div>

        <div className="login-footer-info">
          <p>
            <strong>Security Notice:</strong> The backend generates a cryptographically random
            session token (stored in a server-side session Map). Roles are never trusted from client
            input.
          </p>
        </div>
      </div>
    </div>
  );
}
