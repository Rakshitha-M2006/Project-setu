# 🏛️ PROJECT SETU — PostgreSQL Database Architecture & Schema Specification

> **Smart India Hackathon 2026** | **Engine:** PostgreSQL 14+ Relational Engine | **ORM:** Prisma ORM 5.x | **Language:** TypeScript

---

## 1. Architectural Overview & Rationale

**PROJECT SETU** utilizes a normalized, enterprise-grade **PostgreSQL** relational database. PostgreSQL was specifically chosen over MongoDB and MySQL due to:

1. **Strict ACID & Referential Integrity**: Essential for government complaint redressal, legal audit trails, and financial tracking.
2. **Native PostgreSQL Enums**: Enforces strict domain validation at the database engine level for `Role`, `Priority`, `GrievanceStatus`, `ApplicationStatus`, and `EscalationLevel`.
3. **JSONB Data Storage**: Enables schema flexibility for dynamic application forms (`formData`), AI inference metadata (`rawInference`), and extracted keywords while retaining indexability.
4. **Decoupled Binary Storage**: Large file attachments (documents, images) store only URL and metadata in PostgreSQL, while binary payloads reside on S3-compatible cloud storage or localized blobs.
5. **High-Performance Multi-Column Indexes**: Targeted B-tree indexes for fast queries across tracking numbers, status, department, and SLA breach timestamps.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o| citizen_profiles : "1:1 profile"
    users ||--o| officer_profiles : "1:1 profile"
    users ||--o{ grievances : "lodges"
    users ||--o{ service_applications : "applies"
    users ||--o{ notifications : "receives"
    users ||--o{ audit_logs : "triggers"
    users ||--o{ feedbacks : "submits"

    departments ||--o{ officer_profiles : "employs"
    departments ||--o{ grievance_categories : "defines"
    departments ||--o{ grievances : "manages"
    departments ||--o{ government_services : "provides"
    departments ||--o{ service_applications : "processes"

    locations ||--o{ citizen_profiles : "residence"
    locations ||--o{ officer_profiles : "jurisdiction"
    locations ||--o{ grievances : "incident location"

    grievances ||--|| ai_classifications : "1:1 AI triage"
    grievances ||--o{ grievance_status_histories : "immutable log"
    grievances ||--o{ grievance_assignments : "officer tasks"
    grievances ||--o{ grievance_attachments : "evidence files"
    grievances ||--o{ escalations : "SLA breach triggers"
    grievances ||--o| feedbacks : "citizen rating"

    government_services ||--o{ service_applications : "instances"
    service_applications ||--o{ service_documents : "attached proofs"
    service_applications ||--o{ feedbacks : "service rating"
```

---

## 3. Schema Models & Table Definitions

### 1. `users` (Identity & Core Accounts)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Unique user account identifier |
| `email` | `TEXT` | `UNIQUE, NOT NULL` | Login email address |
| `phone` | `TEXT` | `UNIQUE, NULLABLE` | 10-digit Indian mobile number |
| `passwordHash` | `TEXT` | `NOT NULL` | Bcrypt hashed password string |
| `fullName` | `TEXT` | `NOT NULL` | Citizen or Officer full name |
| `role` | `ENUM Role` | `NOT NULL, DEFAULT 'CITIZEN'` | `CITIZEN`, `OFFICER`, `SENIOR_OFFICER`, `ADMIN` |
| `isActive` | `BOOLEAN` | `DEFAULT true` | Account active flag |
| `createdAt` | `TIMESTAMP(3)` | `DEFAULT CURRENT_TIMESTAMP` | Account registration timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Auto-updated timestamp |

### 2. `citizen_profiles` (Citizen Specifics)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Unique profile ID |
| `userId` | `TEXT` | `UNIQUE, FK -> users(id) ON DELETE CASCADE` | Associated user ID |
| `aadhaarHash` | `TEXT` | `UNIQUE, NULLABLE` | One-way salted hash of Aadhaar number |
| `gender` | `ENUM Gender` | `NULLABLE` | `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY` |
| `pincode` | `TEXT` | `NULLABLE` | 6-digit postal PIN code |
| `locationId` | `TEXT` | `FK -> locations(id) ON DELETE SET NULL` | Linked administrative geography |

### 3. `officer_profiles` (Officer Hierarchy)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Unique officer profile ID |
| `userId` | `TEXT` | `UNIQUE, FK -> users(id) ON DELETE CASCADE` | Associated user ID |
| `departmentId` | `TEXT` | `FK -> departments(id) ON DELETE RESTRICT` | Employing government department |
| `badgeNumber` | `TEXT` | `UNIQUE, NULLABLE` | Official government badge ID |
| `designation` | `TEXT` | `NOT NULL` | Officer official post (e.g. Assistant Engineer) |
| `jurisdictionWard` | `TEXT` | `NULLABLE` | Assigned municipal zone / ward |
| `isAvailable` | `BOOLEAN` | `DEFAULT true` | Ready to receive new assignments |

### 4. `departments` (Government Departments)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Unique department ID |
| `code` | `TEXT` | `UNIQUE, NOT NULL` | Unique code (e.g. `WATER_SUPPLY`, `ELECTRICITY`) |
| `name` | `TEXT` | `NOT NULL` | Full official department title |
| `defaultSlaHours` | `INTEGER` | `DEFAULT 48` | Standard resolution turnaround window |
| `escalationSlaHours`| `INTEGER` | `DEFAULT 24` | Time before supervisor escalation triggers |

### 5. `grievances` (Central Redressal Ledger)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Internal UUID |
| `trackingNumber` | `TEXT` | `UNIQUE, NOT NULL` | Public identifier (e.g. `SETU-2026-ELC-001245`) |
| `citizenId` | `TEXT` | `FK -> users(id) ON DELETE RESTRICT` | Citizen who filed the complaint |
| `departmentId` | `TEXT` | `FK -> departments(id) ON DELETE SET NULL` | Assigned department |
| `categoryId` | `TEXT` | `FK -> grievance_categories(id) ON DELETE SET NULL` | Assigned problem category |
| `status` | `ENUM GrievanceStatus` | `DEFAULT 'SUBMITTED'` | `SUBMITTED`, `AI_TRIAGED`, `ASSIGNED`, `IN_PROGRESS`, `UNDER_INSPECTION`, `RESOLVED`, `REJECTED`, `ESCALATED`, `REOPENED` |
| `priority` | `ENUM Priority` | `DEFAULT 'PENDING_AI'` | `PENDING_AI`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `isUrgent` | `BOOLEAN` | `DEFAULT false` | Immediate public safety hazard flag |
| `slaDeadline` | `TIMESTAMP(3)` | `NULLABLE` | Guaranteed resolution target deadline |
| `slaBreached` | `BOOLEAN` | `DEFAULT false` | Automated breach flag |

### 6. `ai_classifications` (AI Microservice Inferences)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Unique inference ID |
| `grievanceId` | `TEXT` | `UNIQUE, FK -> grievances(id) ON DELETE CASCADE` | Analyzed grievance ID |
| `predictedDepartmentCode` | `TEXT` | `NULLABLE` | AI recommended department code |
| `confidenceScore` | `DOUBLE PRECISION` | `NOT NULL` | Confidence float between 0.0 and 1.0 |
| `priorityScore` | `ENUM Priority` | `NOT NULL` | AI predicted priority |
| `detectedSentiment` | `TEXT` | `NOT NULL` | `FRUSTRATED_CRITICAL`, `DISSATISFIED`, `NEUTRAL`, `SATISFIED` |
| `extractedKeywords` | `JSONB` | `NULLABLE` | Array of extracted tokens |
| `suggestedSlaHours` | `INTEGER` | `NOT NULL` | Suggested turnaround window |
| `modelVersion` | `TEXT` | `DEFAULT '1.0.0-sih'` | Version of NLP model used |
| `rawInference` | `JSONB` | `NULLABLE` | Complete inference payload |

### 7. `grievance_status_histories` (Immutable Audit Trail)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT (UUID)` | `PRIMARY KEY` | Unique history record ID |
| `grievanceId` | `TEXT` | `FK -> grievances(id) ON DELETE CASCADE` | Grievance ID |
| `actorId` | `TEXT` | `FK -> users(id) ON DELETE SET NULL` | User who made the change (NULL if AI system) |
| `previousStatus` | `ENUM GrievanceStatus` | `NULLABLE` | Status before transition |
| `newStatus` | `ENUM GrievanceStatus` | `NOT NULL` | Status after transition |
| `actionTaken` | `TEXT` | `NOT NULL` | Action code (e.g. `GRIEVANCE_AI_TRIAGED`) |
| `remarks` | `TEXT` | `NULLABLE` | Officer notes or explanation |

---

## 4. Indexing & Query Optimization Strategy

| Index Name | Table | Columns | Purpose |
| :--- | :--- | :--- | :--- |
| `grievances_trackingNumber_idx` | `grievances` | `(trackingNumber)` | O(1) citizen live tracking lookups |
| `grievances_citizenId_idx` | `grievances` | `(citizenId)` | Fast citizen portal dashboard listing |
| `grievances_departmentId_idx` | `grievances` | `(departmentId)` | Departmental officer queue filtering |
| `grievances_status_priority_idx` | `grievances` | `(status, priority)` | High-speed triage and urgency dashboards |
| `grievances_slaDeadline_idx` | `grievances` | `(slaDeadline)` | Cron job scanning for impending SLA breaches |
| `ai_classifications_confidenceScore_idx` | `ai_classifications` | `(confidenceScore)` | Identifying queries needing human review (< 85%) |
| `audit_logs_actorId_createdAt_idx` | `audit_logs` | `(actorId, createdAt)` | Forensic audit log chronological search |

---

## 5. Migration & Seeding Instructions

### Environment Variable Format:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_setu?schema=public"
```

### Commands:
```bash
# 1. Validate Schema
npx prisma validate

# 2. Generate Prisma Client
npx prisma generate

# 3. Apply Migrations to PostgreSQL
npx prisma migrate dev --name init_postgresql

# 4. Seed Master and Development Records
npx prisma db seed
```
