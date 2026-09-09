import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleRoute from './components/RoleRoute.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Content from './pages/Content.jsx';
import Reports from './pages/Reports.jsx';
import Users from './pages/Users.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

import { ROLES, PERMISSIONS } from './config/permissions.js';

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated Routes (All authenticated roles: Admin, Editor, Viewer) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/content"
            element={
              <ProtectedRoute>
                <Content />
              </ProtectedRoute>
            }
          />

          {/* Role / Permission Protected Routes */}
          {/* Reports: Admin and Editor (requires view_reports permission) */}
          <Route
            path="/reports"
            element={
              <RoleRoute requiredPermission={PERMISSIONS.VIEW_REPORTS}>
                <Reports />
              </RoleRoute>
            }
          />

          {/* Users: Admin only (requires Admin role / view_users) */}
          <Route
            path="/users"
            element={
              <RoleRoute allowedRoles={ROLES.ADMIN}>
                <Users />
              </RoleRoute>
            }
          />

          {/* Admin Panel: Admin only */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={ROLES.ADMIN}>
                <AdminPanel />
              </RoleRoute>
            }
          />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span>Full Stack Development - II | Experiment 1.3.2</span>
          <span>Role-Based Access Control (RBAC) &amp; Route Protection</span>
          <span className="footer-status">Mock Session Mode: Active</span>
        </div>
      </footer>
    </div>
  );
}
