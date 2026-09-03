import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, EmptyTableState } from "../../components/ui/Table";
import {
  Building,
  Users2,
  Activity,
  History,
  Cpu,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* 1. Admin Header */}
      <div className="bg-purple-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-0.5 rounded-full border border-purple-400/20 font-medium">
              Central Administration • SIH 2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            System Administration & Governance Console
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/90 max-w-xl">
            Manage government master data, configure AI classification parameters, audit role access logs,
            and monitor microservices cluster health.
          </p>
        </div>

        <div className="shrink-0 flex gap-3">
          <Link to="/admin/system-health">
            <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md" leftIcon={<Activity className="w-4 h-4" />}>
              Live System Health
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. System Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</p>
              <p className="text-2xl font-black text-slate-900 font-mono">6</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
              <p className="text-2xl font-black text-blue-600 font-mono">12</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Service</p>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>FastAPI 1.0</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Security</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Tamper-Proof</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. System Audit Log Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">System Security Audit Feed</CardTitle>
            <CardDescription>Live tamper-evident trail of administrative actions, user logins, and schema mutations</CardDescription>
          </div>
          <Link to="/admin/audit-logs">
            <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Full Audit Trail
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Client IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <EmptyTableState
                title="Audit log buffer active"
                description="Security audit entries will populate in real time as events occur."
                colSpan={5}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
