# PROJECT SETU - Database Setup Guide (MySQL)

This folder contains the raw relational database scripts and migration reference for **PROJECT SETU**.

---

## 🗄️ Database Architecture

PROJECT SETU uses **MySQL 8.0+** as the primary relational persistence layer, managed by **Prisma ORM** in the backend.

### Key Relational Entities:
1. **`users`**: Citizen and Officer credentials, roles (`CITIZEN`, `OFFICER`, `SENIOR_OFFICER`, `ADMIN`), department linkage.
2. **`departments`**: Administrative authorities (Water, Electricity, PWD, Health, Revenue, etc.) and SLA policies.
3. **`grievance_categories`**: Hierarchical category taxonomy with default urgency & SLA baselines.
4. **`grievances`**: Core grievance entities tracking status, priority, AI triage scores, and assignment.
5. **`grievance_timelines`**: Immutable event history for all state transitions and remarks.
6. **`documents`**: Citizen proof and officer resolution attachments.
7. **`citizen_feedbacks`**: Post-resolution citizen satisfaction ratings and comments.
8. **`audit_logs`**: System security and administrative event audit records.

---

## 🚀 How to Initialize Database

### Option A: Using Prisma Migrations (Recommended)
1. Ensure MySQL is running on your machine:
   ```bash
   mysql -u root -p
   ```
2. Create the database:
   ```sql
   CREATE DATABASE project_setu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Set your connection string in `backend/.env`:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/project_setu_db"
   ```
4. Run Prisma migration from `backend/`:
   ```bash
   cd ../backend
   npx prisma migrate dev --name init
   ```

### Option B: Using Raw SQL Scripts
You can also directly load the DDL and seed scripts via MySQL CLI:
```bash
mysql -u root -p < schema.sql
mysql -u root -p < seeds/initial_seed.sql
```
