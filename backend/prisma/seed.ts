import { PrismaClient, Role, Priority, GrievanceStatus, EscalationLevel, EscalationStatus, StorageProvider } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Flags to control data tier
const SEED_DEMO_DATA = process.env.NODE_ENV !== "production";

async function main() {
  console.log("===============================================================");
  console.log("🌱 Starting PROJECT SETU Database Seed Pipeline");
  console.log(`🌐 Mode: ${SEED_DEMO_DATA ? "DEVELOPMENT (Includes Demo Data)" : "PRODUCTION (Base Catalog Only)"}`);
  console.log("===============================================================");

  // ---------------------------------------------------------------------------
  // 1. PRODUCTION BASELINE: MASTER LOCATIONS
  // ---------------------------------------------------------------------------
  console.log("📍 Seeding Administrative Locations...");
  const locCentral = await prisma.location.upsert({
    where: { id: "loc-central-delhi" },
    update: {},
    create: {
      id: "loc-central-delhi",
      state: "Delhi (NCT)",
      district: "Central Delhi",
      subDistrict: "Civil Lines",
      blockOrWard: "Ward 12",
      locality: "Rajendra Nagar",
      pincode: "110060",
      latitude: 28.6415,
      longitude: 77.1906,
    },
  });

  const locSouth = await prisma.location.upsert({
    where: { id: "loc-south-delhi" },
    update: {},
    create: {
      id: "loc-south-delhi",
      state: "Delhi (NCT)",
      district: "South Delhi",
      subDistrict: "Hauz Khas",
      blockOrWard: "Ward 45",
      locality: "Saket",
      pincode: "110017",
      latitude: 28.5244,
      longitude: 77.2167,
    },
  });

  // ---------------------------------------------------------------------------
  // 2. PRODUCTION BASELINE: MASTER GOVERNMENT DEPARTMENTS
  // ---------------------------------------------------------------------------
  console.log("🏛️ Seeding Government Departments & SLA Policies...");
  const departmentsData = [
    {
      id: "dept-water-supply",
      code: "WATER_SUPPLY",
      name: "Department of Drinking Water & Sanitation (Jal Board)",
      description: "Drinking water distribution, pipeline maintenance, purity verification, and drainage sanitation.",
      nodalOfficerName: "Shri Rajesh Kumar Verma",
      nodalOfficerEmail: "nodal.water@setu.gov.in",
      nodalOfficerPhone: "+91-11-23094001",
      defaultSlaHours: 24,
      escalationSlaHours: 12,
    },
    {
      id: "dept-electricity",
      code: "ELECTRICITY",
      name: "Department of Power & Renewable Energy (Bijli Vibhag)",
      description: "Grid electricity distribution, transformer repair, high-voltage hazard management, and streetlighting.",
      nodalOfficerName: "Dr. Ananya Sharma",
      nodalOfficerEmail: "nodal.power@setu.gov.in",
      nodalOfficerPhone: "+91-11-23094002",
      defaultSlaHours: 12,
      escalationSlaHours: 6,
    },
    {
      id: "dept-roads-pwd",
      code: "ROADS_HIGHWAYS",
      name: "Public Works Department - Roads & Infrastructure (PWD)",
      description: "Road resurfacing, pothole repairs, flyovers, storm water drainage, and pedestrian crossings.",
      nodalOfficerName: "Er. Vikramaditya Singh",
      nodalOfficerEmail: "nodal.pwd@setu.gov.in",
      nodalOfficerPhone: "+91-11-23094003",
      defaultSlaHours: 72,
      escalationSlaHours: 24,
    },
    {
      id: "dept-health-sanitation",
      code: "HEALTH_SANITATION",
      name: "Department of Public Health & Municipal Solid Waste",
      description: "Garbage collection, open landfill clearance, vector-borne disease control, and hospital grievances.",
      nodalOfficerName: "Dr. Sunita Deshmukh",
      nodalOfficerEmail: "nodal.health@setu.gov.in",
      nodalOfficerPhone: "+91-11-23094004",
      defaultSlaHours: 24,
      escalationSlaHours: 12,
    },
    {
      id: "dept-revenue-land",
      code: "REVENUE_LAND",
      name: "Department of Revenue & Land Records",
      description: "Land mutation, property registration, title dispute grievance, and encumbrance certificates.",
      nodalOfficerName: "Shri Alok Nath Mehta (IAS)",
      nodalOfficerEmail: "nodal.revenue@setu.gov.in",
      nodalOfficerPhone: "+91-11-23094005",
      defaultSlaHours: 96,
      escalationSlaHours: 48,
    },
    {
      id: "dept-women-child",
      code: "WOMEN_CHILD",
      name: "Department of Women & Child Development (WCD)",
      description: "Anganwadi center operations, women safety escalation, child welfare nutrition, and social schemes.",
      nodalOfficerName: "Smt. Meenakshi Sundaram",
      nodalOfficerEmail: "nodal.wcd@setu.gov.in",
      nodalOfficerPhone: "+91-11-23094006",
      defaultSlaHours: 24,
      escalationSlaHours: 12,
    },
  ];

  for (const dept of departmentsData) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: dept,
      create: dept,
    });
  }

  // ---------------------------------------------------------------------------
  // 3. PRODUCTION BASELINE: MASTER GRIEVANCE CATEGORIES
  // ---------------------------------------------------------------------------
  console.log("📂 Seeding Master Grievance Categories...");
  const categoriesData = [
    { id: "cat-water-leakage", departmentId: "dept-water-supply", name: "Pipeline Leakage & Contaminated Water", defaultPriority: Priority.HIGH, defaultSlaHours: 24 },
    { id: "cat-water-supply-low", departmentId: "dept-water-supply", name: "Low Pressure / No Water Supply", defaultPriority: Priority.MEDIUM, defaultSlaHours: 48 },
    { id: "cat-power-sparking", departmentId: "dept-electricity", name: "Transformer Sparking / Live Electric Wire", defaultPriority: Priority.CRITICAL, defaultSlaHours: 6 },
    { id: "cat-power-blackout", departmentId: "dept-electricity", name: "Unscheduled Power Outage / Low Voltage", defaultPriority: Priority.HIGH, defaultSlaHours: 12 },
    { id: "cat-road-pothole", departmentId: "dept-roads-pwd", name: "Dangerous Pothole / Broken Asphalt", defaultPriority: Priority.HIGH, defaultSlaHours: 48 },
    { id: "cat-road-waterlogging", departmentId: "dept-roads-pwd", name: "Clogged Storm Drain / Waterlogging", defaultPriority: Priority.HIGH, defaultSlaHours: 24 },
    { id: "cat-health-garbage", departmentId: "dept-health-sanitation", name: "Unattended Solid Waste Heap", defaultPriority: Priority.MEDIUM, defaultSlaHours: 24 },
    { id: "cat-health-hospital", departmentId: "dept-health-sanitation", name: "Government Hospital Facility Grievance", defaultPriority: Priority.HIGH, defaultSlaHours: 24 },
    { id: "cat-revenue-mutation", departmentId: "dept-revenue-land", name: "Land Mutation / Record Rectification Delay", defaultPriority: Priority.MEDIUM, defaultSlaHours: 96 },
  ];

  for (const cat of categoriesData) {
    await prisma.grievanceCategory.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  // ---------------------------------------------------------------------------
  // 4. PRODUCTION BASELINE: MASTER GOVERNMENT SERVICES
  // ---------------------------------------------------------------------------
  console.log("📑 Seeding Master Citizen Government Services...");
  const servicesData = [
    {
      id: "srv-water-connection",
      code: "NEW_WATER_CONNECTION",
      name: "Application for New Domestic Water Connection",
      departmentId: "dept-water-supply",
      description: "Direct application for piped drinking water line installation for residential premises.",
      feeAmount: 250.00,
      estimatedProcessingDays: 14,
      requiredDocuments: ["Identity Proof (Aadhaar/Voter ID)", "Property Ownership Deed or Rent Agreement", "Latest Electricity Bill"],
    },
    {
      id: "srv-power-meter",
      code: "SMART_METER_INSTALLATION",
      name: "Installation / Replacement of Smart Electric Meter",
      departmentId: "dept-electricity",
      description: "Sanction and meter setup for new electricity consumer accounts.",
      feeAmount: 500.00,
      estimatedProcessingDays: 7,
      requiredDocuments: ["Aadhaar Card", "Premises NOC / Registry Document"],
    },
    {
      id: "srv-land-mutation",
      code: "LAND_MUTATION_CERTIFICATE",
      name: "Application for Land Mutation & Title Transfer",
      departmentId: "dept-revenue-land",
      description: "Formal transfer and recording of ownership changes in municipal revenue registers.",
      feeAmount: 100.00,
      estimatedProcessingDays: 21,
      requiredDocuments: ["Sale Deed", "Previous Khata Certificate", "Encumbrance Certificate", "Identity Proof"],
    },
  ];

  for (const srv of servicesData) {
    await prisma.governmentService.upsert({
      where: { code: srv.code },
      update: srv,
      create: srv,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. PRODUCTION BASELINE: SYSTEM ADMIN ACCOUNT
  // ---------------------------------------------------------------------------
  console.log("🛡️ Seeding Super Admin Account...");
  const adminPasswordHash = await bcrypt.hash("Admin@Setu2026", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@setu.gov.in" },
    update: {
      passwordHash: adminPasswordHash,
      fullName: "National Administrator (SIH 2026)",
      role: Role.ADMIN,
    },
    create: {
      id: "usr-admin-setu",
      email: "admin@setu.gov.in",
      phone: "+91-9999900000",
      passwordHash: adminPasswordHash,
      fullName: "National Administrator (SIH 2026)",
      role: Role.ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // ---------------------------------------------------------------------------
  // 6. DEVELOPMENT DEMO DATA (Skipped in production environments)
  // ---------------------------------------------------------------------------
  if (SEED_DEMO_DATA) {
    console.log("🧪 Seeding Development Demo Accounts & Operational Data...");

    const defaultPasswordHash = await bcrypt.hash("Password@123", 10);

    // 6.1 Demo Citizens
    const citizen1 = await prisma.user.upsert({
      where: { email: "yamini.citizen@setu.gov.in" },
      update: {},
      create: {
        id: "usr-citizen-01",
        email: "yamini.citizen@setu.gov.in",
        phone: "+91-9876543210",
        passwordHash: defaultPasswordHash,
        fullName: "Yamini Sharma",
        role: Role.CITIZEN,
        isEmailVerified: true,
        citizenProfile: {
          create: {
            aadhaarHash: "aadhaar_hash_demo_001_sha256",
            gender: "FEMALE",
            pincode: "110060",
            addressLine1: "House 42, Block B, Rajendra Nagar",
            locationId: locCentral.id,
            occupation: "Software Engineer",
          },
        },
      },
    });

    const citizen2 = await prisma.user.upsert({
      where: { email: "rohit.citizen@setu.gov.in" },
      update: {},
      create: {
        id: "usr-citizen-02",
        email: "rohit.citizen@setu.gov.in",
        phone: "+91-9876543211",
        passwordHash: defaultPasswordHash,
        fullName: "Rohit Patel",
        role: Role.CITIZEN,
        isEmailVerified: true,
        citizenProfile: {
          create: {
            aadhaarHash: "aadhaar_hash_demo_002_sha256",
            gender: "MALE",
            pincode: "110017",
            addressLine1: "Apartment 12A, Saket",
            locationId: locSouth.id,
            occupation: "Banker",
          },
        },
      },
    });

    // 6.2 Demo Officers
    const waterOfficerUser = await prisma.user.upsert({
      where: { email: "officer.water@setu.gov.in" },
      update: {},
      create: {
        id: "usr-officer-water-01",
        email: "officer.water@setu.gov.in",
        phone: "+91-9811100001",
        passwordHash: defaultPasswordHash,
        fullName: "Arjun Verma (Water Engineer)",
        role: Role.OFFICER,
        isEmailVerified: true,
        officerProfile: {
          create: {
            id: "prof-officer-water-01",
            departmentId: "dept-water-supply",
            badgeNumber: "WTR-ENG-402",
            designation: "Assistant Executive Engineer",
            jurisdictionWard: "Ward 12",
            locationId: locCentral.id,
            isAvailable: true,
          },
        },
      },
      include: { officerProfile: true },
    });

    const powerSeniorOfficerUser = await prisma.user.upsert({
      where: { email: "senior.power@setu.gov.in" },
      update: {},
      create: {
        id: "usr-officer-power-01",
        email: "senior.power@setu.gov.in",
        phone: "+91-9811100002",
        passwordHash: defaultPasswordHash,
        fullName: "Kavita Rao (Superintending Engineer)",
        role: Role.SENIOR_OFFICER,
        isEmailVerified: true,
        officerProfile: {
          create: {
            id: "prof-officer-power-01",
            departmentId: "dept-electricity",
            badgeNumber: "PWR-SUP-108",
            designation: "Superintending Engineer & HOD",
            jurisdictionWard: "Central & South Zone",
            locationId: locCentral.id,
            isAvailable: true,
          },
        },
      },
      include: { officerProfile: true },
    });

    // 6.3 Demo Grievance with AI Classification & Timeline
    const demoGrievance = await prisma.grievance.upsert({
      where: { trackingNumber: "SETU-2026-881902" },
      update: {},
      create: {
        id: "grv-demo-01",
        trackingNumber: "SETU-2026-881902",
        citizenId: citizen1.id,
        departmentId: "dept-water-supply",
        categoryId: "cat-water-leakage",
        locationId: locCentral.id,
        title: "Major main pipeline burst causing contaminated dirty water in Ward 12",
        description: "The main underground drinking water pipeline cracked near Gate No. 3 this morning. Contaminated brownish water is leaking into homes with foul smell and flooding the road.",
        addressText: "Near Gate No. 3, Block B, Rajendra Nagar",
        pincode: "110060",
        status: GrievanceStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        isUrgent: true,
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        slaBreached: false,
        isEscalated: false,
        aiClassification: {
          create: {
            predictedDepartmentId: "dept-water-supply",
            predictedCategoryId: "cat-water-leakage",
            predictedDepartmentCode: "WATER_SUPPLY",
            confidenceScore: 0.94,
            priorityScore: Priority.HIGH,
            detectedSentiment: "FRUSTRATED_CRITICAL",
            extractedKeywords: ["pipeline", "burst", "contaminated", "dirty", "water", "leakage", "flooding"],
            suggestedSlaHours: 24,
            modelVersion: "1.0.0-sih",
          },
        },
        statusHistories: {
          createMany: {
            data: [
              {
                actorId: citizen1.id,
                previousStatus: null,
                newStatus: GrievanceStatus.SUBMITTED,
                actionTaken: "GRIEVANCE_SUBMITTED",
                remarks: "Submitted via Citizen Web Portal.",
              },
              {
                actorId: null,
                previousStatus: GrievanceStatus.SUBMITTED,
                newStatus: GrievanceStatus.AI_TRIAGED,
                actionTaken: "AI_TRIAGED",
                remarks: "AI NLP classified as Water Supply with 94% confidence.",
              },
              {
                actorId: waterOfficerUser.id,
                previousStatus: GrievanceStatus.AI_TRIAGED,
                newStatus: GrievanceStatus.IN_PROGRESS,
                actionTaken: "STATUS_IN_PROGRESS",
                remarks: "Field repair team dispatched with replacement pipe section.",
              },
            ],
          },
        },
        assignments: {
          create: {
            officerProfileId: waterOfficerUser.officerProfile!.id,
            assignedById: adminUser.id,
            assignmentNotes: "Assigned to Ward 12 junior field engineer for urgent resolution.",
            isActive: true,
          },
        },
      },
    });

    // 6.4 Demo Service Application
    await prisma.serviceApplication.upsert({
      where: { applicationNumber: "APP-2026-440192" },
      update: {},
      create: {
        id: "app-demo-01",
        applicationNumber: "APP-2026-440192",
        citizenId: citizen2.id,
        serviceId: "srv-water-connection",
        departmentId: "dept-water-supply",
        status: "UNDER_REVIEW",
        formData: {
          connectionType: "Domestic Residential",
          pipeDiameterInch: 0.5,
          numberOfOccupants: 4,
          propertyHoldingNo: "NDMC-PROP-98712",
        },
        documents: {
          create: {
            uploadedById: citizen2.id,
            documentType: "PROPERTY_REGISTRY",
            fileName: "property_registry_doc.pdf",
            originalName: "Registry_Scan_Saket_12A.pdf",
            fileUrl: "https://storage.setu.gov.in/docs/demo_registry.pdf",
            mimeType: "application/pdf",
            fileSizeBytes: 1048576,
            isVerified: true,
          },
        },
      },
    });

    console.log("✅ Development Demo Data Seeded Successfully!");
  }

  console.log("===============================================================");
  console.log("🎉 PROJECT SETU Database Seed Complete!");
  console.log("===============================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
