# Experiment 1.3.2: Role-Based Access Control (RBAC) and Secure Application Routes

**Subject:** Full Stack Development - II  
**Academic Year:** 2025–2026  
**Course Code:** FS-II  

---

## 1. Experiment Title
**Role-Based Access Control (RBAC) and Secure Application Routes with Server-Issued Session Management**

---

## 2. Aim
To implement a robust Role-Based Access Control (RBAC) system across the frontend (React + React Router) and backend (Node.js + Express) to secure application routes, conditionally render user interface components based on fine-grained permissions, and independently enforce authorization at the server boundary.

---

## 3. Objectives
- Understand the technical and conceptual distinctions between **Authentication (AuthN)** and **Authorization (AuthZ)**.
- Implement a server-issued mock session system using cryptographically random session tokens mapped in server memory (`Map<sessionToken, user>`).
- Enforce strict server-side authorization so that roles are never blindly trusted from client-side input or storage.
- Design centralized, synchronized permission definitions in both client (`client/src/config/permissions.js`) and server (`server/authorization.js`).
- Secure frontend routes using custom React Router guard components (`ProtectedRoute.jsx` and `RoleRoute.jsx`).
- Implement granular permission-based UI elements with `PermissionGate.jsx` for creating, editing, and deleting content.
- Differentiate between **HTTP 401 Unauthorized** (unauthenticated) and **HTTP 403 Forbidden** (authenticated but lacking role/permission).
- Build and verify comprehensive backend automated test suites (`test_rbac.js`) covering all roles, endpoints, and anti-spoofing checks.

---

## 4. Theory & Key Concepts

### 4.1 Authentication vs. Authorization
| Dimension | Authentication (AuthN) | Authorization (AuthZ) |
| :--- | :--- | :--- |
| **Core Question** | *"Who are you?"* | *"What are you allowed to do?"* |
| **Focus** | Identity verification | Permissions & access rights |
| **Mechanism** | Email/password, OTP, Biometrics, Tokens | Roles, ACLs, Policies, Permissions |
| **Execution Order** | Happens **first** | Happens **after** identity is established |
| **HTTP Status on Failure** | **401 Unauthorized** | **403 Forbidden** |

### 4.2 What is Role-Based Access Control (RBAC)?
RBAC is an access-control mechanism where access permissions are assigned to specific **roles**, and **users** are assigned one or more roles. Users do not acquire permissions directly; instead, their permissions are determined dynamically by their assigned role.

```
+-----------+        +--------------------+        +---------------------+
|   User    | -----> |   Assigned Role    | -----> | Granted Permissions |
| (Subject) |        | (Admin/Editor/...) |        | (create, edit, ...) |
+-----------+        +--------------------+        +---------------------+
```

### 4.3 Why Frontend Gating Is Not a Security Boundary
> **CRITICAL SECURITY PRINCIPLE:**  
> *"Frontend permission checks are primarily for user experience. They must not be treated as the security boundary. The backend independently authenticates the session and checks the user's role/permissions before allowing protected operations."*

Hiding a button or redirecting a route in React only prevents legitimate users from accidentally triggering unavailable options. Any malicious actor or inspection tool can forge an HTTP request or manipulate browser memory. Therefore, all security enforcement **must** occur authoritatively on the backend server.

### 4.4 HTTP 401 Unauthorized vs. HTTP 403 Forbidden
- **HTTP 401 Unauthorized:** The client request lacks valid authentication credentials. The user is unknown or unauthenticated (e.g., missing header, expired session, fake token).
- **HTTP 403 Forbidden:** The user's identity has been successfully authenticated by the server, but the user's assigned role lacks permission to access the requested resource or perform the specified operation.

---

## 5. Roles & Centralized Permission Matrix

### 5.1 Defined Roles
1. **Admin:** Master administrative user with full administrative and CRUD privileges.
2. **Editor:** Content creator with permissions to create and edit content and view reports. Cannot delete content or manage users.
3. **Viewer:** Read-only user with permissions to view the dashboard and published content.

### 5.2 Centralized Permission Mapping
Both `client/src/config/permissions.js` and `server/authorization.js` strictly maintain this mapping:

| Permission Key | Operation Description | Admin | Editor | Viewer |
| :--- | :--- | :---: | :---: | :---: |
| `view_dashboard` | Access main analytics dashboard | ✅ | ✅ | ✅ |
| `view_content` | View published articles & posts | ✅ | ✅ | ✅ |
| `create_content` | Create new content entries | ✅ | ✅ | ❌ |
| `edit_content` | Modify existing content entries | ✅ | ✅ | ❌ |
| `delete_content` | Permanently delete content items | ✅ | ❌ | ❌ |
| `view_reports` | Access analytics & audit reports | ✅ | ✅ | ❌ |
| `view_users` | View user directory list | ✅ | ❌ | ❌ |
| `manage_users` | Modify roles & user accounts | ✅ | ❌ | ❌ |

---

## 6. Architecture & Session Management Flow

### 6.1 Server-Issued Mock Session System
To prevent client-side privilege escalation:
1. The user logs in via `POST /api/login` with credentials.
2. The server verifies credentials against its mock database.
3. The server generates a cryptographically secure 64-character hex token using Node's `crypto.randomBytes(32).toString('hex')`.
4. The token is mapped server-side in an in-memory session store: `sessions.set(sessionToken, { id, email, role })`.
5. The token and safe user profile (without password) are returned to the client.
6. The client stores the token in `sessionStorage` and attaches `Authorization: Bearer <sessionToken>` to subsequent requests.
7. `authenticateSession` middleware looks up the token in `sessions`. If found, `req.user` is populated with the authoritative server-stored user object.
8. `authorizeRoles` and `authorizePermissions` inspect `req.user.role`. Any client-supplied header or payload role is ignored.

> **Note on Architecture:** This in-memory `Map` is an educational implementation of stateful sessions. In production, applications utilize persistent stores (e.g., Redis session stores) or stateless cryptographically signed tokens (e.g., JWT).

### 6.2 Visual RBAC Request Pipeline
```
User Request
    │
    ▼
[ authenticateSession ] ──(Invalid / Missing Token)──► 401 Unauthorized
    │
    ▼ (Valid Session Token)
Identify User & Role via req.user
    │
    ▼
[ authorizePermissions ] ──(Role Lacks Permission)──► 403 Forbidden
    │
    ▼ (Permission Granted)
Execute Controller Logic (HTTP 200 / 201)
```

---

## 7. Project Structure

```
experiment 3/1.3.2/
├── .gitignore
├── README.md
├── client/                     # Independent React 19 + Vite Frontend
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.jsx            # Mounts BrowserRouter & AuthProvider
│       ├── App.jsx             # Route definitions & guards
│       ├── index.css           # Modern Dark-Themed Vanilla CSS
│       ├── config/
│       │   └── permissions.js  # Centralized client permissions
│       ├── context/
│       │   └── AuthContext.jsx # Auth state, login/logout, session restoration
│       ├── components/
│       │   ├── Navbar.jsx          # Header with role locks & profile strip
│       │   ├── ProtectedRoute.jsx  # AuthN route guard (redirects to /login)
│       │   ├── RoleRoute.jsx       # AuthZ route guard (redirects to /unauthorized)
│       │   ├── PermissionGate.jsx  # Granular UI element rendering guard
│       │   └── RoleBadge.jsx       # Styled role pill component
│       └── pages/
│           ├── Login.jsx           # Sign in & instant demo switchboard
│           ├── Dashboard.jsx       # Identity card, RBAC diagram, interactive testbed
│           ├── Content.jsx         # CRUD content management with PermissionGate
│           ├── Reports.jsx         # KPI metrics & activity logs (Admin & Editor)
│           ├── Users.jsx           # User management directory (Admin only)
│           ├── AdminPanel.jsx      # Master system controls (Admin only)
│           └── Unauthorized.jsx    # 403 Access Denied informative page
│
└── server/                     # Independent Express Backend
    ├── .env.example
    ├── package.json
    ├── authorization.js        # Centralized RBAC middleware & session Map
    ├── server.js               # Express API endpoints with role guards
    └── test_rbac.js            # Comprehensive 12-test automated verification suite
```

---

## 8. Technologies Used
- **Frontend:**
  - **React 19:** Functional components, Context API, custom hooks.
  - **React Router 7:** Declarative client-side routing, protected and role-guarded routes.
  - **Vite 6:** Rapid ESM bundler and development server.
  - **Vanilla CSS:** Custom responsive design system with CSS custom properties, dark mode aesthetics, and micro-animations.
- **Backend:**
  - **Node.js:** Server runtime environment and `crypto` random token generation.
  - **Express 4:** REST API framework and middleware chaining.
  - **CORS:** Cross-Origin Resource Sharing configuration.

---

## 9. Demo Credentials

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` | Dashboard, Users, Content (All CRUD), Reports, Admin Panel |
| **Editor** | `editor@example.com` | `editor123` | Dashboard, Content (Create, Edit), Reports (No Delete, No Users) |
| **Viewer** | `viewer@example.com` | `viewer123` | Dashboard, Content (Read-Only) (All mutations & admin pages 403) |

---

## 10. API Endpoints Specification

| Method | Endpoint | Authentication | Required Authorization | Response on Success | Response on Denied |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/public` | None | Public | `200 OK` | N/A |
| `POST` | `/api/login` | None | Valid Credentials | `200 OK` (token + user) | `401 Unauthorized` |
| `POST` | `/api/logout` | Session Bearer | Authenticated | `200 OK` (session deleted) | `401 Unauthorized` |
| `GET` | `/api/dashboard` | Session Bearer | Admin, Editor, Viewer | `200 OK` | `401 Unauthorized` |
| `GET` | `/api/content` | Session Bearer | Admin, Editor, Viewer | `200 OK` | `401 Unauthorized` |
| `POST` | `/api/content` | Session Bearer | Admin, Editor (`create_content`) | `201 Created` | `403 Forbidden` |
| `PUT` | `/api/content/:id` | Session Bearer | Admin, Editor (`edit_content`) | `200 OK` | `403 Forbidden` |
| `DELETE` | `/api/content/:id` | Session Bearer | Admin only (`delete_content`) | `200 OK` | `403 Forbidden` |
| `GET` | `/api/reports` | Session Bearer | Admin, Editor (`view_reports`) | `200 OK` | `403 Forbidden` |
| `GET` | `/api/users` | Session Bearer | Admin only (`view_users`) | `200 OK` | `403 Forbidden` |
| `GET` | `/api/admin/system` | Session Bearer | Admin only (`Admin` role) | `200 OK` | `403 Forbidden` |

---

## 11. Installation & Execution Guide

### 11.1 Backend Setup
Open a terminal in `experiment 3/1.3.2/server`:
```bash
# 1. Navigate to server folder
cd "experiment 3/1.3.2/server"

# 2. Install dependencies
npm install

# 3. Run automated RBAC test verification suite
npm test

# 4. Start backend server (runs on port 5000)
npm start
```

### 11.2 Frontend Setup
Open a second terminal in `experiment 3/1.3.2/client`:
```bash
# 1. Navigate to client folder
cd "experiment 3/1.3.2/client"

# 2. Install dependencies
npm install

# 3. Verify production build
npm run build

# 4. Start Vite development server (runs on port 5173)
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 12. Verification & Automated Test Results

The automated test runner (`server/test_rbac.js`) verifies all 12 security requirements against a live Express server instance:

```text
====================================================
EXPERIMENT 1.3.2: RBAC BACKEND VERIFICATION SUITE
====================================================

[1/12] Testing GET /api/public (Unauthenticated)...
✓ PASS: GET /api/public accessible without authentication (HTTP 200).

[2/12] Testing Authentication & Session Generation...
✓ PASS: Invalid login rejected with HTTP 401.
✓ PASS: Valid login generated unique server-side session tokens for Admin, Editor, and Viewer.
✓ PASS: Missing and invalid session tokens correctly rejected with HTTP 401.

[3/12] Testing GET /api/dashboard for Admin, Editor, and Viewer...
✓ PASS: All three authenticated roles accessed Dashboard (HTTP 200).

[4/12] Testing GET /api/reports (Admin: 200, Editor: 200, Viewer: 403)...
✓ PASS: Reports authorized for Admin (200) and Editor (200), denied for Viewer (403 Forbidden).

[5/12] Testing GET /api/users (Admin: 200, Editor: 403, Viewer: 403)...
✓ PASS: Users directory authorized ONLY for Admin (200), denied for Editor & Viewer (403).

[6/12] Testing GET /api/admin/system (Admin: 200, Editor: 403, Viewer: 403)...
✓ PASS: Admin Control Panel authorized ONLY for Admin (200), denied for Editor & Viewer (403).

[7/12] Testing POST /api/content (Admin: 201, Editor: 201, Viewer: 403)...
✓ PASS: Content creation allowed for Admin & Editor (201), denied for Viewer (403).

[8/12] Testing PUT /api/content/:id (Admin: 200, Editor: 200, Viewer: 403)...
✓ PASS: Content editing allowed for Admin & Editor (200), denied for Viewer (403).

[9/12] Testing DELETE /api/content/:id (Admin: 200, Editor: 403, Viewer: 403)...
✓ PASS: Content deletion allowed ONLY for Admin (200), denied for Editor & Viewer (403).

[10/12] Anti-Spoofing Test: Client attempting to inject fake role in body/header...
✓ PASS: Server rejected client-side role spoofing attempts (header and body) with HTTP 403.

[11/12] Testing POST /api/logout session invalidation...
✓ PASS: Invalidated session token successfully rejected with HTTP 401.

[12/12] Verification Summary
====================================================
ALL 12 RBAC BACKEND TESTS PASSED SUCCESSFULLY!
====================================================
```

---

## 13. Security Considerations & Best Practices
1. **Never Trust Client-Side Roles:** Client-submitted roles via forms, headers, or local storage must never be used to evaluate authorization. The server queries its own session store using the verified session token.
2. **Session Token Entropy:** Tokens are created with 32 bytes of cryptographically secure pseudorandom data (`crypto.randomBytes`), preventing brute-force token enumeration.
3. **Fail-Closed Principle:** If a user or role is not explicitly mapped or granted a permission in `ROLE_PERMISSIONS`, access is denied by default (`403 Forbidden`).
4. **Session Invalidation:** When a user logs out, the backend immediately deletes the session token from memory (`sessions.delete(token)`), ensuring reused tokens fail immediately with `401 Unauthorized`.
5. **Separation of Concerns:** Route guards handle high-level page navigation, `PermissionGate` manages UI clarity, and backend middleware strictly enforces business-logic security.

---

## 14. Expected Output & UI Demonstration
- **Login Screen:** Provides credential inputs and 1-click demo role switches.
- **Dashboard Screen:** Highlights active user info, active session token, comparison cards for AuthN vs AuthZ, interactive security test switchboard, pipeline visualization, and the role-permission matrix.
- **Content Screen:** Renders articles with dynamically enabled/disabled Edit and Delete buttons governed by `PermissionGate`.
- **403 Unauthorized Screen:** Clearly explains why the user was denied access, shows current role and missing permission, and provides single-click navigation back to safety.

---

## 15. Learning Outcomes
Upon completing this experiment, students are able to:
1. Articulate the precise difference between Authentication (*"Who are you?"*) and Authorization (*"What are you allowed to do?"*).
2. Design and configure centralized Role-Based Access Control models across frontend and backend tiers.
3. Build declarative client-side route guards in React Router using Context-driven authorization states.
4. Implement secure, defense-in-depth Express middleware that rejects unauthenticated (401) and unauthorized (403) operations.
5. Defend applications against client-side role spoofing attacks by ensuring the backend remains the sole authority for privilege verification.

---

## 16. Conclusion / Result
Experiment 1.3.2 was successfully implemented and verified. The application demonstrates end-to-end Role-Based Access Control with server-issued session tokens, client-side route protection, granular permission-based UI rendering, and strict backend authorization enforcement.
