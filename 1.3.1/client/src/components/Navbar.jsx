import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="navbar-brand">
          <span className="brand-badge">Full Stack - II</span>
          <span className="brand-title">Experiment 1.3.1: JWT Auth</span>
        </Link>

        <nav className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <div className="user-status-pill authenticated">
                <span className="dot"></span>
                <span>{user?.email || 'Logged In'}</span>
                <span className="role-badge">{user?.role || 'student'}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-logout"
                title="Log out and clear session"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <div className="user-status-pill unauthenticated">
                <span className="dot"></span>
                <span>Unauthenticated</span>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
