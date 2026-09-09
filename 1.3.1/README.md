# Experiment 1.3.1: Secure Authentication Using JSON Web Tokens (JWT)

**Course:** Full Stack - II (CONT_24CSP-337)  
**Academic Year:** 2026  

---

## 🎯 Aim
To design and implement a secure authentication system using JSON Web Tokens (JWT) for user login and session management.

---

## 📌 Objectives
1. Understand client-server **authentication mechanisms** in modern web applications.
2. Implement **token-based, stateless authentication** using `jsonwebtoken`.
3. Eliminate server-side session stores by encoding authenticated user claims into signed tokens.
4. Securely transmit tokens using the standard HTTP **`Authorization: Bearer <token>`** header.
5. Create Express **middleware** to cryptographically verify token signatures on protected routes.
6. Guard frontend routes (`/dashboard`, `/profile`) using React Router and an **`AuthContext`**.
7. Provide a visual **JWT Token Inspector** illustrating Header, Payload, and Signature, and explaining why client-side decoding is NOT verification.

---

## ⚠️ Important Educational & Security Notice
> [!WARNING]
> - **Mock Credentials & Static User**: The credentials (`student@example.com` / `password123`) and in-memory mock database are strictly for college lab demonstration and viva presentation. Never hardcode plaintext passwords in production.
> - **Token Storage**: In this educational lab, tokens are stored in `sessionStorage` for scoped demonstration (automatically cleared when the browser tab closes). For production web applications, tokens should ideally be stored in **HTTP-only, Secure, SameSite cookies** to prevent Cross-Site Scripting (XSS) token extraction.
> - **Environment Secret**: The cryptographic key is managed through `process.env.JWT_SECRET` on the server and is **never** exposed to client-side code.

---

## 📖 Theory & Core Concepts

### 1. What is Stateless Authentication?
Traditional session-based authentication requires the backend server to create a session record in memory or a database (e.g. Redis) and return a session ID cookie. As applications scale across multiple servers, session sharing becomes complex.

In **JWT-based stateless authentication**, the server generates a cryptographically signed token containing non-sensitive claims (user ID, role, email) upon successful login. The server does not keep a record of the session; instead, it verifies the signature of the incoming token on every subsequent request.

### 2. JWT Structure (Three Parts)
A JSON Web Token consists of three base64url-encoded parts separated by dots (`.`):

$$\text{JWT} = \text{Header} \,.\, \text{Payload} \,.\, \text{Signature}$$

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxLCJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc4ODkyODM2NCwiZXhwIjoxNzg4OTMxOTY0fQ.z04i31Zk2fJ1W-oO_dFwE6Q2_sample_signature
```

1. **Header (Red)**: Contains token metadata, typically the signing algorithm (`HS256`) and the token type (`JWT`).
   ```json
   { "alg": "HS256", "typ": "JWT" }
   ```
2. **Payload (Purple)**: Contains user claims and metadata (e.g., `id`, `email`, `role`, `iat`, `exp`). **Passwords are never included.**
   ```json
   {
     "id": 101,
     "email": "student@example.com",
     "role": "student",
     "iat": 1788928364,
     "exp": 1788931964
   }
   ```
3. **Signature (Cyan)**: Calculated by hashing the encoded header and payload with a private secret key:
   $$\text{Signature} = \text{HMACSHA256}(\text{base64Url}(header) + "." + \text{base64Url}(payload), \text{JWT\_SECRET})$$

### 3. Client-Side Decoding vs. Server Verification
- **Decoding (Client)**: Anyone with access to the token string can base64-decode the payload and read the claims. Decoding does NOT prove the token was issued by your server or that it has not been altered.
- **Verification (Server)**: Only the server possessing `process.env.JWT_SECRET` can calculate and verify the cryptographic signature. If an attacker modifies any claim, the signature check fails immediately (HTTP 401).

---

## 🔄 Authentication Flow

```
[User Browser]                           [Express Backend Server]
      │                                              │
      │ 1. POST /api/login (email + password)        │
      ├─────────────────────────────────────────────►│
      │                                              │ 2. Validate mock credentials
      │                                              │ 3. Sign JWT with process.env.JWT_SECRET
      │ 4. HTTP 200 OK + { token, user }             │
      │◄─────────────────────────────────────────────┤
      │                                              │
      │ 5. Save token in sessionStorage              │
      │ 6. Redirect to /dashboard                    │
      │                                              │
      │ 7. GET /api/dashboard                        │
      │    Header: Authorization: Bearer <token>     │
      ├─────────────────────────────────────────────►│
      │                                              │ 8. authenticateToken middleware verifies
      │                                              │    signature using JWT_SECRET
      │ 9. HTTP 200 OK + Protected Dashboard Data    │
      │◄─────────────────────────────────────────────┤
```

---

## 📁 Project Structure

```
experiment-3/
├── client/                               # React + Vite Frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Global auth provider & sessionStorage sync
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Navigation, auth pill & logout
│   │   │   ├── ProtectedRoute.jsx        # Client route guard
│   │   │   ├── JwtInspector.jsx          # Color-coded JWT structure & decoded claims
│   │   │   └── AuthFlowDiagram.jsx       # Visual lifecycle flowchart
│   │   ├── pages/
│   │   │   ├── Login.jsx                 # Login form with auto-fill helper
│   │   │   ├── Dashboard.jsx             # Authenticated dashboard & protected API caller
│   │   │   └── Profile.jsx               # User profile with "JWT verified by server"
│   │   ├── App.jsx                       # Router & route definitions
│   │   ├── main.jsx                      # React 19 root mount
│   │   └── index.css                     # Modern Vanilla CSS design system
│   ├── public/                           # Favicons & static assets
│   ├── index.html                        # Entry HTML
│   ├── vite.config.js                    # Vite configuration (port 5173)
│   ├── package.json
│   └── package-lock.json
│
├── server/                               # Node.js + Express Backend
│   ├── server.js                         # API routes & authenticateToken middleware
│   ├── test_jwt.js                       # 8-suite automated backend verification
│   ├── .env.example                      # Template for environment variables
│   ├── .env                              # Local secret (git-ignored)
│   ├── package.json
│   └── package-lock.json
│
├── README.md                             # Comprehensive lab documentation
└── .gitignore                            # Ensures .env & node_modules are never committed
```

---

## 🚀 Installation & Running Instructions

### 1. Backend Server Setup
In a terminal window:
```bash
cd "experiment-3/server"

# Install backend dependencies
npm install

# Run automated backend test suite
npm test

# Start the Express server (runs on http://localhost:5000)
npm start
```

### 2. Frontend Client Setup
In a second terminal window:
```bash
cd "experiment-3/client"

# Install frontend dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build
```

---

## 🔑 Mock Login Credentials

| Field | Value |
| :--- | :--- |
| **Email** | `student@example.com` |
| **Password** | `password123` |
| **Role** | `student` |
| **Auto-Fill** | Click the **Auto-Fill** button on the login form |

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Backend health check |
| `POST` | `/api/login` | Public | Validates credentials and returns signed JWT (1h expiry) |
| `GET` | `/api/profile` | Protected | Requires `Authorization: Bearer <token>`; returns user profile |
| `GET` | `/api/dashboard` | Protected | Requires `Authorization: Bearer <token>`; returns course metrics |

---

## 🧪 Verification & Test Results

### 1. Automated Backend Test Suite (`node test_jwt.js`)
```
====================================================
EXPERIMENT 1.3.1: JWT BACKEND VERIFICATION TEST
====================================================

[1/8] Testing POST /api/login with invalid credentials...
✓ PASS: Invalid credentials correctly rejected with HTTP 401.

[2/8] Testing POST /api/login with valid credentials...
✓ PASS: Valid login returned HTTP 200 with signed JWT token.
✓ PASS: JWT structure verified (3 segments: Header.Payload.Signature).

[3/8] Testing protected route without Authorization header...
✓ PASS: Missing Authorization header rejected with HTTP 401.

[4/8] Testing protected route with malformed Authorization header...
✓ PASS: Malformed header format rejected with HTTP 401.

[5/8] Testing protected route with tampered token...
✓ PASS: Tampered token signature rejected with HTTP 401.

[6/8] Testing GET /api/profile with valid JWT...
✓ PASS: Valid JWT authorized access to /api/profile.

[7/8] Testing GET /api/dashboard with valid JWT...
✓ PASS: Valid JWT authorized access to protected /api/dashboard.

[8/8] Verification Summary
====================================================
ALL JWT BACKEND TESTS PASSED SUCCESSFULLY!
====================================================
```

### 2. Frontend Production Build (`npm run build`)
```
vite v8.2.2 building client environment for production...
dist/index.html                   0.66 kB │ gzip:  0.40 kB
dist/assets/index-BI_Q9wLb.css   11.89 kB │ gzip:  3.07 kB
dist/assets/index-FJuBBqXN.js   250.23 kB │ gzip: 78.72 kB
✓ built in 333ms
```

---

## 🎓 Learning Outcomes
- Acquired hands-on mastery of JSON Web Token structure and cryptographic signing using HMAC-SHA256.
- Implemented stateless session architecture in Node.js and Express.
- Created reusable Express middleware (`authenticateToken`) for route-level authorization.
- Gained deep understanding of the `Authorization: Bearer <token>` standard.
- Implemented frontend protected routes with React Router and state persistence with `sessionStorage`.
- Disproved common security misconceptions by demonstrating that base64 payload decoding $\neq$ signature verification.
