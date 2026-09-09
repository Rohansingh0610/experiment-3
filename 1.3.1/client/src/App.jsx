import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="main-content">
        <div className="page-header-ribbon">
          <div className="lab-tag-row">
            <span className="tag-lab">Full Stack - II Lab</span>
            <span className="tag-exp">Experiment 1.3.1</span>
          </div>
          <h1>Secure Authentication Using JSON Web Tokens (JWT)</h1>
          <p className="app-aim-text">
            <strong>Aim:</strong> To design and implement a secure authentication system using
            JWT for user login and session management.
          </p>
        </div>

        <Routes>
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Catch-all route */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Full Stack - II Lab Submission • Built with React 19, Vite, Express & JSON Web Tokens</p>
      </footer>
    </div>
  );
}
