# 🏛️ PROJECT SETU (सेतु)
### *AI-Powered Government Services & Grievance Management Platform*
**National Digital Public Infrastructure (DPI) Flagship Platform**

---

## 🏛️ Executive Summary

**PROJECT SETU** is an enterprise-grade, distributed public service delivery and grievance redressal platform engineered to bridge the trust and efficiency gap between citizens and government administrations.

By integrating automated Natural Language Processing (NLP), dynamic priority scoring, SLA escalation matrices, real-time forensic audit logging, and secure role-based access control (RBAC), SETU transforms citizen complaints into actionable, auditable, and transparent administrative workflows.

---

## 🏗️ System Architecture

```
                                    🌐 CITIZENS & OFFICIALS (HTTPS)
                                                │
                                                ▼
                     ┌─────────────────────────────────────────────────────┐
                     │         Reverse Proxy & Web Server (NGINX)          │
                     │          • SSL/TLS Termination (Port 443)           │
                     │          • Static Assets Cache & Gzip               │
                     │          • SPA Fallback Routing                     │
                     └──────────────────┬────────────────┬─────────────────┘
                                        │                │
                        /api/v1/*       │                │   Static /
                        API Requests    │                │   HTML/JS/CSS
                                        ▼                ▼
                     ┌───────────────────────┐   ┌─────────────────────────┐
                     │   Core REST API       │   │  React 18 SPA Frontend  │
                     │   Node.js + Express   │   │  Vite + TypeScript      │
                     │   (Port 5000)         │   │  Tailwind CSS           │
                     └──────────┬────────────┘   └─────────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │ (Internal HTTP with Auth)   │
                 ▼                             ▼
   ┌───────────────────────────┐   ┌────────────────────────────────────────┐
   │ AI NLP Microservice       │   │ Relational Database (Prisma ORM)       │
   │ Python 3.11 + FastAPI     │   │ MySQL 8.0+ / PostgreSQL 14+            │
   │ (Port 8000)               │   │ (Port 3306 / 5432)                     │
   │ • Triage & Department NLP │   │ • ACID Transactions                   │
   │ • Urgency / SLA Detection │   │ • Immutable Forensic Audit Trail       │
   │ • Anomaly Volume Spikes   │   │ • 10-Domain Schema                     │
   └───────────────────────────┘   └────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Responsive Citizen/Officer/Admin Portals, Accessible Focus Rings, Status Badges |
| **Backend API** | Node.js 20, Express, TypeScript, Prisma ORM | REST APIs, JWT (HS256) Auth, RBAC Guards, Zod Validation, Rate Limiting |
| **Relational Database** | MySQL 8.0+ / PostgreSQL 14+ | Relational Integrity, Prisma Migrations, Master Seed Data, Audit Ledger |
| **AI Microservice** | Python 3.11, FastAPI, Scikit-learn, Uvicorn | NLP Grievance Classification, SLA Priority Scoring, Anomaly Detection |
| **Security & Ops** | Helmet, CORS, Argon2/Bcrypt, PM2, Docker | Defense-in-depth, strictly separated secrets, health check monitoring |

---

## 📁 Repository Structure

```
PROJECT SETU/
├── frontend/                 # React + TypeScript + Vite Single Page Application
│   ├── src/                  # Components, Pages, Context, API clients
│   ├── Dockerfile            # Multi-stage production container with NGINX
│   ├── nginx.conf            # Production NGINX reverse proxy & security headers
│   └── package.json
│
├── backend/                  # Node.js + Express + TypeScript Backend API
│   ├── prisma/               # Prisma Schema & Database Migrations
│   ├── src/                  # Controllers, Services, Middleware, Routes, Utils
│   ├── Dockerfile            # Multi-stage production container (Node 20 Alpine)
│   └── package.json
│
├── ai-service/               # Python FastAPI Microservice
│   ├── app/                  # NLP Classifier, Priority Detector, Anomaly Engine
│   ├── Dockerfile            # Multi-worker Uvicorn production container
│   └── requirements.txt
│
├── database/                 # Raw SQL DDL snapshots & seed scripts
│   ├── schema.sql
│   └── seeds/
│
├── docs/                     # Technical specifications & architecture manuals
├── docker-compose.yml        # Development multi-container stack
├── docker-compose.prod.yml   # Production hardened multi-container stack
├── ecosystem.config.js       # PM2 production process manager configuration
├── DEPLOYMENT.md             # Master Production Deployment Guide
├── .env.example              # Master environment configuration template
└── package.json              # Root workspace management & build scripts
```

---

## 🚀 Quick Start Guide (Local Development)

### Prerequisites
- **Node.js**: `v18.x` or `v20.x LTS`
- **Python**: `3.10` or `3.11`
- **Database Engine**: `MySQL 8.0+` or `PostgreSQL 14+`
- **Git**: Installed

---

### 1. Unified Install
Install dependencies across all workspaces with one command from the project root:
```bash
npm run install:all
```

---

### 2. Database Initialization
1. Start your database service (MySQL or PostgreSQL).
2. Create database:
   ```sql
   CREATE DATABASE project_setu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Copy environment configuration and set your connection URL:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp ai-service/.env.example ai-service/.env
   cp frontend/.env.example frontend/.env
   ```
4. Run migrations and seed data:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

---

### 3. Start Development Services

**Option A: Individual Terminals**
```bash
# Terminal 1: Backend API (Port 5000)
npm run dev:backend

# Terminal 2: AI Microservice (Port 8000)
npm run dev:ai

# Terminal 3: Frontend Web App (Port 5173)
npm run dev:frontend
```

**Option B: Docker Compose**
```bash
docker-compose up -d
```

---

## 🚢 Production Deployment

For complete, step-by-step production deployment instructions, please refer to the dedicated **[DEPLOYMENT.md](DEPLOYMENT.md)** guide.

### Quick Production Deployment Commands:

**Using Docker Compose (Recommended for Containers):**
```bash
cp .env.example .env
npm run docker:build
npm run docker:up
```

**Using PM2 (Recommended for Bare-Metal / Virtual Machines):**
```bash
npm run build:all
npm run prisma:migrate:prod
pm2 start ecosystem.config.js --env production
```

---

## 👥 User Roles & Access Control

| Role | Access Level & Responsibilities |
| :--- | :--- |
| **`CITIZEN`** | Submit grievances, track SLA countdowns, browse government services, upload documents, rate resolution satisfaction. |
| **`OFFICER`** | Claim department grievances, perform on-site inspections, update status timelines, upload verification evidence. |
| **`SENIOR_OFFICER`**| Supervise department SLA compliance, handle auto-escalated issues, assign officers. |
| **`ADMIN`** | Multi-department command, manage users/officers, inspect AI accuracy, monitor anomalies, view immutable forensic audit logs. |

---

## 🔒 Security Hardening

- **Defense in Depth**: Zero plaintext secrets committed; clean `.env.example` templates.
- **Inter-Service Authentication**: Shared internal secret header (`X-Internal-API-Key`) between Express backend and FastAPI microservice.
- **IDOR Protection**: File streaming endpoints verify resource ownership before granting access.
- **SQL Injection Defense**: Strict query parameterization via Prisma ORM.
- **Rate Limiting**: Configured for authentication, API routes, and document uploads.
- **Audit Ledger**: Forensic recording of every security, administrative, and case state change.

---

## 📜 License
PROJECT SETU • Enterprise Public Digital Infrastructure. All rights reserved.
