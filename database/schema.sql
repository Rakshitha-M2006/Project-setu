-- ==============================================================================
-- PROJECT SETU - MySQL Relational Schema Reference
-- Smart India Hackathon 2026
-- Database Engine: MySQL 8.0+ / InnoDB / utf8mb4
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `project_setu_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `project_setu_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `role` ENUM('CITIZEN', 'OFFICER', 'SENIOR_OFFICER', 'ADMIN') NOT NULL DEFAULT 'CITIZEN',
    `aadhaarHash` VARCHAR(64) NULL,
    `departmentId` VARCHAR(36) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_departmentId` (`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `slaHoursDefault` INT NOT NULL DEFAULT 48,
    `contactEmail` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Grievance Categories Table
CREATE TABLE IF NOT EXISTS `grievance_categories` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `departmentId` VARCHAR(36) NOT NULL,
    `defaultPriority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `slaHours` INT NOT NULL DEFAULT 48,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT `fk_cat_department` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Grievances Table
CREATE TABLE IF NOT EXISTS `grievances` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `trackingNumber` VARCHAR(30) NOT NULL UNIQUE,
    `citizenId` VARCHAR(36) NOT NULL,
    `departmentId` VARCHAR(36) NULL,
    `categoryId` VARCHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(255) NULL,
    `pincode` VARCHAR(10) NULL,
    `status` ENUM('SUBMITTED', 'AI_TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ESCALATED') NOT NULL DEFAULT 'SUBMITTED',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `aiConfidenceScore` FLOAT NULL,
    `aiSuggestedDepartmentId` VARCHAR(36) NULL,
    `aiKeywords` JSON NULL,
    `assignedOfficerId` VARCHAR(36) NULL,
    `slaDeadline` DATETIME(3) NULL,
    `isEscalated` BOOLEAN NOT NULL DEFAULT FALSE,
    `resolutionNote` TEXT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `idx_grievance_status` (`status`),
    INDEX `idx_grievance_priority` (`priority`),
    INDEX `idx_grievance_citizen` (`citizenId`),
    INDEX `idx_grievance_dept` (`departmentId`),
    INDEX `idx_grievance_officer` (`assignedOfficerId`),
    CONSTRAINT `fk_grv_citizen` FOREIGN KEY (`citizenId`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_grv_dept` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_grv_category` FOREIGN KEY (`categoryId`) REFERENCES `grievance_categories`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_grv_officer` FOREIGN KEY (`assignedOfficerId`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Grievance Timeline / History
CREATE TABLE IF NOT EXISTS `grievance_timelines` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `grievanceId` VARCHAR(36) NOT NULL,
    `actorId` VARCHAR(36) NULL,
    `action` VARCHAR(100) NOT NULL,
    `previousStatus` VARCHAR(50) NULL,
    `newStatus` VARCHAR(50) NOT NULL,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT `fk_timeline_grv` FOREIGN KEY (`grievanceId`) REFERENCES `grievances`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_timeline_actor` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Supporting Documents
CREATE TABLE IF NOT EXISTS `documents` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `grievanceId` VARCHAR(36) NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `fileUrl` VARCHAR(500) NOT NULL,
    `fileType` VARCHAR(50) NOT NULL,
    `fileSizeBytes` INT NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT `fk_doc_grv` FOREIGN KEY (`grievanceId`) REFERENCES `grievances`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Citizen Feedback
CREATE TABLE IF NOT EXISTS `citizen_feedbacks` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `grievanceId` VARCHAR(36) NOT NULL UNIQUE,
    `citizenId` VARCHAR(36) NOT NULL,
    `rating` TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    `feedbackText` TEXT NULL,
    `isSatisfied` BOOLEAN NOT NULL DEFAULT TRUE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT `fk_feedback_grv` FOREIGN KEY (`grievanceId`) REFERENCES `grievances`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_feedback_citizen` FOREIGN KEY (`citizenId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `userId` VARCHAR(36) NULL,
    `action` VARCHAR(100) NOT NULL,
    `resourceType` VARCHAR(50) NOT NULL,
    `resourceId` VARCHAR(36) NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(255) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `idx_audit_user` (`userId`),
    INDEX `idx_audit_resource` (`resourceType`, `resourceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
