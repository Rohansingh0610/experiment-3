import app from './server.js';

const TEST_PORT = 5066;
const BASE_URL = `http://localhost:${TEST_PORT}`;

console.log('====================================================');
console.log('EXPERIMENT 1.3.2: RBAC BACKEND VERIFICATION SUITE');
console.log('====================================================\n');

const server = app.listen(TEST_PORT, async () => {
  try {
    // 1. Public Endpoint
    console.log('[1/12] Testing GET /api/public (Unauthenticated)...');
    const pubRes = await fetch(`${BASE_URL}/api/public`);
    if (pubRes.status !== 200) throw new Error(`GET /api/public returned ${pubRes.status}`);
    console.log('✓ PASS: GET /api/public accessible without authentication (HTTP 200).');

    // 2. Authentication Checks
    console.log('\n[2/12] Testing Authentication & Session Generation...');
    const invalidLogin = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'wrong' }),
    });
    if (invalidLogin.status !== 401) throw new Error(`Expected 401 for invalid login, got ${invalidLogin.status}`);
    console.log('✓ PASS: Invalid login rejected with HTTP 401.');

    // Login Admin
    const adminRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.sessionToken;

    // Login Editor
    const editorRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'editor@example.com', password: 'editor123' }),
    });
    const editorData = await editorRes.json();
    const editorToken = editorData.sessionToken;

    // Login Viewer
    const viewerRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@example.com', password: 'viewer123' }),
    });
    const viewerData = await viewerRes.json();
    const viewerToken = viewerData.sessionToken;

    if (!adminToken || !editorToken || !viewerToken) {
      throw new Error('Failed to obtain session tokens for demo users');
    }
    console.log('✓ PASS: Valid login generated unique server-side session tokens for Admin, Editor, and Viewer.');

    // Missing & Invalid Session Tokens
    const noTokenRes = await fetch(`${BASE_URL}/api/dashboard`);
    if (noTokenRes.status !== 401) throw new Error('Missing token did not return 401');
    const fakeTokenRes = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { Authorization: 'Bearer fake_random_invalid_token' },
    });
    if (fakeTokenRes.status !== 401) throw new Error('Invalid token did not return 401');
    console.log('✓ PASS: Missing and invalid session tokens correctly rejected with HTTP 401.');

    // 3. Dashboard Route (All Authenticated Roles)
    console.log('\n[3/12] Testing GET /api/dashboard for Admin, Editor, and Viewer...');
    const dashAdmin = await fetch(`${BASE_URL}/api/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const dashEditor = await fetch(`${BASE_URL}/api/dashboard`, { headers: { Authorization: `Bearer ${editorToken}` } });
    const dashViewer = await fetch(`${BASE_URL}/api/dashboard`, { headers: { Authorization: `Bearer ${viewerToken}` } });
    if (dashAdmin.status !== 200 || dashEditor.status !== 200 || dashViewer.status !== 200) {
      throw new Error('Dashboard was denied to an authenticated role');
    }
    console.log('✓ PASS: All three authenticated roles accessed Dashboard (HTTP 200).');

    // 4. Reports Route (Admin: 200, Editor: 200, Viewer: 403)
    console.log('\n[4/12] Testing GET /api/reports (Admin: 200, Editor: 200, Viewer: 403)...');
    const repAdmin = await fetch(`${BASE_URL}/api/reports`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const repEditor = await fetch(`${BASE_URL}/api/reports`, { headers: { Authorization: `Bearer ${editorToken}` } });
    const repViewer = await fetch(`${BASE_URL}/api/reports`, { headers: { Authorization: `Bearer ${viewerToken}` } });
    if (repAdmin.status !== 200) throw new Error(`Admin reports failed: ${repAdmin.status}`);
    if (repEditor.status !== 200) throw new Error(`Editor reports failed: ${repEditor.status}`);
    if (repViewer.status !== 403) throw new Error(`Viewer should be 403, got: ${repViewer.status}`);
    console.log('✓ PASS: Reports authorized for Admin (200) and Editor (200), denied for Viewer (403 Forbidden).');

    // 5. Users Route (Admin: 200, Editor: 403, Viewer: 403)
    console.log('\n[5/12] Testing GET /api/users (Admin: 200, Editor: 403, Viewer: 403)...');
    const usrAdmin = await fetch(`${BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const usrEditor = await fetch(`${BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${editorToken}` } });
    const usrViewer = await fetch(`${BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${viewerToken}` } });
    if (usrAdmin.status !== 200) throw new Error(`Admin users failed: ${usrAdmin.status}`);
    if (usrEditor.status !== 403) throw new Error(`Editor users should be 403, got: ${usrEditor.status}`);
    if (usrViewer.status !== 403) throw new Error(`Viewer users should be 403, got: ${usrViewer.status}`);
    console.log('✓ PASS: Users directory authorized ONLY for Admin (200), denied for Editor & Viewer (403).');

    // 6. Admin Panel / System Route
    console.log('\n[6/12] Testing GET /api/admin/system (Admin: 200, Editor: 403, Viewer: 403)...');
    const sysAdmin = await fetch(`${BASE_URL}/api/admin/system`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const sysEditor = await fetch(`${BASE_URL}/api/admin/system`, { headers: { Authorization: `Bearer ${editorToken}` } });
    const sysViewer = await fetch(`${BASE_URL}/api/admin/system`, { headers: { Authorization: `Bearer ${viewerToken}` } });
    if (sysAdmin.status !== 200 || sysEditor.status !== 403 || sysViewer.status !== 403) {
      throw new Error('Admin system route permission enforcement failed');
    }
    console.log('✓ PASS: Admin Control Panel authorized ONLY for Admin (200), denied for Editor & Viewer (403).');

    // 7. Content Creation (Admin: 201, Editor: 201, Viewer: 403)
    console.log('\n[7/12] Testing POST /api/content (Admin: 201, Editor: 201, Viewer: 403)...');
    const createPayload = { title: 'Test RBAC Content', category: 'Security' };
    const createAdmin = await fetch(`${BASE_URL}/api/content`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    });
    const createEditor = await fetch(`${BASE_URL}/api/content`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${editorToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    });
    const createViewer = await fetch(`${BASE_URL}/api/content`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${viewerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    });
    if (createAdmin.status !== 201 || createEditor.status !== 201 || createViewer.status !== 403) {
      throw new Error(`Content creation failed status checks: Admin=${createAdmin.status}, Editor=${createEditor.status}, Viewer=${createViewer.status}`);
    }
    console.log('✓ PASS: Content creation allowed for Admin & Editor (201), denied for Viewer (403).');

    // 8. Content Edit (Admin: 200, Editor: 200, Viewer: 403)
    console.log('\n[8/12] Testing PUT /api/content/:id (Admin: 200, Editor: 200, Viewer: 403)...');
    const editPayload = { title: 'Updated Title' };
    const editAdmin = await fetch(`${BASE_URL}/api/content/1`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(editPayload),
    });
    const editEditor = await fetch(`${BASE_URL}/api/content/1`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${editorToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(editPayload),
    });
    const editViewer = await fetch(`${BASE_URL}/api/content/1`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${viewerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(editPayload),
    });
    if (editAdmin.status !== 200 || editEditor.status !== 200 || editViewer.status !== 403) {
      throw new Error(`Content edit failed status checks: Admin=${editAdmin.status}, Editor=${editEditor.status}, Viewer=${editViewer.status}`);
    }
    console.log('✓ PASS: Content editing allowed for Admin & Editor (200), denied for Viewer (403).');

    // 9. Content Delete (Admin: 200, Editor: 403, Viewer: 403)
    console.log('\n[9/12] Testing DELETE /api/content/:id (Admin: 200, Editor: 403, Viewer: 403)...');
    const delEditor = await fetch(`${BASE_URL}/api/content/2`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${editorToken}` },
    });
    const delViewer = await fetch(`${BASE_URL}/api/content/2`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    const delAdmin = await fetch(`${BASE_URL}/api/content/2`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (delEditor.status !== 403 || delViewer.status !== 403 || delAdmin.status !== 200) {
      throw new Error(`Content delete status check failed: Editor=${delEditor.status}, Viewer=${delViewer.status}, Admin=${delAdmin.status}`);
    }
    console.log('✓ PASS: Content deletion allowed ONLY for Admin (200), denied for Editor & Viewer (403).');

    // 10. Anti-Spoofing Security Test
    console.log('\n[10/12] Anti-Spoofing Test: Client attempting to inject fake role in body/header...');
    // 10a: Header spoofing attempt on GET /api/users
    const headerSpoofAttempt = await fetch(`${BASE_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${viewerToken}`,
        'x-user-role': 'Admin',
      },
    });
    if (headerSpoofAttempt.status !== 403) {
      throw new Error(`CRITICAL SECURITY FAILURE: Client spoofed role via header! Status was ${headerSpoofAttempt.status}`);
    }

    // 10b: Body spoofing attempt on POST /api/content
    const bodySpoofAttempt = await fetch(`${BASE_URL}/api/content`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${viewerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Hacked Post',
        author: 'Malicious Viewer',
        role: 'Admin', // Fake role injected into body
        userRole: 'Admin',
      }),
    });
    if (bodySpoofAttempt.status !== 403) {
      throw new Error(`CRITICAL SECURITY FAILURE: Client spoofed role via body! Status was ${bodySpoofAttempt.status}`);
    }
    console.log('✓ PASS: Server rejected client-side role spoofing attempts (header and body) with HTTP 403.');

    // 11. Logout & Session Invalidation
    console.log('\n[11/12] Testing POST /api/logout session invalidation...');
    const logoutRes = await fetch(`${BASE_URL}/api/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    if (logoutRes.status !== 200) throw new Error('Logout failed');
    const reuseAttempt = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    if (reuseAttempt.status !== 401) {
      throw new Error('Invalidated session token was accepted!');
    }
    console.log('✓ PASS: Invalidated session token successfully rejected with HTTP 401.');

    console.log('\n[12/12] Verification Summary');
    console.log('====================================================');
    console.log('ALL 12 RBAC BACKEND TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    server.close();
    process.exit(1);
  }
});
