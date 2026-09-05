import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { LanguageProvider } from "./context/LanguageContext";
import LanguageSelectorModal from "./components/common/LanguageSelectorModal";
import SetuAssistant from "./components/assistant/SetuAssistant";

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
import ApplicationDetailPage from "./pages/citizen/ApplicationDetailPage";
import ServicesCatalogPage from "./pages/citizen/ServicesCatalogPage";
import ServiceDetailPage from "./pages/citizen/ServiceDetailPage";
import ApplyServicePage from "./pages/citizen/ApplyServicePage";
import SchemesCatalogPage from "./pages/citizen/SchemesCatalogPage";
import SchemeDetailPage from "./pages/citizen/SchemeDetailPage";
import CitizenNotificationsPage from "./pages/citizen/CitizenNotificationsPage";

// Officer Portal Pages
import OfficerDashboardPage from "./pages/officer/OfficerDashboardPage";
import OfficerGrievancesPage from "./pages/officer/OfficerGrievancesPage";
import OfficerGrievanceDetailPage from "./pages/officer/OfficerGrievanceDetailPage";
import OfficerProfilePage from "./pages/officer/OfficerProfilePage";

// Other Role Dashboards
import SeniorOfficerDashboard from "./pages/dashboards/SeniorOfficerDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

// Admin Portal Pages
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminOfficersPage from "./pages/admin/AdminOfficersPage";
import AdminDepartmentsPage from "./pages/admin/AdminDepartmentsPage";
import AdminGrievancesPage from "./pages/admin/AdminGrievancesPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";
import AdminAiMonitoringPage from "./pages/admin/AdminAiMonitoringPage";
import AdminAnomaliesPage from "./pages/admin/AdminAnomaliesPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <LanguageSelectorModal />
            <SetuAssistant />
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
                <Route path="/citizen/services" element={<ServicesCatalogPage />} />
                <Route path="/citizen/services/:id" element={<ServiceDetailPage />} />
                <Route path="/citizen/services/:id/apply" element={<ApplyServicePage />} />
                <Route path="/citizen/schemes" element={<SchemesCatalogPage />} />
                <Route path="/citizen/schemes/:id" element={<SchemeDetailPage />} />
                <Route path="/citizen/applications" element={<CitizenApplicationsPage />} />
                <Route path="/citizen/applications/:id" element={<ApplicationDetailPage />} />
                <Route path="/citizen/notifications" element={<CitizenNotificationsPage />} />
              </Route>

              {/* 3. Protected Field Officer Routes (OfficerLayout) */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["OFFICER", "SENIOR_OFFICER", "ADMIN"]}>
                    <OfficerLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/officer" element={<OfficerDashboardPage />} />
                <Route path="/officer/dashboard" element={<OfficerDashboardPage />} />
                <Route path="/officer/grievances" element={<OfficerGrievancesPage />} />
                <Route path="/officer/grievances/:id" element={<OfficerGrievanceDetailPage />} />
                <Route path="/officer/profile" element={<OfficerProfilePage />} />
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
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/anomalies" element={<AdminAnomaliesPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/officers" element={<AdminOfficersPage />} />
                <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
                <Route path="/admin/grievances" element={<AdminGrievancesPage />} />
                <Route path="/admin/services" element={<AdminServicesPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="/admin/ai-monitoring" element={<AdminAiMonitoringPage />} />
              </Route>

              {/* 6. Fallback 404 Catch-all */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
