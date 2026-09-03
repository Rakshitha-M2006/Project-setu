/**
 * PROJECT SETU - PostgreSQL Database Seed Script
 * AI-Powered Government Services & Grievance Management Platform
 * 
 * Clean separation of:
 * 1. Master Production Data (Departments, Grievance Categories, Government Services)
 * 2. Realistic Development Seed Data (Locations, Users, Profiles, Sample Grievances, Service Applications)
 */

import { PrismaClient, Role, Gender, Priority, GrievanceStatus, ApplicationStatus, StorageProvider, NotificationType } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================================");
  console.log("🚀 PROJECT SETU — Initializing PostgreSQL Database Seeding");
  console.log("==================================================================\n");

  const isProduction = process.env.NODE_ENV === "production";
  const defaultPasswordHash = await bcrypt.hash("Password@123", 10);

  // ==============================================================================
  // 1. MASTER PRODUCTION DATA (Catalogs & Taxonomy)
  // ==============================================================================
  console.log("📦 Seeding Master Government Departments...");

  const departmentsData = [
    {
      code: "WATER_SUPPLY",
      name: "Department of Water Supply & Sewerage",
      description: "Manages potable drinking water supply, pipeline infrastructure, borewells, and sewage networks.",
      nodalOfficerName: "Shri R. K. Meena",
      nodalOfficerEmail: "nodal.water@setu.gov.in",
      nodalOfficerPhone: "+91 11 2338 0001",
      defaultSlaHours: 48,
      escalationSlaHours: 24,
    },
    {
      code: "ELECTRICITY",
      name: "Electricity & Power Distribution Department",
      description: "Oversees power distribution grids, transformer maintenance, billing meters, and streetlight infrastructure.",
      nodalOfficerName: "Smt. Vandana Rao",
      nodalOfficerEmail: "nodal.electricity@setu.gov.in",
      nodalOfficerPhone: "+91 11 2338 0002",
      defaultSlaHours: 24,
      escalationSlaHours: 12,
    },
    {
      code: "ROADS_HIGHWAYS",
      name: "Public Works Department (PWD) - Roads & Infrastructure",
      description: "Responsible for construction, repair of roads, bridges, storm-water drains, and civic civil structures.",
      nodalOfficerName: "Er. S. K. Gupta",
      nodalOfficerEmail: "nodal.pwd@setu.gov.in",
      nodalOfficerPhone: "+91 11 2338 0003",
      defaultSlaHours: 72,
      escalationSlaHours: 36,
    },
    {
      code: "HEALTH_SANITATION",
      name: "Department of Health, Medical & Family Welfare",
      description: "Governs public health centers, hospital hygiene, epidemic control, vector surveillance, and solid waste dumps.",
      nodalOfficerName: "Dr. Ananya Sen",
      nodalOfficerEmail: "nodal.health@setu.gov.in",
      nodalOfficerPhone: "+91 11 2338 0004",
      defaultSlaHours: 24,
      escalationSlaHours: 12,
    },
    {
      code: "REVENUE_LAND",
      name: "Department of Revenue & Land Administration",
      description: "Handles land title records, mutations, encumbrance certificates, tehsildar inquiries, and citizen certificates.",
      nodalOfficerName: "Shri Alok Tripathi",
      nodalOfficerEmail: "nodal.revenue@setu.gov.in",
      nodalOfficerPhone: "+91 11 2338 0005",
      defaultSlaHours: 96,
      escalationSlaHours: 48,
    },
    {
      code: "WOMEN_CHILD",
      name: "Department of Women & Child Development",
      description: "Directs Anganwadi nutrition centers, Poshan Abhiyaan, maternity benefits, and women empowerment initiatives.",
      nodalOfficerName: "Smt. Manju Sharma",
      nodalOfficerEmail: "nodal.wcd@setu.gov.in",
      nodalOfficerPhone: "+91 11 2338 0006",
      defaultSlaHours: 48,
      escalationSlaHours: 24,
    },
    {
      code: "GENERAL_ADMINISTRATION",
      name: "General Administration & Citizen Grievance Cell",
      description: "Central nodal agency for cross-departmental coordination, RTI facilitation, and untriaged civic appeals.",
      nodalOfficerName: "Shri Vivek Malhotra",
      nodalOfficerEmail: "nodal.admin@setu.gov.in",
      nodalOfficerPhone: "+91 11 2338 0007",
      defaultSlaHours: 48,
      escalationSlaHours: 24,
    },
  ];

  const departmentMap: Record<string, string> = {};
  for (const dept of departmentsData) {
    const upserted = await prisma.department.upsert({
      where: { code: dept.code },
      update: { ...dept },
      create: { ...dept },
    });
    departmentMap[dept.code] = upserted.id;
  }
  console.log(`✔ Seeded ${departmentsData.length} Master Departments.`);

  // ----------------------------------------------------------------------------
  // Master Grievance Categories
  // ----------------------------------------------------------------------------
  console.log("📦 Seeding Master Grievance Categories...");
  const categoriesData = [
    // Water
    { deptCode: "WATER_SUPPLY", name: "Drinking Water Contamination / Quality", code: "WTR_QUAL", priority: Priority.CRITICAL, sla: 12 },
    { deptCode: "WATER_SUPPLY", name: "Pipeline Burst / Water Leakage", code: "WTR_LEAK", priority: Priority.HIGH, sla: 24 },
    { deptCode: "WATER_SUPPLY", name: "No Water Supply / Low Water Pressure", code: "WTR_LOW", priority: Priority.HIGH, sla: 24 },
    { deptCode: "WATER_SUPPLY", name: "Sewage Overflow / Gutter Blockage", code: "WTR_SEW", priority: Priority.HIGH, sla: 24 },

    // Electricity
    { deptCode: "ELECTRICITY", name: "Power Outage / Continuous Blackout", code: "ELC_OUT", priority: Priority.HIGH, sla: 24 },
    { deptCode: "ELECTRICITY", name: "Transformer Sparking / Blast Hazard", code: "ELC_XFMR", priority: Priority.CRITICAL, sla: 6 },
    { deptCode: "ELECTRICITY", name: "Fallen Live Electric Wire / Broken Pole", code: "ELC_POLE", priority: Priority.CRITICAL, sla: 6 },
    { deptCode: "ELECTRICITY", name: "Smart Meter Fault / Excessive Billing", code: "ELC_MTR", priority: Priority.MEDIUM, sla: 48 },

    // Roads & PWD
    { deptCode: "ROADS_HIGHWAYS", name: "Dangerous Potholes & Damaged Road", code: "PWD_POT", priority: Priority.HIGH, sla: 48 },
    { deptCode: "ROADS_HIGHWAYS", name: "Streetlight Malfunction / Dark Spot", code: "PWD_LGT", priority: Priority.MEDIUM, sla: 48 },
    { deptCode: "ROADS_HIGHWAYS", name: "Waterlogging & Blocked Storm Drain", code: "PWD_DRN", priority: Priority.HIGH, sla: 24 },
    { deptCode: "ROADS_HIGHWAYS", name: "Footpath Encroachment / Construction Debris", code: "PWD_ENC", priority: Priority.LOW, sla: 72 },

    // Health
    { deptCode: "HEALTH_SANITATION", name: "Hospital Hygiene & Unsanitary Ward", code: "HLT_HYG", priority: Priority.HIGH, sla: 24 },
    { deptCode: "HEALTH_SANITATION", name: "Doctor / Medical Staff Unavailability", code: "HLT_DOC", priority: Priority.CRITICAL, sla: 12 },
    { deptCode: "HEALTH_SANITATION", name: "Stagnant Water / Dengue Mosquito Threat", code: "HLT_DNG", priority: Priority.HIGH, sla: 24 },
    { deptCode: "HEALTH_SANITATION", name: "Garbage Dump Stench & Overflow", code: "HLT_GARB", priority: Priority.MEDIUM, sla: 48 },

    // Revenue
    { deptCode: "REVENUE_LAND", name: "Land Mutation & Record Verification Delay", code: "REV_MUT", priority: Priority.MEDIUM, sla: 96 },
    { deptCode: "REVENUE_LAND", name: "Income / Caste / Domicile Certificate Delay", code: "REV_CERT", priority: Priority.MEDIUM, sla: 72 },
    { deptCode: "REVENUE_LAND", name: "Encroachment on Public Land", code: "REV_ENC", priority: Priority.HIGH, sla: 72 },

    // Women & Child
    { deptCode: "WOMEN_CHILD", name: "Anganwadi Nutrition & Ration Shortage", code: "WCD_POSH", priority: Priority.HIGH, sla: 48 },
    { deptCode: "WOMEN_CHILD", name: "Maternity Scheme Grant / PMMVY Delay", code: "WCD_MAT", priority: Priority.MEDIUM, sla: 72 },
    { deptCode: "WOMEN_CHILD", name: "Women Safety Concern / Harassment Report", code: "WCD_SAFE", priority: Priority.CRITICAL, sla: 12 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const deptId = departmentMap[cat.deptCode];
    if (!deptId) continue;
    const existing = await prisma.grievanceCategory.findFirst({
      where: { departmentId: deptId, name: cat.name },
    });
    if (!existing) {
      const created = await prisma.grievanceCategory.create({
        data: {
          departmentId: deptId,
          name: cat.name,
          code: cat.code,
          defaultPriority: cat.priority,
          defaultSlaHours: cat.sla,
        },
      });
      categoryMap[cat.code] = created.id;
    } else {
      categoryMap[cat.code] = existing.id;
    }
  }
  console.log(`✔ Seeded ${categoriesData.length} Master Grievance Categories.`);

  // ----------------------------------------------------------------------------
  // Master Government Services Catalog
  // ----------------------------------------------------------------------------
  console.log("📦 Seeding Master Government Services Catalog...");
  const servicesData = [
    {
      code: "SRV-WTR-001",
      name: "New Domestic Piped Water Connection",
      deptCode: "WATER_SUPPLY",
      description: "Application for new residential water supply line pipe connection with municipal water meter installation.",
      eligibilityCriteria: "Residential property owner or registered tenant with owner NOC.",
      requiredDocuments: ["Identity Proof (Aadhaar/Voter ID)", "Proof of Property Ownership / Sale Deed", "Property Tax Receipt", "Plumbing Blueprint"],
      feeAmount: 500.00,
      estimatedProcessingDays: 14,
    },
    {
      code: "SRV-ELC-001",
      name: "Electricity Load Enhancement & Smart Meter",
      deptCode: "ELECTRICITY",
      description: "Apply for load capacity enhancement (kW) and electronic smart meter replacement.",
      eligibilityCriteria: "Existing active electricity consumer with no pending arrears.",
      requiredDocuments: ["Latest Electricity Bill", "Aadhaar Card", "Applicant Passport Photo", "Test Report of Electrical Installation"],
      feeAmount: 250.00,
      estimatedProcessingDays: 7,
    },
    {
      code: "SRV-REV-001",
      name: "Land Record Mutation & Khata Transfer",
      deptCode: "REVENUE_LAND",
      description: "Official legal mutation of title ownership in revenue records following sale, inheritance, or gift.",
      eligibilityCriteria: "Registered deed holder or legal heir.",
      requiredDocuments: ["Registered Sale Deed / Will", "Death Certificate (if inheritance)", "Latest Jamabandi Copy", "Aadhaar Card"],
      feeAmount: 150.00,
      estimatedProcessingDays: 30,
    },
    {
      code: "SRV-INC-001",
      name: "E-Issuance of Annual Income Certificate",
      deptCode: "REVENUE_LAND",
      description: "Official state revenue verification certificate of total annual household income.",
      eligibilityCriteria: "Resident citizen of the state.",
      requiredDocuments: ["Salary Slip / ITR / Self-Declaration", "Ration Card", "Aadhaar Card", "Affidavit"],
      feeAmount: 50.00,
      estimatedProcessingDays: 7,
    },
    {
      code: "SRV-WCD-001",
      name: "Pradhan Mantri Matru Vandana Scheme Registration",
      deptCode: "WOMEN_CHILD",
      description: "Maternity benefit cash incentive scheme for eligible pregnant women and lactating mothers.",
      eligibilityCriteria: "Pregnant woman having first live birth registered at Anganwadi.",
      requiredDocuments: ["Mother-Child Protection (MCP) Card", "Aadhaar Card of Mother & Husband", "Bank Account Passbook"],
      feeAmount: 0.00,
      estimatedProcessingDays: 10,
    },
  ];

  const serviceMap: Record<string, string> = {};
  for (const srv of servicesData) {
    const deptId = departmentMap[srv.deptCode];
    if (!deptId) continue;
    const upserted = await prisma.governmentService.upsert({
      where: { code: srv.code },
      update: {
        name: srv.name,
        departmentId: deptId,
        description: srv.description,
        eligibilityCriteria: srv.eligibilityCriteria,
        requiredDocuments: srv.requiredDocuments,
        feeAmount: srv.feeAmount,
        estimatedProcessingDays: srv.estimatedProcessingDays,
      },
      create: {
        code: srv.code,
        name: srv.name,
        departmentId: deptId,
        description: srv.description,
        eligibilityCriteria: srv.eligibilityCriteria,
        requiredDocuments: srv.requiredDocuments,
        feeAmount: srv.feeAmount,
        estimatedProcessingDays: srv.estimatedProcessingDays,
      },
    });
    serviceMap[srv.code] = upserted.id;
  }
  console.log(`✔ Seeded ${servicesData.length} Master Government Services.`);

  // ==============================================================================
  // 2. REALISTIC DEVELOPMENT SEED DATA (Only in Non-Production)
  // ==============================================================================
  if (isProduction) {
    console.log("\n🔒 Production environment detected: Skipping development mock users and sample grievances.");
    return;
  }

  console.log("\n🧪 Seeding Development Administrative Geography (Locations)...");

  const locCentral = await prisma.location.create({
    data: {
      state: "Delhi NCT",
      district: "New Delhi",
      subDistrict: "Chanakyapuri",
      blockOrWard: "Ward 01 - Central",
      locality: "Connaught Place / Sector 1",
      pincode: "110001",
      latitude: 28.6304,
      longitude: 77.2177,
    },
  });

  const locSouth = await prisma.location.create({
    data: {
      state: "Delhi NCT",
      district: "South Delhi",
      subDistrict: "Hauz Khas",
      blockOrWard: "Ward 12 - Saket",
      locality: "Saket Sector 4",
      pincode: "110017",
      latitude: 28.5244,
      longitude: 77.2167,
    },
  });

  console.log("✔ Seeded Development Locations.");

  // ----------------------------------------------------------------------------
  // Development Users & Profiles across all 4 Roles
  // ----------------------------------------------------------------------------
  console.log("🧪 Seeding Development Users (All Roles with password 'Password@123')...");

  // 1. Citizen User
  const citizenUser = await prisma.user.upsert({
    where: { email: "citizen@setu.gov.in" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "citizen@setu.gov.in",
      phone: "+919876543210",
      passwordHash: defaultPasswordHash,
      fullName: "Aarav Sharma",
      role: Role.CITIZEN,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      citizenProfile: {
        create: {
          gender: Gender.MALE,
          dateOfBirth: new Date("1992-06-15"),
          addressLine1: "House 42, Pocket B, Saket",
          pincode: "110017",
          locationId: locSouth.id,
          emergencyContact: "+919876500000",
          occupation: "Software Engineer",
        },
      },
    },
  });

  // 2. Water Field Officer
  const officerWater = await prisma.user.upsert({
    where: { email: "officer.water@setu.gov.in" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "officer.water@setu.gov.in",
      phone: "+919876543211",
      passwordHash: defaultPasswordHash,
      fullName: "Rajesh Verma",
      role: Role.OFFICER,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      officerProfile: {
        create: {
          departmentId: departmentMap["WATER_SUPPLY"],
          badgeNumber: "WTR-OF-104",
          designation: "Assistant Engineer (Water Supply)",
          jurisdictionWard: "Ward 12 - Saket",
          locationId: locSouth.id,
          isAvailable: true,
        },
      },
    },
  });

  // 3. Electricity Field Officer
  const officerElec = await prisma.user.upsert({
    where: { email: "officer.electricity@setu.gov.in" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "officer.electricity@setu.gov.in",
      phone: "+919876543212",
      passwordHash: defaultPasswordHash,
      fullName: "Priya Singh",
      role: Role.OFFICER,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      officerProfile: {
        create: {
          departmentId: departmentMap["ELECTRICITY"],
          badgeNumber: "ELC-OF-208",
          designation: "Sub-Divisional Officer (Power)",
          jurisdictionWard: "Ward 01 - Central",
          locationId: locCentral.id,
          isAvailable: true,
        },
      },
    },
  });

  // 4. Senior Officer / Department HOD
  const seniorOfficer = await prisma.user.upsert({
    where: { email: "senior.officer@setu.gov.in" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "senior.officer@setu.gov.in",
      phone: "+919876543213",
      passwordHash: defaultPasswordHash,
      fullName: "Dr. Sunita Deshmukh",
      role: Role.SENIOR_OFFICER,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      officerProfile: {
        create: {
          departmentId: departmentMap["ELECTRICITY"],
          badgeNumber: "HOD-ELC-001",
          designation: "Chief Engineer & Nodal Director",
          jurisdictionWard: "State Headquarters",
          locationId: locCentral.id,
          isAvailable: true,
        },
      },
    },
  });

  // 5. Super Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@setu.gov.in" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "admin@setu.gov.in",
      phone: "+919876543214",
      passwordHash: defaultPasswordHash,
      fullName: "Super Administrator",
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  console.log("✔ Seeded 5 Multi-Role Development Users:");
  console.log("   - Citizen:         citizen@setu.gov.in (Password@123)");
  console.log("   - Field Officer:   officer.water@setu.gov.in (Password@123)");
  console.log("   - Field Officer:   officer.electricity@setu.gov.in (Password@123)");
  console.log("   - Senior Officer:  senior.officer@setu.gov.in (Password@123)");
  console.log("   - Super Admin:     admin@setu.gov.in (Password@123)");

  // ----------------------------------------------------------------------------
  // Realistic Development Grievances with AI Classifications & Audit Trails
  // ----------------------------------------------------------------------------
  console.log("\n🧪 Seeding Realistic Development Grievances...");

  // Grievance 1: Power Outage
  await prisma.grievance.upsert({
    where: { trackingNumber: "SETU-2026-ELC-001245" },
    update: {},
    create: {
      trackingNumber: "SETU-2026-ELC-001245",
      citizenId: citizenUser.id,
      departmentId: departmentMap["ELECTRICITY"],
      categoryId: categoryMap["ELC_OUT"],
      locationId: locSouth.id,
      title: "Complete street power outage for two consecutive days",
      description: "My street has been without electricity for two days. Streetlights and residential lines are both down.",
      addressText: "Street 4, Sector 4, Saket",
      pincode: "110017",
      status: GrievanceStatus.AI_TRIAGED,
      priority: Priority.HIGH,
      isUrgent: true,
      slaDeadline: new Date(Date.now() + 24 * 3600 * 1000),
      aiClassification: {
        create: {
          predictedDepartmentId: departmentMap["ELECTRICITY"],
          predictedDepartmentCode: "ELECTRICITY",
          confidenceScore: 0.98,
          priorityScore: Priority.HIGH,
          detectedSentiment: "FRUSTRATED",
          extractedKeywords: ["power", "outage", "street", "electricity", "two", "days"],
          suggestedSlaHours: 24,
          modelVersion: "1.0.0-nlp-rules",
          rawInference: {
            issue_type: "Power Outage / Line Fault",
            auto_triaged: true,
          },
        },
      },
      statusHistories: {
        create: [
          {
            actorId: citizenUser.id,
            actionTaken: "GRIEVANCE_SUBMITTED",
            previousStatus: null,
            newStatus: GrievanceStatus.SUBMITTED,
            remarks: "Grievance submitted by citizen via portal.",
          },
          {
            actorId: null,
            actionTaken: "GRIEVANCE_AI_TRIAGED",
            previousStatus: GrievanceStatus.SUBMITTED,
            newStatus: GrievanceStatus.AI_TRIAGED,
            remarks: "AI NLP Classifier assigned to Electricity Department with HIGH priority (Confidence: 98.0%).",
          },
        ],
      },
      attachments: {
        create: [
          {
            uploadedById: citizenUser.id,
            fileName: "meter_blackout.jpg",
            originalName: "meter_reading_photo.jpg",
            fileUrl: "https://setu-storage.gov.in/evidence/meter_blackout.jpg",
            mimeType: "image/jpeg",
            fileSizeBytes: 245000,
            storageProvider: StorageProvider.LOCAL,
          },
        ],
      },
    },
  });

  // Grievance 2: Drinking Water Contamination (Critical)
  await prisma.grievance.upsert({
    where: { trackingNumber: "SETU-2026-WTR-894102" },
    update: {},
    create: {
      trackingNumber: "SETU-2026-WTR-894102",
      citizenId: citizenUser.id,
      departmentId: departmentMap["WATER_SUPPLY"],
      categoryId: categoryMap["WTR_QUAL"],
      locationId: locSouth.id,
      title: "Severe yellow water contamination and chemical chlorine smell",
      description: "Tap water is coming out muddy brown with foul smell since this morning. Several residents feeling sick.",
      addressText: "Block B, Near Community Water Tank, Saket",
      pincode: "110017",
      status: GrievanceStatus.ASSIGNED,
      priority: Priority.CRITICAL,
      isUrgent: true,
      slaDeadline: new Date(Date.now() + 12 * 3600 * 1000),
      aiClassification: {
        create: {
          predictedDepartmentId: departmentMap["WATER_SUPPLY"],
          predictedDepartmentCode: "WATER_SUPPLY",
          confidenceScore: 0.98,
          priorityScore: Priority.CRITICAL,
          detectedSentiment: "FRUSTRATED_CRITICAL",
          extractedKeywords: ["severe", "water", "contamination", "chlorine", "smell", "muddy"],
          suggestedSlaHours: 12,
          modelVersion: "1.0.0-nlp-rules",
        },
      },
      statusHistories: {
        create: [
          {
            actorId: citizenUser.id,
            actionTaken: "GRIEVANCE_SUBMITTED",
            previousStatus: null,
            newStatus: GrievanceStatus.SUBMITTED,
            remarks: "Emergency drinking water contamination reported.",
          },
          {
            actorId: seniorOfficer.id,
            actionTaken: "GRIEVANCE_ASSIGNED",
            previousStatus: GrievanceStatus.SUBMITTED,
            newStatus: GrievanceStatus.ASSIGNED,
            remarks: "Assigned to Field Engineer Rajesh Verma for urgent water sampling.",
          },
        ],
      },
      assignments: {
        create: {
          officerProfileId: (await prisma.officerProfile.findUnique({ where: { userId: officerWater.id } }))!.id,
          assignedById: seniorOfficer.id,
          assignmentNotes: "Conduct water sampling immediately and verify pipeline breach near main tank.",
          isActive: true,
        },
      },
    },
  });

  // Grievance 3: Sample Government Service Application
  await prisma.serviceApplication.upsert({
    where: { applicationNumber: "APP-2026-WTR-004512" },
    update: {},
    create: {
      applicationNumber: "APP-2026-WTR-004512",
      citizenId: citizenUser.id,
      serviceId: serviceMap["SRV-WTR-001"],
      departmentId: departmentMap["WATER_SUPPLY"],
      status: ApplicationStatus.DOCUMENT_VERIFICATION,
      formData: {
        applicantName: "Aarav Sharma",
        propertyType: "Residential Individual Villa",
        connectionDiameterInch: "0.5",
        estimatedDailyRequirementLiters: 450,
      },
      officerRemarks: "Initial identity documents received. Physical pipeline survey scheduled.",
      submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      documents: {
        create: [
          {
            uploadedById: citizenUser.id,
            documentType: "AADHAAR_CARD",
            fileName: "aadhaar_scan.pdf",
            originalName: "Aadhaar_Aarav.pdf",
            fileUrl: "https://setu-storage.gov.in/docs/aadhaar_scan.pdf",
            mimeType: "application/pdf",
            fileSizeBytes: 412000,
            isVerified: true,
            verifiedAt: new Date(),
          },
        ],
      },
    },
  });

  console.log(`✔ Seeded Sample Grievances (e.g. SETU-2026-ELC-001245) & Service Applications.`);

  console.log("\n==================================================================");
  console.log("✨ PROJECT SETU — PostgreSQL Database Seeding Completed Successfully!");
  console.log("==================================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
