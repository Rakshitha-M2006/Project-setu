# PROJECT SETU (सेतु)
### *AI-Powered Government Service & Grievance Redressal Platform*
**Smart India Hackathon 2026**

---

## 🏛️ Executive Summary

**PROJECT SETU** is an enterprise-grade, AI-driven public service delivery and grievance redressal platform engineered to bridge the trust and efficiency gap between citizens and government administrations.

By integrating automated Natural Language Processing (NLP), dynamic priority scoring, SLA escalation matrices, and secure role-based access control (RBAC), SETU transforms citizen complaints into actionable, auditable, and transparent administrative workflows.

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  |    Citizen / Officer  |
                                  |     Modern Web UI     |
                                  | (React + TS + Vite)   |
                                  +-----------+-----------+
                                              |
                                     HTTP / REST (JWT)
                                              |
                                              v
                                  +-----------------------+
                                  |   Node.js API Gateway |
                                  |     (Express + TS)    |
                                  |   RBAC & Data Layer   |
                                  +-----+-----------+-----+
                                        |           |
                        Prisma Client (MySQL)       HTTP REST (JSON)
                                        |           |
                                        v           v
                    +-----------------------+   +-----------------------+
                    |   MySQL Relational    |   | Python AI Microservice|
                    |       Database        |   |   (FastAPI + NLP)     |
                    | (Grievances, Audits)  |   |  (Route & Classify)   |
                    +-----------------------+   +-----------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS | Responsive Citizen/Officer Portals, Lucide Icons, Axios Interceptors |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM | REST APIs, JWT Auth, Role-Based Access Control, Zod Validation |
| **Database** | MySQL 8.0+ | ACID Relational Model, Prisma Migrations, Auditing Logs |
| **AI Service** | Python 3.10+, FastAPI, Scikit-learn, Uvicorn | NLP Grievance Classification, SLA Priority Scoring, Department Routing |
| **Security** | Helmet, CORS, Argon2/Bcrypt, Rate Limiting | Defense-in-depth, strictly separated secrets, auditable actions |

---

## 📁 Repository Structure

```
PROJECT SETU/
├── frontend/                 # React + TypeScript + Vite Single Page Application
│   ├── src/
│   │   ├── api/              # Axios instance and API service calls
│   │   ├── components/       # Reusable layout and UI widgets
│   │   ├── context/          # React Context (AuthContext for RBAC)
│   │   ├── pages/            # Role-specific dashboard & landing pages
│   │   ├── types/            # TypeScript interfaces for entity models
│   │   ├── App.tsx           # Router configuration
│   │   └── main.tsx          # App entry point
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   └── schema.prisma     # Prisma Data Model (MySQL)
│   ├── src/
│   │   ├── config/           # Database, environment, and constants config
│   │   ├── controllers/      # Route controllers (Auth, Grievance, Dept)
│   │   ├── middleware/       # JWT Auth, RBAC guards, error handling
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # AI Service HTTP bridge & business logic
│   │   ├── types/            # Custom type definitions
│   │   ├── utils/            # ApiResponse, ApiError, and Logger utilities
│   │   ├── app.ts            # Express application setup
│   │   └── server.ts         # Server bootstrap and lifecycle listeners
│   ├── package.json
│   └── tsconfig.json
│
├── ai-service/               # Python FastAPI Microservice
│   ├── app/
│   │   ├── api/v1/           # Classification, Routing & Health endpoints
│   │   ├── core/             # Configuration & environment loader
│   │   ├── models/           # Pydantic schemas for request / response
│   │   ├── services/         # NLP text classifier & priority detector
│   │   └── main.py           # FastAPI application root
│   ├── requirements.txt
│   └── .env.example
│
├── database/                 # MySQL Schema Definitions & Initial Seed Scripts
│   ├── seeds/                # Initial department & admin seed data
│   ├── schema.sql            # MySQL DDL snapshot
│   └── README.md
│
├── docs/                     # Technical Specifications & Architecture Docs
│   ├── architecture.md       # High-level architecture & sequence diagrams
│   ├── api-spec.md           # OpenAPI / REST API specifications
│   └── sih2026-workflow.md   # SIH 2026 lifecycle and escalation policies
│
├── .gitignore                # Global git ignore configuration
├── .env.example              # Root environment template
└── README.md                 # Project README
```

---

## 👥 User Roles & Access Control

| Role | Access Level & Responsibilities |
| :--- | :--- |
| **`CITIZEN`** | Submit grievances, track progress, upload verification documents, submit feedback. |
| **`OFFICER`** | View assigned department grievances, update resolution timeline, resolve issues. |
| **`SENIOR_OFFICER`**| Monitor department SLA compliance, handle escalated issues, reassign officers. |
| **`ADMIN`** | System-wide configuration, manage departments, manage users, audit logs. |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on v25+)
- **Python**: v3.10+
- **MySQL**: 8.0+
- **Git**: Installed

---

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and supply your MySQL DATABASE_URL:
# DATABASE_URL="mysql://root:password@localhost:3306/project_setu_db"

npm install
npx prisma generate
# When MySQL is running:
# npx prisma migrate dev --name init

npm run dev
# Backend runs on http://localhost:5000
```

---

### 2. AI Microservice Setup

```bash
cd ai-service
cp .env.example .env

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# AI Service runs on http://localhost:8000
# OpenAPI Docs: http://localhost:8000/docs
```

---

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env

npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔒 Security & Best Practices

- **Zero Hardcoded Secrets**: All keys, database credentials, and service tokens are loaded via `.env` files.
- **Strict Role-Based Routing**: Both client-side React routes and server-side Express routes enforce role guards.
- **Relational Integrity**: MySQL enforces relational constraints and referential actions across grievances, users, and departments.
- **Isolated AI Layer**: The AI microservice operates statelessly, minimizing attack surface.

---

## 📜 License
Developed for the **Smart India Hackathon 2026**. All rights reserved.
