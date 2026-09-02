# PROJECT SETU - REST API Specification

Base URL: `http://localhost:5000/api/v1`

---

## 1. Authentication Endpoints (`/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register a new Citizen account |
| `POST` | `/auth/login` | Public | Authenticate user and issue JWT token |
| `GET` | `/auth/me` | Authenticated | Retrieve authenticated user profile |

---

## 2. Grievance Endpoints (`/grievances`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/grievances` | Citizen | Submit a new grievance (Triggers AI classification & routing) |
| `GET` | `/grievances` | Authenticated | List grievances (Citizens see own; Officers see department-assigned) |
| `GET` | `/grievances/:id` | Authenticated | Retrieve detailed grievance timeline and attachments |
| `PATCH`| `/grievances/:id/status`| Officer / Admin | Update grievance status (e.g. IN_PROGRESS, RESOLVED, REJECTED) |
| `POST` | `/grievances/:id/feedback`| Citizen | Submit satisfaction rating & review upon resolution |

---

## 3. Department & Master Endpoints (`/departments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/departments` | Public | List all active government departments & categories |
| `POST` | `/departments` | Admin | Create or configure a new government department |

---

## 4. AI Microservice Internal Endpoints (`http://localhost:8000/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Liveness and health check |
| `POST` | `/classify` | Classify grievance text into category and sentiment |
| `POST` | `/priority` | Calculate priority score (LOW, MEDIUM, HIGH, CRITICAL) and SLA estimate |
| `POST` | `/route` | Predict matching department code based on title & description |
| `POST` | `/anomaly-check` | Check for potential spam, duplicate complaints, or anomalies |
