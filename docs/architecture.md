# PROJECT SETU - Architectural Design Document

## 1. System Overview

PROJECT SETU is designed as a modular, decoupled full-stack platform consisting of:
1. **Frontend Presentation Tier**: React 19 Single Page Application with Tailwind CSS and Vite.
2. **API & Business Logic Gateway**: Node.js / Express TypeScript service enforcing RBAC, business rules, and transaction boundaries.
3. **Relational Persistence Tier**: MySQL 8.0+ managed by Prisma ORM.
4. **AI Microservice Tier**: High-throughput Python FastAPI service running NLP grievance categorization, sentiment analysis, priority evaluation, and anomaly detection.

---

## 2. Component Topology & Network Flow

```mermaid
graph TD
    subgraph Client Layer
        A[Citizen Web Portal]
        B[Officer Management Dashboard]
        C[Admin Analytics Portal]
    end

    subgraph API Gateway / Backend [Node.js + Express + TS]
        D[JWT & RBAC Middleware]
        E[Auth Controller]
        F[Grievance Controller]
        G[Department Controller]
        H[AI Service Bridge Client]
    end

    subgraph Persistence Layer
        I[(MySQL 8.0+ Database)]
    end

    subgraph AI Intelligence Layer [Python FastAPI]
        J[NLP Classification Engine]
        K[Priority & Urgency Scorer]
        L[Department Matcher & Router]
        M[Anomaly / Duplicate Detector]
    end

    A -->|HTTPS / REST| D
    B -->|HTTPS / REST| D
    C -->|HTTPS / REST| D

    D --> E
    D --> F
    D --> G

    F -->|Prisma ORM| I
    E -->|Prisma ORM| I
    G -->|Prisma ORM| I

    F -->|Internal REST Call| H
    H -->|Port 8000| J
    H -->|Port 8000| K
    H -->|Port 8000| L
    H -->|Port 8000| M
```

---

## 3. Communication Protocols

| Interface | Protocol | Serialization | Authentication |
| :--- | :--- | :--- | :--- |
| Client <-> Backend | HTTP/1.1 / HTTP/2 | JSON | JWT Bearer Token |
| Backend <-> MySQL | MySQL Native Protocol | Binary (Prisma Driver) | Database Credentials |
| Backend <-> AI Microservice | Internal HTTP/REST | JSON | Service API Key / Internal Network |

---

## 4. Security Architecture

1. **Defense-in-Depth**:
   - Helmet headers (XSS, CSP, frameguard).
   - Rate limiting on authentication and grievance submission endpoints.
   - Strict CORS configuration separating allowed frontend origins.
2. **Role-Based Access Control (RBAC)**:
   - Evaluated server-side via `roleGuard` middleware (`CITIZEN`, `OFFICER`, `SENIOR_OFFICER`, `ADMIN`).
   - Granular resource-level authorization (e.g., Citizens can only inspect their own grievances; Officers can only update complaints within their assigned department).
3. **Data Protection**:
   - Passwords hashed using `bcryptjs` with salt rounds >= 10.
   - Sensitive identification tokens (e.g., Aadhaar hashes) are non-reversible.
   - Comprehensive `AuditLog` capturing timestamp, actor ID, action, resource, and IP address.
