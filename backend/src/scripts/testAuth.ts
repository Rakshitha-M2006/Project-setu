import { app } from "../app";
import { authService } from "../services/authService";
import { userRepository } from "../repositories/userRepository";
import { Role, Gender } from "@prisma/client";
import http from "http";

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, failureDetails?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    results.push({ name: testName, passed: true });
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${failureDetails || "Assertion failed"}`);
    results.push({ name: testName, passed: false, details: failureDetails });
  }
}

// In-memory user store for mock database simulation during isolated testing
const mockUserDb: Map<string, any> = new Map();

// Mock UserRepository methods
userRepository.findByEmail = async (email: string) => {
  for (const u of mockUserDb.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return u;
    }
  }
  return null;
};

userRepository.findByPhone = async (phone: string) => {
  const cleanPhone = phone.trim();
  for (const u of mockUserDb.values()) {
    if (u.phone === cleanPhone || (u.phone && cleanPhone.endsWith(u.phone.replace("+91", "")))) {
      return u;
    }
  }
  return null;
};

userRepository.findByIdentifier = async (identifier: string) => {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return userRepository.findByEmail(trimmed);
  }
  return userRepository.findByPhone(trimmed);
};

userRepository.findById = async (id: string) => {
  return mockUserDb.get(id) || null;
};

userRepository.createCitizen = async (input: any) => {
  const newUser = {
    id: `usr-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    email: input.email,
    passwordHash: input.passwordHash,
    fullName: input.fullName,
    phone: input.phone || null,
    role: Role.CITIZEN,
    isActive: true,
    isEmailVerified: false,
    isPhoneVerified: false,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    citizenProfile: {
      id: `prof-cit-${Date.now()}`,
      userId: `usr-test-${Date.now()}`,
      aadhaarHash: input.aadhaarHash || null,
      gender: input.gender || null,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      addressLine1: input.addressLine1 || null,
      addressLine2: input.addressLine2 || null,
      pincode: input.pincode || null,
      locationId: input.locationId || null,
      occupation: input.occupation || null,
      emergencyContact: input.emergencyContact || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      location: null,
    },
    officerProfile: null,
  };
  mockUserDb.set(newUser.id, newUser);
  return newUser;
};

userRepository.updateLastLogin = async (userId: string) => {
  const user = mockUserDb.get(userId);
  if (user) {
    user.lastLoginAt = new Date();
  }
  return user as any;
};

// Simple HTTP request helper against the in-memory app instance
function makeRequest(
  server: http.Server,
  options: {
    method: string;
    path: string;
    body?: any;
    token?: string;
  }
): Promise<{ statusCode: number; body: any }> {
  return new Promise((resolve, reject) => {
    const port = (server.address() as any).port;
    const postData = options.body ? JSON.stringify(options.body) : "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData).toString(),
    };

    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: options.path,
        method: options.method,
        headers,
      },
      (res) => {
        let responseData = "";
        res.on("data", (chunk) => {
          responseData += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({ statusCode: res.statusCode || 500, body: parsed });
          } catch {
            resolve({ statusCode: res.statusCode || 500, body: responseData });
          }
        });
      }
    );

    req.on("error", (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runAuthTestSuite() {
  console.log("===============================================================");
  console.log("🧪 PROJECT SETU - Automated Authentication & RBAC Test Suite");
  console.log("===============================================================\n");

  // Start temporary test server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const port = (server.address() as any).port;
  console.log(`Test HTTP server running on ephemeral port: ${port}\n`);

  try {
    const timestamp = Date.now();
    const testCitizenEmail = `test.citizen.${timestamp}@setu.gov.in`;
    const testCitizenPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testCitizenPassword = "SecurePassword@2026";

    // -------------------------------------------------------------------------
    // TEST 1: Unit Test - Password Hashing & JWT Token Generation
    // -------------------------------------------------------------------------
    console.log("📦 1. Unit Level: Cryptographic Hashing & JWT Verification");
    const hash = await authService.hashPassword("MySecretPass123");
    const isMatch = await authService.comparePassword("MySecretPass123", hash);
    const isBadMatch = await authService.comparePassword("WrongPass999", hash);
    assert(isMatch === true, "Password hashing produces verifiable bcrypt hash");
    assert(isBadMatch === false, "Incorrect password fails bcrypt comparison");

    const token = authService.generateToken({
      id: "usr-test-unit",
      email: "test@unit.gov.in",
      role: Role.CITIZEN,
      fullName: "Unit Tester",
      departmentId: null,
    });
    const decoded = authService.verifyToken(token);
    assert(decoded.id === "usr-test-unit" && decoded.role === Role.CITIZEN, "JWT token signs and verifies correctly");

    // -------------------------------------------------------------------------
    // TEST 2: Valid Citizen Registration with all 11 compulsory fields
    // -------------------------------------------------------------------------
    console.log("\n📦 2. Integration: Citizen Registration (POST /api/v1/auth/register)");
    const regRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/register",
      body: {
        fullName: "Aarav Sharma",
        email: testCitizenEmail,
        phone: testCitizenPhone,
        password: testCitizenPassword,
        dateOfBirth: "1995-05-12",
        gender: "MALE",
        addressLine1: "123 Civic Lane, Sector 4",
        city: "New Delhi",
        state: "Delhi NCT",
        pincode: "110001",
      },
    });

    assert(regRes.statusCode === 201, "Registration returns 201 Created", `Got ${regRes.statusCode}`);
    assert(regRes.body.success === true, "Response JSON has success: true");
    assert(typeof regRes.body.data.token === "string", "Response returns JWT access token");
    assert(regRes.body.data.user.email === testCitizenEmail, "Response returns registered citizen email");
    assert(regRes.body.data.user.role === Role.CITIZEN, "User is assigned CITIZEN role automatically");
    assert(regRes.body.data.user.passwordHash === undefined, "Password hash is NOT exposed in response");

    const citizenToken = regRes.body.data.token;

    // -------------------------------------------------------------------------
    // TEST 3: Duplicate Email Prevention
    // -------------------------------------------------------------------------
    console.log("\n📦 3. Edge Case: Duplicate Email Prevention");
    const dupEmailRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/register",
      body: {
        fullName: "Imposter User",
        email: testCitizenEmail, // Duplicate
        phone: "9876543299",
        password: "AnotherPassword@123",
        dateOfBirth: "1990-01-01",
        gender: "FEMALE",
        addressLine1: "456 Imposter Road",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
    });

    assert(dupEmailRes.statusCode === 409, "Duplicate email registration returns 409 Conflict", `Got ${dupEmailRes.statusCode}`);
    assert(dupEmailRes.body.success === false, "Duplicate email response has success: false");

    // -------------------------------------------------------------------------
    // TEST 4: Duplicate Phone Prevention
    // -------------------------------------------------------------------------
    console.log("\n📦 4. Edge Case: Duplicate Mobile Phone Prevention");
    const dupPhoneRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/register",
      body: {
        fullName: "Duplicate Phone User",
        email: `unique.email.${timestamp}@setu.gov.in`,
        phone: testCitizenPhone, // Duplicate phone
        password: "AnotherPassword@123",
        dateOfBirth: "1992-02-02",
        gender: "OTHER",
        addressLine1: "789 Other Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
      },
    });

    assert(dupPhoneRes.statusCode === 409, "Duplicate phone registration returns 409 Conflict", `Got ${dupPhoneRes.statusCode}`);

    // -------------------------------------------------------------------------
    // TEST 5: Input Validation (Missing compulsory fields / Invalid formats)
    // -------------------------------------------------------------------------
    console.log("\n📦 5. Input Validation: Missing Compulsory Fields & Short Passwords");
    const invalidInputRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/register",
      body: {
        email: "not-an-email",
        password: "123", // Too short
        fullName: "",
        phone: "12345", // Invalid phone
        pincode: "000000", // Invalid PIN code
      },
    });

    assert(invalidInputRes.statusCode === 422, "Invalid input returns 422 Unprocessable Entity", `Got ${invalidInputRes.statusCode}`);
    assert(Array.isArray(invalidInputRes.body.errors), "Validation errors array returned in response");

    // -------------------------------------------------------------------------
    // TEST 6: Valid Login (By Email & By Mobile Number)
    // -------------------------------------------------------------------------
    console.log("\n📦 6. Authentication: Login by Email & by Mobile Number");
    // 6.1 By Email
    const loginEmailRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/login",
      body: {
        identifier: testCitizenEmail,
        password: testCitizenPassword,
      },
    });

    assert(loginEmailRes.statusCode === 200, "Valid login by Email returns 200 OK", `Got ${loginEmailRes.statusCode}`);
    assert(typeof loginEmailRes.body.data.token === "string", "Email login returns JWT access token");
    assert(loginEmailRes.body.data.user.role === Role.CITIZEN, "Logged in user has CITIZEN role");

    // 6.2 By Mobile Number
    const loginPhoneRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/login",
      body: {
        identifier: testCitizenPhone,
        password: testCitizenPassword,
      },
    });

    assert(loginPhoneRes.statusCode === 200, "Valid login by Mobile Number returns 200 OK", `Got ${loginPhoneRes.statusCode}`);
    assert(typeof loginPhoneRes.body.data.token === "string", "Mobile login returns JWT access token");

    // -------------------------------------------------------------------------
    // TEST 7: Invalid Login (Bad Password / Unknown User)
    // -------------------------------------------------------------------------
    console.log("\n📦 7. Security: Invalid Password & Non-existent User Login");
    const badPassRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/login",
      body: {
        identifier: testCitizenEmail,
        password: "WrongPassword@999",
      },
    });
    assert(badPassRes.statusCode === 401, "Wrong password returns 401 Unauthorized", `Got ${badPassRes.statusCode}`);

    const unknownUserRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/login",
      body: {
        identifier: "ghost.user@setu.gov.in",
        password: "SomePassword@123",
      },
    });
    assert(unknownUserRes.statusCode === 401, "Non-existent user returns 401 Unauthorized", `Got ${unknownUserRes.statusCode}`);

    // -------------------------------------------------------------------------
    // TEST 8: Protected Endpoint (GET /api/v1/auth/me)
    // -------------------------------------------------------------------------
    console.log("\n📦 8. Protected Endpoint: Current Profile (GET /api/v1/auth/me)");
    const meRes = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/auth/me",
      token: citizenToken,
    });
    assert(meRes.statusCode === 200, "Authorized GET /me returns 200 OK", `Got ${meRes.statusCode}`);
    assert(meRes.body.data.email === testCitizenEmail, "Profile contains authenticated user email");
    assert(meRes.body.data.citizenProfile !== null, "Profile includes attached citizenProfile");

    // Test with NO token
    const noTokenRes = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/auth/me",
    });
    assert(noTokenRes.statusCode === 401, "GET /me with no token returns 401 Unauthorized", `Got ${noTokenRes.statusCode}`);

    // Test with bogus token
    const bogusTokenRes = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/auth/me",
      token: "invalid.jwt.token.string",
    });
    assert(bogusTokenRes.statusCode === 401, "GET /me with bogus token returns 401 Unauthorized", `Got ${bogusTokenRes.statusCode}`);

    // -------------------------------------------------------------------------
    // TEST 9: Role-Based Authorization (requireRole & requireAnyRole)
    // -------------------------------------------------------------------------
    console.log("\n📦 9. Role-Based Access Control (RBAC) Enforcement");

    // Generate tokens for each role to test boundaries
    const officerToken = authService.generateToken({
      id: "usr-officer-test",
      email: "officer@setu.gov.in",
      role: Role.OFFICER,
      fullName: "Officer Test",
      departmentId: "dept-water",
    });

    const seniorOfficerToken = authService.generateToken({
      id: "usr-senior-test",
      email: "senior@setu.gov.in",
      role: Role.SENIOR_OFFICER,
      fullName: "Senior Officer Test",
      departmentId: "dept-power",
    });

    const adminToken = authService.generateToken({
      id: "usr-admin-test",
      email: "admin@setu.gov.in",
      role: Role.ADMIN,
      fullName: "Admin Test",
      departmentId: null,
    });

    // 9.1 Citizen accessing Citizen area -> Allowed
    const citOnCit = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/test/rbac/citizen-only",
      token: citizenToken,
    });
    assert(citOnCit.statusCode === 200, "Citizen can access Citizen-only route (200 OK)");

    // 9.2 Citizen accessing Officer area -> FORBIDDEN (403)
    const citOnOff = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/test/rbac/officer-only",
      token: citizenToken,
    });
    assert(citOnOff.statusCode === 403, "Citizen cannot access Officer route (403 Forbidden)", `Got ${citOnOff.statusCode}`);

    // 9.3 Citizen accessing Admin area -> FORBIDDEN (403)
    const citOnAdmin = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/test/rbac/admin-only",
      token: citizenToken,
    });
    assert(citOnAdmin.statusCode === 403, "Citizen cannot access Admin route (403 Forbidden)", `Got ${citOnAdmin.statusCode}`);

    // 9.4 Officer accessing Officer area -> Allowed
    const offOnOff = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/test/rbac/officer-only",
      token: officerToken,
    });
    assert(offOnOff.statusCode === 200, "Officer can access Officer route (200 OK)");

    // 9.5 Senior Officer accessing Officer area -> Allowed
    const senOnOff = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/test/rbac/officer-only",
      token: seniorOfficerToken,
    });
    assert(senOnOff.statusCode === 200, "Senior Officer can access Officer route (200 OK)");

    // 9.6 Officer accessing Admin area -> FORBIDDEN (403)
    const offOnAdmin = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/test/rbac/admin-only",
      token: officerToken,
    });
    assert(offOnAdmin.statusCode === 403, "Officer cannot access Admin route (403 Forbidden)", `Got ${offOnAdmin.statusCode}`);

    // 9.7 Admin accessing Admin area -> Allowed
    const adminOnAdmin = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/test/rbac/admin-only",
      token: adminToken,
    });
    assert(adminOnAdmin.statusCode === 200, "Admin can access Admin route (200 OK)");

    // -------------------------------------------------------------------------
    // TEST 10: Logout Endpoint
    // -------------------------------------------------------------------------
    console.log("\n📦 10. Logout Endpoint (POST /api/v1/auth/logout)");
    const logoutRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/logout",
      token: citizenToken,
    });
    assert(logoutRes.statusCode === 200, "Logout returns 200 OK with session termination acknowledgement");

  } finally {
    server.close();
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log("\n===============================================================");
  console.log(`📊 TEST RESULTS: ${passed}/${total} Passed (${failed} Failed)`);
  console.log("===============================================================");

  if (failed > 0) {
    console.error("❌ Some tests failed!");
    process.exit(1);
  } else {
    console.log("🎉 All Authentication & RBAC security tests passed successfully!");
    process.exit(0);
  }
}

runAuthTestSuite().catch((err) => {
  console.error("Test Suite execution exception:", err);
  process.exit(1);
});
