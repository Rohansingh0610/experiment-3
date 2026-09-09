# Full Stack Development - II: Experiment 3

**Academic Year:** 2025–2026  
**Subject Code:** FS-II  
**Repository:** `experiment-3`

This repository contains the complete, production-grade implementations for **Experiment 3** of the Full Stack Development - II curriculum.

---

## 📁 Repository Structure

```
experiment 3/
├── .gitignore
├── README.md                    # Root overview
├── 1.3.1/                       # Experiment 1.3.1: JWT Authentication
│   ├── README.md
│   ├── client/                  # React 19 + Vite + Vanilla CSS
│   └── server/                  # Node.js + Express + JSON Web Tokens (jsonwebtoken)
└── 1.3.2/                       # Experiment 1.3.2: Role-Based Access Control (RBAC)
    ├── README.md
    ├── client/                  # React 19 + React Router 7 + Context API + RBAC UI
    └── server/                  # Node.js + Express + Server-Side Session Map + RBAC Guards
```

---

## 🔬 Sub-Experiments Overview

### 1. [Experiment 1.3.1: Secure Authentication Using JSON Web Tokens (JWT)](./1.3.1/README.md)
- **Aim:** To design and implement a secure authentication system using JSON Web Tokens (JWT) for user login and stateless session management.
- **Key Features:**
  - Stateless cryptographic authentication with `jsonwebtoken`.
  - Secret key isolation via environment variables (`JWT_SECRET`).
  - Standard `Authorization: Bearer <token>` header transmission.
  - Express verification middleware (`verifyToken`) rejecting missing, expired, or tampered tokens with HTTP 401.
  - Interactive JWT Inspector with visual decoding of Header, Payload, and Signature.
  - Client route protection with React Router.
- **Tech Stack:** React 19, Vite, Express, `jsonwebtoken`.

### 2. [Experiment 1.3.2: Role-Based Access Control (RBAC) and Secure Application Routes](./1.3.2/README.md)
- **Aim:** To implement Role-Based Access Control (RBAC) and secure application routes based on user permissions.
- **Key Features:**
  - Clear distinction between Authentication (*"Who are you?"*) and Authorization (*"What are you allowed to do?"*).
  - Server-issued mock session tokens generated with `crypto.randomBytes(32).toString('hex')` mapped in-memory (`Map<sessionToken, user>`).
  - Strict anti-spoofing defense: the backend never trusts client-supplied roles.
  - Centralized permission definitions synchronized between client and server.
  - Three distinct roles: **Admin**, **Editor**, and **Viewer** with fine-grained capability matrices.
  - Declarative client route protection (`ProtectedRoute.jsx`, `RoleRoute.jsx`).
  - Granular UI visibility and action controls using `PermissionGate.jsx`.
  - Dedicated **403 Access Denied** page and interactive "Try Unauthorized Access" testing switchboard.
  - Full automated backend verification suite (`test_rbac.js`) passing 12/12 security tests.
- **Tech Stack:** React 19, React Router 7, Vite, Express, Vanilla CSS.

---

## 🚀 Quick Start Guide

### Running Experiment 1.3.1 (JWT)
```bash
# Backend
cd "1.3.1/server"
npm install
npm test
npm start

# Frontend
cd "1.3.1/client"
npm install
npm run dev
```

### Running Experiment 1.3.2 (RBAC)
```bash
# Backend
cd "1.3.2/server"
npm install
npm test
npm start

# Frontend
cd "1.3.2/client"
npm install
npm run dev
```

---

## 🔒 Security Principles Demonstrated
1. **Defense-in-Depth:** Frontend route guards and button hiding are for user experience; backend middleware authoritatively enforces all permissions.
2. **Proper HTTP Status Codes:** 
   - `401 Unauthorized`: Unauthenticated / invalid session.
   - `403 Forbidden`: Authenticated, but lacking sufficient role or permission.
3. **Fail-Closed Security:** Unmapped permissions or unrecognized roles default to access denied.
