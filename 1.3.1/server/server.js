import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_development_secret_key_2026';

// Enable Cross-Origin Resource Sharing for React client
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());

/**
 * Mock User Database (For Educational Demonstrations)
 * Passwords should NEVER be stored as plain text in production.
 * This mock simulates user credentials for college lab validation.
 */
const MOCK_USER = {
  id: 101,
  email: 'student@example.com',
  password: 'password123',
  role: 'student',
  fullName: 'Rohan Singh',
  department: 'Computer Science & Engineering',
};

/**
 * JWT Authentication Middleware
 * Validates the Authorization header: 'Bearer <token>'
 * Verifies signature against process.env.JWT_SECRET.
 * Rejects missing, malformed, invalid, tampered, or expired tokens with HTTP 401.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header is missing. Token required.',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'MalformedHeader',
      message: 'Invalid Authorization header format. Expected format: Bearer <token>',
    });
  }

  const token = parts[1];

  // Verify JWT signature using secret key
  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'TokenExpired',
          message: 'JWT token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        error: 'InvalidToken',
        message: 'Invalid or tampered JWT token signature.',
      });
    }

    // Attach verified decoded claims to request object
    req.user = decodedUser;
    next();
  });
}

// --- PUBLIC ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'JWT Auth Server is running' });
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

  // Validate credentials against mock user
  if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password.',
    });
  }

  // Generate signed JWT with non-sensitive claims only (NEVER include password!)
  const payload = {
    id: MOCK_USER.id,
    email: MOCK_USER.email,
    role: MOCK_USER.role,
    fullName: MOCK_USER.fullName,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h', // 1-hour expiration
  });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      role: MOCK_USER.role,
      fullName: MOCK_USER.fullName,
      department: MOCK_USER.department,
    },
  });
});

// --- PROTECTED ROUTES (Require Valid JWT) ---

// GET /api/profile
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'JWT verified by server: profile accessed successfully.',
    verifiedByServer: true,
    user: req.user,
    serverTimestamp: new Date().toISOString(),
  });
});

// GET /api/dashboard
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'JWT verified by server: protected dashboard data unlocked.',
    verifiedByServer: true,
    user: req.user,
    data: {
      enrolledCourse: 'Full Stack - II (CONT_24CSP-337)',
      experiment: 'Experiment 1.3.1 - Secure Authentication Using JWT',
      labStatus: 'In Progress (Active Session)',
      academicYear: '2026',
      completedExperiments: ['1.1.1', '1.1.2', '1.2.1', '1.2.2'],
    },
    serverTimestamp: new Date().toISOString(),
  });
});

// Start server only if executed directly via `node server.js`
import { fileURLToPath } from 'url';
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  app.listen(PORT, () => {
    console.log(`[JWT Server] Express auth server running on http://localhost:${PORT}`);
  });
}

export default app;
