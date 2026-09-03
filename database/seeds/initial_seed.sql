-- ==============================================================================
-- PROJECT SETU - Initial Seed Data Script
-- AI-Powered Government Services & Grievance Management Platform
-- ==============================================================================

USE `project_setu_db`;

-- Insert Core Government Departments
INSERT INTO `departments` (`id`, `code`, `name`, `description`, `slaHoursDefault`, `contactEmail`, `isActive`, `createdAt`, `updatedAt`)
VALUES
('dept-01', 'WATER_SUPPLY', 'Department of Drinking Water and Sanitation', 'Manages municipal drinking water distribution, pipeline leakages, and water purity standards.', 24, 'support.water@setu.gov.in', 1, NOW(), NOW()),
('dept-02', 'ELECTRICITY', 'Department of Power & Renewable Energy', 'Handles power grid interruptions, transformer malfunctions, streetlighting, and billing disputes.', 12, 'support.power@setu.gov.in', 1, NOW(), NOW()),
('dept-03', 'ROADS_HIGHWAYS', 'Public Works & Road Infrastructure (PWD)', 'Responsible for road repairs, pothole filling, storm water drainage, and pedestrian paths.', 72, 'support.pwd@setu.gov.in', 1, NOW(), NOW()),
('dept-04', 'HEALTH_SANITATION', 'Public Health & Municipal Solid Waste', 'Manages garbage collection, disease vector control, open dumpsites, and civic cleanliness.', 24, 'support.health@setu.gov.in', 1, NOW(), NOW()),
('dept-05', 'REVENUE_LAND', 'Revenue and Land Administration', 'Handles land records, property tax assessments, mutation certificates, and land encumbrances.', 96, 'support.revenue@setu.gov.in', 1, NOW(), NOW()),
('dept-06', 'WOMEN_CHILD', 'Women & Child Welfare Department', 'Supervises Anganwadi centers, women safety hotlines, and social welfare distribution.', 24, 'support.wcd@setu.gov.in', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Insert Grievance Categories
INSERT INTO `grievance_categories` (`id`, `name`, `departmentId`, `defaultPriority`, `slaHours`, `createdAt`)
VALUES
('cat-01', 'Pipe Leakage & Contaminated Water', 'dept-01', 'HIGH', 24, NOW()),
('cat-02', 'Low Water Pressure / No Supply', 'dept-01', 'MEDIUM', 48, NOW()),
('cat-03', 'Power Cut / Transformer Sparking', 'dept-02', 'CRITICAL', 6, NOW()),
('cat-04', 'Faulty Smart Electric Meter', 'dept-02', 'LOW', 72, NOW()),
('cat-05', 'Dangerous Pothole / Broken Road', 'dept-03', 'HIGH', 48, NOW()),
('cat-06', 'Clogged Drainage / Waterlogging', 'dept-03', 'HIGH', 24, NOW()),
('cat-07', 'Uncollected Garbage / Waste Heap', 'dept-04', 'MEDIUM', 24, NOW()),
('cat-08', 'Hospital Staff Misconduct / Shortage', 'dept-04', 'HIGH', 24, NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
