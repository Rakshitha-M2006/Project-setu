import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Layouts
import PublicLayout from "./components/layouts/PublicLayout";
import CitizenLayout from "./components/layouts/CitizenLayout";
import OfficerLayout from "./components/layouts/OfficerLayout";
import SeniorOfficerLayout from "./components/layouts/SeniorOfficerLayout";
import AdminLayout from "./components/layouts/AdminLayout";

// Route Guard
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";

// Citizen Portal Pages
import CitizenDashboardPage from "./pages/citizen/CitizenDashboardPage";
import CitizenProfilePage from "./pages/citizen/CitizenProfilePage";
import CitizenGrievancesPage from "./pages/citizen/CitizenGrievancesPage";
import GrievanceDetailPage from "./pages/citizen/GrievanceDetailPage";
import NewGrievancePage from "./pages/citizen/NewGrievancePage";
import CitizenApplicationsPage from "./pages/citizen/CitizenApplicationsPage";
import CitizenNotificationsPage from "./pages/citizen/CitizenNotificationsPage";

// Other Role Dashboards
import OfficerDashboard from "./pages/dashboards/OfficerDashboard";
import SeniorOfficerDashboard from "./pages/dashboards/SeniorOfficerDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* 1. Public Routes (PublicLayout) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/404" element={<NotFoundPage />} />
            </Route>

            {/* 2. Protected Citizen Routes (CitizenLayout) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["CITIZEN"]}>
                  <CitizenLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/citizen" element={<CitizenDashboardPage />} />
              <Route path="/citizen/dashboard" element={<CitizenDashboardPage />} />
              <Route path="/citizen/profile" element={<CitizenProfilePage />} />
              <Route path="/citizen/grievances" element={<CitizenGrievancesPage />} />
              <Route path="/citizen/grievances/new" element={<NewGrievancePage />} />
              <Route path="/citizen/grievances/:id" element={<GrievanceDetailPage />} />
              <Route path="/citizen/applications" element={<CitizenApplicationsPage />} />
              <Route path="/citizen/notifications" element={<CitizenNotificationsPage />} />
            </Route>

            {/* 3. Protected Field Officer Routes (OfficerLayout) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["OFFICER", "SENIOR_OFFICER"]}>
                  <OfficerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/officer" element={<OfficerDashboard />} />
              <Route path="/officer/in-progress" element={<OfficerDashboard />} />
              <Route path="/officer/sla-warnings" element={<OfficerDashboard />} />
              <Route path="/officer/resolved" element={<OfficerDashboard />} />
              <Route path="/officer/services" element={<OfficerDashboard />} />
            </Route>

            {/* 4. Protected Senior Officer / HOD Routes (SeniorOfficerLayout) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["SENIOR_OFFICER", "ADMIN"]}>
                  <SeniorOfficerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/senior-officer" element={<SeniorOfficerDashboard />} />
              <Route path="/senior-officer/escalations" element={<SeniorOfficerDashboard />} />
              <Route path="/senior-officer/officers" element={<SeniorOfficerDashboard />} />
              <Route path="/senior-officer/analytics" element={<SeniorOfficerDashboard />} />
            </Route>

            {/* 5. Protected Super Admin Routes (AdminLayout) */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/departments" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/ai-engine" element={<AdminDashboard />} />
              <Route path="/admin/audit-logs" element={<AdminDashboard />} />
              <Route path="/admin/system-health" element={<AdminDashboard />} />
            </Route>

            {/* 6. Fallback 404 Catch-all */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
