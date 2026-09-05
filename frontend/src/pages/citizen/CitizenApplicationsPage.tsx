import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import citizenApi, { ServiceApplicationItem } from "../../api/citizenApi";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Input } from "../../components/ui/Input";
import {
  Briefcase,
  Search,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export const CitizenApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();

  const [applications, setApplications] = useState<ServiceApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const response = await citizenApi.getMyApplications();
      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch {
      toast.error(t("errors.serverError") || "Failed to load applications.", "Error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        app.applicationNumber.toLowerCase().includes(q) ||
        (app.service?.name || "").toLowerCase().includes(q) ||
        (app.service?.department?.name || "").toLowerCase().includes(q)
      );
    });
  }, [applications, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("applications.title") || "My Government Service Applications"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("applications.subtitle") || "Track statutory verification progress and download official permits / sanction certificates"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadApplications}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {t("common.refresh") || "Refresh"}
          </Button>

          <Link to="/citizen/services">
            <Button size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
              {t("navigation.services") || "Browse Services"}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Search & Filter */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder={t("common.search") + "..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredApps.length} {t("common.statusActive") || "Applications"}
          </span>
        </CardContent>
      </Card>

      {/* 3. Applications Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("applications.applicationNumber") || "Application #"}</TableHead>
              <TableHead>{t("applications.serviceName") || "Service Name"}</TableHead>
              <TableHead>{t("applications.department") || "Department"}</TableHead>
              <TableHead>{t("applications.status") || "Status"}</TableHead>
              <TableHead>{t("applications.submittedOn") || "Submitted On"}</TableHead>
              <TableHead className="text-right">{t("common.actions") || "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  {t("common.loading") || "Loading applications..."}
                </TableCell>
              </TableRow>
            ) : filteredApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="p-8 text-center space-y-3">
                    <p className="font-bold text-slate-700">{t("applications.noApplications") || "No applications found"}</p>
                    <p className="text-xs text-slate-500">{t("applications.noApplicationsDesc") || "You have not submitted any service applications yet."}</p>
                    <Button size="sm" onClick={() => navigate("/citizen/services")}>
                      {t("dashboard.applyServiceBtn") || "Apply for Government Service"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredApps.map((app) => (
                <TableRow key={app.id} className="hover:bg-slate-50/80 transition">
                  <TableCell className="font-mono font-bold text-blue-700 text-xs">
                    {app.applicationNumber}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {app.service?.name}
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs">
                    {app.service?.department?.name || "General"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/citizen/applications/${app.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-blue-700">
                        <span>{t("common.view") || "View"}</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CitizenApplicationsPage;
