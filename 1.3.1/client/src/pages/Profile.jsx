import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        const res = await fetch('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          // Token rejected or expired
          logout();
          navigate('/login');
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }

        if (isMounted) {
          setProfileData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [token, logout, navigate]);

  return (
    <div className="profile-page">
      <div className="card profile-card">
        <div className="card-header">
          <div>
            <h2>👤 User Profile</h2>
            <p className="section-desc">
              Protected view loaded via <code>GET /api/profile</code>.
            </p>
          </div>
          {profileData?.verifiedByServer && (
            <span className="badge-server-verified">
              ✓ JWT verified by server
            </span>
          )}
        </div>

        {loading && <div className="loading-spinner">Verifying JWT signature with backend...</div>}

        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        {profileData && (
          <div className="profile-content">
            <div className="profile-details-grid">
              <div className="profile-item">
                <span className="field-label">User ID</span>
                <span className="field-value">#{profileData.user.id}</span>
              </div>
              <div className="profile-item">
                <span className="field-label">Email Address</span>
                <span className="field-value">{profileData.user.email}</span>
              </div>
              <div className="profile-item">
                <span className="field-label">Full Name</span>
                <span className="field-value">{profileData.user.fullName || 'Student'}</span>
              </div>
              <div className="profile-item">
                <span className="field-label">Authorization Role</span>
                <span className="role-tag">{profileData.user.role}</span>
              </div>
              <div className="profile-item">
                <span className="field-label">Server Verification Time</span>
                <span className="field-value mono">{profileData.serverTimestamp}</span>
              </div>
            </div>

            <div className="profile-security-notice">
              <h4>🛡️ Security Guarantee</h4>
              <p>
                The information above was not read from untrusted client storage. Instead, the server
                cryptographically validated the incoming token signature against <code>process.env.JWT_SECRET</code>,
                extracted the validated claims, and delivered this authenticated response.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
