# PROJECT SETU - Backend REST API

Production-ready Node.js, Express, and TypeScript API server using Prisma ORM with **MySQL**.

---

## 🏛️ Architecture & Features

- **Express & TypeScript**: Strongly typed request handlers, routes, and services.
- **MySQL & Prisma ORM**: Structured relational models with automated migrations.
- **JWT Authentication**: Secure stateless token issuance with role-based payloads.
- **Role-Based Access Control (RBAC)**: Middleware enforcing permissions for `CITIZEN`, `OFFICER`, `SENIOR_OFFICER`, and `ADMIN`.
- **AI Microservice Bridge**: Integrated Axios client querying the Python FastAPI microservice on `http://localhost:8000`.
- **Security**: Hardened with Helmet, CORS, input validation via Zod, and structured error responses.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Update DATABASE_URL with your local MySQL credentials
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Migrations (when MySQL is available)
```bash
npx prisma migrate dev --name init
```

### 5. Start Server
```bash
# Development mode with hot reload:
npm run dev

# Build and start production bundle:
npm run build
npm start
```
The API server will listen on `http://localhost:5000`.
