import app from './server.js';

const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}`;

console.log('====================================================');
console.log('EXPERIMENT 1.3.1: JWT BACKEND VERIFICATION TEST');
console.log('====================================================\n');

// Start temporary test server
const server = app.listen(TEST_PORT, async () => {
  try {
    // TEST 1: Invalid credentials return HTTP 401
    console.log('[1/8] Testing POST /api/login with invalid credentials...');
    const invalidLoginRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@example.com', password: 'wrongpassword' }),
    });
    if (invalidLoginRes.status !== 401) {
      throw new Error(`Expected HTTP 401, received ${invalidLoginRes.status}`);
    }
    console.log('✓ PASS: Invalid credentials correctly rejected with HTTP 401.');

    // TEST 2 & 3: Valid credentials return HTTP 200 with JWT
    console.log('\n[2/8] Testing POST /api/login with valid credentials...');
    const validLoginRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'password123' }),
    });
    if (validLoginRes.status !== 200) {
      throw new Error(`Expected HTTP 200, received ${validLoginRes.status}`);
    }
    const loginData = await validLoginRes.json();
    if (!loginData.token || typeof loginData.token !== 'string') {
      throw new Error('Valid login did not return a JWT token string');
    }
    const validToken = loginData.token;
    console.log('✓ PASS: Valid login returned HTTP 200 with signed JWT token.');

    // Verify token structure has 3 parts: header.payload.signature
    const parts = validToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Generated token does not have 3 parts (header.payload.signature)');
    }
    console.log('✓ PASS: JWT structure verified (3 segments: Header.Payload.Signature).');

    // TEST 4: Missing Authorization header returns HTTP 401
    console.log('\n[3/8] Testing protected route without Authorization header...');
    const noAuthRes = await fetch(`${BASE_URL}/api/profile`);
    if (noAuthRes.status !== 401) {
      throw new Error(`Expected HTTP 401 for missing header, received ${noAuthRes.status}`);
    }
    console.log('✓ PASS: Missing Authorization header rejected with HTTP 401.');

    // TEST 5: Malformed Authorization header returns HTTP 401
    console.log('\n[4/8] Testing protected route with malformed Authorization header...');
    const malformedRes = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `InvalidFormat ${validToken}` },
    });
    if (malformedRes.status !== 401) {
      throw new Error(`Expected HTTP 401 for malformed header, received ${malformedRes.status}`);
    }
    console.log('✓ PASS: Malformed header format rejected with HTTP 401.');

    // TEST 6: Tampered token returns HTTP 401
    console.log('\n[5/8] Testing protected route with tampered token...');
    const tamperedToken = validToken.slice(0, -5) + 'XXXXX';
    const tamperedRes = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${tamperedToken}` },
    });
    if (tamperedRes.status !== 401) {
      throw new Error(`Expected HTTP 401 for tampered signature, received ${tamperedRes.status}`);
    }
    console.log('✓ PASS: Tampered token signature rejected with HTTP 401.');

    // TEST 7: Valid token allows GET /api/profile
    console.log('\n[6/8] Testing GET /api/profile with valid JWT...');
    const profileRes = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    if (profileRes.status !== 200) {
      throw new Error(`Expected HTTP 200 for valid profile request, received ${profileRes.status}`);
    }
    const profileData = await profileRes.json();
    if (!profileData.verifiedByServer || profileData.user.email !== 'student@example.com') {
      throw new Error('Profile response payload does not match authenticated user');
    }
    console.log('✓ PASS: Valid JWT authorized access to /api/profile.');

    // TEST 8: Valid token allows GET /api/dashboard
    console.log('\n[7/8] Testing GET /api/dashboard with valid JWT...');
    const dashboardRes = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    if (dashboardRes.status !== 200) {
      throw new Error(`Expected HTTP 200 for valid dashboard request, received ${dashboardRes.status}`);
    }
    const dashboardData = await dashboardRes.json();
    if (!dashboardData.data || !dashboardData.data.enrolledCourse) {
      throw new Error('Dashboard response payload missing protected course data');
    }
    console.log('✓ PASS: Valid JWT authorized access to protected /api/dashboard.');

    console.log('\n[8/8] Verification Summary');
    console.log('====================================================');
    console.log('ALL JWT BACKEND TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    server.close();
    process.exit(1);
  }
});
