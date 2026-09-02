# PROJECT SETU - Frontend Single Page Application

Built with **React 18 / 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **React Router**.

---

## 🎨 Features & Architecture

- **Role-Based Portals**: Tailored views for `CITIZEN`, `OFFICER`, `SENIOR_OFFICER`, and `ADMIN`.
- **Modern Responsive UI**: Clean government-standard visual identity with Tailwind CSS.
- **Axios HTTP Client**: Interceptor for automated JWT authorization header attachment.
- **Auth Context**: Global user session management with persistent localStorage tokens.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.
