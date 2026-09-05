import { prisma } from "../config/database";
import { authService } from "../services/authService";
import { Role, Gender } from "@prisma/client";
import { app } from "../app";
import http from "http";
import bcrypt from "bcryptjs";

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

async function runPostgresVerification() {
  console.log("==================================================================");
  console.log("🐘 PROJECT SETU — PostgreSQL Live Database & Auth Verification");
  console.log("==================================================================\n");

  // 1. Direct Prisma & PostgreSQL Query Test
  console.log("📦 1. Verifying Database Connection & Table Schema in PostgreSQL...");
  const userCount = await prisma.user.count();
  const deptCount = await prisma.department.count();
  const categoryCount = await prisma.grievanceCategory.count();
  const serviceCount = await prisma.governmentService.count();

  console.log(`   - Total Users in PostgreSQL: ${userCount}`);
  console.log(`   - Total Departments in PostgreSQL: ${deptCount}`);
  console.log(`   - Total Categories in PostgreSQL: ${categoryCount}`);
  console.log(`   - Total Services in PostgreSQL: ${serviceCount}`);

  assert(userCount >= 5, "PostgreSQL contains at least 5 seeded users");
  assert(deptCount >= 6, "PostgreSQL contains master departments");
  assert(categoryCount >= 20, "PostgreSQL contains master grievance categories");
  assert(serviceCount >= 5, "PostgreSQL contains master government services");

  // Start HTTP server for integration testing
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const port = (server.address() as any).port;
  console.log(`\nHTTP Server listening for live tests on port: ${port}\n`);

  try {
    const timestamp = Date.now();
    const testEmail = `citizen.pg.${timestamp}@setu.gov.in`;
    const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testPassword = "Password@123";

    // 2. Test Real Citizen Registration in PostgreSQL
    console.log("📦 2. Testing Live Citizen Registration in PostgreSQL...");
    const regRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/register",
      body: {
        fullName: "Vikramaditya Singh",
        email: testEmail,
        phone: testPhone,
        password: testPassword,
        dateOfBirth: "1994-08-15",
        gender: "MALE",
        addressLine1: "Flat 402, Royal Residency, Connaught Place",
        city: "New Delhi",
        state: "Delhi NCT",
        pincode: "110001",
      },
    });

    assert(regRes.statusCode === 201, "Registration returns 201 Created", `Got ${regRes.statusCode}: ${JSON.stringify(regRes.body)}`);
    assert(regRes.body.success === true, "Registration response has success: true");
    assert(typeof regRes.body.data.token === "string", "Registration issued JWT token");

    // Verify record directly in PostgreSQL database table
    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { citizenProfile: true },
    });

    assert(dbUser !== null, "User was physically inserted into PostgreSQL 'users' table");
    assert(dbUser?.role === Role.CITIZEN, "User role is CITIZEN in PostgreSQL");
    assert(dbUser?.citizenProfile !== null, "User citizen_profiles row was created in PostgreSQL");
    assert(dbUser?.citizenProfile?.pincode === "110001", "CitizenProfile pincode correctly stored");

    // Verify Password Hashing
    const passwordIsHashed = Boolean(dbUser?.passwordHash && dbUser.passwordHash !== testPassword && dbUser.passwordHash.startsWith("$2"));
    assert(passwordIsHashed, "Password is encrypted with bcrypt hash (never plaintext)");
    const passwordMatches = await bcrypt.compare(testPassword, dbUser!.passwordHash);
    assert(passwordMatches, "Bcrypt hash validates correctly with original password");

    // 3. Test Live Login with Newly Created User via Email
    console.log("\n📦 3. Testing Live Login by Email in PostgreSQL...");
    const loginEmailRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/login",
      body: {
        identifier: testEmail,
        password: testPassword,
      },
    });

    assert(loginEmailRes.statusCode === 200, "Login by Email returns 200 OK");
    assert(loginEmailRes.body.data.user.email === testEmail, "Login returned correct user profile");
    const citizenToken = loginEmailRes.body.data.token;

    // 4. Test Live Login with Newly Created User via Mobile Number
    console.log("\n📦 4. Testing Live Login by Mobile Phone in PostgreSQL...");
    const loginPhoneRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/login",
      body: {
        identifier: testPhone,
        password: testPassword,
      },
    });

    assert(loginPhoneRes.statusCode === 200, "Login by Mobile Number returns 200 OK");
    assert(loginPhoneRes.body.data.user.email === testEmail, "Mobile login resolved to correct user");

    // 5. Test Live Login with Seeded Admin Account
    console.log("\n📦 5. Testing Live Login with Seeded Admin User in PostgreSQL...");
    const loginAdminRes = await makeRequest(server, {
      method: "POST",
      path: "/api/v1/auth/login",
      body: {
        identifier: "admin@setu.gov.in",
        password: "Password@123",
      },
    });

    assert(loginAdminRes.statusCode === 200, "Admin login returns 200 OK");
    assert(loginAdminRes.body.data.user.role === Role.ADMIN, "Admin user has ADMIN role");
    const adminToken = loginAdminRes.body.data.token;

    // 6. Test Protected Endpoint /api/v1/auth/me
    console.log("\n📦 6. Testing Protected Route /api/v1/auth/me with Real Database Record...");
    const meRes = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/auth/me",
      token: citizenToken,
    });

    assert(meRes.statusCode === 200, "GET /api/v1/auth/me returns 200 OK");
    assert(meRes.body.data.email === testEmail, "Profile contains correct email");
    assert(meRes.body.data.citizenProfile !== null, "Profile includes citizenProfile data");

    // 7. Test RBAC Routes with Real Database Tokens
    console.log("\n📦 7. Testing RBAC Role Separation with Real Database Tokens...");
    const citizenOnAdminRoute = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/test/rbac/admin-only",
      token: citizenToken,
    });
    assert(citizenOnAdminRoute.statusCode === 403, "Citizen cannot access Admin route (403 Forbidden)");

    const adminOnAdminRoute = await makeRequest(server, {
      method: "GET",
      path: "/api/v1/test/rbac/admin-only",
      token: adminToken,
    });
    assert(adminOnAdminRoute.statusCode === 200, "Admin can access Admin route (200 OK)");

    // Clean up test user
    await prisma.user.delete({ where: { id: dbUser!.id } });
    console.log("\n🧹 Test user cleaned up from PostgreSQL database.");

  } finally {
    server.close();
    await prisma.$disconnect();
  }

  // Summary
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log("\n==================================================================");
  console.log(`📊 POSTGRESQL VERIFICATION: ${passed}/${total} Tests Passed (${failed} Failed)`);
  console.log("==================================================================");

  if (failed > 0) {
    console.error("❌ Some live database tests failed!");
    process.exit(1);
  } else {
    console.log("🎉 All live PostgreSQL database & authentication tests passed!");
    process.exit(0);
  }
}

runPostgresVerification().catch((err) => {
  console.error("❌ Live PostgreSQL verification exception:", err);
  process.exit(1);
});
