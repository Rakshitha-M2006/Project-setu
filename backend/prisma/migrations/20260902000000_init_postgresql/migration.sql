-- ==============================================================================
-- PROJECT SETU - PostgreSQL Migration Script (20260902000000_init_postgresql)
-- Smart India Hackathon 2026
-- Target Engine: PostgreSQL 14+ Relational Engine
-- ==============================================================================

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'OFFICER', 'SENIOR_OFFICER', 'ADMIN');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE "GrievanceStatus" AS ENUM ('SUBMITTED', 'AI_TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_INSPECTION', 'RESOLVED', 'REJECTED', 'ESCALATED', 'REOPENED');
CREATE TYPE "Priority" AS ENUM ('PENDING_AI', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE "EscalationLevel" AS ENUM ('LEVEL_1_SUPERVISOR', 'LEVEL_2_HOD', 'LEVEL_3_DISTRICT_MAGISTRATE');
CREATE TYPE "EscalationStatus" AS ENUM ('TRIGGERED', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'OVERRIDDEN');
CREATE TYPE "NotificationType" AS ENUM ('GRIEVANCE_STATUS_UPDATE', 'OFFICER_ASSIGNED', 'SLA_BREACH_WARNING', 'ESCALATION_TRIGGERED', 'SERVICE_APPLICATION_UPDATE', 'FEEDBACK_REQUEST', 'SYSTEM_ANNOUNCEMENT');
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'S3_COMPATIBLE', 'AZURE_BLOB', 'GCS');

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable citizen_profiles
CREATE TABLE "citizen_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aadhaarHash" TEXT,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "pincode" TEXT,
    "locationId" TEXT,
    "emergencyContact" TEXT,
    "occupation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizen_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable officer_profiles
CREATE TABLE "officer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "badgeNumber" TEXT,
    "designation" TEXT NOT NULL,
    "jurisdictionWard" TEXT,
    "locationId" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "activeGrievanceCount" INTEGER NOT NULL DEFAULT 0,
    "resolvedGrievanceCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "officer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable locations
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "subDistrict" TEXT,
    "blockOrWard" TEXT,
    "locality" TEXT,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable departments
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodalOfficerName" TEXT,
    "nodalOfficerEmail" TEXT,
    "nodalOfficerPhone" TEXT,
    "defaultSlaHours" INTEGER NOT NULL DEFAULT 48,
    "escalationSlaHours" INTEGER NOT NULL DEFAULT 24,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable grievance_categories
CREATE TABLE "grievance_categories" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "defaultPriority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "defaultSlaHours" INTEGER NOT NULL DEFAULT 48,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grievance_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable grievances
CREATE TABLE "grievances" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "departmentId" TEXT,
    "categoryId" TEXT,
    "locationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "addressText" TEXT,
    "pincode" TEXT,
    "status" "GrievanceStatus" NOT NULL DEFAULT 'SUBMITTED',
    "priority" "Priority" NOT NULL DEFAULT 'PENDING_AI',
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "slaDeadline" TIMESTAMP(3),
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "isEscalated" BOOLEAN NOT NULL DEFAULT false,
    "resolutionSummary" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grievances_pkey" PRIMARY KEY ("id")
);

-- CreateTable ai_classifications
CREATE TABLE "ai_classifications" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "predictedDepartmentId" TEXT,
    "predictedCategoryId" TEXT,
    "predictedDepartmentCode" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "priorityScore" "Priority" NOT NULL,
    "detectedSentiment" TEXT NOT NULL,
    "extractedKeywords" JSONB,
    "suggestedSlaHours" INTEGER NOT NULL,
    "isSpamOrGibberish" BOOLEAN NOT NULL DEFAULT false,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "modelVersion" TEXT NOT NULL DEFAULT '1.0.0-sih',
    "rawInference" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable grievance_status_histories
CREATE TABLE "grievance_status_histories" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "actorId" TEXT,
    "previousStatus" "GrievanceStatus",
    "newStatus" "GrievanceStatus" NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grievance_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable grievance_assignments
CREATE TABLE "grievance_assignments" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "officerProfileId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignmentNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),

    CONSTRAINT "grievance_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable grievance_attachments
CREATE TABLE "grievance_attachments" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'LOCAL',
    "isResolutionEvidence" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grievance_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable escalations
CREATE TABLE "escalations" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "escalationLevel" "EscalationLevel" NOT NULL DEFAULT 'LEVEL_1_SUPERVISOR',
    "status" "EscalationStatus" NOT NULL DEFAULT 'TRIGGERED',
    "reason" TEXT NOT NULL,
    "triggeredById" TEXT,
    "escalatedToUserId" TEXT,
    "actionNotes" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable government_services
CREATE TABLE "government_services" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "description" TEXT,
    "eligibilityCriteria" TEXT,
    "requiredDocuments" JSONB,
    "feeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "estimatedProcessingDays" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable service_applications
CREATE TABLE "service_applications" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "formData" JSONB NOT NULL,
    "reviewingOfficerId" TEXT,
    "officerRemarks" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable service_documents
CREATE TABLE "service_documents" (
    "id" TEXT NOT NULL,
    "serviceApplicationId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'LOCAL',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationRemarks" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable feedbacks
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "grievanceId" TEXT,
    "serviceApplicationId" TEXT,
    "rating" INTEGER NOT NULL,
    "timelinessRating" INTEGER,
    "officerBehaviorRating" INTEGER,
    "feedbackComments" TEXT,
    "isSatisfied" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'GRIEVANCE_STATUS_UPDATE',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "changes" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_isActive_idx" ON "users"("isActive");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

CREATE UNIQUE INDEX "citizen_profiles_userId_key" ON "citizen_profiles"("userId");
CREATE UNIQUE INDEX "citizen_profiles_aadhaarHash_key" ON "citizen_profiles"("aadhaarHash");
CREATE INDEX "citizen_profiles_userId_idx" ON "citizen_profiles"("userId");
CREATE INDEX "citizen_profiles_pincode_idx" ON "citizen_profiles"("pincode");
CREATE INDEX "citizen_profiles_locationId_idx" ON "citizen_profiles"("locationId");

CREATE UNIQUE INDEX "officer_profiles_userId_key" ON "officer_profiles"("userId");
CREATE UNIQUE INDEX "officer_profiles_badgeNumber_key" ON "officer_profiles"("badgeNumber");
CREATE INDEX "officer_profiles_userId_idx" ON "officer_profiles"("userId");
CREATE INDEX "officer_profiles_departmentId_idx" ON "officer_profiles"("departmentId");
CREATE INDEX "officer_profiles_isAvailable_idx" ON "officer_profiles"("isAvailable");
CREATE INDEX "officer_profiles_locationId_idx" ON "officer_profiles"("locationId");

CREATE INDEX "locations_pincode_idx" ON "locations"("pincode");
CREATE INDEX "locations_district_idx" ON "locations"("district");
CREATE INDEX "locations_state_idx" ON "locations"("state");
CREATE INDEX "locations_blockOrWard_idx" ON "locations"("blockOrWard");

CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");
CREATE INDEX "departments_code_idx" ON "departments"("code");
CREATE INDEX "departments_isActive_idx" ON "departments"("isActive");

CREATE INDEX "grievance_categories_departmentId_idx" ON "grievance_categories"("departmentId");
CREATE INDEX "grievance_categories_isActive_idx" ON "grievance_categories"("isActive");

CREATE UNIQUE INDEX "grievances_trackingNumber_key" ON "grievances"("trackingNumber");
CREATE INDEX "grievances_trackingNumber_idx" ON "grievances"("trackingNumber");
CREATE INDEX "grievances_status_idx" ON "grievances"("status");
CREATE INDEX "grievances_priority_idx" ON "grievances"("priority");
CREATE INDEX "grievances_citizenId_idx" ON "grievances"("citizenId");
CREATE INDEX "grievances_departmentId_idx" ON "grievances"("departmentId");
CREATE INDEX "grievances_categoryId_idx" ON "grievances"("categoryId");
CREATE INDEX "grievances_locationId_idx" ON "grievances"("locationId");
CREATE INDEX "grievances_pincode_idx" ON "grievances"("pincode");
CREATE INDEX "grievances_slaDeadline_idx" ON "grievances"("slaDeadline");
CREATE INDEX "grievances_isEscalated_idx" ON "grievances"("isEscalated");
CREATE INDEX "grievances_createdAt_idx" ON "grievances"("createdAt");

CREATE UNIQUE INDEX "ai_classifications_grievanceId_key" ON "ai_classifications"("grievanceId");
CREATE INDEX "ai_classifications_grievanceId_idx" ON "ai_classifications"("grievanceId");
CREATE INDEX "ai_classifications_confidenceScore_idx" ON "ai_classifications"("confidenceScore");
CREATE INDEX "ai_classifications_predictedDepartmentId_idx" ON "ai_classifications"("predictedDepartmentId");

CREATE INDEX "grievance_status_histories_grievanceId_idx" ON "grievance_status_histories"("grievanceId");
CREATE INDEX "grievance_status_histories_actorId_idx" ON "grievance_status_histories"("actorId");
CREATE INDEX "grievance_status_histories_createdAt_idx" ON "grievance_status_histories"("createdAt");

CREATE INDEX "grievance_assignments_grievanceId_idx" ON "grievance_assignments"("grievanceId");
CREATE INDEX "grievance_assignments_officerProfileId_idx" ON "grievance_assignments"("officerProfileId");
CREATE INDEX "grievance_assignments_isActive_idx" ON "grievance_assignments"("isActive");

CREATE INDEX "grievance_attachments_grievanceId_idx" ON "grievance_attachments"("grievanceId");
CREATE INDEX "grievance_attachments_uploadedById_idx" ON "grievance_attachments"("uploadedById");

CREATE INDEX "escalations_grievanceId_idx" ON "escalations"("grievanceId");
CREATE INDEX "escalations_escalationLevel_idx" ON "escalations"("escalationLevel");
CREATE INDEX "escalations_status_idx" ON "escalations"("status");
CREATE INDEX "escalations_escalatedToUserId_idx" ON "escalations"("escalatedToUserId");

CREATE UNIQUE INDEX "government_services_code_key" ON "government_services"("code");
CREATE INDEX "government_services_code_idx" ON "government_services"("code");
CREATE INDEX "government_services_departmentId_idx" ON "government_services"("departmentId");
CREATE INDEX "government_services_isActive_idx" ON "government_services"("isActive");

CREATE UNIQUE INDEX "service_applications_applicationNumber_key" ON "service_applications"("applicationNumber");
CREATE INDEX "service_applications_applicationNumber_idx" ON "service_applications"("applicationNumber");
CREATE INDEX "service_applications_citizenId_idx" ON "service_applications"("citizenId");
CREATE INDEX "service_applications_serviceId_idx" ON "service_applications"("serviceId");
CREATE INDEX "service_applications_departmentId_idx" ON "service_applications"("departmentId");
CREATE INDEX "service_applications_status_idx" ON "service_applications"("status");
CREATE INDEX "service_applications_createdAt_idx" ON "service_applications"("createdAt");

CREATE INDEX "service_documents_serviceApplicationId_idx" ON "service_documents"("serviceApplicationId");
CREATE INDEX "service_documents_uploadedById_idx" ON "service_documents"("uploadedById");
CREATE INDEX "service_documents_documentType_idx" ON "service_documents"("documentType");

CREATE UNIQUE INDEX "feedbacks_grievanceId_key" ON "feedbacks"("grievanceId");
CREATE INDEX "feedbacks_citizenId_idx" ON "feedbacks"("citizenId");
CREATE INDEX "feedbacks_rating_idx" ON "feedbacks"("rating");
CREATE INDEX "feedbacks_createdAt_idx" ON "feedbacks"("createdAt");

CREATE INDEX "notifications_recipientId_idx" ON "notifications"("recipientId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX "notifications_type_idx" ON "notifications"("type");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKeys
ALTER TABLE "citizen_profiles" ADD CONSTRAINT "citizen_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "citizen_profiles" ADD CONSTRAINT "citizen_profiles_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "officer_profiles" ADD CONSTRAINT "officer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "officer_profiles" ADD CONSTRAINT "officer_profiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "officer_profiles" ADD CONSTRAINT "officer_profiles_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "grievance_categories" ADD CONSTRAINT "grievance_categories_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "grievances" ADD CONSTRAINT "grievances_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "grievance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ai_classifications" ADD CONSTRAINT "ai_classifications_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "grievances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_classifications" ADD CONSTRAINT "ai_classifications_predictedDepartmentId_fkey" FOREIGN KEY ("predictedDepartmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_classifications" ADD CONSTRAINT "ai_classifications_predictedCategoryId_fkey" FOREIGN KEY ("predictedCategoryId") REFERENCES "grievance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "grievance_status_histories" ADD CONSTRAINT "grievance_status_histories_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "grievances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grievance_status_histories" ADD CONSTRAINT "grievance_status_histories_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "grievance_assignments" ADD CONSTRAINT "grievance_assignments_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "grievances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grievance_assignments" ADD CONSTRAINT "grievance_assignments_officerProfileId_fkey" FOREIGN KEY ("officerProfileId") REFERENCES "officer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grievance_assignments" ADD CONSTRAINT "grievance_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "grievance_attachments" ADD CONSTRAINT "grievance_attachments_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "grievances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grievance_attachments" ADD CONSTRAINT "grievance_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "escalations" ADD CONSTRAINT "escalations_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "grievances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_escalatedToUserId_fkey" FOREIGN KEY ("escalatedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "government_services" ADD CONSTRAINT "government_services_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "service_applications" ADD CONSTRAINT "service_applications_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_applications" ADD CONSTRAINT "service_applications_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "government_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_applications" ADD CONSTRAINT "service_applications_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_applications" ADD CONSTRAINT "service_applications_reviewingOfficerId_fkey" FOREIGN KEY ("reviewingOfficerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "service_documents" ADD CONSTRAINT "service_documents_serviceApplicationId_fkey" FOREIGN KEY ("serviceApplicationId") REFERENCES "service_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "service_documents" ADD CONSTRAINT "service_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "grievances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_serviceApplicationId_fkey" FOREIGN KEY ("serviceApplicationId") REFERENCES "service_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
