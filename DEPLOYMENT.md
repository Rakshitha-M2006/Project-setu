# 🏛️ PROJECT SETU — Master Production Deployment Manual
### Smart India Hackathon 2026 • AI-Powered Citizen Grievance Redressal & Public Service Delivery Platform

---

## 📑 Table of Contents

1. [Architecture & Topology](#1-architecture--topology)
2. [Server & System Requirements](#2-server--system-requirements)
3. [Environment Configuration & Variables](#3-environment-configuration--variables)
4. [Relational Database Setup (MySQL 8.0+ / PostgreSQL 14+)](#4-relational-database-setup-mysql-80--postgresql-14)
5. [Prisma Client Generation & Database Migration](#5-prisma-client-generation--database-migration)
6. [Backend API Deployment (Node.js + Express + TypeScript)](#6-backend-api-deployment-nodejs--express--typescript)
7. [AI NLP Microservice Deployment (Python 3.11 + FastAPI)](#7-ai-nlp-microservice-deployment-python-311--fastapi)
8. [Frontend SPA Deployment (React + Vite + NGINX)](#8-frontend-spa-deployment-react--vite--nginx)
9. [Automated Docker & Docker Compose Deployment](#9-automated-docker--docker-compose-deployment)
10. [PM2 Production Process Management](#10-pm2-production-process-management)
11. [Health Checks, Monitoring & Logging](#11-health-checks-monitoring--logging)
12. [Security Hardening & Production Checklist](#12-security-hardening--production-checklist)
13. [Troubleshooting & Recovery Runbook](#13-troubleshooting--recovery-runbook)

---

## 1. Architecture & Topology

PROJECT SETU is designed as a **3-Tier Distributed Microservice Architecture** adhering to Government of India (GoI) Digital Public Infrastructure guidelines.

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

## 2. Server & System Requirements

### Recommended Hardware Specifications (Production)

| Resource | Minimum (Staging/Demo) | Recommended (Enterprise Production) |
| :--- | :--- | :--- |
| **CPU** | 2 vCPUs | 4 to 8 vCPUs |
| **RAM** | 4 GB | 16 GB |
| **Storage** | 40 GB SSD | 160 GB NVMe SSD |
| **OS** | Ubuntu 22.04 LTS / Debian 12 | Ubuntu 22.04 LTS / RHEL 9 |

### Software Prerequisites

- **Node.js**: `v20.x LTS` (or `v18.x LTS`)
- **npm**: `v10.x`
- **Python**: `3.10` or `3.11`
- **Database Engine**: `MySQL 8.0+` or `PostgreSQL 14+`
- **NGINX**: `1.22+`
- **Process Manager**: `PM2` (`npm install -g pm2`) or `Docker & Docker Compose`

---

## 3. Environment Configuration & Variables

PROJECT SETU uses strictly separated configuration for **Development** vs **Production**.

### 3.1 Backend Environment Configuration (`backend/.env`)

Create `backend/.env` based on `backend/.env.example`:

```env
# Runtime
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
API_PREFIX=/api/v1
LOG_LEVEL=info

# Database Connection (MySQL 8.0+ or PostgreSQL 14+)
# For MySQL:
DATABASE_URL="mysql://setu_user:StrongDBPassword123!@localhost:3306/project_setu?sslaccept=strict&connection_limit=20"
# For PostgreSQL:
# DATABASE_URL="postgresql://setu_user:StrongDBPassword123!@localhost:5432/project_setu?schema=public&connection_limit=20"

# Cryptographic Security (Generate with: openssl rand -base64 48)
JWT_SECRET=c2V0dV9zdXBlcl9zZWN1cmVfZW50ZXJwcmlzZV9rZXlfMjAyNg==
JWT_EXPIRES_IN=7d

# Microservice Inter-Communication & Security
AI_SERVICE_URL=http://127.0.0.1:8000
AI_CONFIDENCE_THRESHOLD=0.85
AI_REQUEST_TIMEOUT_MS=5000
INTERNAL_API_SECRET=setu_internal_microservice_secret_key_2026

# CORS: Comma-separated list of allowed production domains
CORS_ORIGIN=https://setu.gov.in,https://admin.setu.gov.in

# Object Storage
STORAGE_PROVIDER=LOCAL
STORAGE_LOCAL_PATH=./uploads
STORAGE_MAX_FILE_SIZE_BYTES=10485760
```

### 3.2 AI Microservice Environment Configuration (`ai-service/.env`)

Create `ai-service/.env` based on `ai-service/.env.example`:

```env
ENVIRONMENT=production
PORT=8000
HOST=0.0.0.0
PROJECT_NAME=PROJECT SETU AI NLP Microservice
MODEL_VERSION=1.0.0-sih
CONFIDENCE_THRESHOLD=0.85
INTERNAL_API_SECRET=setu_internal_microservice_secret_key_2026
ALLOWED_ORIGINS=http://localhost:5000,http://127.0.0.1:5000
```

### 3.3 Frontend Environment Configuration (`frontend/.env`)

Create `frontend/.env`:

```env
# When served behind NGINX reverse proxy:
VITE_API_BASE_URL=/api/v1

# When standalone:
# VITE_API_BASE_URL=https://api.setu.gov.in/api/v1
```

---

## 4. Relational Database Setup (MySQL 8.0+ / PostgreSQL 14+)

### Option A: MySQL 8.0+ Setup

1. **Log in to MySQL as root**:
   ```bash
   mysql -u root -p
   ```

2. **Create the production database with UTF-8 character encoding**:
   ```sql
   CREATE DATABASE project_setu 
     CHARACTER SET utf8mb4 
     COLLATE utf8mb4_unicode_ci;
   ```

3. **Create dedicated non-root application user**:
   ```sql
   CREATE USER 'setu_user'@'localhost' IDENTIFIED BY 'StrongDBPassword123!';
   GRANT ALL PRIVILEGES ON project_setu.* TO 'setu_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Verify connection**:
   ```bash
   mysql -u setu_user -p project_setu -e "SELECT 1;"
   ```

### Option B: PostgreSQL 14+ Setup

1. **Create database & user**:
   ```bash
   sudo -u postgres psql
   ```
   ```sql
   CREATE USER setu_user WITH ENCRYPTED PASSWORD 'StrongDBPassword123!';
   CREATE DATABASE project_setu OWNER setu_user;
   GRANT ALL PRIVILEGES ON DATABASE project_setu TO setu_user;
   \q
   ```

---

## 5. Prisma Client Generation & Database Migration

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Generate the Prisma Type-Safe Client**:
   ```bash
   npx prisma generate
   ```

3. **Execute Production Schema Migrations**:
   ```bash
   # In production, use 'migrate deploy' to apply pending migrations safely:
   npx prisma migrate deploy
   ```

4. **Seed Administrative Master Data**:
   Populates 6 core government departments, grievance categories, services, and default administrative roles:
   ```bash
   npm run prisma:seed
   ```

5. *(Optional)* **Inspect Database with Prisma Studio**:
   ```bash
   npx prisma studio --port 5555
   ```

---

## 6. Backend API Deployment (Node.js + Express + TypeScript)

1. **Install Dependencies**:
   ```bash
   cd backend
   npm ci
   ```

2. **Compile TypeScript into Production JavaScript**:
   ```bash
   npm run build
   ```
   *Output files will be generated in `backend/dist/`.*

3. **Verify Health & Start Server**:
   ```bash
   node dist/server.js
   ```

4. **Verify Healthcheck Endpoint**:
   ```bash
   curl http://localhost:5000/api/v1/health
   ```
   *Expected Response:*
   ```json
   {
     "success": true,
     "data": {
       "status": "healthy",
       "service": "PROJECT SETU Core Engine",
       "environment": "production",
       "dependencies": {
         "database": { "status": "connected" },
         "aiMicroservice": { "status": "connected" }
       }
     }
   }
   ```

---

## 7. AI NLP Microservice Deployment (Python 3.11 + FastAPI)

1. **Navigate to the AI service directory**:
   ```bash
   cd ai-service
   ```

2. **Create and activate a Python Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate    # On Linux/macOS
   # .\venv\Scripts\activate   # On Windows
   ```

3. **Install Requirements**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Run Production Server with Uvicorn (Multi-Worker)**:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

5. **Verify AI Microservice Health**:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

---

## 8. Frontend SPA Deployment (React + Vite + NGINX)

1. **Navigate to frontend directory and build static bundles**:
   ```bash
   cd frontend
   npm ci
   npm run build
   ```
   *Production static bundle is generated in `frontend/dist/`.*

2. **Deploy via NGINX**:
   Copy the `dist/` directory to the NGINX web root:
   ```bash
   sudo cp -r dist/* /var/www/setu/
   ```

3. **NGINX Production Server Block Configuration** (`/etc/nginx/sites-available/setu`):
   ```nginx
   server {
       listen 80;
       server_name setu.gov.in www.setu.gov.in;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name setu.gov.in www.setu.gov.in;

       ssl_certificate /etc/letsencrypt/live/setu.gov.in/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/setu.gov.in/privkey.pem;

       root /var/www/setu;
       index index.html;

       # Security Headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;

       # Gzip Compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

       # API Reverse Proxy
       location /api/ {
           proxy_pass http://127.0.0.1:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Static Asset Caching
       location ~* \.(?:css|js|jpg|jpeg|png|svg|ico|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # SPA Fallback
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Enable site and reload NGINX**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/setu /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 9. Automated Docker & Docker Compose Deployment

PROJECT SETU includes a fully automated, production-hardened multi-container stack.

```bash
# 1. Clone repository on production server
git clone https://github.com/organization/project-setu.git
cd project-setu

# 2. Configure master production environment
cp .env.example .env
nano .env

# 3. Build all containers
npm run docker:build
# Or: docker-compose -f docker-compose.prod.yml build

# 4. Start all services in detached mode
npm run docker:up
# Or: docker-compose -f docker-compose.prod.yml up -d

# 5. Check container health status
docker-compose -f docker-compose.prod.yml ps

# 6. Stream live logs
npm run docker:logs
```

---

## 10. PM2 Production Process Management

For non-containerized bare-metal or VM deployments, use PM2:

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Start all services via ecosystem config
pm2 start ecosystem.config.js --env production

# 3. View live monitoring status
pm2 status
pm2 monit

# 4. Enable PM2 startup on system reboot
pm2 startup
pm2 save

# 5. Zero-downtime reload on code updates
pm2 reload all
```

---

## 11. Health Checks, Monitoring & Logging

### Health Endpoints

| Service | Endpoint | Method | Success Response |
| :--- | :--- | :--- | :--- |
| **Backend Core** | `/api/v1/health` | `GET` | `200 OK` (Database + AI connectivity verified) |
| **AI Microservice** | `http://localhost:8000/api/v1/health` | `GET` | `200 OK` (NLP engine readiness status) |
| **Web Server** | `/healthz` | `GET` | `200 OK` (NGINX liveness) |

### Centralized Logging

- **Backend HTTP Logs**: Structured Morgan format with sanitized headers.
- **Audit Logs**: Stored immutably in relational database `audit_logs` table.
- **File System Logs**: Available at `backend/logs/` and `ai-service/logs/`.

---

## 12. Security Hardening & Production Checklist

- [x] **Password Hashing**: `bcryptjs` $\ge 10$ salt rounds.
- [x] **Strict JWT Algorithms**: Explicit `HS256` token signing & expiry.
- [x] **Rate Limiting**: `express-rate-limit` protecting `/auth` (10 req/min) and global `/api` (100 req/min).
- [x] **Inter-Service Authentication**: Secret key header `X-Internal-API-Key` between Express and FastAPI.
- [x] **IDOR Protection**: Document streaming verifies user ownership / officer role before releasing files.
- [x] **SQL Injection Defense**: Strict parameterization via Prisma ORM.
- [x] **Secure HTTP Headers**: Helmet enabled with CSP and anti-sniff headers.
- [x] **Zero Plaintext Secrets**: Clean `.env.example` templates across all repositories.

---

## 13. Troubleshooting & Recovery Runbook

### Issue 1: Database Connection Refused (`P1001`)
- **Cause**: MySQL/PostgreSQL service is not running or credentials in `DATABASE_URL` are incorrect.
- **Fix**:
  ```bash
  sudo systemctl status mysql # or postgresql
  sudo systemctl restart mysql
  # Verify credentials with CLI:
  mysql -u setu_user -p project_setu
  ```

### Issue 2: AI Service `503 Service Unavailable` or `Unreachable`
- **Cause**: Python FastAPI microservice is stopped or blocked by firewall.
- **Fix**:
  ```bash
  pm2 restart setu-ai-service
  # Verify direct response:
  curl http://localhost:8000/api/v1/health
  ```

### Issue 3: CORS Blocked from Browser
- **Cause**: Domain is not listed in `CORS_ORIGIN` in `backend/.env`.
- **Fix**: Add your domain to `CORS_ORIGIN` in `backend/.env` (e.g. `CORS_ORIGIN=https://setu.gov.in,https://admin.setu.gov.in`) and restart backend.

### Issue 4: 404 on Page Refresh (Client-Side Routes)
- **Cause**: NGINX is not configured with SPA fallback routing.
- **Fix**: Ensure `try_files $uri $uri/ /index.html;` is present in your NGINX configuration.
