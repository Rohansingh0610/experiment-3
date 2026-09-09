import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  ROLE_PERMISSIONS,
  sessions,
  authenticateSession,
  authorizeRoles,
  authorizePermissions,
} from './authorization.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/**
 * Demo Users Repository (For Educational Demonstration)
 */
export const DEMO_USERS = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    role: 'Admin',
    fullName: 'System Administrator',
  },
  {
    id: 2,
    email: 'editor@example.com',
    password: 'editor123',
    role: 'Editor',
    fullName: 'Content Editor',
  },
  {
    id: 3,
    email: 'viewer@example.com',
    password: 'viewer123',
    role: 'Viewer',
    fullName: 'Guest Viewer',
  },
];

/**
 * In-Memory Content Repository
 */
let contentItems = [
  {
    id: 1,
    title: 'Architecting Secure Full Stack Applications with RBAC',
    author: 'admin@example.com',
    category: 'Security',
    createdAt: '2026-03-01',
  },
  {
    id: 2,
    title: 'Client-Side Route Protection vs Server-Side Enforcement',
    author: 'editor@example.com',
    category: 'Architecture',
    createdAt: '2026-03-03',
  },
  {
    id: 3,
    title: 'Best Practices for Stateless Session Management',
    author: 'admin@example.com',
    category: 'Backend',
    createdAt: '2026-03-05',
  },
];

// --- PUBLIC ENDPOINTS ---

// GET /api/public
app.get('/api/public', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Public endpoint accessed successfully. No authentication required.',
    timestamp: new Date().toISOString(),
  });
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Email and password are required.',
    });
  }

  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password.',
    });
  }

  // Generate cryptographically secure random session token
  const sessionToken = crypto.randomBytes(32).toString('hex');

  // Store user in server-side session Map (role is stored securely on server!)
  const sessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };
  sessions.set(sessionToken, sessionUser);

  res.json({
    message: 'Login successful',
    sessionToken,
    user: sessionUser,
  });
});

// POST /api/logout
app.post('/api/logout', authenticateSession, (req, res) => {
  sessions.delete(req.sessionToken);
  res.json({ message: 'Session invalidated successfully.' });
});

// --- AUTHENTICATED ENDPOINTS (All Roles) ---

// GET /api/dashboard
app.get('/api/dashboard', authenticateSession, (req, res) => {
  res.json({
    message: `Welcome to the dashboard, ${req.user.fullName}!`,
    user: req.user,
    permissions: ROLE_PERMISSIONS[req.user.role] || [],
    serverTimestamp: new Date().toISOString(),
  });
});

// GET /api/content (All authenticated roles can read content)
app.get('/api/content', authenticateSession, (req, res) => {
  res.json({
    userRole: req.user.role,
    content: contentItems,
  });
});

// --- ROLE-BASED & PERMISSION-BASED PROTECTED ENDPOINTS ---

// GET /api/reports (Allowed for Admin & Editor; Denied for Viewer -> 403)
app.get('/api/reports', authenticateSession, authorizeRoles('Admin', 'Editor'), (req, res) => {
  res.json({
    message: 'Reports data accessed successfully.',
    user: req.user,
    analytics: {
      totalLogins: 142,
      activeSessions: sessions.size,
      securityAuditsPassed: '100%',
      weeklyGrowth: '+18.4%',
    },
  });
});

// GET /api/users (Allowed ONLY for Admin; Denied for Editor & Viewer -> 403)
app.get('/api/users', authenticateSession, authorizeRoles('Admin'), (req, res) => {
  res.json({
    message: 'User management directory accessed successfully.',
    user: req.user,
    users: DEMO_USERS.map(({ id, email, role, fullName }) => ({
      id,
      email,
      role,
      fullName,
    })),
  });
});

// GET /api/admin/system (Allowed ONLY for Admin -> 403 for others)
app.get('/api/admin/system', authenticateSession, authorizeRoles('Admin'), (req, res) => {
  res.json({
    message: 'Admin Control Panel settings unlocked.',
    user: req.user,
    systemSettings: {
      sessionTimeout: '3600 seconds',
      mfaRequired: true,
      corsOrigin: 'http://localhost:5173',
      enforceStrictRbac: true,
    },
  });
});

// POST /api/content (Requires 'create_content': Allowed for Admin, Editor; Denied for Viewer -> 403)
app.post(
  '/api/content',
  authenticateSession,
  authorizePermissions('create_content'),
  (req, res) => {
    const { title, category } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const newItem = {
      id: Date.now(),
      title: title.trim(),
      author: req.user.email,
      category: category || 'General',
      createdAt: new Date().toISOString().split('T')[0],
    };

    contentItems.unshift(newItem);
    res.status(201).json({ message: 'Content created successfully', item: newItem });
  }
);

// PUT /api/content/:id (Requires 'edit_content': Allowed for Admin, Editor; Denied for Viewer -> 403)
app.put(
  '/api/content/:id',
  authenticateSession,
  authorizePermissions('edit_content'),
  (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { title, category } = req.body;

    const index = contentItems.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Content item not found' });
    }

    contentItems[index] = {
      ...contentItems[index],
      title: title ? title.trim() : contentItems[index].title,
      category: category || contentItems[index].category,
    };

    res.json({ message: 'Content updated successfully', item: contentItems[index] });
  }
);

// DELETE /api/content/:id (Requires 'delete_content': Allowed ONLY for Admin; Denied for Editor & Viewer -> 403)
app.delete(
  '/api/content/:id',
  authenticateSession,
  authorizePermissions('delete_content'),
  (req, res) => {
    const id = parseInt(req.params.id, 10);
    const exists = contentItems.some((c) => c.id === id);

    if (!exists) {
      return res.status(404).json({ message: 'Content item not found' });
    }

    contentItems = contentItems.filter((c) => c.id !== id);
    res.json({ message: 'Content deleted successfully', id });
  }
);

// Start server if run directly
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  app.listen(PORT, () => {
    console.log(`[RBAC Server] Express authorization server listening on http://localhost:${PORT}`);
  });
}

export default app;
