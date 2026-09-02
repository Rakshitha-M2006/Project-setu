-- ==============================================================================
-- Migration: 20260902000000_init_database
-- Description: Initialize PROJECT SETU Relational Schema in MySQL 8.0+
-- Smart India Hackathon 2026
-- ==============================================================================

-- CreateTable users
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `role` ENUM('CITIZEN', 'OFFICER', 'SENIOR_OFFICER', 'ADMIN') NOT NULL DEFAULT 'CITIZEN',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `isPhoneVerified` BOOLEAN NOT NULL DEFAULT false,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable locations
CREATE TABLE `locations` (
    `id` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `subDistrict` VARCHAR(191) NULL,
    `blockOrWard` VARCHAR(191) NULL,
    `locality` VARCHAR(191) NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `locations_pincode_idx`(`pincode`),
    INDEX `locations_district_idx`(`district`),
    INDEX `locations_state_idx`(`state`),
    INDEX `locations_blockOrWard_idx`(`blockOrWard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable citizen_profiles
CREATE TABLE `citizen_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `aadhaarHash` VARCHAR(191) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `addressLine1` VARCHAR(191) NULL,
    `addressLine2` VARCHAR(191) NULL,
    `pincode` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `occupation` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `citizen_profiles_userId_key`(`userId`),
    UNIQUE INDEX `citizen_profiles_aadhaarHash_key`(`aadhaarHash`),
    INDEX `citizen_profiles_userId_idx`(`userId`),
    INDEX `citizen_profiles_pincode_idx`(`pincode`),
    INDEX `citizen_profiles_locationId_idx`(`locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable departments
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `nodalOfficerName` VARCHAR(191) NULL,
    `nodalOfficerEmail` VARCHAR(191) NULL,
    `nodalOfficerPhone` VARCHAR(191) NULL,
    `defaultSlaHours` INTEGER NOT NULL DEFAULT 48,
    `escalationSlaHours` INTEGER NOT NULL DEFAULT 24,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_code_key`(`code`),
    INDEX `departments_code_idx`(`code`),
    INDEX `departments_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable officer_profiles
CREATE TABLE `officer_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `badgeNumber` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NOT NULL,
    `jurisdictionWard` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `activeGrievanceCount` INTEGER NOT NULL DEFAULT 0,
    `resolvedGrievanceCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `officer_profiles_userId_key`(`userId`),
    UNIQUE INDEX `officer_profiles_badgeNumber_key`(`badgeNumber`),
    INDEX `officer_profiles_userId_idx`(`userId`),
    INDEX `officer_profiles_departmentId_idx`(`departmentId`),
    INDEX `officer_profiles_isAvailable_idx`(`isAvailable`),
    INDEX `officer_profiles_locationId_idx`(`locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable grievance_categories
CREATE TABLE `grievance_categories` (
    `id` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `defaultPriority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `defaultSlaHours` INTEGER NOT NULL DEFAULT 48,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `grievance_categories_departmentId_idx`(`departmentId`),
    INDEX `grievance_categories_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable grievances
CREATE TABLE `grievances` (
    `id` VARCHAR(191) NOT NULL,
    `trackingNumber` VARCHAR(191) NOT NULL,
    `citizenId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `addressText` VARCHAR(191) NULL,
    `pincode` VARCHAR(191) NULL,
    `status` ENUM('SUBMITTED', 'AI_TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_INSPECTION', 'RESOLVED', 'REJECTED', 'ESCALATED', 'REOPENED') NOT NULL DEFAULT 'SUBMITTED',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `isUrgent` BOOLEAN NOT NULL DEFAULT false,
    `slaDeadline` DATETIME(3) NULL,
    `slaBreached` BOOLEAN NOT NULL DEFAULT false,
    `isEscalated` BOOLEAN NOT NULL DEFAULT false,
    `resolutionSummary` TEXT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `grievances_trackingNumber_key`(`trackingNumber`),
    INDEX `grievances_trackingNumber_idx`(`trackingNumber`),
    INDEX `grievances_status_idx`(`status`),
    INDEX `grievances_priority_idx`(`priority`),
    INDEX `grievances_citizenId_idx`(`citizenId`),
    INDEX `grievances_departmentId_idx`(`departmentId`),
    INDEX `grievances_categoryId_idx`(`categoryId`),
    INDEX `grievances_locationId_idx`(`locationId`),
    INDEX `grievances_pincode_idx`(`pincode`),
    INDEX `grievances_slaDeadline_idx`(`slaDeadline`),
    INDEX `grievances_isEscalated_idx`(`isEscalated`),
    INDEX `grievances_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable ai_classifications
CREATE TABLE `ai_classifications` (
    `id` VARCHAR(191) NOT NULL,
    `grievanceId` VARCHAR(191) NOT NULL,
    `predictedDepartmentId` VARCHAR(191) NULL,
    `predictedCategoryId` VARCHAR(191) NULL,
    `predictedDepartmentCode` VARCHAR(191) NULL,
    `confidenceScore` DOUBLE NOT NULL,
    `priorityScore` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `detectedSentiment` VARCHAR(191) NOT NULL,
    `extractedKeywords` JSON NULL,
    `suggestedSlaHours` INTEGER NOT NULL,
    `isSpamOrGibberish` BOOLEAN NOT NULL DEFAULT false,
    `isDuplicate` BOOLEAN NOT NULL DEFAULT false,
    `modelVersion` VARCHAR(191) NOT NULL DEFAULT '1.0.0-sih',
    `rawInference` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ai_classifications_grievanceId_key`(`grievanceId`),
    INDEX `ai_classifications_grievanceId_idx`(`grievanceId`),
    INDEX `ai_classifications_confidenceScore_idx`(`confidenceScore`),
    INDEX `ai_classifications_predictedDepartmentId_idx`(`predictedDepartmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable grievance_status_histories
CREATE TABLE `grievance_status_histories` (
    `id` VARCHAR(191) NOT NULL,
    `grievanceId` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `previousStatus` ENUM('SUBMITTED', 'AI_TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_INSPECTION', 'RESOLVED', 'REJECTED', 'ESCALATED', 'REOPENED') NULL,
    `newStatus` ENUM('SUBMITTED', 'AI_TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_INSPECTION', 'RESOLVED', 'REJECTED', 'ESCALATED', 'REOPENED') NOT NULL,
    `actionTaken` VARCHAR(191) NOT NULL,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `grievance_status_histories_grievanceId_idx`(`grievanceId`),
    INDEX `grievance_status_histories_actorId_idx`(`actorId`),
    INDEX `grievance_status_histories_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable grievance_assignments
CREATE TABLE `grievance_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `grievanceId` VARCHAR(191) NOT NULL,
    `officerProfileId` VARCHAR(191) NOT NULL,
    `assignedById` VARCHAR(191) NULL,
    `assignmentNotes` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unassignedAt` DATETIME(3) NULL,

    INDEX `grievance_assignments_grievanceId_idx`(`grievanceId`),
    INDEX `grievance_assignments_officerProfileId_idx`(`officerProfileId`),
    INDEX `grievance_assignments_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable grievance_attachments
CREATE TABLE `grievance_attachments` (
    `id` VARCHAR(191) NOT NULL,
    `grievanceId` VARCHAR(191) NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `fileSizeBytes` INTEGER NOT NULL,
    `storageProvider` ENUM('LOCAL', 'S3_COMPATIBLE', 'AZURE_BLOB', 'GCS') NOT NULL DEFAULT 'LOCAL',
    `isResolutionEvidence` BOOLEAN NOT NULL DEFAULT false,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `grievance_attachments_grievanceId_idx`(`grievanceId`),
    INDEX `grievance_attachments_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable escalations
CREATE TABLE `escalations` (
    `id` VARCHAR(191) NOT NULL,
    `grievanceId` VARCHAR(191) NOT NULL,
    `escalationLevel` ENUM('LEVEL_1_SUPERVISOR', 'LEVEL_2_HOD', 'LEVEL_3_DISTRICT_MAGISTRATE') NOT NULL DEFAULT 'LEVEL_1_SUPERVISOR',
    `status` ENUM('TRIGGERED', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'OVERRIDDEN') NOT NULL DEFAULT 'TRIGGERED',
    `reason` TEXT NOT NULL,
    `triggeredById` VARCHAR(191) NULL,
    `escalatedToUserId` VARCHAR(191) NULL,
    `actionNotes` TEXT NULL,
    `triggeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acknowledgedAt` DATETIME(3) NULL,
    `resolvedAt` DATETIME(3) NULL,

    INDEX `escalations_grievanceId_idx`(`grievanceId`),
    INDEX `escalations_escalationLevel_idx`(`escalationLevel`),
    INDEX `escalations_status_idx`(`status`),
    INDEX `escalations_escalatedToUserId_idx`(`escalatedToUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable government_services
CREATE TABLE `government_services` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `eligibilityCriteria` TEXT NULL,
    `requiredDocuments` JSON NULL,
    `feeAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `estimatedProcessingDays` INTEGER NOT NULL DEFAULT 7,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `government_services_code_key`(`code`),
    INDEX `government_services_code_idx`(`code`),
    INDEX `government_services_departmentId_idx`(`departmentId`),
    INDEX `government_services_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable service_applications
CREATE TABLE `service_applications` (
    `id` VARCHAR(191) NOT NULL,
    `applicationNumber` VARCHAR(191) NOT NULL,
    `citizenId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'SUBMITTED',
    `formData` JSON NOT NULL,
    `reviewingOfficerId` VARCHAR(191) NULL,
    `officerRemarks` TEXT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `service_applications_applicationNumber_key`(`applicationNumber`),
    INDEX `service_applications_applicationNumber_idx`(`applicationNumber`),
    INDEX `service_applications_citizenId_idx`(`citizenId`),
    INDEX `service_applications_serviceId_idx`(`serviceId`),
    INDEX `service_applications_departmentId_idx`(`departmentId`),
    INDEX `service_applications_status_idx`(`status`),
    INDEX `service_applications_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable service_documents
CREATE TABLE `service_documents` (
    `id` VARCHAR(191) NOT NULL,
    `serviceApplicationId` VARCHAR(191) NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `fileSizeBytes` INTEGER NOT NULL,
    `storageProvider` ENUM('LOCAL', 'S3_COMPATIBLE', 'AZURE_BLOB', 'GCS') NOT NULL DEFAULT 'LOCAL',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedAt` DATETIME(3) NULL,
    `verificationRemarks` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_documents_serviceApplicationId_idx`(`serviceApplicationId`),
    INDEX `service_documents_uploadedById_idx`(`uploadedById`),
    INDEX `service_documents_documentType_idx`(`documentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable feedbacks
CREATE TABLE `feedbacks` (
    `id` VARCHAR(191) NOT NULL,
    `citizenId` VARCHAR(191) NOT NULL,
    `grievanceId` VARCHAR(191) NULL,
    `serviceApplicationId` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL,
    `timelinessRating` INTEGER NULL,
    `officerBehaviorRating` INTEGER NULL,
    `feedbackComments` TEXT NULL,
    `isSatisfied` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `feedbacks_grievanceId_key`(`grievanceId`),
    INDEX `feedbacks_citizenId_idx`(`citizenId`),
    INDEX `feedbacks_rating_idx`(`rating`),
    INDEX `feedbacks_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable notifications
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `recipientId` VARCHAR(191) NOT NULL,
    `type` ENUM('GRIEVANCE_STATUS_UPDATE', 'OFFICER_ASSIGNED', 'SLA_BREACH_WARNING', 'ESCALATION_TRIGGERED', 'SERVICE_APPLICATION_UPDATE', 'FEEDBACK_REQUEST', 'SYSTEM_ANNOUNCEMENT') NOT NULL DEFAULT 'GRIEVANCE_STATUS_UPDATE',
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `linkUrl` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_recipientId_idx`(`recipientId`),
    INDEX `notifications_isRead_idx`(`isRead`),
    INDEX `notifications_type_idx`(`type`),
    INDEX `notifications_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable audit_logs
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `changes` JSON NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_actorId_idx`(`actorId`),
    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- FOREIGN KEY CONSTRAINTS
-- ------------------------------------------------------------------------------

-- citizen_profiles
ALTER TABLE `citizen_profiles` ADD CONSTRAINT `citizen_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `citizen_profiles` ADD CONSTRAINT `citizen_profiles_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- officer_profiles
ALTER TABLE `officer_profiles` ADD CONSTRAINT `officer_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `officer_profiles` ADD CONSTRAINT `officer_profiles_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `officer_profiles` ADD CONSTRAINT `officer_profiles_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- grievance_categories
ALTER TABLE `grievance_categories` ADD CONSTRAINT `grievance_categories_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- grievances
ALTER TABLE `grievances` ADD CONSTRAINT `grievances_citizenId_fkey` FOREIGN KEY (`citizenId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `grievances` ADD CONSTRAINT `grievances_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `grievances` ADD CONSTRAINT `grievances_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `grievance_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `grievances` ADD CONSTRAINT `grievances_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ai_classifications
ALTER TABLE `ai_classifications` ADD CONSTRAINT `ai_classifications_grievanceId_fkey` FOREIGN KEY (`grievanceId`) REFERENCES `grievances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ai_classifications` ADD CONSTRAINT `ai_classifications_predictedDepartmentId_fkey` FOREIGN KEY (`predictedDepartmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ai_classifications` ADD CONSTRAINT `ai_classifications_predictedCategoryId_fkey` FOREIGN KEY (`predictedCategoryId`) REFERENCES `grievance_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- grievance_status_histories
ALTER TABLE `grievance_status_histories` ADD CONSTRAINT `grievance_status_histories_grievanceId_fkey` FOREIGN KEY (`grievanceId`) REFERENCES `grievances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grievance_status_histories` ADD CONSTRAINT `grievance_status_histories_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- grievance_assignments
ALTER TABLE `grievance_assignments` ADD CONSTRAINT `grievance_assignments_grievanceId_fkey` FOREIGN KEY (`grievanceId`) REFERENCES `grievances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grievance_assignments` ADD CONSTRAINT `grievance_assignments_officerProfileId_fkey` FOREIGN KEY (`officerProfileId`) REFERENCES `officer_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `grievance_assignments` ADD CONSTRAINT `grievance_assignments_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- grievance_attachments
ALTER TABLE `grievance_attachments` ADD CONSTRAINT `grievance_attachments_grievanceId_fkey` FOREIGN KEY (`grievanceId`) REFERENCES `grievances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grievance_attachments` ADD CONSTRAINT `grievance_attachments_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- escalations
ALTER TABLE `escalations` ADD CONSTRAINT `escalations_grievanceId_fkey` FOREIGN KEY (`grievanceId`) REFERENCES `grievances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `escalations` ADD CONSTRAINT `escalations_triggeredById_fkey` FOREIGN KEY (`triggeredById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `escalations` ADD CONSTRAINT `escalations_escalatedToUserId_fkey` FOREIGN KEY (`escalatedToUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- government_services
ALTER TABLE `government_services` ADD CONSTRAINT `government_services_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- service_applications
ALTER TABLE `service_applications` ADD CONSTRAINT `service_applications_citizenId_fkey` FOREIGN KEY (`citizenId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `service_applications` ADD CONSTRAINT `service_applications_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `government_services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `service_applications` ADD CONSTRAINT `service_applications_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `service_applications` ADD CONSTRAINT `service_applications_reviewingOfficerId_fkey` FOREIGN KEY (`reviewingOfficerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- service_documents
ALTER TABLE `service_documents` ADD CONSTRAINT `service_documents_serviceApplicationId_fkey` FOREIGN KEY (`serviceApplicationId`) REFERENCES `service_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `service_documents` ADD CONSTRAINT `service_documents_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- feedbacks
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_citizenId_fkey` FOREIGN KEY (`citizenId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_grievanceId_fkey` FOREIGN KEY (`grievanceId`) REFERENCES `grievances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_serviceApplicationId_fkey` FOREIGN KEY (`serviceApplicationId`) REFERENCES `service_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- notifications
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- audit_logs
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
